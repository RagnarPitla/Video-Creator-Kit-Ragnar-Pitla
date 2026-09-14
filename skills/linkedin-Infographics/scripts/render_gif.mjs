#!/usr/bin/env node
/**
 * render_gif.mjs - turn an animated HTML page into a looping, LinkedIn-safe GIF.
 *
 * Primary renderer on macOS. It drives the Playwright that ships with the
 * Playwright MCP server and the system Google Chrome, so nothing needs installing.
 * (scripts/render_gif.py is the equivalent for Linux containers that have the
 * Python playwright package instead.)
 *
 * How it works:
 *   1. Loads the HTML in headless Chrome at 2x scale, so text survives quantization.
 *   2. Pauses every Web Animation on the page.
 *   3. Sets each animation's currentTime to an exact millisecond per frame, then
 *      screenshots. Deterministic frames, no timing jitter, no dropped motion.
 *   4. Assembles frames with ffmpeg using one global palette (flat design = tiny files).
 *   5. If the GIF is over budget it retries with fewer colors, then smaller dimensions.
 *
 * Usage:
 *   node render_gif.mjs deck.html -o post.gif
 *   node render_gif.mjs deck.html -o post.gif --duration 6 --fps 12
 *   node render_gif.mjs deck.html --still 4.5 -o preview.png
 *
 * --duration must equal one full loop of the CSS cycle or the GIF will jump.
 * LinkedIn feed GIFs: 5 MB and 400 frames are hard ceilings. Over either and
 * LinkedIn freezes the GIF on frame one.
 */

import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";

const PLAYWRIGHT_HOME =
  "/Users/ragnarpitla/.hermes/node/lib/node_modules/@playwright/mcp/node_modules";

function loadPlaywright() {
  const require = createRequire(import.meta.url);
  const tried = [];
  for (const base of [process.env.PLAYWRIGHT_HOME, PLAYWRIGHT_HOME, null]) {
    try {
      return base
        ? require(path.join(base, "playwright"))
        : require("playwright");
    } catch (e) {
      tried.push(base ?? "<default resolution>");
    }
  }
  console.error(
    "Could not load playwright. Looked in:\n  " +
      tried.join("\n  ") +
      "\nSet PLAYWRIGHT_HOME to a directory containing a playwright package."
  );
  process.exit(1);
}

function parseArgs(argv) {
  const a = {
    html: null, out: "out.gif", width: 1080, height: 1350,
    duration: 6, fps: 12, scale: 2, colors: 128,
    dither: false, maxMb: 4.6, still: null, keepFrames: false,
  };
  const num = (v, name) => {
    const n = Number(v);
    if (!Number.isFinite(n)) { console.error(`--${name} needs a number, got "${v}"`); process.exit(2); }
    return n;
  };
  for (let i = 2; i < argv.length; i++) {
    const k = argv[i];
    if (k === "-o" || k === "--out") a.out = argv[++i];
    else if (k === "--width") a.width = num(argv[++i], "width");
    else if (k === "--height") a.height = num(argv[++i], "height");
    else if (k === "--duration") a.duration = num(argv[++i], "duration");
    else if (k === "--fps") a.fps = num(argv[++i], "fps");
    else if (k === "--scale") a.scale = num(argv[++i], "scale");
    else if (k === "--colors") a.colors = num(argv[++i], "colors");
    else if (k === "--max-mb") a.maxMb = num(argv[++i], "max-mb");
    else if (k === "--still") a.still = num(argv[++i], "still");
    else if (k === "--dither") a.dither = true;
    else if (k === "--keep-frames") a.keepFrames = true;
    else if (k.startsWith("-")) { console.error(`unknown option ${k}`); process.exit(2); }
    else a.html = k;
  }
  if (!a.html) { console.error("usage: node render_gif.mjs <deck.html> [-o out.gif]"); process.exit(2); }
  if (!fs.existsSync(a.html)) { console.error(`no such file: ${a.html}`); process.exit(2); }
  return a;
}

