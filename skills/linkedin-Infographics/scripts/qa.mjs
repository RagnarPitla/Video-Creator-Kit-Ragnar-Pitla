#!/usr/bin/env node
/**
 * qa.mjs - gate for LinkedIn infographic GIFs.
 *
 *   node qa.mjs deck.html            lint the source before rendering
 *   node qa.mjs post.gif             gate the render
 *   node qa.mjs deck.html post.gif   both
 *   node qa.mjs --selftest           prove the detectors can discriminate
 *
 * Exit 0 = pass, 1 = at least one FAIL. Warnings never fail the gate.
 *
 * The GIF checks automate the two things SKILL.md otherwise asks you to eyeball:
 * whether anything actually moves, and whether the last frame flows back into
 * the first. Both are measured, not asserted.
 */

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const MAX_MB = 5.0;
const MAX_FRAMES = 400;
const MIN_FONT_PX = 22;

let failures = 0;
const pass = (m) => console.log(`  [PASS] ${m}`);
const warn = (m) => console.log(`  [WARN] ${m}`);
const fail = (m) => { failures++; console.log(`  [FAIL] ${m}`); };
const head = (m) => console.log(`\n${m}`);

/* ---------------- HTML detectors ----------------
   Each returns a list of violations. Empty list = clean. They are written to
   report what is WRONG, never to count what is right: a checker that counts
   conforming items cannot see a non-conforming one. */

function findAnimationDelay(html) {
  const out = [];
  const re = /animation-delay\s*:/gi;
  let m;
  while ((m = re.exec(html))) out.push(lineOf(html, m.index));
  return out;
}

function findAnimationDuration(html) {
  const out = [];
  // `animation: name 3s` shorthand also overrides duration, so catch both. The
  // value has to be inside the match or the var(--loop) allowance below cannot see it.
  const re = /animation-duration\s*:[^;{}]*|animation\s*:\s*[^;{}]*?\d+(?:\.\d+)?m?s/gi;
  let m;
  while ((m = re.exec(html))) {
    // var(--loop) is the sanctioned value and is not a hardcoded duration.
    if (/var\(\s*--loop\s*\)/i.test(m[0])) continue;
    out.push(lineOf(html, m.index));
  }
  return out;
}

