# ailabs-explainer

A Remotion component library for the flat, near-black, skeleton-UI explainer style
reverse-engineered in `references/ailabs-unlazy/TEARDOWN.md`.

Every value here is measured off the reference video, not chosen. If you change one,
change it in `theme.ts` so the whole system moves together.

```ts
import { Canvas, TreeDiagram, ailabsTheme } from "../shared/brand/ailabs-explainer";
```

## The four rules the components exist to enforce

1. **One accent colour.** `#CE6F57`, at roughly 2% of frame coverage, marking the
   single thing the narration is on right now. Everything else is greyscale. This
   includes footage: the caret in `engine/scripts/make-screen-rec.sh` is terracotta
   because a cyan one would be a second accent.
2. **Pills, not text.** Content is grey rectangles unless the literal word is the
   point. `Callout`, `Terminal` and `ChecklistGates` are the only real-text
   components, and the reference spends real text about a dozen times in 13 minutes.
3. **Flat fills only.** No gradients, no grain, no blurred shadows. The reference
   encodes 1080p at 222 kbps because most of the frame is byte-identical between
   frames. Treat the output bitrate as a conformance check: `engine`'s `StyleProof`
   lands at 337 kbps.
4. **Long holds, not cuts.** Elements animate in, connectors draw on, the accent
   moves. A single scene should carry 20-30s of narration. Target ~4.7 cuts/min.

Everything is driven by `useCurrentFrame()` and a seeded hash, never `Math.random()`,
because Remotion renders frames out of order across threads.

## Theme

`theme.ts` exports `Theme`, `ailabsTheme`, `ThemeContext`, `useTheme()`, plus the
`Tone` union (`'bright' | 'dim' | 'accent' | 'surface' | 'connector'`) and
`toneColor(theme, tone)`.

| Token | Value | Where it is used |
|---|---|---|
| `bg` | `#0D0D0D` | every scene background |
| `bgDeep` | `#030303` | only behind punched-in recordings |
| `surface` | `#2C3439` | cards, nodes, panels -- the only "material" |
| `surfaceAlt` | `#1A1F21` | recessed panels inside a surface |
| `pillBright` | `#8A9199` | stands in for a heading line |
| `pillDim` | `#5A6169` | stands in for body copy |
| `accent` | `#CE6F57` | the one thing being narrated |
| `connector` | `#6B7280` | 2px bezier curves |
| `trafficRed/Yellow/Green` | `#FF5F57` `#FEBC2E` `#28C840` | `BrowserChrome` only |
| `radiusPill` / `radiusCard` | `7` / `12` | |
| `pillHeight` | `16` | spec range is 14-18 |
| `connectorWidth` | `2` | |
| `mono` | `JetBrains Mono` | all real text |

`fonts.ts` loads JetBrains Mono and re-exports the resolved family as `MONO`. Import
it once from your `Root.tsx`; the theme only carries the family name.

`motion.ts` holds the shared entrance timing -- see "Entrance timing" below. Anything
you build with a `from` prop should go through it rather than calling `spring()`
directly.

## Components

### `Canvas`
Root scene shell: flat background, `ThemeContext` provider, generous padding, and an
optional slow camera drift over the sequence duration.
`children`, `theme?`, `deep?`, `padding?`, `drift?`, `driftScale?`, `driftPx?`.
*Use this when* you are starting any scene. It is the only component that sets a
background.

Drift defaults are tiny (`scale 1.02`, `~10px`) on purpose -- large drift moves every
pixel sub-pixel every frame and destroys the flat-fill bitrate. Pass `drift={false}`
for shots that already contain motion.

### `Pill`
The skeleton text primitive. A rounded rectangle that grows from the left.
`width`, `height?`, `tone?`, `radius?`, `from?`, `duration?`, `style?`.
*Use this when* you need one line of implied text, or a single highlighted token.

### `PillBlock`
A paragraph of pills with jittered widths so it reads as prose rather than a bar
chart. Widths come from `seededUnit(seed)`, so the same `seed` always renders the
same paragraph.
`lines`, `width`, `height?`, `tone?`, `gap?`, `jitter?`, `seed?`, `shortLast?`,
`from?`, `stagger?`, `duration?`, `style?`.
*Use this when* you are implying body copy. Two or three of these fill a fake app.

### `Card`
Rounded surface container with a spring entrance (fade + rise + scale).
`children?`, `width?`, `height?`, `padding?`, `tone?` (`surface`/`surfaceAlt`),
`radius?`, `accentBorder?`, `accentFill?`, `from?`, `rise?`, `style?`.
*Use this when* you need any panel, tile or box. Nest `surfaceAlt` inside `surface`
for a recessed look -- do not invent a third grey.

