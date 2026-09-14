---
name: mia-video
description: Build a Microsoft-house-style animated explainer or sizzle film in Remotion - white studio space, Segoe UI, glass cards on layered shadows, threads of light connecting scenes, Dynamics 365 product iconography, and a film-wide grade that stops a white CG frame looking like a slide deck. Use when making a product vision film, a launch sizzle, a customer-facing explainer, or when narration already exists and scenes must be cut to it frame-exactly. Also use when replacing borrowed footage or placeholder cards with generated scenes, or when one cut needs several pickable variants.
verified_on: 2026-08-27
provenance: "Extracted from the Project Mia vision film - 153.6s, 4608 frames, 18 scenes, rendered through seven versions. Every component in assets/ is the shipped file. The technical warnings are all failures that actually cost a render: two ten-minute font stalls, a black-frame bug that survived three checks, and a render killed by a pipe."
---

A vision film gets one showing to the audience that matters. It fails in
predictable ways: white frames that read as unfinished rather than minimal, a
viewer who has lost track of where they are by scene four, and a claim on
screen nobody can source. This skill is the house style plus the fixes.

## The five rules

**1. Generate every frame you can, and record the product itself for the rest.**
No lifted slides, no borrowed clips from someone else's cut. Not purity -
editability. A borrowed frame cannot be re-timed, re-worded or corrected, and
you will need to do all three. One film carried three borrowed slots through
four versions before they were rebuilt, and one of them had a factual error on
screen the whole time.

The exception that earns its place is a recording of the actual product, via
`ProductClip`. A drawn approximation of a UI is a claim; a recording is
evidence, and stakeholders can tell the difference instantly. Draw the parts
that do not exist yet, record the parts that do, and say which is which in the
shot list.

**2. Cut to the narration, not to taste.** Transcribe the audio first
(`whisper large-v3`), convert timings to frames at 30fps, and let those define
scene boundaries. A scene is as long as the sentence it serves.

**3. Never leave the viewer waiting.** The most common note on a first cut is
"it felt slow". It is almost never pacing - it is a camera arriving somewhere
before the content that justifies the move. Check the frame at the moment each
move lands, not just at the end of the scene.

**4. No unsourced numbers.** "40% faster" on a Microsoft-branded frame is worse
than no number. Count things the narration already claims, or say nothing.

**5. White space needs an anchor.** A near-empty white frame reads as broken.
Use `BrandBackdrop` - a product mark at 5-8% opacity, large. Above about 9% it
stops being a backdrop and starts competing.

## The look

Background `#EEF3F8`. Text `#2E343C` on white, `#7D8998` for secondary,
`#8794A3` for uppercase labels. Accent is a cyan-to-teal ramp, `#19B6E4` to
`#1EC3BD`, used for light, motion and confirmation - never for chrome.

Segoe UI at four weights only: **300 / 350 / 400 / 600**. Do not introduce
others; the film reads as inconsistent immediately.

Cards are white-to-`#F5FAFD` gradients, 1px `rgba(198,213,229,0.9)` border,
radius 14-16.

### Shadows are three, never one

`lib/material.ts`. A single large soft shadow is the tell that a surface was
drawn rather than photographed. `elevation(n)` returns the three a real object
casts - tight contact, mid key, wide ambient. `raised(n)` adds the lit top
edge. Cheapest realism available; use it on every surface.

### The grade

`components/FilmGrade.tsx` wraps the whole film. A clean CG frame has no lens
and no light source and the eye notices without being able to say why. Four
layers put that back: a warm key falling to a cool fill on `soft-light`, bloom
on `screen`, corner falloff on `multiply`, and grain on `overlay` with its
offset jumped every frame so it shimmers like film instead of sitting there
like a dirty sensor.

`lib/look.ts` holds the presets - six numbers each. `studio` is restrained,
`depth` is the default, `product` adds product iconography. Retune there, never
in the scenes.

## The component library

Scenes are composed, not hand-built. `assets/src/components/`:

