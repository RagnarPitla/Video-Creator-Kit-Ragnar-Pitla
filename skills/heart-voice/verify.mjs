#!/usr/bin/env node
// Prove the narration voice on THIS machine is the one the films were timed to.
//
// Kokoro is not byte-reproducible: the same text rendered twice differs by up to
// 0.19 in sample amplitude, so comparing wav bytes reports a change that is not
// there. Sample COUNT is stable to the sample, and the timeline is built from
// measured durations, so duration is the property that actually has to hold.
//
// Re-renders a few segments and compares against the shipped manifest.
//
// Usage: node skills/heart-voice/verify.mjs [vo4]
import { execFileSync } from "node:child_process";
import { readFileSync, existsSync, mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { tmpdir } from "node:os";

const VO = process.argv[2] ?? "vo4";
const SCRIPTS = { vo: "narration.json", vo2: "narration-impact.json", vo3: "narration-story.json",
                  vo4: "narration-bench.json", vo5: "narration-deal.json" };
const N = 3;
const TOL = 0.002;

const root = resolve(process.cwd());
const launcher = join(root, "skills/heart-voice/scripts/heart-voice");
const manifestPath = join(root, "public", VO, "manifest.json");
if (!existsSync(manifestPath)) {
  console.error(`no shipped manifest at public/${VO}/manifest.json`);
  process.exit(1);
}

const shipped = JSON.parse(readFileSync(manifestPath, "utf8")).segments.slice(0, N);
const all = JSON.parse(readFileSync(join(root, SCRIPTS[VO]), "utf8")).segments;
const want = shipped.map((s) => all.find((x) => x.id === s.id));
if (want.some((s) => !s)) {
  console.error("a shipped segment id is missing from the narration script");
  process.exit(1);
}

const dir = mkdtempSync(join(tmpdir(), "hv-verify-"));

const render = (voice, out, segs) => {
  execFileSync(launcher, ["script", writeBatch(out, segs), out], {
    stdio: ["ignore", "ignore", "inherit"],
    env: { ...process.env, HEART_VOICE: voice, HF_HUB_OFFLINE: "1", TRANSFORMERS_OFFLINE: "1" },
  });
  return JSON.parse(readFileSync(join(out, "manifest.json"), "utf8")).segments;
};

const writeBatch = (out, segs) => {
  mkdirSync(out, { recursive: true });
  const p = join(out, "batch.json");
  writeFileSync(p, JSON.stringify({ segments: segs }));
  return p;
};

console.log(`verifying public/${VO} against a fresh af_heart render\n`);

let bad = 0;
const heart = render("af_heart", join(dir, "heart"), want.map(({ id, text }) => ({ id, text })));
for (const [i, s] of shipped.entries()) {
  const got = heart[i].seconds;
  const delta = Math.abs(s.seconds - got);
  const ok = delta <= TOL;
  if (!ok) bad++;
  console.log(`  ${ok ? "MATCH" : "DIFF "}  ${s.id}  shipped ${s.seconds.toFixed(4)}s  rebuilt ${got.toFixed(4)}s  delta ${delta.toFixed(4)}s`);
}

// Control. Durations agreeing proves nothing unless something would have made
// them disagree; without this, a comparison that can only pass reads as a pass.
// Uses altered text rather than a second voice, so it needs no extra download
// and therefore still runs on a machine that has only af_heart.
console.log("\n  control, same voice speaking deliberately different text:");
const ctrl = render("af_heart", join(dir, "ctrl"),
  [{ id: want[0].id, text: `${want[0].text} And here is an extra sentence that was never in the script.` }]);
const ctrlDelta = Math.abs(shipped[0].seconds - ctrl[0].seconds);
console.log(`  ${want[0].id} plus one sentence differs by ${ctrlDelta.toFixed(3)}s`);
if (ctrlDelta <= TOL) {
  console.log("\n  CONTROL FAILED: longer text measured the same, so the check has no power");
  rmSync(dir, { recursive: true, force: true });
  process.exit(2);
}
console.log("  CONTROL OK: a drifting voice would have been caught");

rmSync(dir, { recursive: true, force: true });
console.log(bad === 0
  ? `\nPASS  the bundled af_heart reproduces public/${VO} timings`
  : `\nFAIL  ${bad} of ${shipped.length} segments drifted`);
process.exit(bad === 0 ? 0 : 1);
