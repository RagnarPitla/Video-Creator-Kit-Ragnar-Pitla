'use strict';

/**
 * transcript.js — deterministic transcript extraction via yt-dlp.
 *
 * Design notes (learned from live testing):
 *  - Fetch metadata + caption catalog in ONE call with `yt-dlp -J`.
 *  - Download EXACTLY ONE caption track, ONE format. Requesting a glob of
 *    languages (e.g. `en.*`) makes yt-dlp fan out and trip YouTube's
 *    HTTP 429 rate limiter. One track = reliable.
 *  - Prefer json3 (clean discrete events, no rolling-duplicate problem);
 *    fall back to vtt with de-duplication.
 *  - Retry with backoff on 429, and retry metadata with an alternate
 *    player client if the default extraction fails.
 */

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const {
  run,
  resolveBin,
  ensureDir,
  msToTimestamp,
  formatUploadDate,
  sleep,
} = require('./util');

const YT_DLP_COMMON = [
  '--no-warnings',
  '--ignore-config',
  '--no-playlist',
  '--retries', '3',
  '--extractor-retries', '3',
];

/** Throw a friendly error if yt-dlp is missing. */
function requireYtDlp() {
  const bin = resolveBin('yt-dlp');
  if (!bin) {
    const err = new Error(
      'yt-dlp not found. Install it with:  brew install yt-dlp   (macOS)  or  pipx install yt-dlp'
    );
    err.code = 'YT_DLP_MISSING';
    throw err;
  }
  return bin;
}

/* ------------------------------------------------------------------ *
 * Metadata + caption catalog
 * ------------------------------------------------------------------ */

/**
 * Fetch full metadata (incl. subtitle catalog) for a single video URL.
 * Retries once with an alternate player client on failure.
 * @returns {Promise<object>} normalized metadata
 */
async function getMetadata(url, opts = {}) {
  requireYtDlp();
  const timeoutMs = opts.timeoutMs || 90000;

  const attempts = [
    [...YT_DLP_COMMON, '-J', '--skip-download', url],
    // fallback: force a different client when the default extraction breaks
    [...YT_DLP_COMMON, '-J', '--skip-download', '--extractor-args', 'youtube:player_client=android,web', url],
  ];

  let lastErr = null;
  for (const args of attempts) {
    const res = await run('yt-dlp', args, { timeoutMs, signal: opts.signal });
    if (res.code === 0 && res.stdout.trim()) {
      try {
        return normalizeInfo(JSON.parse(res.stdout));
      } catch (e) {
        lastErr = new Error('Could not parse yt-dlp JSON: ' + e.message);
        continue;
      }
    }
    lastErr = new Error(firstErrorLine(res.stderr) || `yt-dlp exited ${res.code}`);
    if (/429|too many requests/i.test(res.stderr)) {
      await sleep(4000);
    }
  }
  throw lastErr || new Error('yt-dlp metadata fetch failed');
}

function normalizeInfo(info) {
  return {
    id: info.id,
    title: info.title || info.id,
    channel: info.channel || info.uploader || 'Unknown Channel',
    uploader: info.uploader || info.channel || '',
    channelId: info.channel_id || info.uploader_id || '',
    channelUrl: info.channel_url || info.uploader_url || '',
    uploadDate: formatUploadDate(info.upload_date),
    durationSec: Number(info.duration) || 0,
    viewCount: Number(info.view_count) || 0,
    description: info.description || '',
    webpageUrl: info.webpage_url || `https://www.youtube.com/watch?v=${info.id}`,
    thumbnail: info.thumbnail || '',
    subtitles: info.subtitles || {},
    automaticCaptions: info.automatic_captions || {},
    _raw: undefined, // keep payload small
  };
}

function firstErrorLine(stderr) {
  if (!stderr) return '';
  const line = stderr.split('\n').map((l) => l.trim()).filter(Boolean).find((l) => /error/i.test(l));
  return line || stderr.split('\n').map((l) => l.trim()).filter(Boolean).pop() || '';
}

