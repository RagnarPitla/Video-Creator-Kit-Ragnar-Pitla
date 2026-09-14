#!/usr/bin/env node
'use strict';

/**
 * yt-notes — standalone CLI for YouTube Notes Studio.
 *
 * Usage:
 *   yt-notes <url> [more urls...]
 *   yt-notes --file links.txt
 *   echo "<url>" | yt-notes
 *   yt-notes --doctor
 *
 * This is the same engine the Electron app and the Claude Code skill/agent use,
 * so behavior is identical everywhere.
 */

const fs = require('node:fs');
const engine = require('../index');

const HELP = `YouTube Notes Studio — turn YouTube links into notes in your voice, by channel.

USAGE
  yt-notes <url> [url...]          Generate notes for one or more links
  yt-notes --file <path>          Read links (one per line) from a file
  cat links.txt | yt-notes        Read links from stdin
  yt-notes --doctor               Show environment diagnostics
  yt-notes --list-styles          List available note styles

OPTIONS
  --out <dir>            Output directory (default from config / ~/Documents/YouTube Notes)
  --provider <id>        auto | claude | copilot | codex | anthropic-api | extractive
  --model <name>         Model override for the provider
  --style <name>         ragnar | executive | detailed | bullets | study  (default: ragnar)
  --language <code>      Preferred caption language (default: en)
  --concurrency <n>      Videos processed in parallel (default: 2)
  --limit <n>            Cap how many videos to take from a playlist/channel
  --no-transcript        Don't append the full transcript to each note
  --no-mindmap           Don't include the Mermaid mind map
  --whisper              Enable Whisper fallback for videos without captions
  --json                 Print the run manifest as JSON (stdout)
  --quiet                Less progress output
  -h, --help             Show this help

EXAMPLES
  yt-notes https://youtu.be/dQw4w9WgXcQ
  yt-notes --style executive --out "~/Notes" https://youtu.be/VIDEO1 https://youtu.be/VIDEO2
  yt-notes --file my-watchlist.txt --provider claude --model sonnet
`;

function parseArgs(argv) {
  const opts = { links: [], flags: {} };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    const take = () => argv[++i];
    switch (a) {
      case '-h': case '--help': opts.flags.help = true; break;
      case '--doctor': opts.flags.doctor = true; break;
      case '--list-styles': opts.flags.listStyles = true; break;
      case '--json': opts.flags.json = true; break;
      case '--quiet': opts.flags.quiet = true; break;
      case '--no-transcript': opts.flags.includeTranscript = false; break;
      case '--no-mindmap': opts.flags.includeMindmap = false; break;
      case '--whisper': opts.flags.whisperFallback = true; break;
      case '--out': opts.flags.outputDir = take(); break;
      case '--provider': opts.flags.provider = take(); break;
      case '--model': opts.flags.model = take(); break;
      case '--style': opts.flags.summaryStyle = take(); break;
      case '--language': opts.flags.language = take(); break;
      case '--concurrency': opts.flags.concurrency = parseInt(take(), 10) || undefined; break;
      case '--limit': opts.flags.playlistLimit = parseInt(take(), 10) || undefined; break;
      case '--file': {
        const f = take();
        try { opts.links.push(...fs.readFileSync(f, 'utf8').split(/\r?\n/)); }
        catch (e) { console.error(`Could not read --file ${f}: ${e.message}`); process.exit(2); }
        break;
      }
      default:
        if (a.startsWith('--')) { console.error(`Unknown option: ${a}`); process.exit(2); }
        else opts.links.push(a);
    }
  }
  return opts;
}

function readStdin() {
  return new Promise((resolve) => {
    if (process.stdin.isTTY) return resolve('');
    let data = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (c) => (data += c));
    process.stdin.on('end', () => resolve(data));
    setTimeout(() => resolve(data), 200); // don't hang if nothing comes
  });
}

const C = {
  dim: (s) => `\x1b[2m${s}\x1b[0m`,
  green: (s) => `\x1b[32m${s}\x1b[0m`,
  yellow: (s) => `\x1b[33m${s}\x1b[0m`,
  red: (s) => `\x1b[31m${s}\x1b[0m`,
  cyan: (s) => `\x1b[36m${s}\x1b[0m`,
  bold: (s) => `\x1b[1m${s}\x1b[0m`,
};

