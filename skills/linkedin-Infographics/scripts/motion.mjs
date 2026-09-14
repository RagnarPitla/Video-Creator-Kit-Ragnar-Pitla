#!/usr/bin/env node
// motion.mjs - the motion-budget gate.
//
// Measures what fraction of a GIF's pixels actually animate, and fails a render
// that spends more than the budget. The budget is not a taste call: across 32
// high-performing infographic GIFs, 31 animate under 2% of their pixels and the
// median is 0.7% (references/poster-analysis.md). Over-animating is the single
// most common way one of these posters stops working.
//
//   node scripts/motion.mjs --selftest        prove the metric
//   node scripts/motion.mjs out.gif [...]     gate one or more renders
import sharp from 'sharp';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

/* Analysis scale is RELATIVE, not a fixed pixel width.
   A fixed 400px width was calibrated against the 800px reference GIFs (a 14px
   dot survives erosion as ~7px, a 2px dither artifact dies). Applied to a
   1080px render it silently halves everything again, and a legitimate 5px
   connector lands at 1.85px, which the >=7-of-8 erosion annihilates. That
   reported 0.00% on nine posters whose wires were plainly moving on screen.
   Downscaling by a constant factor makes the metric say the same thing about
   the same design at any canvas size. */
const SCALE = 0.5;

export async function analyse(gif, tmp, { scale = SCALE } = {}) {
  fs.rmSync(tmp, { recursive: true, force: true });
  fs.mkdirSync(tmp, { recursive: true });
  execFileSync('ffmpeg', ['-v', 'error', '-i', gif, '-vsync', '0', path.join(tmp, '%04d.png')]);
  const files = fs.readdirSync(tmp).filter(f => f.endsWith('.png')).sort();
  if (files.length < 2) return null;

  // cap the number of frames we compare; evenly spaced
  const MAX = 24;
  const step = Math.max(1, Math.floor(files.length / MAX));
  const picked = files.filter((_, i) => i % step === 0).slice(0, MAX);

  const srcW = (await sharp(path.join(tmp, picked[0])).metadata()).width;
  const width = Math.max(120, Math.round(srcW * scale));

  const bufs = [];
  let meta = null;
  for (const f of picked) {
    const img = sharp(path.join(tmp, f)).resize({ width }).greyscale();
    const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });
    if (!meta) meta = info;
    bufs.push(data);
  }
  const n = meta.width * meta.height;
  const min = new Uint8Array(n).fill(255);
  const max = new Uint8Array(n).fill(0);
  for (const b of bufs) {
    for (let i = 0; i < n; i++) {
      const v = b[i];
      if (v < min[i]) min[i] = v;
      if (v > max[i]) max[i] = v;
    }
  }
  const range = new Uint8Array(n);
  let sum = 0, peak = 0;
  const THRESH = 24; // a pixel counts as "moving" above this grey range
  for (let i = 0; i < n; i++) {
    const r = max[i] - min[i];
    range[i] = r;
    sum += r;
    if (r > peak) peak = r;
  }
  // GIF palette quantisation flips anti-aliased EDGE pixels between palette
  // entries with amplitude up to 150 - measured on a provably static deck.
  // Threshold alone cannot separate that from real motion. Real motion is
  // spatially contiguous; palette speckle is isolated. Require a moving pixel
  // to have >=7 of 8 moving neighbours: a 2px-tall edge line tops out at 5
  // (measured), while a 10px blob interior scores 8.
  const hot = new Uint8Array(n);
  for (let i = 0; i < n; i++) hot[i] = range[i] > THRESH ? 1 : 0;
  const solid = new Uint8Array(n);
  const { width: mw, height: mh } = meta;
  for (let y = 1; y < mh - 1; y++) {
    for (let x = 1; x < mw - 1; x++) {
      const i = y * mw + x;
      if (!hot[i]) continue;
      let c = 0;
      for (let dy = -1; dy <= 1; dy++)
        for (let dx = -1; dx <= 1; dx++)
          if (dx || dy) c += hot[i + dy * mw + dx];
      if (c >= 7) solid[i] = 1;
    }
  }
  let moved = 0;
  for (let i = 0; i < n; i++) if (solid[i]) moved++;
  // vertical band profile: which thirds move
  const bands = [0, 0, 0];
  const bandPix = [0, 0, 0];
  for (let y = 0; y < mh; y++) {
    const b = Math.min(2, Math.floor((y / mh) * 3));
    for (let x = 0; x < mw; x++) {
      bandPix[b]++;
      if (solid[y * mw + x]) bands[b]++;
    }
  }
  return {
    frames: files.length,
    compared: picked.length,
    movedPct: (moved / n) * 100,
    meanRange: sum / n,
    peakRange: peak,
    bandPct: bands.map((v, i) => (v / bandPix[i]) * 100),
    range, solid, meta,
  };
}

