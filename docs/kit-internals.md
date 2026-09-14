# Video Agent Kit

Shared home for every video-building agent. Research, style systems, component
libraries, verification tooling and finished projects live here so that a new agent
starts from what the last one learned instead of from nothing.

**If you are an agent starting video work: read this file, then `docs/verification-gates.md`,
then the style spec for whichever look you are building. Do not start a new component
library until you have checked whether one already exists here.**

## Layout

| Path | What it holds |
|---|---|
| `agents/` | Agent definitions, one `.md` per role |
| `skills/` | Skills that agents load for house style and hard-won failure lists |
| `shared/brand/<style>/` | Per-style design system: `theme.ts` plus a Remotion component library |
| `shared/lib/` | Cross-style tooling, mostly verification gates |
| `engine/` | Remotion project that renders the `ailabs-explainer` library. `StyleProof` is the style regression reel |
| `references/` | Teardowns of reference videos, and cloned repos for subjects we explain |
| `projects/` | Actual productions |
| `docs/` | Cross-cutting docs that apply to every style |

## Docs

| Doc | Read it when |
|---|---|
| `docs/verification-gates.md` | Before calling any render done. Which gate covers which blind spot, and what none of them can see |
| `docs/ghosted-ui-and-the-qc-reel.md` | When a film puts real product recordings on screen, and before settling for a 20-minute review loop. How half-erased interface happens, and the half-res QC reel that replaces full renders while iterating |
| `docs/episode-template-ailabs-explainer.md` | Scripting an `ailabs-explainer` episode. Beat sheet with word budgets derived from the reference's measured chapter proportions |
| `docs/authoring-traps.md` | While building, not after. The failures no gate can see: silent schema and layer failures, the 9:16 zoom trap, why "boring" is usually weight rather than motion |
| `docs/registry.md` | Before building anything. Every video engine, skill and voice asset on this machine, with verified paths |

## Agents

| Agent | Use it for |
|---|---|
| `explainer-director` | Long-form tool explainers in the `ailabs-explainer` style: mechanism-first teardowns of a repo, skill or tool |
| `ink-board-director` | Vertical hand-drawn concept explainers in the `ink-board` style, under three minutes, for Instagram and LinkedIn |
| `film-director` | Microsoft-house-style vision films and sizzle reels cut to existing narration |
| `podcast-editor` | Multi-camera podcast edits from separate per-host recordings |
| `video-producer` | End-to-end pipeline control and stage gates across the other agents |
| `video-researcher` | Source-grounded research packs and claim ledgers |
| `video-scriptwriter` | Narration in Ragnar's voice, written from a verified claim ledger |
| `video-animator` | Remotion 4 implementation from an approved storyboard |
| `video-publisher` | Packaging verified renders for YouTube, LinkedIn, X and Shorts |

## Styles

| Style | Look | Spec |
|---|---|---|
| `ailabs-explainer` | Near-black canvas, greyed-out skeleton UI, one terracotta accent, long continuous animated holds, screen recordings punched in hard | `references/ailabs-unlazy/TEARDOWN.md` |
| `in-our-ai-era` | DOS-on-paper and black CRT, pixel type, scanlines, typewriter reveals | `shared/brand/in-our-ai-era/BRAND.md` |
| `d365` | White studio space, Segoe UI, glass cards on layered shadows, threads of light, D365 product iconography | `skills/mia-video/SKILL.md` |
| `ink-board` | Cream paper, wobbling ink boiled on fours, marker colour, a camera roaming one tall board that is never erased. Vertical, under three minutes | `shared/brand/ink-board/STYLE.md` |
| `editorial-type` | Same cream and marker palette, no handwriting. Anton and Inter, full-bleed cards, hard cuts on the narration, a chapter numeral and progress rail that hold still across the cuts | `shared/brand/editorial-type/STYLE.md` |

## Projects

| Project | What it is |
|---|---|
| `projects/agent-self-verification/` | `ailabs-explainer` episode, 4:40, on why agents report work complete when it is not. Every element pins to a cue id in `board/timing.json` rather than a timestamp, so re-recording the narration re-times the film with no board edits. `board/check_map.py` gates the frame map against the measured audio before anything renders |
| `projects/project-mia/` | Project Mia vision film. 153.6s, 4608 frames, seventeen versions, cut frame-exactly to existing narration. Scene source and transcript only - the narration audio, screen recordings and 2.3GB of renders stay in the working directory, which the README names |
| `projects/jam-studio/` | Vertical explainer videos about AI. Under three minutes, animated, narrated, no presenter. Six episodes, 63-97s. Length and topic selection are calibrated against 195 mined jam.with.ai videos in `references/jam-with-ai/FINDINGS.md`; the slate is `projects/jam-studio/SLATE.md`. Any episode also cuts to 1920x1080 from the same board with `--orientation horizontal`, at an identical frame count. Run `./jam ideas` for the topic backlog |
| `ig-video-animations` | The `ink-board` engine and its episodes. Lives in its own repo at `~/Desktop/rbuild-ai/Prod-Tools/ig-video-animations`, not vendored here. Episode 001 (Palantir) ships in two visual registers, `Ep001-Palantir` and `Ep001-Palantir-V4` |
| `agent-sprawl-reel` | Vertical reel, 86.3s, on counting the AI agents already running in a company. Lives at `~/Desktop/IG/agent-sprawl-reel`, not vendored here. Built from a pre-existing teardown kit of a ServiceNow-sponsored Harper Carroll reel: 13 CSS animations on one shared timeline, seeked frame by frame with Playwright. Synthesised voice, no presenter. Cues are phrases resolved against a word-level transcript of the voice track, so replacing `audio/vo.wav` re-times every visual with no board edits. `06-render/README.md` records the six defects the build found, including the one where warping a scene clock to land a cue also stretches every animation duration |

## Verification

Every finished video passes the gates in `docs/verification-gates.md` before it is
called done. The short version:

```bash
bash shared/lib/verify/gate.sh out.mp4 --fps 30 --expect-frames <n>
node shared/lib/video-gates/contrast.mjs out.mp4
bash shared/lib/verify/stills.sh out.mp4
```

The three tools cover different blind spots, so running one and calling the file
verified is how defects ship. Gate the whole file, never a window.

`contrast.mjs` keys on luma spread and was written for a light film. On a dark flat
style like `ailabs-explainer`, where 95% of the frame is `#0D0D0D` by design, it
over-reports washes. Use `engine/scripts/blank-frames.mjs` there instead - it detects
genuinely uniform frames and takes `--allow-head N` for an intended fade-in.

No gate catches a caption that contradicts its frame, on-screen prose fighting the
narration, or a cut landing mid-word. Build the contact sheet and look at it.

## References

| Reference | What it is |
|---|---|
| `references/ailabs-unlazy/` | Full measured teardown of the AI LABS "unlazy" video: container facts, per-chapter pacing, palette sampled from frames, cut-rate distribution, narrative structure, channel formula. Includes 78 stills, contact sheets and the transcript |
| `references/unlazy-repo/` | Clone of `Leonxlnx/unlazy`, the skill that video explains |

## Conventions

- Style systems are `theme.ts` exporting a `Theme` type, a theme object, a
  `ThemeContext` and a `useTheme()` hook. Components consume the hook, never raw hexes.
- Comment why a value is what it is, especially when it comes from a measured spec.
  Do not comment what the code obviously does.
- Research documents state what was measured and what was inferred, separately. If a
  claim has no source it does not ship.
- This folder is worked on by several agents at once. Create under your own style or
  project path and leave the rest alone.
