# Registry

Every video-making system on this machine, what it is for, and where it is.
Check here before you build a new one.

The **engines** below live outside the kit and are only referenced. The
**skills** below have since been moved *into* the kit and symlinked back out -
see that section for the ownership rule.

Paths verified 2026-08-30. Anything that has since moved is a bug in this
file: fix it rather than working around it.

## Engines

| Path | Style | Stack |
|---|---|---|
| `~/Desktop/rbuild-ai/Prod-Tools/ig-video-animations` | **ink-board** - vertical hand-drawn concept explainers on an accumulating board. Spec: `shared/brand/ink-board/STYLE.md` | Remotion + TypeScript, Python cue pipeline |
| `~/Desktop/Mia-video/mia-remotion` | Microsoft-house product films cut to existing narration | Remotion |
| `~/Desktop/rbuild-ai/Y2b-Animation-Video-Agent` | YouTube animation work, plus extracted reference frames | mixed |
| `~/Desktop/rbuild-ai/video-studio` | Voice-first studio. Holds the rated TTS comparison | see below |
| `~/Desktop/Scout-local/edit` | Multi-camera podcast edit: per-host recordings plus a screen capture, cut to one episode | Python + ffmpeg |
| `Video-Agent-Kit/engine` | The kit's own Remotion sources for the `ailabs-explainer` style | Remotion |

### ink-board lives outside this kit

`ig-video-animations` is the reference the `ink-board-director` agent points at.
It is not vendored here. Its architecture is the one worth copying if you build
another: narration is the clock, and every mark hangs off a cue phrase from the
transcript rather than a timestamp, so re-recording the voice moves the drawing
with it.

## Skills

Ragnar's own video skills are **canonical in `Video-Agent-Kit/skills/`** and
symlinked into `~/.copilot/skills`, `~/.agents/skills` and `~/.claude/skills`.
Edit the kit copy. The `~/.copilot/skills/...` paths still work because they
are links, but they are not the original.

| Skill in the kit | Use it for |
|---|---|
| `skills/mia-video` | Mia product video work; also the `d365` style spec |
| `skills/podcast-multicam-edit` | speaker-driven shot selection, EDLs, revision passes |
| `skills/ragnar-video-studio` | Ragnar Video Studio pipeline |
| `skills/ragnar-youtube-engine` | YouTube channel workflow |
| `skills/video-prompt` | prompting generative video models |

Do not add a second real copy under a skills directory. That happened once
with `mia-video` and produced two directories that could drift apart in
silence; it was caught only by a recursive diff.

### Left outside deliberately

The `remotion-*` family (`remotion-create`, `captions`, `render`, `studio`,
`docs`, `maps`, `markup`, `multimedia`, `interactivity`, `saas`, `upgrade`,
`best-practices`, `remotion-video-builder`) are upstream-maintained vendor
skills, not ours. They stay in the skills directories so they can be updated
from upstream without a merge against the kit. Same for the `lovart` image
family, which is used well beyond video.

## Voice

Start here rather than picking a TTS at random.

**Default: Kokoro `af_heart`, via `skills/heart-voice/`.** Local, free, no API key,
and the voice preset is committed at a pinned SHA256 so a checkout cannot silently
substitute a different one. Install with `bash skills/heart-voice/setup.sh`; it
downloads the 327 MB weights and verifies them. Anything below is an alternative
that needs an explicit request.

| Path | What |
|---|---|
| `skills/heart-voice/` | **Default.** Kokoro `af_heart`, offline. 54 presets available via `HEART_VOICE` |
| `~/Desktop/rbuild-ai/video-studio/voice-samples/` | ~20 rendered samples across **kokoro, aura2, grok, flux, voxtral, sesame**, with `results.json` holding the ratings |
| `~/Desktop/rbuild-ai/voice-lab` | chatterbox TTS |
| `~/Desktop/rbuild-ai/vibevoice` | VibeVoice |
| macOS `say` | draft narration only. Samantha, Daniel, Karen, Moira, Rishi, Tara, Aman, Reed, Rocko, Sandy, Shelley, Flo, Eddy |

**Design for a voice swap from the start.** In `ink-board`, elements are
pinned to *cue phrases* in the transcript rather than to timestamps, so
dropping in a different recording and re-running re-times the entire film with
no layout edits. Any engine that hard-codes seconds has to be re-cut by hand
every time the voice changes.

## References

| Path | What |
|---|---|
| `references/ailabs-unlazy/` | Measured teardown of the reference video for `ailabs-explainer`: 78 frames, contact sheets, transcript. `TEARDOWN.md` is the style spec |
| `references/unlazy-repo/` | Clone of the repo that video explains |
| `~/Movies/Instagram-Videos/nataliefratto/` | The reference series `ink-board` is derived from |

## Where the docs are

| Doc | Read it when |
|---|---|
| `docs/verification-gates.md` | before calling any render done |
| `docs/authoring-traps.md` | while building. The failures no gate can see |
| `docs/episode-template-ailabs-explainer.md` | scripting an `ailabs-explainer` episode |
| `shared/brand/<style>/STYLE.md` | before writing a single frame in that style |
