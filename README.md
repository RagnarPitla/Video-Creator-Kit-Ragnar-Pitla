# Video Creator Kit

Agents and skills that make finished videos. Research, script, voice, storyboard,
animate in Remotion, render, verify, publish - each stage owned by an agent that
already knows the house style and the ways this pipeline has broken before.

Built for GitHub Copilot CLI. Clone it, run `./install.sh`, ask for a video.

```bash
git clone https://github.com/RagnarPitla/Video-Creator-Kit.git
cd Video-Creator-Kit
./install.sh
cd engine && npm install
```

Then, in Copilot CLI:

```
make a 90 second vision film cut to the narration I recorded
```

The `film-director` agent picks that up, reads the narration, plans the shot map,
writes the scenes, probes stills before committing to a render, gates the output,
and hands back the shot list for review.

## Requirements

| Thing | Why | Check |
|---|---|---|
| GitHub Copilot CLI | Runs the agents | `copilot --version` |
| Node 18+ | Remotion render engine | `node -v` |
| ffmpeg / ffprobe | Every verification gate shells out to it | `ffmpeg -version` |
| Python 3 | `shared/lib/verify/*.py` offset measurement | `python3 -V` |
| Kokoro `af_heart` | Default narration voice. Local, free, no key | `bash skills/heart-voice/setup.sh` |
| ElevenLabs key (optional) | Only for narration in your own saved voice | see `skills/elevenlabs-voice/` |

### macOS and Linux

```bash
./install.sh              # link agents and skills into ~/.copilot/
./install.sh --dry-run    # show the plan, change nothing
./install.sh --uninstall  # remove only the links it created
```

### Windows

```powershell
.\install.ps1 -Check      # verify the toolchain first, changes nothing
.\install.ps1 -WithDeps   # install ffmpeg and Node LTS via winget, then link
.\install.ps1 -Uninstall  # remove only what it installed
```

`-WithDeps` installs `Gyan.FFmpeg` and `OpenJS.NodeJS.LTS`, then refreshes PATH
inside the running shell. Without that refresh, ffmpeg installs correctly and
the very next command still reports it as missing.

One Windows difference worth knowing before you hit it. Skills are folders and
link as junctions, which need no privilege, so they always track `git pull`.
Agents are single `.md` files, and a file symlink needs Developer Mode or an
elevated shell. Without it they are **copied**, which works but means a later
`git pull` will not update them until you re-run the script. The summary tells
you which you got. Turn on Developer Mode under Settings > System > For
developers to get links.

Both installers are idempotent and refuse to overwrite an agent or skill you
already have under the same name.

## How skills make the animation

This is the part that surprises people. No agent writes animation from
imagination, and nothing here is a text-to-video model. A video is built like
software, and the skills are what stop each build starting from zero.

```
  topic
    |
    v
 [research]   video-researcher
    |         measured claims with sources, contradictions flagged
    v
 [script]     video-scriptwriter / ryt-script
    |         narration in a known voice, word budgets per beat
    v
 [voice]      heart-voice (default), elevenlabs-voice on request
    |         vo.wav, plus a word-level transcript
    v
 [board]      video-prompt / video-animator
    |         storyboard.json: one scene per beat, from a fixed scene vocabulary
    v
 [animate]    video-animator + shared/brand/<style>/theme.ts
    |         Remotion 4 React components. Deterministic: frame N is always frame N
    v
 [render]     remotion-render / engine/
    |         mp4 at a known frame count
    v
 [verify]     shared/lib/verify/ + shared/lib/video-gates/
    |         the render is proven, not assumed
    v
 [publish]    video-publisher
              titles, descriptions, chapters, per-platform packaging
```

Four mechanisms do the real work:

**Skills carry the house style as code, not adjectives.** `shared/brand/<style>/theme.ts`
exports a theme object and a `useTheme()` hook. Components read the hook and never a
raw hex. Asking for "the DOS look" resolves to a specific palette, type stack, scanline
treatment and reveal timing, identically every run.

**Scenes come from a fixed vocabulary.** The board is written against a closed set of
scene types rather than inventing a new visual idea per beat. That is why episodes in
a series look like each other.

**Cues bind visuals to audio, not to timestamps.** Elements pin to a cue id resolved
against a word-level transcript of the narration. Re-record the voice and the whole
film re-times itself with no board edits. Hardcoding timestamps is how a cut lands
mid-word three versions later.