| Component | Use |
|---|---|
| `Stage` | The room. Vanishing point, zoom, optional figures and light streak. Start every scene with it. |
| `BrandBackdrop` | Large faint product mark, optional rings. The fix for an empty frame. |
| `Panel` / `Row` | Titled card with status rows - `idle`, `active`, `warn`, `done`. |
| `GlassCard` | Person or entity card with avatar. |
| `Thread` / `ThreadPulse` | The light that connects everything. Give each instance a unique `glowId`. |
| `Caption` | Word-staggered scene caption. |
| `Motes` | Drifting particles. 20-30 per scene. |
| `ProductTile` | One Dynamics 365 icon on a tile. 15 icons in `public/d365/`. |
| `DeviceScreen` | Laptop shell. Use it for a device beauty shot, not for readable UI. |
| `ProductClip` | Full-bleed real screen recording with label and caption. The readable way to show software. Read its doc comment before running two back to back. |
| `JourneyRail` | Bottom rail showing which stage of a journey the viewer is in. |
| `EvidenceMeter` | Top-right tally of artefacts produced. |
| `Figure` / `People` | Abstract Fluent-style figures. |

Motion lives in `lib/motion.ts`: `settle()` for anything that lands (it
overshoots), `floatAt()` for idle drift, `cameraDrift()` for handheld,
`EASE.in/out/inOut`, and `rand(frame, salt)` for deterministic noise.

**Apply camera drift to the translation, not to the centre point**, or zoom
silently multiplies the amplitude.

## Copy lives in one file

All on-screen text in a single `film-copy.ts`, read by both the film and the
composition registrations so copy cannot drift between preview and render. See
`reference/film-copy.ts`.

Do not use `as const` on it - it makes arrays readonly and breaks zod prop
types.

## Variants

Register the same composition several times with different props rather than
forking scenes. `reference/MiaFilm.tsx` takes `look` and `overlay` and produces
five pickable films from one cut. Give the client something to choose between;
"which of these two" is a far easier conversation than "is this right".

## Probe stills before you render

```bash
npx remotion still "Comp-Id" /tmp/f240.png --frame=240
```

A still costs seconds; a full render costs twenty-five minutes. Probe every new
shot at the frame where its content is fully on screen, and **look at the
image** - not at the exit code. Three classes of defect are invisible in the
markup, survive typecheck, and pass both output gates, because every one of them
produces a technically perfect frame:

**The last element in a scaled or drifting layout falls off the edge.** A row of
fifteen tiles was laid out correctly, then a continuous push (1.008 to 1.075)
plus a path drift of +0.038 slid it right over the shot, and the fifteenth tile
finished bisected by the frame edge. It had shipped in every previous version.
The tell is asymmetry: the first tile had 146px of clearance and the last had
none, so it read as a mistake rather than as the row continuing off-frame. When
a layout is animated by a zoom or a drift, probe the **last** frame of the
scene, not the first, and check the element furthest along the axis of travel.

**A caption contradicts the frame it sits on.** Text is authored against what
the shot is supposed to show, then the shot changes. Read the caption and the
picture together, in the same image.

**On-screen prose competes with the narration.** Check the added copy against
the SRT segment covering that frame. Single nouns and labels are safe over
voice; a full sentence is not, because it forces the viewer to read against what
they are hearing. One line landed under an unrelated narration segment and both
gates passed it - only the transcript caught it.

## Rendering

```bash
npx remotion render "Comp-Id" out.mp4 --codec=h264 --crf=16 --concurrency=5 > /tmp/r.log 2>&1
```

**Never pipe a render to `head`.** SIGPIPE kills it when head closes the pipe.
Redirect to a log and `tail` it.

Concurrency 5. Seven caused contention on an M-series laptop and was slower.

`remotion.config.ts` must set `Config.setDelayRenderTimeoutInMilliseconds(120000)`.

### Fonts will stall a long render

This cost two ten-minute renders. `@remotion/fonts` `loadFont()` opens a
`delayRender` per face; across five concurrent tabs one wedged decode stalls
everything, and it dies a thousand frames in, not at frame zero. Base64 data
URIs are worse - megabytes of CSS per tab.

**The working pattern is plain CSS `@font-face` against real files in
`public/`, loaded with `staticFile()`, with no `delayRender` at all.** See
`assets/src/fonts.ts`. `staticFile()` works fine for fonts, video and audio
during `remotion render`; the belief that it 404s is wrong.

And do not try to rescue a stuck `delayRender` with a `setTimeout` escape
hatch. **Remotion fakes `setTimeout` during renders** so it never fires.

Segoe UI woff files are not shipped in this skill. Put
`segoeui-{light,semilight,regular,semibold}.woff` in `public/fonts/`; without
them `fonts.ts` falls back to a system stack and the film will look close but
not right.

