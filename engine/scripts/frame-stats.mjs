#!/usr/bin/env node
/**
 * Report luma statistics for named frames of a video, decoded sequentially.
 *
 * Exists because seeking with `-ss` does not reliably land on the frame you
 * asked for, and Python-interpolated `select=eq(n\,N)` filters silently fall
 * back to frame 0 when the escaping is wrong. Both failure modes return
 * plausible numbers for the wrong frame, which is worse than an error.
 *
 * This decodes the whole stream once, in order, and keeps only the frames
 * requested -- the same way scripts/blank-frames.mjs reads a file.
 *
 * Usage:
 *   node frame-stats.mjs <video> <frame,frame,...> [--w 160] [--h 90]
 */
import { spawn } from "node:child_process";

const [, , file, list, ...rest] = process.argv;
if (!file || !list) {
  console.error("usage: frame-stats.mjs <video> <frame,frame,...>");
  process.exit(2);
}
const arg = (name, dflt) => {
  const i = rest.indexOf(`--${name}`);
  return i === -1 ? dflt : Number(rest[i + 1]);
};
const W = arg("w", 160);
const H = arg("h", 90);
const want = new Set(list.split(",").map(Number));
const maxWanted = Math.max(...want);
const frameBytes = W * H;

const ff = spawn("ffmpeg", [
  "-v", "error",
  "-i", file,
  "-vf", `scale=${W}:${H},format=gray`,
  "-f", "rawvideo", "-pix_fmt", "gray", "-",
]);

let buf = Buffer.alloc(0);
let n = 0;
const rows = [];

ff.stdout.on("data", (chunk) => {
  buf = buf.length ? Buffer.concat([buf, chunk]) : chunk;
  while (buf.length >= frameBytes) {
    const frame = buf.subarray(0, frameBytes);
    buf = buf.subarray(frameBytes);
    if (want.has(n)) {
      let min = 255, max = 0, sum = 0;
      for (let i = 0; i < frameBytes; i++) {
        const v = frame[i];
        if (v < min) min = v;
        if (v > max) max = v;
        sum += v;
      }
      rows.push({ n, min, max, spread: max - min, avg: +(sum / frameBytes).toFixed(2) });
    }
    n++;
    if (n > maxWanted) ff.kill("SIGTERM");
  }
});

ff.on("close", () => {
  if (!rows.length) {
    console.error(`no frames matched; stream had ${n} frame(s)`);
    process.exit(2);
  }
  console.log(`decoded sequentially from ${file}, raster ${W}x${H}`);
  console.log(`${"frame".padStart(6)}${"min".padStart(6)}${"max".padStart(6)}${"spread".padStart(8)}${"avg".padStart(8)}   verdict`);
  let worst = null;
  for (const r of rows) {
    const verdict = r.spread <= 2 ? "BLANK" : r.spread < 25 ? "THIN" : "ok";
    if (verdict !== "ok" && (!worst || r.spread < worst.spread)) worst = r;
    console.log(
      `${String(r.n).padStart(6)}${String(r.min).padStart(6)}${String(r.max).padStart(6)}` +
      `${String(r.spread).padStart(8)}${String(r.avg).padStart(8)}   ${verdict}`
    );
  }
  console.log(worst ? `\nthinnest: frame ${worst.n}, spread ${worst.spread}` : "\nall requested frames carry content");
  process.exit(rows.some((r) => r.spread <= 2) ? 1 : 0);
});