/* ------------------------------------------------------------------ *
 * Playlist / channel expansion
 * ------------------------------------------------------------------ */

/**
 * Expand a playlist or channel URL into a flat list of {id, url, title}.
 */
async function expandPlaylist(url, opts = {}) {
  requireYtDlp();
  const limit = opts.limit || 0;
  const args = [
    '--no-warnings', '--ignore-config',
    '--flat-playlist',
    '--print', '%(id)s\t%(title)s',
  ];
  if (limit > 0) args.push('--playlist-end', String(limit));
  args.push(url);

  const res = await run('yt-dlp', args, { timeoutMs: opts.timeoutMs || 120000 });
  if (res.code !== 0) {
    throw new Error(firstErrorLine(res.stderr) || `Could not expand playlist (${res.code})`);
  }
  const out = [];
  for (const line of res.stdout.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const [id, ...rest] = trimmed.split('\t');
    if (id && /^[a-zA-Z0-9_-]{11}$/.test(id)) {
      out.push({ id, url: `https://www.youtube.com/watch?v=${id}`, title: rest.join('\t') || '' });
    }
  }
  return out;
}

/* ------------------------------------------------------------------ *
 * Track selection
 * ------------------------------------------------------------------ */

/** Auto-translation keys look like `fr-en` / `ab-en` (lang-lang, both lowercase). */
function isTranslation(key) {
  return /^[a-z]{2,3}-[a-z]{2,3}$/.test(key);
}

/**
 * Build an ordered list of caption-track candidates to try, best first.
 * @returns {Array<{lang:string, kind:'manual'|'auto', translated:boolean}>}
 */
function chooseTrackCandidates(info, prefLang = 'en') {
  const manual = Object.keys(info.subtitles || {});
  const auto = Object.keys(info.automaticCaptions || {});
  const candidates = [];
  const seen = new Set();
  const push = (lang, kind, translated = false) => {
    const key = kind + ':' + lang;
    if (lang && !seen.has(key)) {
      seen.add(key);
      candidates.push({ lang, kind, translated });
    }
  };

  const pref = prefLang.toLowerCase();
  const startsWithPref = (k) => k.toLowerCase() === pref || k.toLowerCase().startsWith(pref + '-');

  // 1) Manual subs in the preferred language (highest quality).
  manual.filter((k) => k.toLowerCase() === pref).forEach((k) => push(k, 'manual'));
  manual.filter(startsWithPref).forEach((k) => push(k, 'manual'));

  // 2) Auto captions in the preferred language, original (not translated).
  auto.filter((k) => k.toLowerCase() === pref).forEach((k) => push(k, 'auto'));
  auto.filter((k) => k.toLowerCase() === pref + '-orig').forEach((k) => push(k, 'auto'));
  auto.filter((k) => startsWithPref(k) && !isTranslation(k)).forEach((k) => push(k, 'auto'));

  // 3) Any manual sub at all (original language of the video).
  manual.forEach((k) => push(k, 'manual'));

  // 4) Any non-translated auto caption (original language).
  auto.filter((k) => k.toLowerCase().endsWith('-orig')).forEach((k) => push(k, 'auto'));
  auto.filter((k) => !isTranslation(k)).forEach((k) => push(k, 'auto'));

  // 5) Last resort: a translation INTO the preferred language.
  auto.filter((k) => k.toLowerCase().endsWith('-' + pref)).forEach((k) => push(k, 'auto', true));

  return candidates;
}

/* ------------------------------------------------------------------ *
 * Track download + parse
 * ------------------------------------------------------------------ */

/**
 * Download a single caption track to a temp dir and return the file path.
 * Retries on 429 with backoff. Returns null if the track produced no file.
 */