export async function heatmap(res, out) {
  const { range, meta } = res;
  const rgb = Buffer.alloc(meta.width * meta.height * 3);
  for (let i = 0; i < range.length; i++) {
    const v = range[i];
    rgb[i * 3] = v > 24 ? Math.min(255, v * 3) : 0;
    rgb[i * 3 + 1] = v > 24 ? Math.min(255, v * 1.2) : 0;
    rgb[i * 3 + 2] = v > 24 ? 40 : 0;
  }
  await sharp(rgb, { raw: { width: meta.width, height: meta.height, channels: 3 } })
    .png().toFile(out);
}

// ---- selftest: prove the metric on REAL content before trusting it ----
// A synthetic fixture with a large flat fill is NOT a valid control here: ffmpeg's
// GIF encoder error-diffuses across big uniform areas and produced a 7-row dither
// wedge, i.e. 0.39% phantom motion on a provably frozen image. Real posters are
// mostly white with small coloured elements, and on that content the encoder is
// stable. So the control is a real poster frame, frozen and re-encoded.
async function selftest() {
  // control must ship with the skill - do not point this at anything outside it
  const SRC = new URL('../examples/ambient.gif', import.meta.url).pathname;
  const d = path.join(os.tmpdir(), 'li-motion-selftest');
  fs.rmSync(d, { recursive: true, force: true });
  fs.mkdirSync(d, { recursive: true });
  execFileSync('ffmpeg', ['-v','error','-y','-i',SRC,'-vf','select=eq(n\\,0)','-frames:v','1',path.join(d,'f1.png')]);
  execFileSync('ffmpeg', ['-v','error','-y','-loop','1','-i',path.join(d,'f1.png'),'-frames:v','30','-framerate','20',path.join(d,'frozen.gif')]);

  let fail = 0;
  const chk = (label, cond, detail) => {
    console.log(`  ${cond ? 'ok  ' : 'FAIL'} ${label}  ${detail}`);
    if (!cond) fail++;
  };
  const frozen = await analyse(path.join(d,'frozen.gif'), path.join(d,'t1'));
  const live   = await analyse(SRC, path.join(d,'t2'));

  chk('a frozen real poster reads as no motion', frozen.movedPct < 0.05,
      `frozen=${frozen.movedPct.toFixed(3)}%`);
  chk('the same poster animated reads as motion', live.movedPct > 0.2,
      `live=${live.movedPct.toFixed(3)}%`);
  chk('frozen and live are separable', live.movedPct > frozen.movedPct * 20,
      `live=${live.movedPct.toFixed(3)}% frozen=${frozen.movedPct.toFixed(3)}%`);
  chk('motion is bounded, not whole-frame', live.movedPct < 40,
      `live=${live.movedPct.toFixed(3)}%`);
  chk('a frozen deck reports no band as active',
      Math.max(...frozen.bandPct) < 0.1, `maxBand=${Math.max(...frozen.bandPct).toFixed(3)}%`);

  console.log(fail ? `\nSELFTEST FAILED (${fail})` : '\nSELFTEST PASSED');
  return fail === 0;
}

export const POSTER_MAX = 2.5;   // fail above this
export const POSTER_MIN = 0.05;  // below this nothing moves at all

async function gate(files) {
  let bad = 0;
  for (const f of files) {
    const r = await analyse(f, path.join(os.tmpdir(), 'li-motion-gate'));
    if (!r) { console.log(`FAIL ${f}  could not read frames`); bad++; continue; }
    const pct = r.movedPct;
    const over = pct > POSTER_MAX, under = pct < POSTER_MIN;
    const tag = over ? 'OVER ' : under ? 'STILL' : 'ok   ';
    console.log(`${tag} ${f}  moving=${pct.toFixed(2)}%  ` +
      `bands[t/m/b]=${r.bandPct.map(v => v.toFixed(1)).join('/')}  frames=${r.frames}`);
    if (over) {
      console.log(`      budget is ${POSTER_MAX}% - the measured set runs 0.19-1.81%.`);
      console.log(`      Move animation off content and onto connectors, panel edges and icons.`);
      bad++;
    }
    if (under) {
      console.log(`      nothing animates; a still would be a smaller file.`);
      bad++;
    }
  }
  return bad === 0;
}

const args = process.argv.slice(2);
if (args[0] === '--selftest') {
  process.exit((await selftest()) ? 0 : 1);
} else if (args.length) {
  process.exit((await gate(args)) ? 0 : 1);
} else {
  console.log('usage: motion.mjs --selftest | motion.mjs <gif...>');
  process.exit(2);
}
