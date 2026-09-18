#!/usr/bin/env node
/**
 * Is this new version actually different from the last one?
 *
 * Written after a cut was re-animated, signed off as "more animated", and the
 * reaction was "I think we did the same video". That was correct, and nobody
 * could prove it either way because the only instrument was opinion.
 *
 * Measures the mean per-pixel difference between two renders, frame by frame,
 * using ffmpeg's difference blend. A value of 0 means the two files are
 * identical at that frame. On a 0-255 scale, a whole-film mean under about 2
 * is a version that will be called "the same video".
 *
 * Usage:
 *   node version-difference.mjs candidate.mp4 reference.mp4
 *   node version-difference.mjs candidate.mp4 reference.mp4 --min 5
 *   node version-difference.mjs candidate.mp4 reference.mp4 --baseline prior.mp4
 *
 * --min N       fail if the mean difference is below N
 * --baseline F  also measure F against the reference, and fail unless the
 *               candidate differs more than F did. Use the version that was
 *               already rejected as too similar: it is the only threshold you
 *               have that is grounded in a real judgement rather than a guess.
 *
 * Controls are not optional and run automatically:
 *   - the reference against itself must read 0. If it does not, the two files
 *     are misaligned and every other number here is noise.
 *   - the candidate against the reference must read non-zero. Without this, a
 *     harness handed the same path twice reports a clean 0 and that reads as
 *     agreement rather than as a broken measurement.
 */

import {spawn} from 'node:child_process';
import {existsSync} from 'node:fs';
import {basename} from 'node:path';

const argv = process.argv.slice(2);
const files = argv.filter((a) => !a.startsWith('--'));
const flag = (name) => {
	const i = argv.indexOf('--' + name);
	return i === -1 ? null : argv[i + 1];
};

const [candidate, reference] = files;
if (!candidate || !reference) {
	console.error('usage: version-difference.mjs candidate.mp4 reference.mp4 [--min N] [--baseline prior.mp4]');
	process.exit(2);
}
for (const f of [candidate, reference, flag('baseline')].filter(Boolean)) {
	if (!existsSync(f)) {
		console.error('FATAL: %s does not exist', f);
		process.exit(2);
	}
}

/**
 * Mean frame-to-frame difference WITHIN one file: how much the picture moves.
 *
 * This is the metric that answers "is it more animated", and it is not the same
 * question as "is it different from the last version". A version can differ
 * enormously from its predecessor by sitting at a constant camera offset, which
 * scores high here against the other file while still looking like the same
 * video very slightly zoomed. Temporal activity cannot be faked that way: it
 * only rises if the picture actually changes from one frame to the next.
 *
 * tblend=difference compares each frame with the one before it in the same
 * file.
 */
function measureSelf(a) {
	return new Promise((resolve, reject) => {
		const args = [
			'-v', 'error', '-nostdin', '-i', a,
			'-vf',
			'tblend=all_mode=difference,format=gray,signalstats,metadata=print:key=lavfi.signalstats.YAVG:file=-',
			'-f', 'null', '-',
		];
		const p = spawn('ffmpeg', args);
		let out = '';
		let err = '';
		p.stdout.on('data', (d) => (out += d));
		p.stderr.on('data', (d) => (err += d));
		p.on('error', reject);
		p.on('close', (code) => {
			if (code !== 0) return reject(new Error('ffmpeg exited ' + code + '\n' + err.slice(-600)));
			const vals = [];
			for (const line of out.split('\n')) {
				const m = line.match(/YAVG=([\d.]+)/);
				if (m) vals.push(parseFloat(m[1]));
			}
			if (!vals.length) return reject(new Error('no frames measured in ' + a));
			resolve(vals);
		});
	});
}

/**
 * Mean per-frame difference between two files.
 *
 * blend=difference gives |a - b| per channel, format=gray collapses it, and
 * signalstats reports YAVG per frame, which is the mean absolute difference on
 * a 0-255 scale. Reading it through metadata=print avoids parsing the human
 * readable log, which changes between ffmpeg builds.
 */