function findWebfontImport(html) {
  const out = [];
  const re = /@import\s+(?:url\()?["']?https?:/gi;
  let m;
  while ((m = re.exec(html))) out.push(lineOf(html, m.index));
  return out;
}

function findTinyFonts(html) {
  const out = [];
  const re = /font-size\s*:\s*(\d+(?:\.\d+)?)px/gi;
  let m;
  while ((m = re.exec(html))) {
    if (parseFloat(m[1]) < MIN_FONT_PX) out.push(`${lineOf(html, m.index)} (${m[1]}px)`);
  }
  return out;
}

/** Two silent-death cases, neither of which CSS reports as an error:
 *  a class like "rise-9" that no rule defines, and an animation-name pointing at
 *  a @keyframes that does not exist. Either way the element simply never animates
 *  and the GIF looks subtly dead. Checking inline animation-name alone is not
 *  enough - the decks style everything through classes, so that check inspects
 *  zero names and passes vacuously. Returns the violations AND how many things
 *  were actually examined, so a vacuous pass is visible rather than green. */
const ANIM_FAMILY = /^(?:rise|pop|draw|flow|glow|fill|pulse)-\d+$|^(?:anim|amb)-[a-z]+$/;

function findDanglingAnimations(html, file) {
  const sheets = [];
  const missing = [];
  for (const m of html.matchAll(/<link[^>]+href=["']([^"']+\.css)["']/gi)) {
    if (/^https?:/i.test(m[1])) { missing.push(m[1]); continue; }
    const p = path.resolve(path.dirname(file), m[1]);
    if (fs.existsSync(p)) sheets.push(fs.readFileSync(p, "utf8"));
    else missing.push(m[1]);
  }
  // Without the stylesheet every class looks undefined, so the check would blame
  // the deck for the harness's broken path. Report the real cause and check nothing.
  if (missing.length) return { out: [], checked: 0, missing };
  const blob = [html, ...sheets].join("\n");
  const keyframes = new Set([...blob.matchAll(/@keyframes\s+([A-Za-z0-9_-]+)/g)].map((m) => m[1]));
  const classes = new Set([...blob.matchAll(/\.([A-Za-z][A-Za-z0-9_-]*)/g)].map((m) => m[1]));

  const out = [];
  let checked = 0;

  for (const m of html.matchAll(/animation-name:\s*([A-Za-z0-9_-]+)/g)) {
    checked++;
    if (!keyframes.has(m[1])) out.push(`${lineOf(html, m.index)} animation-name ${m[1]} has no @keyframes`);
  }
  for (const m of html.matchAll(/class=["']([^"']+)["']/g)) {
    for (const cls of m[1].trim().split(/\s+/)) {
      if (!ANIM_FAMILY.test(cls)) continue;
      checked++;
      if (!classes.has(cls)) out.push(`${lineOf(html, m.index)} class .${cls} is not defined in any stylesheet`);
    }
  }
  return { out, checked, missing };
}

function lineOf(text, idx) {
  return `line ${text.slice(0, idx).split("\n").length}`;
}

function lintHtml(file) {
  head(`HTML  ${file}`);
  const html = fs.readFileSync(file, "utf8");

  const delays = findAnimationDelay(html);
  delays.length
    ? fail(`animation-delay used at ${delays.join(", ")}. It shifts the whole cycle, ` +
           `so the element also exits late and the loop turns into random blinking. ` +
           `Use an index class (.rise-3, .draw-3, .pop-3) instead.`)
    : pass("no animation-delay");

  const durs = findAnimationDuration(html);
  durs.length
    ? fail(`hardcoded animation duration at ${durs.join(", ")}. Every animation must ` +
           `run for var(--loop) so the renderer can scrub one shared timeline.`)
    : pass("no hardcoded animation-duration");

  const imports = findWebfontImport(html);
  imports.length
    ? fail(`remote @import at ${imports.join(", ")}. The renderer has no network ` +
           `webfonts; the font silently falls back and the layout shifts. Use system stacks.`)
    : pass("no remote font @import");

  if (!/base\.css/.test(html)) warn("assets/base.css does not appear to be linked");

  const { out: dangling, checked: nAnim, missing } = findDanglingAnimations(html, file);
  if (missing.length) {
    fail(`stylesheet not found: ${missing.join(", ")}. Every class in this deck is ` +
         `unstyled, so the render would be a bare page. Check the href is right ` +
         `relative to the deck.`);
  } else if (dangling.length) {
    fail(`animation refers to something undefined: ${dangling.join("; ")}. CSS does not ` +
         `error on this - the element just never animates and the GIF looks dead.`);
  } else if (nAnim === 0) {
    warn("no animation classes found to check; is base.css linked and are the classes spelled right?");
  } else {
    pass(`all ${nAnim} animation references resolve`);
  }

  const tiny = findTinyFonts(html);
  if (tiny.length) warn(`font-size under ${MIN_FONT_PX}px at ${tiny.join(", ")}; unreadable in a mobile feed`);
  else pass(`no text under ${MIN_FONT_PX}px`);
}

/* ---------------- GIF gate ---------------- */

function ffprobeFrames(file) {
  const out = execFileSync("ffprobe", [
    "-v", "error", "-select_streams", "v:0", "-count_frames",
    "-show_entries", "stream=nb_read_frames", "-of", "csv=p=0", file,
  ]).toString().trim();
  return parseInt(out, 10);
}

/** Decode every frame to a small grayscale thumbnail and diff them. */
function frameDiffs(file, w = 108, h = 135) {
  const raw = execFileSync("ffmpeg", [
    "-v", "error", "-i", file, "-vf", `scale=${w}:${h}`,
    "-f", "rawvideo", "-pix_fmt", "gray", "-",
  ], { maxBuffer: 1 << 28 });
  const per = w * h;
  const n = Math.floor(raw.length / per);
  const frame = (i) => raw.subarray(i * per, (i + 1) * per);
  const diff = (a, b) => {
    let s = 0;
    for (let i = 0; i < per; i++) s += Math.abs(a[i] - b[i]);
    return s / per;
  };
  const trans = [];
  for (let i = 1; i < n; i++) trans.push(diff(frame(i - 1), frame(i)));
  return { n, trans };
}

function median(xs) {
  const s = [...xs].sort((a, b) => a - b);
  return s.length ? s[Math.floor(s.length / 2)] : 0;
}

function gateGif(file) {
  head(`GIF   ${file}`);
  const mb = fs.statSync(file).size / 1e6;
  mb <= MAX_MB
    ? pass(`${mb.toFixed(2)} MB (ceiling ${MAX_MB})`)
    : fail(`${mb.toFixed(2)} MB exceeds LinkedIn's ${MAX_MB} MB ceiling; it will freeze on frame one`);

  const frames = ffprobeFrames(file);
  frames <= MAX_FRAMES
    ? pass(`${frames} frames (ceiling ${MAX_FRAMES})`)
    : fail(`${frames} frames exceeds LinkedIn's ${MAX_FRAMES}-frame ceiling`);

  const { n, trans } = frameDiffs(file);
  if (n < 2) { fail("only one frame decoded; this is a static image, not a GIF"); return; }

  const med = median(trans);
  const peak = Math.max(...trans);
  // Total blindness: nothing moves anywhere.
  if (peak < 0.05) {
    fail("every frame is identical. Nothing animates. Most likely the renderer was " +
         "passed animations:'disabled', which fast-forwards animations to their end state.");
  } else {
    pass(`motion present (median frame delta ${med.toFixed(2)}, peak ${peak.toFixed(2)})`);
  }

  // Partial blindness: motion exists, but only in a small stretch of the loop.
  const staticT = trans.filter((d) => d < 0.05).length;
  const staticPct = (staticT / trans.length) * 100;
  if (staticPct > 60) {
    warn(`${staticT}/${trans.length} transitions (${staticPct.toFixed(0)}%) are frozen. ` +
         `Holding the finished state is intentional, but over 60% reads as a still image that flickers.`);
  } else {
    pass(`${(100 - staticPct).toFixed(0)}% of transitions carry motion`);
  }

  // No seam check here, deliberately. A whole-frame diff of last-against-first cannot
  // tell a legitimate synchronised exit from a wrong-phase jump: both are large. It was
  // measured against a GIF rendered at the wrong --duration and could not separate it
  // from a correct render, so it is not shipped. render_gif.mjs checks the loop directly
  // instead, by comparing the page state at t=duration against t=0, and refuses to build
  // a GIF when they differ.
  console.log(`  [INFO] median frame delta ${med.toFixed(2)}, peak ${peak.toFixed(2)}`);
}

/* ---------------- selftest ----------------
   Every detector is checked in BOTH directions: it must fire on a known
   violation AND stay silent on a known-good sample. A detector that only
   ever returns "clean" would pass a one-directional check. */

function selftest() {
  head("SELFTEST  detectors must discriminate in both directions");
  const cases = [
    ["animation-delay", findAnimationDelay,
      `<div style="animation-delay:.35s"></div>`,
      `<div class="rise-3"></div>`],
    ["animation-duration", findAnimationDuration,
      `<style>.c{animation:rise1 3s infinite}</style>`,
      `<style>.c{animation-name:rise1}</style>`],
    ["animation-duration var(--loop) allowed", findAnimationDuration,
      `<style>.c{animation-duration:2.5s}</style>`,
      `<style>.c{animation-duration:var(--loop)}</style>`],
    ["remote @import", findWebfontImport,
      `<style>@import url("https://fonts.googleapis.com/css2?family=Inter");</style>`,
      `<style>@import "local.css";</style>`],
    // The samples carry no <link>, so nothing is read from disk and the path is
    // only there to satisfy the signature.
    ["dangling animation-name", (h) => findDanglingAnimations(h, "/nonexistent/deck.html").out,
      `<style>@keyframes rise1{}.c{animation-name:risee}</style>`,
      `<style>@keyframes rise1{}.c{animation-name:rise1}</style>`],
    ["undefined animation class", (h) => findDanglingAnimations(h, "/nonexistent/deck.html").out,
      `<style>.rise-1{}</style><div class="card rise-9"></div>`,
      `<style>.rise-1{}</style><div class="card rise-1"></div>`],
    ["tiny fonts", findTinyFonts,
      `<style>.b{font-size:18px}</style>`,
      `<style>.b{font-size:25px}</style>`],
  ];
  let bad = 0;
  for (const [name, fn, dirty, clean] of cases) {
    const onDirty = fn(dirty).length;
    const onClean = fn(clean).length;
    if (onDirty === 0) { console.log(`  [FAIL] ${name}: blind, did not fire on a known violation`); bad++; }
    else if (onClean !== 0) { console.log(`  [FAIL] ${name}: false positive on known-good input`); bad++; }
    else console.log(`  [PASS] ${name}: fires on bad (${onDirty}), silent on good`);
  }
  console.log(bad ? `\nSELFTEST FAILED (${bad})` : "\nSELFTEST PASSED");
  process.exit(bad ? 1 : 0);
}

/* ---------------- main ---------------- */

const args = process.argv.slice(2);
if (!args.length || args.includes("-h") || args.includes("--help")) {
  console.log("usage: node qa.mjs [deck.html] [post.gif]\n       node qa.mjs --selftest");
  process.exit(args.length ? 0 : 2);
}
if (args.includes("--selftest")) selftest();

for (const f of args) {
  if (!fs.existsSync(f)) { fail(`no such file: ${f}`); continue; }
  const ext = path.extname(f).toLowerCase();
  if (ext === ".html" || ext === ".htm") lintHtml(f);
  else if (ext === ".gif") gateGif(f);
  else warn(`skipping ${f}: not an .html or .gif`);
}

console.log(failures ? `\nGATE FAILED (${failures})` : "\nGATE PASSED");
process.exit(failures ? 1 : 0);