## Verify before claiming it is done

`scripts/qa.mjs out.mp4 --frames=4608` checks frame count, that an audio stream
exists, and that there are no black frames.

```bash
node scripts/qa.mjs out.mp4 --frames=4608
node scripts/contrast.mjs out.mp4 --allow=432,522,861
```

**Run both.** `qa.mjs` has a blind spot it cannot fix: it looks for *black*
frames, and a light-background film fails to *white*. That defect shipped in
three consecutive versions of one film. `contrast.mjs` is the second gate.

**Gate the whole film, never a window.** With no `--from`/`--to`, `contrast.mjs`
measures the entire file, which is what certifying a cut requires. Those flags
exist for investigating one boundary, not for signing off. A film that had only
ever been gated over narrow ranges passed every time; the first full-range run
on the same file returned 15 failing boundaries and 64 blank frames, seven of
them long enough to see. Two were completely blank white for a third of a
second, and they had survived four rounds of review. If you catch yourself
passing `--to` on a final check, you are measuring the passage you just edited
and calling it the film.

### White frames are the black frames of a light film

Sequential `<Sequence>`s do not overlap. If each clip carries its own opacity
fade, a boundary plays one fade-out and *then* the next fade-in, so the picture
dips through the background for the sum of the two rather than cross-dissolving.

Mean brightness cannot detect this. Measured across the same 21 frames on a
broken cut and its fix, YAVG was 234.7-238.8 in **both**. What moves is the
*spread* of luma: it fell from 25 to 14 for 13 frames on the broken cut and
held flat at 29-30 on the fix.

`contrast.mjs` measures that spread, but it does not just threshold it. Spread
is content-dependent - dark product footage measures 171 where a pale drawn
scene measures 35 - so a threshold flags every cut into a drawn scene. What
separates a fade from a cut is **transience**: a fade dips and recovers, so it
sits below the frames on both sides; a cut steps and holds, so only one side is
higher. At one boundary the broken film dipped 171 -> 14 -> 38 (flagged) and the
fixed film stepped 171 -> 35 -> 38 (passed).

The fix is `fadeInFrames={0} fadeOutFrames={0}` on every clip after the first in
a run. Keep a fade only where the narration has a pause, or where the register
changes - footage cutting to a drawn scene earns one.

**Apply it to both sides of every boundary, in one pass.** Doing this clip by
clip as each defect is reported leaves the rest in place and reads as fixed. One
film accumulated a clip with `fadeOutFrames={10}` instead of `0`, another with
only `fadeInFrames={0}` and its fade-out untouched, and a third with neither -
each edited in a different session, each believed complete. Fifteen boundaries
survived. Setting both props on all clips in the run took one edit and removed
every visible flash. Note which side a report blames: if the flagged ranges all
*end* on the boundary frame, the outgoing fade-out is the dominant cause.

Black frames are the one that hides. If you build a clip from source footage
with `tpad=stop_mode=clone`, **it clones the literal last frame including if it
is black** - trim the black tail first with `trim=end_frame=N,setpts=PTS-STARTPTS`.
Only `blackdetect` on the assembled output catches this.

Two ffmpeg traps: `blackframe=amount=50:threshold=80` flags every frame of a
genuinely dark slide, so use `blackdetect=d=0.03:pix_th=0.10` for true black;
and `last_keyframe:189` matches a naive `grep -o "frame:[0-9]*"`.

## Starting a new film

```bash
bash ~/.copilot/skills/mia-video/scripts/new-film.sh ~/Desktop/my-film
```

Scaffolds a blank Remotion project, drops in the component library, the look
system, the product icons and the config, and prints what to do next.

## Things that will bite

- `scaleX` is not a valid React inline style. Use `scale: '-1 1'`.
- 1px hairlines vanish at `--scale=0.5`. Minimum 2px.
- `interpolate()` `inputRange` must be strictly increasing.
- Microsoft product SVGs share gradient ids (`paint0_linear_3989_14887`).
  Inline several in one document and some render with another product's
  gradient. Load each as a separate file - that is why `ProductTile` uses
  `<Img>`.
- `ffprobe -count_frames -of csv=p=0` emits a trailing comma. Use
  `-of default=nk=1:nw=1`.
- macOS bash 3.2 has no `declare -A`.