async function downloadTrack(url, videoId, lang, kind, outDir, opts = {}) {
  const writeFlag = kind === 'manual' ? '--write-subs' : '--write-auto-subs';
  const args = [
    ...YT_DLP_COMMON,
    '--skip-download',
    writeFlag,
    '--sub-langs', lang,
    '--sub-format', 'json3/srv3/vtt/best',
    '-o', path.join(outDir, '%(id)s.%(ext)s'),
    url,
  ];

  const maxTries = opts.maxTries || 3;
  for (let attempt = 1; attempt <= maxTries; attempt++) {
    const res = await run('yt-dlp', args, { timeoutMs: opts.timeoutMs || 90000, signal: opts.signal });
    const file = findSubFile(outDir, videoId, lang);
    if (file) return file;

    if (/429|too many requests/i.test(res.stderr)) {
      await sleep(3000 * attempt); // backoff
      continue;
    }
    if (res.code === 0) return null; // no file, no error => track unavailable
    if (attempt === maxTries) return null;
    await sleep(1000 * attempt);
  }
  return null;
}

/** Find the sub file yt-dlp wrote for a given id+lang (ext varies). */
function findSubFile(outDir, videoId, lang) {
  let entries;
  try {
    entries = fs.readdirSync(outDir);
  } catch {
    return null;
  }
  // Preferred extension order.
  const exts = ['json3', 'srv3', 'vtt', 'srt', 'ttml'];
  for (const ext of exts) {
    const exact = entries.find(
      (f) => f === `${videoId}.${lang}.${ext}` || (f.startsWith(`${videoId}.`) && f.endsWith(`.${lang}.${ext}`))
    );
    if (exact) return path.join(outDir, exact);
  }
  // Looser: any file for this id with a known caption ext.
  const loose = entries.find((f) => f.startsWith(`${videoId}.`) && exts.some((e) => f.endsWith('.' + e)));
  return loose ? path.join(outDir, loose) : null;
}

/** Parse a caption file (json3 or vtt) into [{startMs, text}]. */
function parseSubFile(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  if (filePath.endsWith('.json3') || filePath.endsWith('.srv3') || raw.trimStart().startsWith('{')) {
    try {
      return parseJson3(raw);
    } catch {
      /* fall through to vtt */
    }
  }
  return parseVtt(raw);
}

/** json3 -> segments. */
function parseJson3(raw) {
  const data = JSON.parse(raw);
  const segments = [];
  for (const ev of data.events || []) {
    if (!ev.segs) continue;
    const text = ev.segs.map((s) => s.utf8 || '').join('').replace(/\s+/g, ' ').trim();
    if (!text || text === '\n') continue;
    segments.push({ startMs: Number(ev.tStartMs) || 0, text });
  }
  return segments;
}

/** vtt -> segments, de-duplicating YouTube's rolling auto-caption lines. */
function parseVtt(raw) {
  const lines = raw.split(/\r?\n/);
  const segments = [];
  let curStartMs = null;
  let buffer = [];

  const flush = () => {
    if (curStartMs == null) return;
    let text = buffer.join(' ')
      .replace(/<[^>]+>/g, '')          // inline <c> timing tags
      .replace(/\s+/g, ' ')
      .trim();
    if (text) segments.push({ startMs: curStartMs, text });
    buffer = [];
    curStartMs = null;
  };

  for (const line of lines) {
    const m = line.match(/^(\d{2}):(\d{2}):(\d{2})[.,](\d{3})\s*-->/);
    if (m) {
      flush();
      curStartMs = ((+m[1]) * 3600 + (+m[2]) * 60 + (+m[3])) * 1000 + (+m[4]);
      continue;
    }
    if (/^WEBVTT/.test(line) || /^Kind:/.test(line) || /^Language:/.test(line)) continue;
    if (curStartMs != null && line.trim()) buffer.push(line.trim());
  }
  flush();

  // De-dup YouTube's rolling auto-captions WITHOUT losing real content.
  // The only safe drops are PREFIX relationships (forward growth + stale
  // partials) and exact repeats. We deliberately do NOT drop on a suffix
  // match (prev.text.endsWith(seg.text)) — that deletes genuine short lines
  // that merely happen to end the previous line (e.g. "in production").
  const deduped = [];
  for (const seg of segments) {
    const prev = deduped[deduped.length - 1];
    if (!prev) { deduped.push({ ...seg }); continue; }
    if (seg.text === prev.text) continue;                 // exact repeat
    if (seg.text.startsWith(prev.text)) { prev.text = seg.text; continue; } // grew forward
    if (prev.text.startsWith(seg.text)) continue;         // stale shorter prefix
    deduped.push({ ...seg });
  }
  return deduped;
}