### `BrowserChrome`
The fake browser window: title bar, three traffic lights, a lock glyph and a
monospace URL in a rounded field, plus a content slot. A signature motif.
`children?`, `width?`, `height?`, `url?`, `chromeHeight?`, `contentPadding?`,
`from?`, `style?`.
*Use this when* the subject is a web app. The URL is the one place a real string is
always allowed.

### `Connector`
A 2px cubic bezier between two points that draws on via `stroke-dashoffset`.
Both control points sit on the horizontal midline, which produces vertical tangents
at each end -- a flowchart edge, not a graph edge.
`from`, `to`, `curvature?`, `color?`, `width?`, `fromFrame?`, `duration?`.
Also exports `connectorPath()`, the `ConnectorGeometry` type, and `ConnectorPath`
(a bare `<path>`) for when you are batching many edges into one `<svg>`; `Connector`
itself brings its own `AbsoluteFill` svg.
*Use this when* you are drawing causality between two things you positioned yourself.

Path length is declared with `pathLength={1}` rather than measured with
`getTotalLength()`, because DOM measurement is not deterministic across Remotion's
parallel render threads.

### `TreeDiagram`
The hero motif. Give it a depth and branching factor; it lays out nodes bottom-up,
animates them in as a top-down wave, draws every connector on, and accents exactly
one node.
`depth?`, `branching?`, `levelSize?`, `rowGap?`, `leafGap?`, `groupGap?`,
`highlight?`, `from?`, `levelStagger?`, `nodeStagger?`, `connectorDuration?`,
`curvature?`, `style?`. Node ids are `l{level}n{index}`, left-to-right.
*Use this when* the narration is about decomposition, planning or fan-out. Defaults
reproduce `m_340s.jpg`: 1 root, 3 mid, 9 leaves at the measured level sizes.

### `Terminal`
Fake terminal: prompt line, frame-derived typewriter reveal of a command, optional
output lines, blinking accent caret.
`command`, `prompt?`, `outputs?`, `width?`, `height?`, `fontSize?`, `from?`,
`typeDelay?`, `cps?`, `outputStagger?`, `chrome?`, `style?`.
*Use this when* the literal command is the content. Keep `cps` near 20 -- faster
reads as a paste, slower as a stunt.

### `ChecklistGates`
Rows of checkbox + outcome label + sub-lines, ticking one at a time, with the accent
on the active row. `sub` accepts `string[]` for real text or a `number` for that many
pills.
`rows`, `width?`, `fontSize?`, `rowGap?`, `from?`, `stagger?`, `tickDuration?`,
`style?`.
*Use this when* the point is verification: acceptance criteria, gates, test results.

### `ParallelBars`
Labelled agent rows whose bars fill over a frame range. `mode="sequential"` staggers
them by `sequentialGap`; `mode="parallel"` fills them together.
`count?`, `labels?`, `mode?`, `from?`, `fillDuration?`, `sequentialGap?`,
`accentRow?`, `barWidth?`, `barHeight?`, `labelWidth?`, `rowGap?`, `fontSize?`,
`style?`.
*Use this when* you are arguing that concurrency is faster. Put the two modes side by
side and let the shapes make the claim; keep `sequentialGap > fillDuration` or the
sequential column reads as "slightly staggered" rather than "one at a time".

### `ScreenRec`
Wraps real footage (`OffthreadVideo`) or a still (`Img`, via `kind="still"`) and
punches in 200-300% with an animated focal point, rounded corners, on `bgDeep`.
`src`, `focal` (`{x, y, zoom}` in source fractions), `kind?`, `focalTo?`, `width?`,
`height?`, `from?`, `durationInFrames?`, `radius?`, `fadeIn?`, `style?`.
*Use this when* you have to show something real. Punch in far past comfortable -- the
reference never shows a full desktop.

Focal points are source fractions, not pixels, and the transform is
`translate((0.5 - fx*z)*W, (0.5 - fy*z)*H) scale(z)` off origin `0 0`. Using a
percentage `transform-origin` instead would pin the focal point where it already was
rather than centring it. Work out the visible region before you place text in the
source: at zoom `z` it is `fx*W +/- W/(2z)` by `fy*H +/- H/(2z)`.

