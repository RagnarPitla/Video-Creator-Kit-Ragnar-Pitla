---
name: rbuild-video-editor
description: >
  Produce and revise videos with RBuild Video Editor. Use when asked to edit a
  recording, make a Vox-style explainer, turn a script and narration into a video,
  prepare a presenter-ready background, change an edit's theme, or fix mismatched
  audio and visual timing. Use this installed engine rather than inventing a
  separate renderer. Not for podcast multicamera editing or publishing.
---

# RBuild Video Editor

## Locate the engine

Resolve this skill directory's symlinks. The editor repository is two directories
above it. An explicit `RBUILD_VIDEO_EDITOR_HOME` overrides that location. Do not
assume the current working directory is the editor or copy the engine into every
production.

Read `STATE.md`, `CLAUDE.md`, `README.md`, and `NOTICE.md` in the editor before
operating it. They own the current commands, limitations, and licensing notes.
Read `src/themes/README.md` before changing a look. Keep distribution separate
from private video production; do not publish the engine or bundled packs.

## Establish the input contract

Record the script, actual narration or recording, output folder, dimensions,
subtitle choice, presenter geometry, and requested theme before editing.
Carry forward explicit choices from the current production. Preserve earlier
exports and use versioned names.

- With a real presenter recording, follow the documented cut, align, plan, review,
  render workflow. Never hand-edit the generated beat plan.
- Before the presenter has recorded, make an explicitly presenter-ready
  background using the engine's theme and renderer. Do not fabricate a presenter
  or pass synthetic footage through recording-specific quality gates.
- With narration already recorded, reuse the actual take and measured word
  timings. Do not regenerate speech merely to change a visual style.
- With only a script, complete the requested narration stage first. Do not claim
  estimated word timings were measured.

Use the existing `PresenterReel` composition for subtitle-free backgrounds.
Do not create another renderer for each production. Preserve the default
recording workflow. Declare which recording-specific gates do not apply and
replace them with checks that measure the requested output.

## Presenter-ready render path

Read `src/presenter/contract.ts` for block and manifest types,
`src/presenter/registry.tsx` for available blocks, and
`scripts/build_presenter_manifest.mjs` for the editorial spec and word formats.
The scene boundaries in the spec are absolute frames. Word anchors inside each
block use `{"$word":"Square","$nth":1}` and resolve against measured words.
Changing narration requires reviewing scene boundaries as well as rebuilding
anchors; this is not automatic retiming of an arbitrary new recording.

Keep the production outside the engine source. Make captures available below
`public/productions/<slug>/`, with `assetsRoot` relative to `public/`. Keep source
captures and narration outside disposable render directories.

Run from the editor checkout, replacing the example production paths:

```bash
node scripts/build_presenter_manifest.mjs \
  --spec /path/to/production/film.spec.json \
  --words /path/to/production/narration.words.json \
  --out /path/to/production/film.manifest.json \
  --beatmap /path/to/production/beatmap.md
```

Review warnings and the beat map. The props file must wrap the resulting
manifest as `{"manifest": <manifest object>}`; passing the bare manifest is
not the composition's input contract.

```bash
npx remotion still src/methodology/index.ts PresenterReel \
  /path/to/production/probe.png --props=/path/to/production/film.props.json --frame=60
npx remotion render src/methodology/index.ts PresenterReel \
  /path/to/production/presenter-no-audio.mp4 \
  --props=/path/to/production/film.props.json --muted
node scripts/check_presenter_clearance.mjs \
  /path/to/production/presenter-no-audio.mp4 --lane 1344,0,576,1080
```

Always pass the entry point explicitly: the shipped config does not set it.
Use `--muted` for the silent export even though this composition has no Audio
component. Do not set global muting: it would remove the recorded presenter's
audio from `AutoReel`. Confirm the final MP4 has zero audio streams.

Create the voiced reference by muxing the approved narration into a copy of the
silent picture. Apply the declared lead-in once, not again if using already
padded audio. Preserve picture packets and confirm the actual encoded audio's
identity and offset.

The clearance script detects dark or saturated intrusions on a light stage.
It is not a universal blank-region detector: near-background text or shapes
need reference-image comparison or additional controls. Use the actual lane
geometry and test representative content intrusions, not only black text.

## Design around what is said

Select the requested theme through the engine's theme contract. Never alter the
frozen dark theme to create another look. Preserve source evidence, factual
qualifiers, and the distinction between illustration and official footage.

Read installed animations before choosing them. Their meaning must match the
spoken beat; registration alone does not prove the planner can reach a pack.
Check the current blocker in `STATE.md` before relying on automatic selection.
For subtitle-free work, do not fall back to full-narration typewriter captions.
Use meaningful diagrams, brief labels, or real source captures instead.

If presenter space is requested, reserve one explicit rectangle throughout the
video. Nothing important may enter it, including transitions, citations, or
off-screen animation entrances. Supply a separate placement guide, not permanent
placeholder text in the finished video.

## Prove the delivered file

Use the repository's existing type, contrast, theme-parity, and rendering checks.
Probe a representative scene before a long render. Inspect frames from the
encoded export at the actual spoken phrases, not only settled scene endings.

Verify the audio inside the final MP4 against the intended take. A frame map's
filename, matching duration, or passing loudness check cannot detect the wrong
narration. Compare content and order, word-triggered reveals, scene boundaries,
and the last spoken words. Include a wrong-track or shifted-audio control.

For a silent version, confirm there is no audio stream. For a subtitle-free
version, confirm both that no subtitle stream exists and that no captions were
burned into frames. Diagram labels are not subtitles.

Verify presenter clearance across the exported timeline and test a temporary
camera rectangle against the promised region. Remove that rectangle from the
deliverable. Visually inspect every scene for cropping, overlap, and readability.

## Handoff

Deliver the actual MP4, a plain recording transcript, and any required camera
placement guide. State the exact path and whether audio is present. Keep proof
with the production. Explain that a different recording pace requires retiming;
do not promise automatic synchronization merely because a timeline exists.

Reuse source assets rather than duplicating them. Check free space before large
downloads or renders. Remove only known, newly generated scratch outputs after
success; never delete source captures, narration caches, or prior deliveries.
