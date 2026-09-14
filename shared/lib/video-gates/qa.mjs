#!/usr/bin/env node
/**
 * Gate a rendered film before it goes anywhere.
 *
 * Checks the three things that have actually shipped broken: a frame count
 * that drifted from the cut, a missing audio stream, and black frames. Black
 * frames are the one that hides - they survived three visual spot-checks on
 * one film because they sat at a scene join nobody sampled.
 *
 * This gate has a known blind spot. It cannot see a frame that has washed out
 * to *white*, which is the failure mode of a light-background film, and one
 * that shipped in three consecutive versions. Run `contrast.mjs` as well
 * wherever clips run back to back.
 *
 * Usage: node qa.mjs <file.mp4> [--frames=N] [--no-audio]
 */
import {execFileSync, spawnSync} from 'node:child_process';
import {existsSync} from 'node:fs';

const FFPROBE = ['/opt/homebrew/bin/ffprobe', 'ffprobe'].find((p) => {
	try {
		execFileSync(p, ['-version'], {stdio: 'ignore'});
		return true;
	} catch {
		return false;
	}
});
const FFMPEG = ['/opt/homebrew/bin/ffmpeg', 'ffmpeg'].find((p) => {
	try {
		execFileSync(p, ['-version'], {stdio: 'ignore'});
		return true;
	} catch {
		return false;
	}
});

const args = process.argv.slice(2);
const file = args.find((a) => !a.startsWith('--'));
const wantFrames = Number((args.find((a) => a.startsWith('--frames=')) || '').split('=')[1]);
const wantAudio = !args.includes('--no-audio');

if (!file || !existsSync(file)) {
	console.error('usage: qa.mjs <file.mp4> [--frames=N] [--no-audio]');
	process.exit(2);
}
if (!FFPROBE || !FFMPEG) {
	console.error('ffmpeg/ffprobe not found');
	process.exit(2);
}

const probe = (a) => execFileSync(FFPROBE, a, {encoding: 'utf8'}).trim();
const fail = [];
const pass = [];

// Frame count. -of csv=p=0 emits a trailing comma, which breaks a naive
// numeric compare - default=nk=1:nw=1 does not.
const frames = Number(
	probe(['-v', 'error', '-select_streams', 'v:0', '-count_frames',
		'-show_entries', 'stream=nb_read_frames', '-of', 'default=nk=1:nw=1', file]),
);
if (Number.isFinite(wantFrames)) {
	if (frames === wantFrames) pass.push(`frames ${frames}`);
	else fail.push(`frames ${frames}, expected ${wantFrames}`);
} else {
	pass.push(`frames ${frames}`);
}

// Audio stream.
const codecs = probe(['-v', 'error', '-show_entries', 'stream=codec_type,codec_name',
	'-of', 'csv=p=0', file]);
const hasAudio = /audio/.test(codecs);
if (wantAudio) {
	if (hasAudio) pass.push('audio present');
	else fail.push('no audio stream');
}

// Black frames. blackframe=amount=50:threshold=80 flags every frame of a
// genuinely dark slide, so it is useless here; blackdetect finds true black.
// blackdetect reports on stderr, not stdout.
const bd =
	spawnSync(FFMPEG,
		['-v', 'info', '-i', file, '-vf', 'blackdetect=d=0.03:pix_th=0.10', '-f', 'null', '-'],
		{encoding: 'utf8', maxBuffer: 64 * 1024 * 1024}).stderr || '';
const hits = [...bd.matchAll(/black_start:([\d.]+) black_end:([\d.]+)/g)];
if (hits.length === 0) pass.push('no black frames');
else {
	for (const h of hits) fail.push(`black ${h[1]}s - ${h[2]}s`);
}

for (const p of pass) console.log(`  ok    ${p}`);
for (const f of fail) console.log(`  FAIL  ${f}`);
console.log(fail.length === 0 ? '\nPASS' : `\nFAIL (${fail.length})`);
if (fail.length === 0) {
	console.log(
		'\nnote: this gate does not detect frames washed out to white.\n' +
			'      run contrast.mjs over any passage where clips run back to back.',
	);
}
process.exit(fail.length === 0 ? 0 : 1);