/* ------------------------------------------------------------------ *
 * Segments -> readable text
 * ------------------------------------------------------------------ */

/**
 * Join segments into readable paragraphs, optionally with timestamp markers.
 */
function segmentsToText(segments, opts = {}) {
  const { includeTimestamps = true, markerEverySec = 60 } = opts;
  if (!segments.length) return '';

  if (!includeTimestamps) {
    return paragraphize(segments.map((s) => s.text));
  }

  const out = [];
  let nextMarker = 0;
  let para = [];
  for (const seg of segments) {
    const sec = Math.floor(seg.startMs / 1000);
    if (sec >= nextMarker) {
      if (para.length) { out.push(para.join(' ')); para = []; }
      out.push(`\n**[${msToTimestamp(seg.startMs)}]**`);
      nextMarker = sec - (sec % markerEverySec) + markerEverySec;
    }
    para.push(seg.text);
  }
  if (para.length) out.push(para.join(' '));
  return out.join('\n').replace(/\n{3,}/g, '\n\n').trim();
}

function paragraphize(texts, perPara = 6) {
  const out = [];
  for (let i = 0; i < texts.length; i += perPara) {
    out.push(texts.slice(i, i + perPara).join(' '));
  }
  return out.join('\n\n');
}

/** Plain transcript with no markers (for the .txt / prompt body). */
function segmentsToPlain(segments) {
  return segments.map((s) => s.text).join(' ').replace(/\s+/g, ' ').trim();
}

/* ------------------------------------------------------------------ *
 * Whisper fallback (optional, only when no captions exist)
 * ------------------------------------------------------------------ */

let _whisperCache;
function whisperAvailable() {
  if (_whisperCache !== undefined) return _whisperCache;
  if (resolveBin('whisper')) { _whisperCache = 'whisper'; return _whisperCache; }
  // Verify the python module actually imports — don't assume from python presence.
  const py = resolveBin('python3') || resolveBin('python');
  if (py) {
    try {
      const { execFileSync } = require('node:child_process');
      execFileSync(py, ['-c', 'import whisper'], { timeout: 8000, stdio: 'ignore' });
      _whisperCache = 'python-module';
      return _whisperCache;
    } catch {
      /* module not installed */
    }
  }
  _whisperCache = null;
  return _whisperCache;
}