function makeReporter(quiet) {
  return (e) => {
    switch (e.type) {
      case 'expand':
        if (!quiet) process.stderr.write(C.dim(`  ${e.message}\n`));
        break;
      case 'job:start':
        process.stderr.write(C.bold(`\n▶ Generating notes for ${e.total} video(s)\n`) + C.dim(`  → ${e.outputDir}\n\n`));
        break;
      case 'item:start':
        process.stderr.write(C.cyan(`[${e.index + 1}/${e.total}] `) + `${e.title || e.url}\n`);
        break;
      case 'item:progress':
        if (!quiet && e.message) {
          const tag = e.level === 'warn' ? C.yellow('    ! ') : C.dim('    · ');
          process.stderr.write(tag + C.dim(e.message) + '\n');
        }
        break;
      case 'item:done':
        if (e.status === 'ok') {
          process.stderr.write(C.green(`  ✓ `) + `${e.title}  ` + C.dim(`(${e.provider}) → ${e.path}\n\n`));
        } else if (e.status === 'no_transcript') {
          process.stderr.write(C.yellow(`  ⚠ `) + `${e.title} — no transcript (stub saved)\n\n`);
        }
        break;
      case 'item:error':
        process.stderr.write(C.red(`  ✗ `) + `${e.error}\n\n`);
        break;
    }
  };
}

async function main() {
  const { links, flags } = parseArgs(process.argv.slice(2));

  if (flags.help) { process.stdout.write(HELP); return; }

  if (flags.doctor) {
    const d = await engine.doctor(buildOverrides(flags));
    printDoctor(d);
    return;
  }

  if (flags.listStyles) {
    for (const [k, v] of Object.entries(engine.styles)) {
      process.stdout.write(`${k.padEnd(12)} ${v.label}\n`);
    }
    return;
  }

  let allLinks = links.slice();
  if (!allLinks.filter((l) => l.trim()).length) {
    const piped = await readStdin();
    if (piped.trim()) allLinks = piped.split(/\r?\n/);
  }
  allLinks = allLinks.map((l) => l.trim()).filter(Boolean);

  if (!allLinks.length) { process.stdout.write(HELP); process.exit(1); }

  const config = engine.loadConfig(buildOverrides(flags));
  const reporter = makeReporter(flags.quiet);

  // graceful cancel on Ctrl-C
  const ac = new AbortController();
  process.on('SIGINT', () => { process.stderr.write(C.yellow('\nCancelling…\n')); ac.abort(); });

  const manifest = await engine.generateNotes({
    links: allLinks,
    config,
    onEvent: reporter,
    signal: ac.signal,
  });

  if (flags.json) {
    process.stdout.write(JSON.stringify(manifest, null, 2) + '\n');
  } else {
    const c = manifest.counts;
    process.stderr.write(
      C.bold(`Done. `) +
        `${C.green(c.ok + ' ok')}` +
        (c.no_transcript ? ` · ${C.yellow(c.no_transcript + ' no-transcript')}` : '') +
        (c.error ? ` · ${C.red(c.error + ' error')}` : '') +
        (c.cancelled ? ` · ${c.cancelled} cancelled` : '') +
        C.dim(`  →  ${manifest.outputDir}\n`)
    );
  }
  process.exit(manifest.counts.error > 0 && manifest.counts.ok === 0 ? 1 : 0);
}

function buildOverrides(flags) {
  const o = {};
  for (const k of ['outputDir', 'provider', 'model', 'summaryStyle', 'language', 'concurrency', 'playlistLimit', 'includeTranscript', 'includeMindmap', 'whisperFallback']) {
    if (flags[k] !== undefined) o[k] = flags[k];
  }
  if (o.outputDir) o.outputDir = engine.util.expandHome(o.outputDir);
  return o;
}

function printDoctor(d) {
  const yes = C.green('✓'); const no = C.red('✗'); const warn = C.yellow('!');
  const L = [];
  L.push(C.bold('\nYouTube Notes Studio — doctor\n'));
  L.push(`  Node:        ${d.node} (${d.platform})`);
  L.push(`  yt-dlp:      ${d.ytDlp.found ? yes + ' ' + d.ytDlp.version + C.dim('  ' + d.ytDlp.path) : no + ' not found  ' + C.dim('brew install yt-dlp')}`);
  L.push(`  ffmpeg:      ${d.ffmpeg.found ? yes + C.dim('  ' + d.ffmpeg.path) : warn + ' not found  ' + C.dim('(needed only for Whisper fallback)')}`);
  L.push(`  whisper:     ${d.whisper.available ? yes + ' ' + d.whisper.mode : C.dim('not installed (optional)')}`);
  L.push(C.bold('\n  Providers:'));
  for (const p of Object.values(d.providers)) {
    const mark = p.available && p.authed !== false ? yes : (p.available ? warn : no);
    L.push(`    ${mark} ${p.label.padEnd(20)} ${C.dim(p.reason)}`);
  }
  L.push(`\n  Will use:    ${C.cyan(d.chosenProvider)}`);
  L.push(`  Output dir:  ${d.outputDir} ${d.outputWritable ? C.green('(writable)') : C.red('(NOT writable)')}`);
  L.push(`  Config file: ${C.dim(d.userConfigPath)}`);
  L.push(`  Styles:      ${d.styles.join(', ')}\n`);
  process.stdout.write(L.join('\n') + '\n');
}

main().catch((err) => {
  console.error(C.red('\nFatal: ') + (err && err.stack ? err.stack : err));
  process.exit(1);
});
