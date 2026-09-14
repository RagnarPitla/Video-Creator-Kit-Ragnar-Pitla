# ink-board

Vertical 1080x1920 hand-drawn concept explainers. Cream paper, wobbling ink,
marker colour. Nothing is ever erased: the camera roams a tall virtual board
that accumulates into a poster by the last frame.

Reference lineage: Natalie Fratto's Instagram "Charts and Craft" series.
Shipped episode: `001-palantir`, 146.67s, 4400 frames.

**Engine:** `~/Desktop/rbuild-ai/Prod-Tools/ig-video-animations`
(git: `github.com/RagnarPitla/ig-video-animations`, branch `master`).
The kit does not carry a copy. Work in the repo; read this file first.

## The shape of the thing

| | |
|---|---|
| Frame | 1080x1920, 30fps |
| Board | 1000 x 3620 virtual units, taller than any frame |
| Camera | roams the board, one move per narrative cluster |
| Captions | burned in, from `CAP_TOP = 1560` down. Content stays above it |
| Timing | every element is pinned to a **cue phrase** in the narration |

Narration is the clock. You do not time a video and fit words to it. You
record the words, transcribe them, and hang every mark off a phrase. Swap the
voice and re-run and the whole film re-times itself.

## Two visual registers

Both ship. They are separate compositions off the same narration.

**V3 `Ep001-Palantir`**  -  everything is an outline. Thin ink on cream, uniform
type, colour only in the strokes.

**V4 `Ep001-Palantir-V4`**  -  colour gets area. Section titles sit in solid
slabs with the type knocked out to paper, figures count up from zero, arrows
carry travelling dots, and outlined containers are deleted rather than nested.

V4 exists because V3 was called boring twice. The diagnosis matters more than
the fix, and it is written up in `docs/authoring-traps.md` under "boring is
usually weight, not motion".

## Element vocabulary

15 types, validated by zod in `engine/src/lib/storyboard.ts`. A type that is
not in that enum fails validation and takes the **whole composition** out of
the studio list without printing anything.

| Type | Notes |
|---|---|
| `label` `note` `highlight` `sticky` `count` | rendered in the **HTML** layer |
| `line` `connector` `rect` `icon` `flow` `chart` `shapes` `peep` `bars` `block` | rendered in **SVG** |

The schema name is not the component name. `shapes` renders through
`ShapeGrid`; travelling dots are not a type at all but `dots: true` on a
`flow`. Author against the zod union, not against the React exports.

`HTML_TYPES` in `BoardFilm.tsx` is the split. Put an SVG element in the HTML
list and it renders nothing and reports no error.

### The V4 additions

- **`block`**  -  a solid-colour slab that wipes on via `scale(k,1)` with a
  `back()` ease. This is the single biggest visual lever in the style. An
  outlined heading reads as one more line of handwriting; a filled slab reads
  as a section.
- **`count`**  -  runs a figure from `start` to `to` on a cubic ease-out, so a
  statistic feels arrived-at rather than typed in.
- **`flow.dots`**  -  markers travelling the arrow's own quadratic, computed
  analytically. Deliberately not CSS `offset-path`.
- **`color: "paper"`**  -  knockout type, for a label sitting on a `block`.

## Colour

`pop0..pop5` is **one shared set of six marker brights across every palette**,
on purpose. A board drawn in six shades of one brand colour reads as a
corporate slide. Brand identity lives only in `accent` and `highlight`.

## The boil

Geometry is re-seeded every 4 frames: `seed = seedFrom(id) + boilTick * 7919`,
`boilTick = floor(frame/4)`. That is 7.5 redraws a second, animation "on
fours". Every line trembles as if being redrawn by hand.

`boilTick` **must** be in the `useMemo` deps or the geometry never regenerates
and the whole film goes dead still while appearing to work.

Verified end to end through H.264 by PSNR on consecutive encoded frames:
62-68 dB within a tick, 22-28 dB across one.

## Peep anatomy

A filled quadratic torso drawn behind the outline at `fillOpacity 0.8` is the
whole difference between a peep and a stick figure. Arms must terminate
**outside** the torso silhouette (`x +/- 44*s`) or they disappear behind the
shirt. `color` is the shirt, `hairFill` is the hair; one variable driving both
gives you a character in a black shirt.

## Pipeline

```bash
cd episodes/001-palantir && ../../../.venv/bin/python build_storyboard.py
cd ../.. && ../.venv/bin/python pipeline/stage.py episodes/001-palantir
cd engine && npx tsc --noEmit
npx remotion still Ep001-Palantir-V4 /tmp/p.png --frame=N     # probe first
npx remotion render Ep001-Palantir-V4 out/ep001-v4.mp4
cd .. && ../.venv/bin/python pipeline/qa.py engine/out/ep001-v4.mp4
```

Quirks that cost time:

- `build_storyboard.py` uses **relative paths**. Run it from inside the episode
  directory or it writes to the wrong place.
- `stage.py` takes a **path** (`episodes/001-palantir`), not a slug, and must
  run after every storyboard build.
- Python venv is `Prod-Tools/.venv`. Homebrew python3.14 is PEP-668 managed.
- Full render is roughly 4-8 minutes for 4400 frames.

## Voice

`pipeline/narrate.py` takes `--voice <macOS voice>` for a draft and `--audio
<file>` to drop in a real recording or a cloned model. Because cues are
phrases, not timestamps, replacing the audio and re-running re-times the film
with no layout edits.

Richer options already on this machine, rated:
`~/Desktop/rbuild-ai/video-studio/voice-samples/results.json`
(kokoro, aura2, grok, flux, voxtral, sesame).
Local TTS: `~/Desktop/rbuild-ai/voice-lab` and `~/Desktop/rbuild-ai/vibevoice`.
