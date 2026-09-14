#!/usr/bin/env node
/**
 * Proves a QC reel actually shows the film.
 *
 * The reel is a proxy: it draws the film at half size and seeks it with a
 * negative Sequence offset. Both of those are places where it could silently
 * show the wrong frame - an off-by-one in the seek, a stale prologue offset, a
 * scale that clips - and the failure mode is the worst kind, because the reel
 * would still look like a plausible film and would be trusted.
 *
 * So this compares each mark in the reel against the same frame of the full
 * render. Resampling differs - Chrome rasterising at --scale=0.5 against
 * ffmpeg's downscale of a 1080p raster - so the match is never bit-exact. On
 * text-heavy frames it tops out around 25 dB, which means a fixed "looks high"
 * threshold would be a guess. Instead every mark is compared against a frame it
 * should NOT match, and the gate is the separation between the two.
 *
 * THE RULE THAT MAKES IT HONEST: before asking the reel to tell two frames
 * apart, check that the FILM tells them apart. A control 90 frames into a
 * static hold is the same picture - measured, film f3700 against f3790 is
 * 48.5 dB - so no reel could ever separate them and demanding 6 dB is demanding
 * the impossible. Every test below therefore measures the film's own variation
 * first and reports n/a where the film cannot support the question. A test that
 * cannot fail for a good reason must not be allowed to fail for a bad one.
 *
 * The same trap ended the strict argmax alignment check. On a static hold the
 * PSNR landscape is flat - measured at mark 590, film frames 590 to 596 all
 * matched within 0.39 dB - so argmax lands wherever noise puts it and reports a
 * confident "SEEK OFF BY 6" about a reel that is correct. Alignment now passes
 * on a plateau and only fails when the mark is beaten by a clear margin.
 *
 *   node scripts/qc-verify.mjs --reel <reel.mp4> --film <film.mp4> \
 *     --marks 0,282,432,522 [--span 16] [--control 90] [--min-sep 6] [--fps 30]
 *
 * Exit 0 pass, 1 fail, 2 bad invocation.
 */