**Skills store the failure list.** Each `SKILL.md` carries the defects that build
already produced - the 9:16 zoom trap, silent schema failures, half-erased product UI,
warping a scene clock to land a cue and stretching every animation duration with it.
An agent reading the skill does not rediscover them on your video.

## Agents

| Agent | Use it for |
|---|---|
| `film-director` | Microsoft-house-style vision films and sizzle reels cut to existing narration |
| `explainer-director` | Long-form tool explainers: mechanism-first teardowns of a repo, skill or tool |
| `ink-board-director` | Vertical hand-drawn concept explainers, one tall board the camera roams |
| `infographic-director` | Dense animated infographics, 1080x1350 looping GIFs, plus the post to publish them with |
| `podcast-editor` | Multi-camera podcast edits from separate per-host recordings |
| `video-producer` | End-to-end pipeline control and stage gates across the other agents |
| `video-researcher` | Source-grounded research packs and claim ledgers |
| `video-scriptwriter` | Narration in Ragnar's voice, written from a verified claim ledger |
| `video-animator` | Remotion 4 implementation from an approved storyboard |
| `video-publisher` | Packaging verified renders for YouTube, LinkedIn, X and Shorts |

Agents call each other. `video-producer` is the one to ask when you do not know
which of the others you want.

## Skills

| Skill | What it holds |
|---|---|
| `ragnar-video-studio` | Studio entry point. Routes "make a video" to the right pipeline |
| `mia-video` | Microsoft-house explainer: white studio, Segoe UI, glass cards |
| `podcast-multicam-edit` | Per-person recordings to one multi-camera cut |
| `linkedin-Infographics` | Concept to animated LinkedIn-ready infographic GIF |
| `video-prompt` | Video prompts in plain language and JSON, for Kling / Veo / Lovart |
| `ryt-script` | Ragnar-Nate hybrid style: three numbered shifts, real examples |
| `ragnar-youtube-engine` | Weekly channel planning, 4-5 ideas from current AI news |
| `voice-dna` | Extract a writing voice from samples so drafts sound like the author |
| `heart-voice` | **Default narrator.** Local Kokoro `af_heart`, no key, no cost |
| `elevenlabs-voice` | Narration with a confirmed saved voice |
| `remotion-best-practices` | Router into the Remotion skills |
| `remotion-create` | Start a new Remotion video |
| `remotion-render` | Export a Remotion video |
| `remotion-captions` | Transcribe, display and animate captions |
| `remotion-docs` | Search the official Remotion documentation |
| `remotion-studio` | Drive the Remotion Studio preview |
| `remotion-render` | Export a Remotion video |
| `remotion-upgrade` | Move a project across Remotion major versions |
| `remotion-video-builder` | Assemble a composition from an existing board |
| `remotion-multimedia` | Audio, video embedding and synchronisation inside a composition |
| `remotion-interactivity` | Player embedding and interactive compositions |
| `remotion-markup` | Text, layout and typography inside Remotion |
| `remotion-maps` | Animated maps and geographic motion |
| `remotion-saas` | Server-side rendering and Lambda |
| `rbuild-video-editor` | Deterministic script-driven editing engine |
| `video-editing` | General ffmpeg editing operations |
| `videodb` | Indexing and searching video by content |
| `mia-Html` | Microsoft-style HTML reports and architecture documents |
| `gemini-voice` | Narration through Gemini voices, on explicit request |

`heart-voice`, `elevenlabs-voice` and the `remotion-*` skills are vendored copies of
general skills that also exist outside this kit. The rest are maintained here.

## Styles

| Style | Look | Spec |
|---|---|---|
| `ailabs-explainer` | Near-black canvas, greyed skeleton UI, one terracotta accent, long continuous holds, screen recordings punched in hard | `references/ailabs-unlazy/TEARDOWN.md` |
| `d365` | White studio space, Segoe UI, glass cards on layered shadows, threads of light | `skills/mia-video/SKILL.md` |
| `ink-board` | Cream paper, ink boiled on fours, marker colour, a camera roaming one tall board never erased. Vertical | `shared/brand/ink-board/STYLE.md` |
| `editorial-type` | Same palette, no handwriting. Anton and Inter, full-bleed cards, hard cuts on the narration | `shared/brand/editorial-type/STYLE.md` |

