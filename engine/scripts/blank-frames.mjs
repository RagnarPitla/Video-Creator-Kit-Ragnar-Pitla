#!/usr/bin/env node
/**
 * Blank-frame gate for flat dark styles.
 *
 * The kit's contrast.mjs keys on luma spread, which works on a light film but
 * over-reports here: roughly 95% of every ailabs-explainer frame is #0D0D0D by
 * design, so legitimate frames look low-contrast to it. This gate asks a narrower
 * question that survives the style -- is the frame *uniform*, i.e. does it contain
 * literally nothing? -- and so it only fires on frames that are genuinely empty.
 *
 * It is deliberately not a replacement for contrast.mjs. It cannot see a white
 * wash, a wrong colour, or anything about the edit. It sees empty frames.
 *
 *   node scripts/blank-frames.mjs out/style-proof.mp4 [--allow-head N] [--threshold T]
 *
 * Exits 0 when clean, 1 when a disallowed blank frame is present, 2 on a usage or
 * decode error. Read the exit code directly -- piping it into `tail` reports
 * `tail`'s status, which is 0 whatever this decided.
 */
import { spawn } from "node:child_process";

const W = 160;
const H = 90;
const FRAME_BYTES = W * H;

function parseArgs(argv) {
  const args = { file: null, allowHead: 0, threshold: 2 };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--allow-head") args.allowHead = Number(argv[++i]);
    else if (a === "--threshold") args.threshold = Number(argv[++i]);
    else if (a.startsWith("--")) throw new Error(`unknown flag ${a}`);
    else if (args.file === null) args.file = a;
    else throw new Error(`unexpected argument ${a}`);
  }
  if (!args.file) throw new Error("usage: blank-frames.mjs <file> [--allow-head N] [--threshold T]");
  if (!Number.isFinite(args.allowHead) || args.allowHead < 0) throw new Error("--allow-head must be >= 0");
  if (!Number.isFinite(args.threshold) || args.threshold < 0) throw new Error("--threshold must be >= 0");
  return args;
}

/**
 * Decode to a small greyscale raster. Downscaling first is not a shortcut: it
 * averages away lone hot pixels and codec ringing, so a frame has to be uniform
 * over real area to count as blank.
 */
function decode(file) {
  return new Promise((resolve, reject) => {
    const ff = spawn("ffmpeg", [
      "-v", "error",
      "-i", file,
      "-vf", `scale=${W}:${H},format=gray`,
      "-f", "rawvideo",
      "-",
    ]);
    const chunks = [];
    const err = [];
    ff.stdout.on("data", (d) => chunks.push(d));
    ff.stderr.on("data", (d) => err.push(d));
    ff.on("error", reject);
    ff.on("close", (code) => {
      if (code !== 0) return reject(new Error(`ffmpeg exited ${code}: ${Buffer.concat(err).toString().trim()}`));
      resolve(Buffer.concat(chunks));
    });
  });
}

function findBlankFrames(raster, threshold) {
  const count = Math.floor(raster.length / FRAME_BYTES);
  const blank = [];
  for (let f = 0; f < count; f++) {
    const base = f * FRAME_BYTES;
    let min = 255;
    let max = 0;
    for (let i = base; i < base + FRAME_BYTES; i++) {
      const v = raster[i];
      if (v < min) min = v;
      if (v > max) max = v;
    }
    if (max - min <= threshold) blank.push({ frame: f, min, max });
  }
  return { count, blank };
}

/** Collapse consecutive frame numbers so a 90-frame hole reads as one finding. */
function toRuns(blank) {
  const runs = [];
  for (const b of blank) {
    const last = runs[runs.length - 1];
    if (last && b.frame === last.to + 1) {
      last.to = b.frame;
      last.length++;
    } else {
      runs.push({ from: b.frame, to: b.frame, length: 1, min: b.min, max: b.max });
    }
  }
  return runs;
}

async function main() {
  const { file, allowHead, threshold } = parseArgs(process.argv.slice(2));
  const raster = await decode(file);
  const { count, blank } = findBlankFrames(raster, threshold);

  if (count === 0) throw new Error(`decoded 0 frames from ${file}`);

  const runs = toRuns(blank);
  // A run is only forgiven if it is entirely inside the allowed head. A run that
  // starts at frame 0 and continues past it is a real defect, not a long fade.
  const allowed = runs.filter((r) => r.to < allowHead);
  const failing = runs.filter((r) => r.to >= allowHead);

  console.log(`blank-frames: ${file}`);
  console.log(`  frames scanned  ${count}`);
  console.log(`  threshold       max-min <= ${threshold} on a ${W}x${H} grey raster`);
  console.log(`  allowed head    ${allowHead} frame(s)`);

  for (const r of allowed) {
    console.log(`  ok    f${r.from}-${r.to} (${r.length} frame(s)) within allowed head`);
  }
  for (const r of failing) {
    const where = r.length === 1 ? `f${r.from}` : `f${r.from}-${r.to}`;
    console.log(`  FAIL  ${where} (${r.length} frame(s)) uniform at luma ${r.min}`);
  }

  if (failing.length === 0) {
    console.log(`PASS: no blank frames outside the first ${allowHead}.`);
    process.exit(0);
  }
  const total = failing.reduce((n, r) => n + r.length, 0);
  console.log(`FAIL: ${total} blank frame(s) in ${failing.length} run(s).`);
  process.exit(1);
}

main().catch((e) => {
  console.error(`blank-frames: ${e.message}`);
  process.exit(2);
});
