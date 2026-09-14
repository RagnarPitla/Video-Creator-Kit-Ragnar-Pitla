#!/usr/bin/env node
/**
 * Find frames that have washed out to the background.
 *
 * This exists because of a bug that shipped in three consecutive versions of a
 * film and was caught by nobody. Remotion `<Sequence>`s do not overlap, so if
 * each clip carries its own opacity fade, a boundary plays one clip's fade-out
 * and *then* the next clip's fade-in. On a dark film that is a dip to black and
 * `blackdetect` finds it. On a light film it is a dip to near-white and
 * nothing in the standard toolchain sees it:
 *
 *   - `qa.mjs` tests for black frames. A white frame is not black.
 *   - Mean brightness does not move. Measured across the same 21 frames on the
 *     broken cut and the fixed one, YAVG was 234.7-238.8 in both. It is a
 *     useless signal here.
 *
 * What does work is the *spread* of luma - `signalstats` YHIGH minus YLOW, the
 * 90th percentile minus the 10th. A frame with content has spread; a frame
 * faded to flat paper does not. On the broken cut spread fell from 25 to 14
 * across 13 frames; on the fixed cut it held flat at 29-30 through the same
 * range. Blank is blank whatever colour it is, so this catches dips to black
 * too.
 *
 * Detection is relative, not a fixed threshold, because spread is
 * content-dependent - a dark product screen in the same film measures 171
 * where a pale drawn scene measures 35. But a single rolling median is not
 * enough either, because it cannot tell a fade from a cut: at a cut from
 * footage to a drawn scene the neighbourhood is mostly footage, so the healthy
 * drawn scene reads as a collapse and the gate cries wolf.
 *
 * The discriminator is transience. A fade through white dips and *recovers*,
 * so it sits below the frames on both sides of it. A cut is a step that
 * *persists*, so only one side is higher. This script flags a frame only when
 * it is below both its before-window and its after-window. Measured proof from
 * one film: at boundary f777-784 the broken cut dips to spread 14 and recovers
 * (flagged), and the fixed cut steps from 171 to 35 and holds (not flagged).
 *
 * Frames are also measured for half a window either side of the requested
 * range, so an edge frame still gets a full comparison. Without that margin
 * the verdict changes with where you set --to, and a gate whose answer depends
 * on the question is not a gate.
 *
 * Usage:
 *   node contrast.mjs <file.mp4> [--from=N] [--to=N]
 *                     [--ratio=0.65] [--window=61] [--floor=6]
 *                     [--allow=522,861] [--tolerance=10] [--json]
 *
 *   --ratio      flag a frame whose spread is below this fraction of the local
 *                median on *both* sides. Default 0.65.
 *   --window     neighbourhood size in frames, split half before and half
 *                after. Default 61.
 *   --floor      also flag anything below this absolute spread, however flat
 *                its neighbourhood is. Default 6.
 *   --allow      frames where a dip is intentional - a section break landing in
 *                a narration pause, or footage cutting to a drawn scene. Runs
 *                within --tolerance of one of these are reported but do not
 *                fail the run.
 *
 * Exits 1 if any unexpected washed run is found.
 */
