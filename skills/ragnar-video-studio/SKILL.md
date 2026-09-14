---
name: ragnar-video-studio
description: |
  Drive Ragnar Pitla's agentic video studio from GitHub Copilot CLI, VS Code, and terminal commands. Use when user says "make a video", "explainer video", "remotion video", "video script", "youtube video", "shorts", "video studio", or wants a complete YouTube, Shorts, LinkedIn, or X video production workflow.
user-invokable: true
argument-hint: "[topic, slug, references, target length, platforms]"
metadata:
  tags: video, remotion, youtube, copilot-cli, ragnar, studio
---

# Ragnar Video Studio

Run Ragnar's agentic video studio from Copilot CLI, VS Code, or the terminal.
Topic plus references in, published video plus social pack out. Animation only, no talking head.

Studio root: `<studio>`
Productions: `<productions-root>/<slug>-<YYYY-MM-DD>/`
Delivered videos: `~/Desktop/Y2B-AI/<slug>-<YYYY-MM-DD>/` (Ragnar's pickup folder)
Handoff docs: `<studio>/docs/index.html`

## Repo and portability

The studio is a git repo: **https://github.com/RagnarPitla/rag-remotion-video** (private).
It is the source of truth for the pipeline, the engine, the brand config, and this skill.

`STUDIO_ROOT` is derived from `scripts/_lib.mjs` at runtime, so the clone works from any
directory. Never hardcode an absolute studio path in code or docs.

Setting up or resuming on another machine:

```bash
git clone https://github.com/RagnarPitla/rag-remotion-video.git && cd rag-remotion-video
node scripts/studio.mjs doctor       # pass/fail per binary, path, and credential
cd engine && npm install && cd ..    # ~650 MB, not committed
node scripts/studio.mjs skills       # install skills into ~/.copilot and ~/.claude
node scripts/studio.mjs archive --list
node scripts/studio.mjs archive --restore <slug>
```

Three things never travel with git: `engine/node_modules`, the narration API key (env or
macOS keychain, and keychain does not reliably sync between Macs), and `vendor/remotion`.

**This repo is the source of truth for the skill.** Edit `skills/ragnar-video-studio/SKILL.md`
here, then run `node scripts/studio.mjs skills` to push it out. Use `skills --check` to
detect drift. Do not hand-edit the installed copies.

## Archive rule

Archive anything that cannot be deterministically regenerated.

- **Skip renders.** Same storyboard plus same audio always gives the same frames.
- **Keep TTS audio.** Regenerating narration produces different clip durations, which
  shift `timing.json` and move every scene boundary. Audio is an input to render.

After `archive --restore`, do NOT re-run `vo`. Run `render`, `report`, then `verify`.

## Read first

- `README.md` for the map
- `COPILOT-CLI.md` for per-stage prompts and model routing
- `AGENTS.md` for the harness contract
- The relevant `pipeline/NN-*.md` stage contract
- `brand/VOICE-DNA-RAGNAR.md` before writing any script
- `brand/STYLE-EXPLAINER.md` before storyboarding
- `engine/README.md` before touching components

## Division of labour with official Remotion skills

This skill owns the pipeline, Ragnar's voice, the explainer style, and verification.
Official Remotion skills own Remotion API correctness. Defer to them:

`/remotion-best-practices` when unsure, `/remotion-docs` before using any current API,
`/remotion-markup` for markup and timing, `/remotion-studio` for preview,
`/remotion-render` for render commands, plus `/remotion-captions`, `/remotion-maps`,
`/remotion-saas`, `/remotion-interactivity`, `/remotion-upgrade`, `/remotion-multimedia`.

## Pipeline and canonical artifact paths

Paths are exact. `<studio>/scripts/` is the CLI. `<production>/script/` is the artifact. They are different things.

| Stage | Produces |
|---|---|
| 00 INTAKE | `brief.json` |
| 01 RESEARCH | `research/research.json` claim ledger, `research/refs/` |
| 02 SCRIPT | `script/script.json`, `script/teleprompter.md`, `script/script.md` |
| 03 STORYBOARD | `storyboard/storyboard.json` |
| 04 VISUALS | `visuals/assets.json`, `screenshots/` |
| 05 ANIMATE | Remotion preview from the storyboard |
| 06 AUDIO | `audio/narration.mp3`, `audio/timing.json`, `audio/vo/` |
| 07 RENDER | `render/*.mp4`, `render/*.png`, `render/shorts/` |
| 08 PUBLISH | `social/*`, `report/report.html` |

## Commands

Run from `<studio>`. Prefer the dispatcher.
`--production` is required on every command. From inside a production folder, pass `--production .`.

```bash
node scripts/studio.mjs doctor
node scripts/studio.mjs skills   [--check]
node scripts/studio.mjs archive  --production <slug> | --restore <slug> | --list
node scripts/studio.mjs new      --slug <slug> --title "<title>" --length <seconds>
node scripts/studio.mjs refs     --production <slug> --url "<url>"
node scripts/studio.mjs shots    --production <slug>
node scripts/studio.mjs vo         --production <slug> --script script/script.json --engine openrouter
node scripts/studio.mjs storyboard --production <slug>
node scripts/studio.mjs render     --production <slug> --target long|short|thumb|all --theme dark|light
node scripts/studio.mjs shorts   --production <slug>
node scripts/studio.mjs prompt   --production <slug> --script script/script.json
node scripts/studio.mjs chapters --production <slug>
node scripts/studio.mjs links    --production <slug>
node scripts/studio.mjs social   --production <slug>
node scripts/studio.mjs voice    --production <slug>
node scripts/studio.mjs verify   --production <slug>
node scripts/studio.mjs report   --production <slug>
```

Add `--force` to overwrite existing renders. Renders refuse to overwrite by default.

`prompt` writes `teleprompter.md`, `teleprompter.txt`, and `script.md` from the *measured*
`audio/timing.json`, one sentence per line. Re-run it after any voiceover regeneration
or the timestamps will be stale.

`voice` is the publish gate. It checks every deliverable against the NEVER list in
`brand/VOICE-DNA-RAGNAR.md` section 4 plus the ASCII rule, and exits non-zero on a hit.
Run it before any render, publish, or GitHub write. It has already caught a real banned
word sitting in shipped narration, so treat a failure as real.

## Multi-cut productions and slot namespacing

One production can hold several cuts of the same story: a long landscape cut and a
90 second vertical cut. Both cuts reuse the same beat ids, so every per-cut artifact is
namespaced by *slot*, derived from the script filename:

| Slot | Script | Storyboard | Audio | Timing |
|---|---|---|---|---|
| main | `script/script.json` | `storyboard/storyboard.json` | `audio/vo/`, `audio/narration.mp3` | `audio/timing.json` |
| short | `script/script-short.json` | `storyboard/storyboard-short.json` | `audio/vo-short/`, `audio/narration-short.mp3` | `audio/timing-short.json` |

Each suffixed file falls back to the unsuffixed one, so single-cut productions need no suffixes.

**Never run two `vo` processes against one production at the same time.** They share the
staging path and will overwrite each other. Run them sequentially.

Titles and chapters come from the cut's own script. `render.mjs` must never carry a
default chapter list: the engine already derives chapters from `ChapterCard` scenes, and
`ProgressMap` returns null when the list is empty. A fallback there silently stamps
another video's chapters onto this one.

## Timing is measured, never estimated

Measured pace for the default voice is **137.6 wpm**. Duration in seconds is
`words / 137.6 * 60`. Confirmed across multiple runs. Do not extrapolate from a short
sample: sentence count matters as much as word count because every full stop adds a pause,
and TTS pacing is non-deterministic run to run (the same 5 beat cut measured 100.7s once
and 83.6s after a 20 word trim).

How badly a short sample lies, measured on one voice: a 29 word test line gave **117 wpm**,
84 words of real script gave **144 wpm**, and the full 14 minute production gave **137.6 wpm**.
Short clips contain almost no sentence boundaries, so they overstate the differences between
voices. Never compare voices, or quote a pace, from a single line. On real script six
different voices landed within 8 percent of each other, which is not enough to decide
anything, so voice selection is a timbre judgement the human has to make by listening.

The correct order is: script, then voiceover, then storyboard built *from* `timing.json`.
Build the storyboard from measured audio and picture cannot drift from narration. Build it
from estimates and it always will.

## Voice configuration

The narration model and voice live in `<studio>/brand/VOICE.json`, not in code. Overrides,
strongest last: `VOICE.json`, then `STUDIO_TTS_MODEL` / `STUDIO_TTS_VOICE`, then `--model`
and `--voice`. Changing voice changes timing, so re-run `vo`, rebuild the storyboard, and
re-render. There is no way to change voice without a re-render.

Only `deepgram/flux-tts:free` is usable without OpenRouter credits. Every paid model returns
`HTTP 402` on this account. Before offering a voice as a choice, call it once and confirm it
generates; a name in a table is not proof it runs.

When presenting options to a human, use one numbering scheme everywhere. The same eleven
voice samples once carried three different numbering schemes across two folders and a doc
table, so "voice 10" identified two different models depending on which the reader was
looking at. File names are the identifier; numbers in prose must match them exactly.

## Script schema

`pipeline/schemas/script.schema.json` is enforced by `verify`. Required top level keys are
`productionSlug`, `wordBudget`, `scorecard`, `revisionNotes`, and `beats`. Each beat needs
`id`, `order`, `title`, `targetSeconds`, `narration`, `onScreenText`, `claimRefs`.

Beat `title` becomes the YouTube chapter label, so write them as chapter titles a viewer
would click, not as internal notes. `onScreenText` should be derived from the storyboard so
script and picture agree by construction.

## Voice

Four engines. Two of them ship.

| Engine | What it is | Use for |
|---|---|---|
| `openrouter` | Neural TTS through the existing `OPENROUTER_API_KEY` | Shipping, when you want it back in seconds |
| `chatterbox` | Self-hosted neural TTS running on this machine | Shipping, when you want no key, no cost, no rate limit, or Ragnar's own voice |
| `say` | macOS built-in voice | Never ship this. Timing dry-runs only |
| `none` | No audio, estimates timing at 150 wpm | Storyboard iteration before the script is locked |

**Always pass `--engine` explicitly.** The default used to be `say`, and it silently
produced a placeholder narration for a full 16 beat script before anyone noticed. After
any `vo` run, read `audio/timing.json` and confirm the `engine` field is what you meant.

`chatterbox` needs a one-time `node scripts/studio.mjs setup-voice`. It is slower than the
API, roughly 20 to 60 minutes for a 10 minute video, but it is free and works offline.
Pacing is matched to the API voice (141.5 vs 141.6 wpm on the same script), so switching
engines does not require rebuilding the storyboard. It can also clone Ragnar's voice from
a reference clip:

```bash
node scripts/studio.mjs record-voice
node scripts/studio.mjs vo --production <slug> --script script/script.json \
  --engine chatterbox --voice-ref voice/refs/ragnar.wav
```

Detail, including the pacing calibration and install gotchas, is in
`<studio>/docs/VOICE-SELF-HOSTED.md`.

```bash
node scripts/studio.mjs vo --production <slug> --script script/script.json \
  --engine openrouter --model deepgram/aura-2 --voice aura-2-arcas-en --gap 0.35
```

Defaults are `deepgram/aura-2` / `aura-2-arcas-en`, overridable with `STUDIO_TTS_MODEL`
and `STUDIO_TTS_VOICE`. The key is read from env, then the macOS keychain
(`security find-generic-password -s OPENROUTER_API_KEY -w`). No other account is needed.

Eleven auditioned voices with samples and per-video cost live in
`<studio>/docs/PICK-A-VOICE.md`. Cost is not a real
constraint: the most expensive option is about 29 cents for a 12 minute video.

Every beat is loudness-normalised to -16 LUFS (`--lufs`, or `off`) because providers
vary by more than 10 dB. `--gap` appends breathing room after each beat and is counted
in `timing.json`, so it never desyncs.

**Narration concat is gated.** After stitching, the script compares `narration.mp3`
against the sum of the beats and hard-fails above 50ms. mp3 stream-copy concat silently
adds roughly 22ms of encoder padding per beat, which on a 60-beat long-form video is
over a second of drift. Do not "optimise" that concat back to `-c copy`.

## Engine contract

19 storyboard primitives, a hard contract with `pipeline/schemas/storyboard.schema.json` and `engine/src/scenes/registry.ts`:

TitleCard, KineticText, TermCard, BulletReveal, QuoteCard, FlowDiagram, NodeGraph,
Comparison, StatCounter, BarChart, Timeline, CodeBlock, Screenshot, ImagePan,
DrawOn, Callout, ChapterCard, ProgressMap, EndCard

Supporting layers: Background, Captions, LowerThird, Watermark, SafeFrame, AutoFitText.

Compositions: `Explainer`, `Short`, `Thumbnail`, `Showcase`.

Adding or changing a component means updating all three of: `components/index.tsx`,
`theme/zodSchemas.ts`, `scenes/registry.ts`. Then `npx tsc --noEmit`, then render `Showcase`.

`Callout` is an overlay primitive. When used as a standalone scene with nothing underneath,
pass `edge: "center"` or it will sit off to one side with an empty frame beside it.

`AutoFitText` shrinks text to fit but never grows past the authored token size, and those
tokens are authored for 1920x1080. Portrait needs a raised ceiling plus proportional box
heights or everything reads tiny on a phone. Multi-column primitives such as `Comparison`
must stack vertically in portrait. Never assume a landscape layout survives a 1080x1920 crop:
render the short and look at the frames.

Pass `maxSize` to `AutoFitText` when a short hero string should fill its box, such as a
StatCounter number on a Short or a thumbnail headline. The shrink-to-fit pass still runs,
so a long string stays inside the box. `AutoFitText` is also top-aligned unless `align` is
`center`; when a box is deliberately taller than its text, pass `style={{alignItems: 'center'}}`.

The `Thumbnail` still is not a title card. It is read at about 320x180, so it uses its own
layout with a chip kicker, a headline allowed up to 280px, and an accent rule. Keep the
headline to three or four words and put the promise in the subtitle.

Numbers on screen need their unit in the label. A bar labelled "AI text caught" with the
value 25 is ambiguous; "AI text caught (%)" is not. Check the narration to confirm whether
a value is a percentage or a count before labelling it.

## Validate props before rendering, not during

`storyboard.schema.json` types `props` as a free-form record, so a bad prop passes the
schema and only explodes mid-render, minutes in. Validate against the engine's own zod
schemas first. It takes seconds:

```bash
cd <studio>/engine && npx tsx src/_validate-props.mts <production>/storyboard/storyboard*.json
```

Storyboard scenes key the component as `primitive`, not `component`.

## Rules

- Copilot CLI and VS Code are the primary drivers.
- Pipeline artifacts are contracts. Do not skip gates.
- Every factual sentence carries a `claimRefs` entry resolving to `research/research.json`.
- A cut that makes no external claims sets `"claimPolicy": "first-party"` in `research.json`. Anything that states a fact about the world stays on the default `sourced` policy and must carry refs.
- Frame-based timing at 30 fps. Deterministic only: no `Math.random()`, no `Date.now()`, no timers, no CSS animations or transitions.
- All motion via `useCurrentFrame()`. All `interpolate()` with `extrapolateRight: "clamp"`.
- Never guess a Remotion API. Use `/remotion-docs`, fetch `https://www.remotion.dev/docs/<page>.md`, or read `vendor/remotion/`.
- All on-screen text goes through `AutoFitText`.
- Use design tokens, not literals.
- ASCII-clean everywhere including on-screen text and social copy. No em dashes, smart quotes, section signs, or fancy arrows. Standard emoji are fine.
- Never invent a URL, handle, or statistic. Write `TODO: Ragnar to confirm` and leave it visible.
- Verify every URL with `curl -o /dev/null -s -w "%{http_code}" <url>` before it enters a deliverable. Web search bodies can carry hallucinated URLs even when the citations beside them are real. This has already caught a 404 that read as completely plausible.
- Ragnar's own numbers get labelled as his own on screen, never dressed up as an industry benchmark.

## Generated files versus authored files

`make-social.mjs` writes templates carrying a `TODO: AI WRITE NEEDED` marker. Once that
marker is gone the file counts as authored, and a rebuild will not overwrite it even with
`--force`. Delete a file to get its template back.

The YouTube description is the exception: chapters and links must refresh after every
voiceover change, so the authored body above `## Chapters` is kept and only the generated
tail is replaced. **Never hand-edit anything below `## Chapters`.** It regenerates and your
edit will vanish. Links belong in data:

- Ragnar's stable public links: `<studio>/brand/PROFILE-LINKS.json`
- Video-specific sources and repos: the `bibliography` array in `research/research.json`

`links.mjs` classifies GitHub URLs and enriches them with `gh`, so a repo entry gains its
real description and star count automatically.

Title candidates below rank 1 are pattern fills, not vetted titles, and the scorer can rank
nonsense above a good sentence. The authored `script.title` always wins. Read the rest as
prompts only.

## Contracts drift, so run verify early

`verify` is the only thing that reads every schema. Two failures found the hard way:

- `research.json` had been authored with `claims`, `gaps`, and string confidences while the
  schema declared `claimLedger`, `gapList`, numeric confidence, `claimType`, and `status`.
  Every downstream tool tolerated both shapes, so nothing complained until the gate ran.
  Fix the data to match the contract; only widen the schema when it genuinely cannot
  express something real, such as a bibliography entry needing a title and a type.
- The duration check compared every render against `storyboard.json`, so a short cut was
  measured against the long cut's length. Any check that walks `render/` has to resolve the
  storyboard per slot.

An animation-only production still needs `visuals/assets.json`. Write it with an empty
`items` array and a `checks` entry recording that no external media was used. An empty
manifest is a real answer; a missing one is an unanswered question.

## Verify before claiming done

`scripts/verify.mjs` is the gate and exits non-zero on failure. It checks artifacts exist,
JSON parses, schemas validate, the claim ledger is populated, the script actually carries
claim refs, every ref resolves, asset references exist, renders are present, and durations match.

Under the default `sourced` policy an empty claim ledger is a failure, which is the whole
point of the gate. `"claimPolicy": "first-party"` is the only escape and it is for
experience or method cuts that cite nothing. Do not reach for it to silence a failing
sourced script.

The "script carries claim references" row exists because the gate once silently passed with
`0 refs checked` due to a key-name mismatch. If that row ever reports zero, the gate is broken,
not clean.

Never trust a render because the code looks right. Extract frames and look at them:

```bash
ffmpeg -ss <seconds> -i render/<file>.mp4 -frames:v 1 -y /tmp/f.png
```

Build a contact sheet across all scenes, view it, fix what looks wrong, re-render. At least two rounds.

Budget for it. A 14 minute 1080p render is roughly 20 to 25 minutes; a 90 second portrait
short is about 4. Piping a long render to `tail` hides progress until the pipe closes, so
watch the log file or the growing mp4 on disk instead.

**Rebuild the storyboard before you render.** The script plus `audio/timing.json` are
source; `storyboard.json` is the artifact, and the renderer only reads the artifact.
Editing the script and rendering without re-running `studio.mjs storyboard --force`
silently ships the old text, and 25 minutes are gone before the frame proves it. Compare
mtimes first:

```bash
stat -f '%Sm %N' script/script.json audio/timing.json storyboard/storyboard.json
```

`storyboard` times every scene from `timing.json` and refuses to write a storyboard whose
frame total does not equal the measured narration, so picture cannot drift from voice. It
also writes `visuals/assets.json` when absent, which the verify gate requires. A hand
authored storyboard is never overwritten without `--force`.

After a text-only edit the frame numbers must not move. Diff the rebuilt storyboard against
a copy of the old one and confirm every `startFrame` and `durationInFrames` is unchanged;
if any moved, the narration changed too and the voiceover has to be regenerated.

Batch on-screen text fixes. Before committing to a re-render, dump every string in one pass
and read it as a viewer would:

```bash
python3 -c "import json;[print(s['id'],s['primitive'],'::',' | '.join(s.get('onScreenText') or [])) for s in json.load(open('storyboard/storyboard.json'))['scenes']]"
```

That single pass caught a StatCounter rendering "20M million Gemini responses tested",
because the unit `M` and the word "million" in the label were both saying the same thing.
Units live in `unit`, never in `label`. Values need their unit somewhere: a bar reading 25
is ambiguous until the label says `(%)`.

## Human checkpoints

Record approval after brief, research gaps, script, storyboard, preview, final render, and report.

## Done definition

Stage artifacts exist, `verify` passes, frames have been visually inspected, unresolved
dependencies are explicit as visible TODOs, and the next command or checkpoint is clear.