async function whisperTranscribe(url, videoId, outDir, opts = {}) {
  const model = opts.whisperModel || 'base';
  // 1) extract audio with yt-dlp
  const audioOut = path.join(outDir, `${videoId}.%(ext)s`);
  const dl = await run('yt-dlp', [
    ...YT_DLP_COMMON,
    '-x', '--audio-format', 'mp3', '--audio-quality', '5',
    '-o', audioOut, url,
  ], { timeoutMs: opts.timeoutMs || 600000, signal: opts.signal });
  const audioFile = fs.existsSync(path.join(outDir, `${videoId}.mp3`))
    ? path.join(outDir, `${videoId}.mp3`)
    : null;
  if (!audioFile) {
    throw new Error('Whisper fallback: could not extract audio. ' + firstErrorLine(dl.stderr));
  }

  // 2) run whisper
  const mode = whisperAvailable();
  if (!mode) {
    throw new Error('Whisper not installed. Install with:  pipx install openai-whisper  (needs ffmpeg).');
  }
  const args = mode === 'whisper'
    ? [audioFile, '--model', model, '--output_format', 'json', '--output_dir', outDir, '--fp16', 'False']
    : ['-m', 'whisper', audioFile, '--model', model, '--output_format', 'json', '--output_dir', outDir, '--fp16', 'False'];
  const bin = mode === 'whisper' ? 'whisper' : (resolveBin('python3') ? 'python3' : 'python');
  const wr = await run(bin, args, { timeoutMs: opts.timeoutMs || 1800000, signal: opts.signal });
  const jsonFile = path.join(outDir, `${videoId}.json`);
  if (!fs.existsSync(jsonFile)) {
    throw new Error('Whisper produced no output. ' + firstErrorLine(wr.stderr));
  }
  const data = JSON.parse(fs.readFileSync(jsonFile, 'utf8'));
  const segments = (data.segments || []).map((s) => ({
    startMs: Math.round((Number(s.start) || 0) * 1000),
    text: String(s.text || '').trim(),
  })).filter((s) => s.text);
  return segments;
}

/* ------------------------------------------------------------------ *
 * Public: fetch a transcript for one work item
 * ------------------------------------------------------------------ */

/**
 * @param {{url:string, id?:string}} item
 * @param {object} opts { language, includeTimestamps, whisperFallback, whisperModel, onEvent }
 * @returns {Promise<{meta, segments, text, plain, source, lang, translated}>}
 */
async function fetchTranscript(item, opts = {}) {
  const onEvent = opts.onEvent || (() => {});
  const language = opts.language || 'en';
  const tmpRoot = opts.tmpDir || path.join(os.tmpdir(), 'yt-notes-tmp');
  ensureDir(tmpRoot);

  onEvent({ stage: 'metadata', message: 'Fetching video info…' });
  const meta = await getMetadata(item.url, opts);
  const videoId = meta.id;
  const outDir = ensureDir(path.join(tmpRoot, videoId + '-' + Math.random().toString(36).slice(2, 8)));

  try {
    const candidates = chooseTrackCandidates(meta, language);
    onEvent({ stage: 'transcript', message: `Looking for captions (${candidates.length} track option(s))…` });

    for (const cand of candidates) {
      const file = await downloadTrack(item.url, videoId, cand.lang, cand.kind, outDir, opts);
      if (!file) continue;
      const segments = parseSubFile(file);
      if (segments.length) {
        onEvent({ stage: 'transcript', message: `Got ${cand.kind} captions (${cand.lang})` });
        return finalize(meta, segments, cand.kind, cand.lang, cand.translated, opts);
      }
    }

    // No captions — Whisper fallback if enabled.
    if (opts.whisperFallback) {
      onEvent({ stage: 'whisper', message: 'No captions; transcribing audio with Whisper…' });
      const segments = await whisperTranscribe(item.url, videoId, outDir, opts);
      if (segments.length) {
        return finalize(meta, segments, 'whisper', language, false, opts);
      }
    }

    const err = new Error('No transcript available for this video (no captions found).');
    err.code = 'NO_TRANSCRIPT';
    err.meta = meta;
    throw err;
  } finally {
    // best-effort cleanup of temp files
    try { fs.rmSync(outDir, { recursive: true, force: true }); } catch {}
  }
}

function finalize(meta, segments, source, lang, translated, opts) {
  return {
    meta,
    segments,
    text: segmentsToText(segments, { includeTimestamps: opts.includeTimestamps !== false }),
    plain: segmentsToPlain(segments),
    source,
    lang,
    translated: !!translated,
  };
}

module.exports = {
  getMetadata,
  expandPlaylist,
  chooseTrackCandidates,
  isTranslation,
  downloadTrack,
  parseSubFile,
  parseJson3,
  parseVtt,
  segmentsToText,
  segmentsToPlain,
  whisperAvailable,
  whisperTranscribe,
  fetchTranscript,
};