import {execFileSync, spawnSync} from 'node:child_process';
import {existsSync, readFileSync, rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';

const bin = (names) =>
	names.find((p) => {
		try {
			execFileSync(p, ['-version'], {stdio: 'ignore'});
			return true;
		} catch {
			return false;
		}
	});
const FFMPEG = bin(['/opt/homebrew/bin/ffmpeg', 'ffmpeg']);

const args = process.argv.slice(2);
const file = args.find((a) => !a.startsWith('--'));
const opt = (k, d) => {
	const a = args.find((x) => x.startsWith(`--${k}=`));
	return a === undefined ? d : a.split('=').slice(1).join('=');
};

const from = Number(opt('from', 0));
const toRaw = opt('to', '');
const to = toRaw === '' ? Infinity : Number(toRaw);
const ratio = Number(opt('ratio', 0.65));
const windowSize = Number(opt('window', 61));
const floor = Number(opt('floor', 6));
const tolerance = Number(opt('tolerance', 10));
const allow = String(opt('allow', ''))
	.split(',')
	.map((s) => Number(s.trim()))
	.filter((n) => Number.isFinite(n));
const asJson = args.includes('--json');

if (!file || !existsSync(file)) {
	console.error(
		'usage: contrast.mjs <file.mp4> [--from=N] [--to=N] [--ratio=0.65] [--allow=a,b] [--json]',
	);
	process.exit(2);
}
if (!FFMPEG) {
	console.error('ffmpeg not found');
	process.exit(2);
}

// metadata=mode=print writes nothing to the log in recent ffmpeg builds; it
// has to be given an explicit file. Note also that signalstats has no YSTD -
// only the percentile set - so spread is YHIGH - YLOW.
const statsFile = join(tmpdir(), `contrast-${process.pid}.txt`);
// Measure a margin either side of the requested range so that frames at its
// edges still get a full window. Without this the verdict depends on where
// --to is set: a truncated window at the edge is dominated by whatever
// preceded it, which turns a legitimate cut into a false failure.
const marginFrames = Math.floor(windowSize / 2) + 1;
const measureFrom = Math.max(0, from - marginFrames);
const sel = Number.isFinite(to)
	? `select='between(n\\,${measureFrom}\\,${to + marginFrames})',`
	: measureFrom > 0
		? `select='gte(n\\,${measureFrom})',`
		: '';

const res = spawnSync(
	FFMPEG,
	[
		'-nostdin',
		'-v', 'error',
		'-i', file,
		'-an',
		'-vf', `${sel}signalstats,metadata=mode=print:file=${statsFile}`,
		'-vsync', '0',
		'-f', 'null', '-',
	],
	{encoding: 'utf8', maxBuffer: 32 * 1024 * 1024},
);

if (!existsSync(statsFile)) {
	console.error('ffmpeg produced no stats');
	console.error((res.stderr || '').split('\n').slice(-4).join('\n'));
	process.exit(2);
}

const text = readFileSync(statsFile, 'utf8');
rmSync(statsFile, {force: true});

// select= renumbers frames from 0, so add the offset back.
const offset = measureFrom;
const vals = [];
const blocks = text.split(/frame:(\d+)/).slice(1);
for (let i = 0; i < blocks.length; i += 2) {
	const n = Number(blocks[i]) + offset;
	const body = blocks[i + 1];
	const lo = /YLOW=([\d.]+)/.exec(body);
	const hi = /YHIGH=([\d.]+)/.exec(body);
	const av = /YAVG=([\d.]+)/.exec(body);
	if (lo && hi) {
		vals.push({n, spread: Number(hi[1]) - Number(lo[1]), avg: av ? Number(av[1]) : NaN});
	}
}

if (vals.length === 0) {
	console.error('no frames measured - is this a video file?');
	process.exit(2);
}

const median = (xs) => {
	const s = [...xs].sort((a, b) => a - b);
	return s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2;
};

// A wash dips and recovers; a cut steps and stays. So compare each frame
// against the median of the frames before it AND the median of the frames
// after it, and flag only when it sits below both. A single rolling median
// cannot tell the two apart: at a cut from dark footage to a pale drawn scene
// the window is mostly footage, so the (healthy) pale scene reads as a
// collapse. Measured case - frames 745-800 of a real film step from spread 171
// to spread 35 and hold there. That is a cut, and it must not fail.
const half = Math.floor(windowSize / 2);
const minSide = Math.max(5, Math.round(half / 4));
for (let i = 0; i < vals.length; i++) {
	const before = vals.slice(Math.max(0, i - half), i).map((v) => v.spread);
	const after = vals.slice(i + 1, Math.min(vals.length, i + half + 1)).map((v) => v.spread);
	const bMed = before.length >= minSide ? median(before) : NaN;
	const aMed = after.length >= minSide ? median(after) : NaN;
	const dip =
		Number.isFinite(bMed) &&
		Number.isFinite(aMed) &&
		vals[i].spread < ratio * bMed &&
		vals[i].spread < ratio * aMed;
	// Report the weaker shoulder, so the number shown is the conservative one.
	vals[i].local = Math.min(
		Number.isFinite(bMed) ? bMed : Infinity,
		Number.isFinite(aMed) ? aMed : Infinity,
	);
	vals[i].washed = vals[i].spread < floor || dip;
}

// Frames outside the requested range were measured only to give the frames at
// its edges a complete window. Drop them before reporting.
const reported = vals.filter((v) => v.n >= from && (!Number.isFinite(to) || v.n <= to));

const runs = [];
for (const v of reported) {
	if (!v.washed) continue;
	const last = runs[runs.length - 1];
	if (last && v.n === last.end + 1) last.end = v.n;
	else runs.push({start: v.n, end: v.n});
}
for (const r of runs) {
	const inRun = reported.filter((v) => v.n >= r.start && v.n <= r.end);
	r.frames = r.end - r.start + 1;
	r.min = Math.min(...inRun.map((v) => v.spread));
	r.baseline = Math.max(...inRun.map((v) => v.local));
	r.expected = allow.some((a) => r.start - tolerance <= a && a <= r.end + tolerance);
}

const bad = runs.filter((r) => !r.expected);

if (asJson) {
	console.log(JSON.stringify({file, from, to, ratio, runs, failed: bad.length}, null, 2));
	process.exit(bad.length === 0 ? 0 : 1);
}

console.log(
	`  measured ${reported.length} frames, median spread ${median(reported.map((v) => v.spread)).toFixed(1)}`,
);
if (runs.length === 0) {
	console.log('  ok    no washed frames');
} else {
	for (const r of runs) {
		console.log(
			`  ${r.expected ? 'ok   ' : 'FAIL '} f${r.start}-${r.end}  ${r.frames} frames, ` +
				`spread ${r.min.toFixed(0)} against local ${r.baseline.toFixed(0)}  ` +
				`${r.expected ? 'intended' : 'UNINTENDED WASH'}`,
		);
	}
}
console.log(bad.length === 0 ? '\nPASS' : `\nFAIL (${bad.length} unexpected)`);
process.exit(bad.length === 0 ? 0 : 1);