import {execFileSync, spawnSync} from 'node:child_process';
import {mkdtempSync, rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';

const arg = (name, fallback) => {
	const i = process.argv.indexOf(name);
	if (i === -1) return fallback;
	const v = process.argv[i + 1];
	if (v === undefined || v.startsWith('--')) {
		console.error(`${name} needs a value`);
		process.exit(2);
	}
	return v;
};

const reel = arg('--reel');
const film = arg('--film');
const marksRaw = arg('--marks');
const span = Number(arg('--span', '16'));
const control = Number(arg('--control', '90'));
const minSep = Number(arg('--min-sep', '6'));
const fps = Number(arg('--fps', '30'));
/** How much better a neighbouring frame may match before it counts as a shift. */
const NEAR_TOL = Number(arg('--near-tol', '0.5'));
/** Marks given a decisive argmax alignment search. 0 disables. */
const ALIGN_PROBE = Number(arg('--align-probe', '3'));
/**
 * Above this, two film frames are the same picture and cannot serve as each
 * other's control. Set just above the reel-vs-film ceiling (~25 dB on text):
 * if the film's two frames resemble each other more closely than the reel can
 * ever resemble the film, separation has no headroom and means nothing.
 */
const SAME_PICTURE = Number(arg('--same-picture', '28'));
/** How far below the best match the mark may sit before alignment counts as off. */
const ALIGN_TOL = Number(arg('--align-tol', '1.0'));
/** Fail if fewer than this fraction of marks could be tested at all. */
const MIN_COVERAGE = Number(arg('--min-coverage', '0.5'));
/** Fraction of marks allowed to look wrong before the reel is condemned. */
const BAD_FRAC = Number(arg('--bad-frac', '0.10'));

if (!reel || !film || !marksRaw) {
	console.error(
		'usage: qc-verify.mjs --reel <mp4> --film <mp4> --marks <n,n,n> [--span 16] [--control 90] [--min-sep 6] [--fps 30]',
	);
	process.exit(2);
}

const marks = [...new Set(marksRaw.split(',').map(Number))].sort((a, b) => a - b);
const work = mkdtempSync(join(tmpdir(), 'qc-verify-'));

const frameCount = (src) => {
	const out = execFileSync(
		'ffprobe',
		['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=nb_frames',
			'-of', 'default=nw=1:nk=1', src],
		{stdio: ['ignore', 'pipe', 'pipe']},
	);
	const n = Number(String(out).trim());
	return Number.isFinite(n) && n > 0 ? n : null;
};

/**
 * Input-side seek, which is frame accurate and does not decode the whole file.
 * `select=eq(n,N)` decodes from frame 0 every time, which costs about 9 seconds
 * at frame 3400 and would make a 46-mark run take twenty minutes.
 *
 * The offset matters and is not obvious. `-ss t` returns the first frame whose
 * pts is >= t, so t = (N + 0.5)/fps lands on frame **N+1** - measured against
 * `select=eq(n,500)`, which matched `slow-501` at inf and frame 500 at only
 * 42.7 dB. Because 42.7 dB looks like a healthy match, an off-by-one here would
 * not announce itself; it would just quietly shift every comparison. Backing off
 * to (N - 0.25)/fps lands inside frame N-1 and returns N. Verified bit-identical
 * (psnr inf) at frames 0, 500, 1540 and 3400.
 */
const grab = (src, frame, out) => {
	const t = Math.max(0, (frame - 0.25) / fps);
	execFileSync(
		'ffmpeg',
		['-v', 'error', '-y', '-ss', t.toFixed(6), '-i', src, '-frames:v', '1', out],
		{stdio: ['ignore', 'ignore', 'pipe']},
	);
};

/**
 * PSNR of b against a, after scaling b to a's size. Infinite reads as 99.
 *
 * ffmpeg writes filter statistics to **stderr**, and execFileSync returns only
 * stdout, so an earlier version of this read an empty string and threw on the
 * first mark every time. Shell testing hid it, because `2>&1 | grep` had already
 * merged the streams by hand. spawnSync gives both.
 */
const psnr = (a, b) => {
	const r = spawnSync(
		'ffmpeg',
		[
			'-v', 'info', '-i', a, '-i', b,
			'-lavfi', '[1:v]scale=rw:rh[s];[0:v][s]psnr',
			'-f', 'null', '-',
		],
		{encoding: 'utf8'},
	);
	const text = `${r.stdout ?? ''}${r.stderr ?? ''}`;
	const m = /average:([0-9.]+|inf)/.exec(text);
	if (!m) {
		throw new Error(
			`no psnr in ffmpeg output for ${a} vs ${b}\n${text.slice(-400)}`,
		);
	}
	return m[1] === 'inf' ? 99 : Number(m[1]);
};

const rows = [];
let failed = 0;
let tested = 0;
const nFilm = frameCount(film);

for (const [i, mark] of marks.entries()) {
	/*
	 * Replicates QcReel's own arithmetic rather than assuming the mark is
	 * centred. The reel clamps `start` at 0, so for any mark below span/2 the
	 * probe point shows start + span/2, not the mark. Assuming centring made
	 * mark 0 compare reel frame 8 against film frame 0 - a comparison that can
	 * pass or fail on the fade-in and means nothing either way.
	 */
	const start = Math.max(0, mark - span / 2);
	const reelFrame = i * span + span / 2;
	const filmFrame = start + span / 2;

	const a = join(work, `reel-${mark}.png`);
	const b = join(work, `film-${mark}.png`);
	grab(reel, reelFrame, a);
	grab(film, filmFrame, b);
	const match = psnr(a, b);

	/*
	 * Pick a control that is genuinely a different picture, rather than trusting
	 * a fixed offset. In a slow shot the frame `control` away is the same image,
	 * and separation against it is a test with no possible pass. Candidates walk
	 * outward until one is clearly different; if none is, the mark gets no
	 * separation verdict instead of a false one.
	 */
	let ctrlFrame = null;
	let filmCtrl = Infinity;
	for (const d of [control, control * 2, control * 4, control * 8, control * 16]) {
		for (const sign of [1, -1]) {
			const n = filmFrame + sign * d;
			if (n < 0 || (nFilm !== null && n >= nFilm)) continue;
			const p = join(work, `ctrlcand-${mark}-${sign * d}.png`);
			grab(film, n, p);
			const v = psnr(b, p);
			if (v < filmCtrl) {
				filmCtrl = v;
				ctrlFrame = n;
			}
		}
		if (filmCtrl < 15) break;
	}

	let ctrl = NaN;
	let sep = NaN;
	let sepOk = null; // null means not applicable
	if (ctrlFrame !== null && filmCtrl <= SAME_PICTURE) {
		const c = join(work, `ctrl-${mark}.png`);
		grab(film, ctrlFrame, c);
		ctrl = psnr(a, c);
		sep = match - ctrl;
		sepOk = sep >= minSep;
	}

	/*
	 * Near-neighbour: the reel must match its own frame better than one a span
	 * away. Gated the same way - in a static shot the neighbour IS the mark, so
	 * the question is unanswerable, and a shift inside a static region shows the
	 * right picture anyway.
	 */
	const nearFrames = [filmFrame - span, filmFrame + span].filter(
		(n) => n >= 0 && (nFilm === null || n < nFilm),
	);
	let near = -Infinity;
	let filmNear = Infinity;
	for (const n of nearFrames) {
		const p = join(work, `near-${mark}-${n}.png`);
		grab(film, n, p);
		filmNear = Math.min(filmNear, psnr(b, p));
		near = Math.max(near, psnr(a, p));
	}
	const nearApplies = nearFrames.length > 0 && filmNear <= SAME_PICTURE;
	const aligned = nearApplies ? match >= near - NEAR_TOL : null;

	const applicable = sepOk !== null || aligned !== null;
	const ok = sepOk !== false && aligned !== false;
	if (!ok) failed++;
	if (applicable) tested++;
	rows.push({
		mark, reelFrame, filmFrame, ctrlFrame, match, ctrl, sep, near,
		filmCtrl, filmNear, sepOk, aligned, applicable, ok,
	});
}

const f = (n) => (Number.isFinite(n) ? n.toFixed(2) : '  n/a').padStart(6);
console.log('mark   reel   film   ctrl   match   ctrl    sep   near  filmC  filmN  verdict');
for (const r of rows) {
	const why = !r.applicable
		? 'n/a (film static here)'
		: r.aligned === false
			? 'SHIFTED'
			: r.sepOk === false
				? 'MISMATCH'
				: 'ok';
	console.log(
		`${String(r.mark).padStart(5)} ${String(r.reelFrame).padStart(6)} ` +
			`${String(r.filmFrame).padStart(6)} ${String(r.ctrlFrame ?? '-').padStart(6)} ` +
			`${f(r.match)} ${f(r.ctrl)} ${f(r.sep)} ${f(r.near)} ` +
			`${f(r.filmCtrl)} ${f(r.filmNear)}  ${why}`,
	);
}

/*
 * The two checks above are cheap and run on every mark, but neither is decisive
 * about a *systematic* seek offset: measured on a reel shifted by 40 frames,
 * separation caught 1 of 6 marks and the neighbour check 2 of 6, because PSNR
 * between two frames of a pushing shot is noisy enough to order them wrongly.
 *
 * So a few marks get the expensive answer: search offsets around the mark and
 * find which film frame the reel frame actually matches best. If that argmax is
 * not the mark, the reel is seeking wrong, and it says so with a number instead
 * of an inference. Three marks is enough because a seek offset is systematic -
 * it cannot be present at one mark and absent at the next.
 */
const alignRows = [];
let alignFailed = 0;
if (ALIGN_PROBE > 0 && rows.length) {
	const step = Math.max(2, Math.round(span / 8));
	const picks = [];
	const n = Math.min(ALIGN_PROBE, rows.length);
	for (let k = 0; k < n; k++) {
		picks.push(rows[Math.floor(((k + 0.5) * rows.length) / n)]);
	}
	for (const r of picks) {
		const a = join(work, `align-reel-${r.mark}.png`);
		grab(reel, r.reelFrame, a);
		let best = null;
		const probe = new Map();
		for (let d = -span; d <= span; d += step) {
			const fr = r.filmFrame + d;
			if (fr < 0 || (nFilm !== null && fr >= nFilm)) continue;
			const p = join(work, `align-film-${r.mark}-${d}.png`);
			grab(film, fr, p);
			const v = psnr(a, p);
			probe.set(d, v);
			if (!best || v > best.v) best = {d, v};
		}
		if (!probe.has(0)) {
			const p0 = join(work, `align-film-${r.mark}-0.png`);
			grab(film, r.filmFrame, p0);
			probe.set(0, psnr(a, p0));
		}
		/*
		 * Plateau-aware. Requiring argmax to land exactly on the mark assumes
		 * the film varies frame to frame; on a hold it does not, and argmax
		 * lands on noise. Measured at mark 590, film 590 to 596 all matched
		 * the reel within 0.39 dB, and strict argmax called that "SEEK OFF BY
		 * 6" about a correct reel. So the mark only has to be within ALIGN_TOL
		 * of the best - a real seek offset is far larger than a plateau.
		 */
		const atMark = probe.get(0);
		const ok =
			best === null ||
			atMark === undefined ||
			Math.abs(best.d) <= step ||
			atMark >= best.v - ALIGN_TOL;
		if (!ok) alignFailed++;
		alignRows.push({
			mark: r.mark,
			offset: best ? best.d : null,
			v: best ? best.v : null,
			atMark,
			ok,
		});
	}
	console.log(`\nalignment search, offsets ${-span}..${span} step ${step}:`);
	for (const r of alignRows) {
		console.log(
			`  f${String(r.mark).padStart(5)} best offset ${String(r.offset).padStart(4)} ` +
				`(${r.v === null ? 'n/a' : r.v.toFixed(2)} dB), at mark ` +
				`${r.atMark === undefined ? 'n/a' : r.atMark.toFixed(2)} dB  ` +
				`${r.ok ? 'ok' : 'SEEK OFF BY ' + r.offset}`,
		);
	}
}

rmSync(work, {recursive: true, force: true});

/*
 * The verdict is distributional, not per-mark, and the measurements say why.
 *
 * At half resolution the reel-vs-film match tops out near 25 dB, so a single
 * mark's separation is noisy. Measured on this film: a reel proven correct by
 * frame inspection gave separations from 4.07 to 25 dB (median 7.88), while a
 * reel shifted 40 frames gave -14.76 to 20 dB (median 3.94). The two ranges
 * overlap, so any per-mark floor either fails a good reel or passes a bad one.
 * The medians do not overlap, and neither do the shifted counts (2 of 46
 * against 17 of 46).
 *
 * That is the right shape for the question anyway. A seek error is systematic:
 * it cannot be present at one mark and absent at the next, so it moves the
 * whole distribution. Judging the distribution measures the defect that exists
 * rather than the one a per-frame threshold imagines.
 */
const seps = rows.filter((r) => Number.isFinite(r.sep)).map((r) => r.sep);
const coverage = rows.length ? tested / rows.length : 0;
const med = (xs) => xs.slice().sort((x, y) => x - y)[Math.floor(xs.length / 2)];
const medSep = seps.length ? med(seps) : NaN;
const negSep = seps.filter((v) => v < 0).length;
const shifted = rows.filter((r) => r.aligned === false).length;
const shiftedFrac = tested ? shifted / tested : 0;
const negFrac = seps.length ? negSep / seps.length : 0;

console.log(
	`\n${rows.length} marks, ${tested} testable (${(coverage * 100).toFixed(0)}% coverage).` +
		(seps.length
			? ` separation min ${Math.min(...seps).toFixed(2)} dB, median ${medSep.toFixed(2)} dB ` +
				`(floor ${minSep} dB), ${negSep} negative.`
			: ' no mark had a usable control.') +
		` ${shifted} matched a neighbour better.`,
);

/*
 * Coverage is its own gate. Every individual test can legitimately report n/a,
 * and if they all did the run would pass having verified nothing - the exact
 * failure this script exists to prevent, one level up. A gate that reports
 * green while measuring nothing is worse than no gate.
 */
const fails = [];
if (coverage < MIN_COVERAGE)
	fails.push(
		`only ${(coverage * 100).toFixed(0)}% of marks were testable (floor ` +
			`${(MIN_COVERAGE * 100).toFixed(0)}%) - this mark set cannot prove anything about this film`,
	);
if (!seps.length) fails.push('no mark had a control that was a different picture');
else {
	if (medSep < minSep)
		fails.push(`median separation ${medSep.toFixed(2)} dB is below the ${minSep} dB floor`);
	if (negFrac > BAD_FRAC)
		fails.push(
			`${negSep} of ${seps.length} marks match their control better than their own frame`,
		);
}
if (shiftedFrac > BAD_FRAC)
	fails.push(`${shifted} of ${tested} marks match a neighbouring frame better`);
if (alignFailed)
	fails.push(
		`${alignFailed} of ${alignRows.length} alignment probes found a clearly better match away from the mark`,
	);

if (fails.length) {
	console.error(`\nFAIL: ${fails.join('; ')}. Do not review from this reel.`);
	process.exit(1);
}
console.log(
	`PASS: separation median ${medSep.toFixed(2)} dB over ${tested} testable marks, ` +
		`${negSep} negative, ${shifted} shifted, alignment probes on the mark.`,
);