### `Callout`
Small monospace label that fades and rises in near an element. Forces lowercase.
`children`, `tone?`, `fontSize?`, `boxed?`, `x?`, `y?`, `from?`, `duration?`,
`rise?`, `style?`.
*Use this when* a measurement or a name has to be literal: `10 min`, `3h 41m`,
`gates.md`. Omit `x`/`y` to lay out inline, pass them to place absolutely inside the
nearest positioned ancestor.

## Entrance timing: never schedule one at frame 0

`motion.ts` exports `entranceSpring()` and `entranceFade()`, and every component
with a `from` prop runs through them. They enforce one rule:

> An entrance cannot begin before its shot's first frame. If `from` is undefined,
> or is at or before frame 0, the element is already there.

This is not cosmetic. `spring({frame: 0})` is exactly `0` and a fade starting at
frame 0 is exactly `0`, so a component scheduled at `from={0}` renders **nothing**
on the first frame of its `<Sequence>`. In a composition of abutting shots that is
one uniform frame at every boundary: a 33ms black flash at 30fps, in a style whose
whole premise is that it never hard-cuts. Four of them shipped in `StyleProof`
before the gate below caught them.

So the grammar at a cut is: the container is already on screen, and its contents
animate in. Cut to the browser window, then the UI populates. Cut to the tree's
root node, then it branches. That is also what the reference does.

## Verifying a render

### `engine/scripts/blank-frames.mjs` -- use this one

```bash
node scripts/blank-frames.mjs out/style-proof.mp4 --allow-head 5   # 0 clean, 1 blank frames, 2 bad input
```

Detects frames that are genuinely uniform, on a 160x90 grey raster so a lone hot
pixel or codec ringing cannot mask a blank frame. `--allow-head N` forgives an
intended opening fade up from black and nothing else -- a run that starts at frame
0 and continues past `N` is still a failure.

### `shared/lib/video-gates/contrast.mjs` -- expect false positives here

It over-reports on this style, badly. On a clean 1200-frame `StyleProof` render it
returns three FAILs covering 282 frames:

```
FAIL  f390-473   84 frames, spread 0 against local 0  UNINTENDED WASH
FAIL  f750-797   48 frames, spread 0 against local 2  UNINTENDED WASH
FAIL  f930-1079 150 frames, spread 0 against local 0  UNINTENDED WASH
```

Every one of those frames has real content. Measured directly on the same file:

| frame | full-frame luma spread | pixels above background |
|---|---|---|
| 400 | 126 | 2.81% |
| 460 | 113 | 9.84% |
| 770 | 72 | 9.62% |
| 1000 | 149 | 8.26% |

The tool keys on luma spread, which is the right question for the light film it was
written for. Here roughly 95% of every frame is `#0D0D0D` by design and diagrams
occupy the middle 45-60% of the canvas, so legitimate frames read as low-contrast
against their local neighbourhood and trip the wash detector.

**Do not flatten the style to satisfy it, and do not edit `contrast.mjs`** -- another
agent owns that file, and it is correct for the film it was built for. Read its
output, then confirm each flagged range against `blank-frames.mjs` and your own eyes.
It was right about the four genuine one-frame flashes; it is wrong about the ranges
around them.

### `engine/scripts/measure-accent.js`

```bash
node scripts/measure-accent.js frame.png
```

Reports accent coverage and the distribution of saturated hues, which is how the
"exactly one accent colour at roughly 2%" rule gets checked rather than asserted.
Run it on PNG -- JPEG chroma subsampling invents saturated pixels along every
high-contrast text edge and makes the hue histogram unreadable. Reference numbers,
measured against the teardown's own stills:

| frame | accent % of frame | accent as % of saturated px |
|---|---|---|
| `StyleProof` tree | 0.11% | 99.7% |
| reference `m_340s.jpg` | 0.16% | 98.7% |
| `StyleProof` browser | 1.78% | 98.4% |
| reference `m_100s.jpg` | 1.55% | 97.1% |

## Consuming the library from another Remotion project

The library deliberately has no `package.json` and no `node_modules`, so a host
project's bundler will not resolve `react`/`remotion` from inside it. Add the host's
own `node_modules` as an absolute resolution root -- see `engine/bundler-override.ts`
for the working version, including the two traps:

- with `Config.setRspack(true)`, `overrideWebpackConfig` is never called; use
  `overrideBundlerConfig`;
- `__dirname` inside `remotion.config.ts` is the Remotion CLI's `dist` directory,
  because the CLI bundles the config before evaluating it. Anchor paths to
  `process.cwd()`.

TypeScript needs the same fix separately, via `paths` in `tsconfig.json`.
