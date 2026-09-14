// Style conformance check: how much of the frame is accent, and is there more than
// one saturated hue in it? Run on PNG, not JPEG -- chroma subsampling invents
// saturated pixels along every high-contrast text edge.
const { execFileSync } = require("child_process");
const [, , file] = process.argv;
const b = execFileSync("ffmpeg", ["-v", "error", "-i", file, "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], {
  maxBuffer: 1 << 28,
});
let accent = 0, saturated = 0;
const hues = new Map();
for (let i = 0; i < b.length; i += 3) {
  const r = b[i], g = b[i + 1], bl = b[i + 2];
  const mx = Math.max(r, g, bl), mn = Math.min(r, g, bl), d = mx - mn;
  // Ignore anything dark or nearly grey; those are the pills and the background.
  if (mx < 70 || d / mx < 0.25) continue;
  saturated++;
  let h = mx === r ? 60 * (((g - bl) / d) % 6) : mx === g ? 60 * ((bl - r) / d + 2) : 60 * ((r - g) / d + 4);
  h = Math.round((((h + 360) % 360) / 15)) * 15 % 360;
  hues.set(h, (hues.get(h) ?? 0) + 1);
  if (h >= 0 && h <= 30) accent++;
}
const total = b.length / 3;
const top = [...hues.entries()].sort((a, c) => c[1] - a[1]).slice(0, 4)
  .map(([h, n]) => `${h}deg:${(100 * n / saturated).toFixed(1)}%`);
console.log(
  file.padEnd(34),
  "accent", (100 * accent / total).toFixed(2) + "% of frame,",
  (100 * accent / Math.max(saturated, 1)).toFixed(1) + "% of saturated px |",
  "hues", top.join(" "),
);