async function captureFrames(a, dir, still) {
  const { chromium } = loadPlaywright();
  // Capture on the SECOND iteration, so nothing is still in its first-run
  // fill-mode state and frame 0 joins frame N-1 seamlessly.
  const offset = a.duration * 1000;
  const times =
    still != null
      ? [offset + still * 1000]
      : Array.from({ length: Math.round(a.duration * a.fps) },
          (_, i) => offset + (i / a.fps) * 1000);

  const browser = await chromium.launch({
    channel: "chrome",
    args: ["--force-color-profile=srgb", "--disable-lcd-text"],
  });
  const page = await browser.newPage({
    viewport: { width: a.width, height: a.height },
    deviceScaleFactor: a.scale,
  });
  await page.goto(pathToFileURL(path.resolve(a.html)).href, { waitUntil: "load" });
  await page.waitForTimeout(400);
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(200);

  const animCount = await page.evaluate(() => {
    document.getAnimations().forEach((x) => { try { x.pause(); } catch {} });
    return document.getAnimations().length;
  });
  if (animCount === 0 && still == null) {
    console.warn("WARNING: page declares 0 animations. The GIF will be a static image.");
  }

  for (let i = 0; i < times.length; i++) {
    await page.evaluate((ms) => {
      document.getAnimations().forEach((x) => { try { x.currentTime = ms; } catch {} });
    }, times[i]);
    await page.screenshot({ path: path.join(dir, `f${String(i).padStart(4, "0")}.png`) });
  }

  // Loop integrity. The primary check measures the real animation periods and
  // compares them to --duration as exact arithmetic, with no threshold to tune.
  // The pixel probe below is the backstop for the case where no animation reports
  // a finite duration and there is therefore nothing to compare against.
  let cssLoop = null;
  let periods = [];
  let loopOk = null;
  let halfDup = false;
  let loopMax = null;
  if (still == null) {
    // Read the resolved duration off the animations themselves rather than the
    // --loop custom property. base.css declares a :root default, so reading the
    // property answers 6s even for a deck that overrides --loop on a child - a
    // confidently wrong number. getTiming().duration is what is really running,
    // and it also exposes a deck animating on more than one period.
    const durs = await page.evaluate(() => {
      const out = [];
      for (const an of document.getAnimations()) {
        const d = an.effect?.getTiming?.().duration;
        if (typeof d === "number" && d > 0) out.push(Math.round(d));
      }
      return out;
    });
    const uniq = [...new Set(durs)].sort((x, y) => x - y);
    periods = uniq.map((ms) => ms / 1000);
    if (uniq.length) {
      const gcd = (x, y) => (y ? gcd(y, x % y) : x);
      const lcm = uniq.reduce((x, y) => (x / gcd(x, y)) * y);
      // Beyond a minute the LCM is a pathological deck, not a render target.
      cssLoop = lcm <= 60000 ? lcm / 1000 : null;
    }

    // Probe 5ms INSIDE the cycle rather than on the boundary. At exactly
    // t = duration Chrome resolves iteration progress with float residue
    // (measured: opacity 4.25e-05 instead of 0, translateY(-0.000158667px)
    // instead of 0). A near-zero opacity is composited where a true 0 is not
    // painted at all, so the boundary probe reported a seam on a correct deck.
    const EDGE = 5;
    const probe = path.join(dir, "loopprobe.png");
    const shootMax = async (ms, ref) => {
      await page.evaluate((t) => {
        document.getAnimations().forEach((x) => { try { x.currentTime = t; } catch {} });
      }, ms);
      await page.screenshot({ path: probe });
      return pixelMaxDiff(probe, ref);
    };
    const base = path.join(dir, "loopbase.png");
    await page.evaluate((t) => {
      document.getAnimations().forEach((x) => { try { x.currentTime = t; } catch {} });
    }, offset + EDGE);
    await page.screenshot({ path: base });
    loopMax = await shootMax(offset + EDGE + a.duration * 1000, base);
    loopOk = loopMax <= LOOP_MAX_DIFF;
    // Half-duration duplicate detection, ONLY when the period could not be measured.
    // When it could, the exact check above already rejects a duration that is a
    // multiple of the cycle, and this probe is actively wrong: on an ambient deck
    // the half-cycle difference is a 2px scan line and a soft halo, which survive
    // neither the 5x downscale nor a 64-level threshold. Measured on a real deck,
    // it reported a duplicate at t=3s while the page had in fact moved the scan
    // line 760px and taken its glow from 0 to a 34px halo.
    if (loopOk && cssLoop == null) {
      halfDup = (await shootMax(offset + EDGE + a.duration * 500, base)) <= LOOP_MAX_DIFF;
    }
    fs.rmSync(probe, { force: true });
    fs.rmSync(base, { force: true });
  }

  await browser.close();
  return { animCount, loopOk, halfDup, loopMax, cssLoop, periods };
}

/** Mean absolute pixel difference between two PNGs, 0-255. Uses ffmpeg to decode,
 *  so there is no image dependency. Chrome's PNG output is not bit-deterministic
 *  between screenshots of identical state, so byte-equality is not usable here:
 *  it was measured failing roughly one run in four on an unchanged, correct deck. */
function pixelMaxDiff(pathA, pathB, w = 216, h = 270) {
  const decode = (p) => execFileSync("ffmpeg", [
    "-v", "error", "-i", p, "-vf", `scale=${w}:${h}`,
    "-f", "rawvideo", "-pix_fmt", "gray", "-",
  ], { maxBuffer: 1 << 26 });
  const a = decode(pathA), b = decode(pathB);
  const n = Math.min(a.length, b.length);
  let max = 0;
  for (let i = 0; i < n; i++) {
    const d = Math.abs(a[i] - b[i]);
    if (d > max) max = d;
  }
  return max;
}