## Verification

A render is not done because it finished. Gate it:

```bash
bash shared/lib/verify/gate.sh out.mp4 --fps 30 --expect-frames <n>
node shared/lib/video-gates/contrast.mjs out.mp4
bash shared/lib/verify/stills.sh out.mp4
```

The three cover different blind spots. Running one and calling the file verified is
how defects ship.

`contrast.mjs` keys on luma spread and was written for a light film. On a dark flat
style like `ailabs-explainer`, where 95% of the frame is `#0D0D0D` by design, it
over-reports washes. Use `node engine/scripts/blank-frames.mjs` there instead. It
detects genuinely uniform frames and takes `--allow-head N` for an intended fade-in.

No gate catches a caption that contradicts its frame, on-screen prose fighting the
narration, or a cut landing mid-word. Build the contact sheet and look at it.

Full detail in `docs/verification-gates.md`.

## Layout

| Path | What it holds |
|---|---|
| `agents/` | Agent definitions, one `.md` per role |
| `skills/` | Skills agents load for house style and hard-won failure lists |
| `shared/brand/<style>/` | Per-style design system: `theme.ts` plus a Remotion component library |
| `shared/lib/` | Cross-style tooling, mostly verification gates |
| `engine/` | Remotion project rendering the `ailabs-explainer` library. `StyleProof` is the style regression reel |
| `references/` | Measured teardowns of reference videos |
| `docs/` | Cross-cutting docs that apply to every style |
| `projects/` | Productions |

## Docs

| Doc | Read it when |
|---|---|
| `docs/verification-gates.md` | Before calling any render done. Which gate covers which blind spot, and what none of them can see |
| `docs/authoring-traps.md` | While building, not after. The failures no gate can see: silent schema and layer failures, the 9:16 zoom trap, why "boring" is usually weight rather than motion |
| `docs/ghosted-ui-and-the-qc-reel.md` | When a film puts real product recordings on screen. How half-erased interface happens, and the half-res QC reel that replaces full renders while iterating |
| `docs/episode-template-ailabs-explainer.md` | Scripting an `ailabs-explainer` episode. Beat sheet with word budgets from measured chapter proportions |
| `docs/registry.md` | Before building anything. Every video engine, skill and voice asset, with paths |
| `docs/kit-internals.md` | The previous agent-facing README. Style specs and project notes kept for reference |

## Worked examples

Read these before inventing a new approach. Each one solved something.

| Project | What it is |
|---|---|
| `projects/agent-self-verification/` | `ailabs-explainer` episode, 4:40, on why agents report work complete when it is not. Every element pins to a cue id in `board/timing.json` rather than a timestamp, so re-recording the narration re-times the film with no board edits. `board/check_map.py` gates the frame map against the measured audio before anything renders |
| `projects/project-mia/` | Vision film. 153.6s, 4608 frames, seventeen versions, cut frame-exactly to existing narration. Scene source and transcript only - narration audio, screen recordings and 2.3GB of renders stay out of the repo |
| `projects/hack-2026-products/` | Small, readable, good first read for how a project is laid out |

## What is not in the repo

Rendered media is gitignored. The kit ships the code that makes videos, not the
videos - a 2GB clone is a kit nobody installs. `engine/node_modules`, render output,
and Ragnar's in-flight episodes are excluded too. Run `npm install` in `engine/`
after cloning.

Two productions live in their own repos and are referenced, not vendored:
`ig-video-animations` (the `ink-board` engine) and `agent-sprawl-reel`. So does

## Conventions

- Style systems are `theme.ts` exporting a `Theme` type, a theme object, a
  `ThemeContext` and a `useTheme()` hook. Components consume the hook, never raw hexes.
- Comment why a value is what it is, especially when it comes from a measured spec.
  Do not comment what the code obviously does.
- Research documents state what was measured and what was inferred, separately. If a
  claim has no source it does not ship.
- This folder is worked on by several agents at once. Create under your own style or
  project path and leave the rest alone.

## Contributing

The kit gets better when a build failure becomes a line in a `SKILL.md`. If you hit
a defect the gates did not catch, add it to the relevant skill's failure list in the
same PR as the fix. That is the whole mechanism - the next person's agent reads it.