function measure(a, b) {
	return new Promise((resolve, reject) => {
		const args = [
			'-v', 'error', '-nostdin',
			'-i', a, '-i', b,
			'-filter_complex',
			'[0:v][1:v]blend=all_mode=difference,format=gray,signalstats,metadata=print:key=lavfi.signalstats.YAVG:file=-',
			'-f', 'null', '-',
		];
		const p = spawn('ffmpeg', args);
		let out = '';
		let err = '';
		p.stdout.on('data', (d) => (out += d));
		p.stderr.on('data', (d) => (err += d));
		p.on('error', reject);
		p.on('close', (code) => {
			if (code !== 0) return reject(new Error('ffmpeg exited ' + code + '\n' + err.slice(-600)));
			const vals = [];
			for (const line of out.split('\n')) {
				const m = line.match(/YAVG=([\d.]+)/);
				if (m) vals.push(parseFloat(m[1]));
			}
			if (!vals.length) {
				return reject(new Error(
					'no frames measured comparing ' + a + ' and ' + b +
					'. Different resolutions or frame counts will do this, and it ' +
					'would otherwise look like a clean zero.'));
			}
			resolve(vals);
		});
	});
}

const stats = (v) => {
	const s = [...v].sort((x, y) => x - y);
	const mean = v.reduce((a, c) => a + c, 0) / v.length;
	return {
		n: v.length,
		mean,
		median: s[Math.floor(s.length / 2)],
		p95: s[Math.floor(s.length * 0.95)],
		max: s[s.length - 1],
		// The share of the film that is visually untouched. A version can post a
		// decent mean off a handful of big moments while most of it is identical,
		// and that is exactly what gets called "the same video".
		flatShare: v.filter((x) => x < 1).length / v.length,
	};
};

const show = (label, s) =>
	console.log(
		'  %s  mean %s  median %s  p95 %s  max %s  under-1 %s%%',
		label.padEnd(28),
		s.mean.toFixed(2).padStart(6),
		s.median.toFixed(2).padStart(6),
		s.p95.toFixed(2).padStart(6),
		s.max.toFixed(2).padStart(6),
		(s.flatShare * 100).toFixed(0).padStart(3),
	);

const run = async () => {
	let bad = 0;

	if (argv.includes('--self')) {
		console.log('Frame-to-frame movement within each file, 0-255.');
		console.log('Higher means the picture actually changes. This is the');
		console.log('"is it more animated" number.\n');
		for (const f of files) {
			const s = stats(await measureSelf(f));
			show(basename(f), s);
		}
		console.log('\n  Compare the means. A version that was called "the same video"');
		console.log('  is your threshold: beat it by a margin you can see, not by 10%.');
		return process.exit(0);
	}

	console.log('Mean per-pixel difference, 0-255. 0 means identical.\n');

	const cand = stats(await measure(candidate, reference));
	show(basename(candidate), cand);

	let base = null;
	const baselineFile = flag('baseline');
	if (baselineFile) {
		base = stats(await measure(baselineFile, reference));
		show(basename(baselineFile) + ' (baseline)', base);
	}

	console.log('\n  controls');
	const c1 = stats(await measure(reference, reference));
	const ok1 = c1.mean === 0 && c1.max === 0;
	console.log('    reference vs itself   %s   %s (must be 0)', c1.mean.toFixed(4), ok1 ? 'PASS' : 'FAIL');
	if (!ok1) bad = 1;

	const ok2 = cand.mean > 0;
	console.log('    candidate vs reference %s  %s (must be non-zero)', cand.mean.toFixed(4), ok2 ? 'PASS' : 'FAIL');
	if (!ok2) bad = 1;

	console.log('\n  verdict');
	const min = flag('min');
	if (min !== null) {
		const ok = cand.mean >= parseFloat(min);
		console.log('    mean %s vs --min %s   %s', cand.mean.toFixed(2), min, ok ? 'PASS' : 'FAIL');
		if (!ok) bad = 1;
	}
	if (base) {
		const ratio = cand.mean / Math.max(base.mean, 0.001);
		const ok = ratio > 1;
		console.log('    %sx the baseline            %s', ratio.toFixed(1), ok ? 'PASS' : 'FAIL');
		if (!ok) bad = 1;
		if (ok && ratio < 1.5) {
			console.log('    NOTE: under 1.5x. The baseline was already judged too similar,');
			console.log('          so a small multiple of it is unlikely to read as different.');
		}
	}
	if (min === null && !base) {
		console.log('    no threshold given, reporting only. Pass --min or --baseline to gate.');
	}

	console.log(bad ? '\nDIFFERENCE GATE FAILED' : '\nDIFFERENCE GATE PASSED');
	process.exit(bad);
};

run().catch((e) => {
	console.error('FATAL:', e.message);
	process.exit(2);
});