/** Above this, two frames are showing different content rather than encoder noise.
 *  Chosen from a 20-case measurement over all six templates at matching and
 *  mismatched durations: seamless renders topped out at a max difference of 22
 *  (most read 0), broken ones bottomed out at 138. A whole-frame MEAN was tried
 *  first and rejected - it separated the same cases by only 1.6x (0.059 vs 0.122),
 *  because a localised seam barely moves a full-frame average. */
const LOOP_MAX_DIFF = 64;

function buildGif(dir, out, fps, w, h, colors, dither) {
  const pal = path.join(dir, "palette.png");
  const vf = `scale=${w}:${h}:flags=lanczos`;
  const run = (args) => execFileSync("ffmpeg", args, { stdio: ["ignore", "ignore", "inherit"] });
  run(["-y", "-loglevel", "error", "-framerate", String(fps),
       "-i", path.join(dir, "f%04d.png"),
       "-vf", `${vf},palettegen=max_colors=${colors}:stats_mode=diff`, pal]);
  const ditherArg = dither ? "bayer:bayer_scale=5" : "none";
  run(["-y", "-loglevel", "error", "-framerate", String(fps),
       "-i", path.join(dir, "f%04d.png"), "-i", pal,
       "-lavfi", `${vf}[x];[x][1:v]paletteuse=dither=${ditherArg}:diff_mode=rectangle`,
       "-loop", "0", out]);
  return fs.statSync(out).size / 1e6;
}

const a = parseArgs(process.argv);
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "gifframes_"));
try {
  if (a.still != null) {
    await captureFrames(a, tmp, a.still);
    fs.copyFileSync(path.join(tmp, "f0000.png"), a.out);
    console.log(`still -> ${a.out}`);
  } else {
    const n = Math.round(a.duration * a.fps);
    if (n > 400) {
      console.error(`${n} frames exceeds LinkedIn's 400-frame ceiling. Lower --fps or --duration.`);
      process.exit(1);
    }
    console.log(`capturing ${n} frames at ${a.fps} fps (${a.duration}s loop)...`);
    const { loopOk, halfDup, loopMax, cssLoop, periods } = await captureFrames(a, tmp, null);

    // Exact check first. The deck states its own cycle length, so a mismatch is
    // arithmetic, not a judgement call, and the message can name both numbers.
    if (cssLoop != null && Math.abs(cssLoop - a.duration) > 1e-6) {
      const mult = a.duration / cssLoop;
      const rotated = Number.isInteger(mult);
      const how = periods.length > 1
        ? `This deck animates on ${periods.length} different periods (${periods.join("s, ")}s), ` +
          `which only all line up again after ${cssLoop}s.`
        : `This deck animates on a ${cssLoop}s cycle.`;
      console.error(
        `LOOP MISMATCH: ${how} You asked for ` +
        `--duration ${a.duration}. ${rotated
          ? `That is ${mult} whole cycles, so it will not tear, but every frame after the ` +
            `first ${cssLoop}s is a duplicate and the file is ${mult}x bigger than it needs ` +
            `to be.`
          : `The GIF will jump at the seam.`} Render at --duration ${cssLoop}.`);
      process.exit(1);
    }
    if (loopOk === false) {
      console.error(
        `LOOP MISMATCH: the page state one full --duration after frame 0 differs from ` +
        `frame 0 by ${loopMax} grey levels, against a tolerance of ${LOOP_MAX_DIFF}. ` +
        `${cssLoop == null
          ? `No animation reported a finite duration, so the cycle could not be measured ` +
            `directly. `
          : `The measured cycle is ${cssLoop}s. `}` +
        `The GIF will jump at the seam.`);
      process.exit(1);
    }
    if (halfDup) {
      console.warn(
        `WARNING: the CSS cycle repeats within --duration ${a.duration}, so every frame ` +
        `is encoded twice and the file is roughly double the size it needs to be. ` +
        `Render at --duration ${a.duration / 2} instead.`);
    }

    let { width: w, height: h, colors, fps } = a;
    let size = buildGif(tmp, a.out, fps, w, h, colors, a.dither);
    for (const c of [96, 64, 48]) {
      if (size <= a.maxMb) break;
      colors = c;
      size = buildGif(tmp, a.out, fps, w, h, colors, a.dither);
    }
    while (size > a.maxMb && w > 720) {
      w = Math.floor(w * 0.85 / 2) * 2;
      h = Math.floor(h * 0.85 / 2) * 2;
      size = buildGif(tmp, a.out, fps, w, h, colors, a.dither);
    }
    console.log(`${a.out}  ${size.toFixed(2)} MB  ${w}x${h}  ${n} frames  ${colors} colors`);
    if (size > a.maxMb) {
      console.error("WARNING: still over budget. Cut motion area or shorten the loop.");
    }
  }
} finally {
  if (a.keepFrames) console.log(`frames kept in ${tmp}`);
  else fs.rmSync(tmp, { recursive: true, force: true });
}
