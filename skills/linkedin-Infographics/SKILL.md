---
name: linkedin-Infographics
description: Turn a concept into an animated, LinkedIn-ready infographic GIF. Two families: six motion variants (Stack, Ambient, Flow, Hub, Versus, Layers) for a spacious sequenced post, and ten dense reference posters (Spine, Columns, Quad, Rail, Radial, Arcs, Venn, Matrix, Road, Layers) distilled from measuring 32 high-performing Instagram infographics. Carries 17 vetted official Microsoft product logos for ecosystem, platform and architecture maps, and six skins (gradient dark, aurora, light gradient, monochrome, a white-ink-on-black marker style, and MSFT style - the Microsoft marketing house look with white cards, thin blue connectors and one glowing dark card) that restyle a finished poster without touching its content. Hands back a single HTML gallery with a download button under each so the pick happens by eye. Use this skill whenever the user asks for an animated GIF, a motion infographic, a moving carousel-style visual, a LinkedIn or Instagram post graphic, a dense "save this" reference poster, a cheat sheet, a "5-step stack", a workflow or architecture diagram, an ecosystem or platform map, a before/after comparison, or uploads a reference infographic and says "make one like this". Also use it when the user gives a concept, framework or step-by-step process and wants it visualized as a post, asks for "variations" or "options" of a post graphic, asks to reskin one or wants it "in MSFT style", "Microsoft style", "on-brand", "in gradient", "in dark", "modern flow", "monochrome", "black and white", "hand-drawn", "whiteboard" or "sketch" style, or wants real product logos on a diagram.
---

# LinkedIn Infographics

Concept in, looping animated infographic out, in several named variants at once.
HTML/CSS does the layout and motion, headless Chrome captures deterministic frames,
ffmpeg packs them into a GIF that LinkedIn will actually animate.

## Two families. Pick the family before the template.

|  | **Motion variants** (`base.css`) | **Dense posters** (`poster.css`) |
|---|---|---|
| looks like | 5-7 big cards, generous space | 30-90 labelled elements, packed |
| the job | make one argument land | be screenshotted and read later |
| motion | content animates in, sequenced | connectors only; **text never moves** |
| measures | 5.7-13% of pixels moving | 0.2-1.1% |
| reach for it when | a post that is read once in the feed | a "save this" reference the reader keeps |

If the user says cheat sheet, reference, framework map, "save this", comparison table,
or anything they would screenshot, that is a **poster**. If they want a single point
delivered with impact, that is a **motion variant**.

The two families do not mix. A poster template links `poster.css` only.

## Hard constraints (LinkedIn feed)

- **5 MB max, 400 frames max.** Over either and LinkedIn freezes the GIF on frame one.
- Upload through the **photo** button, not the video button.
- 1080x1350 (4:5) takes the most feed space on mobile. 1080x1080 is the safe alternative.
- Working budget: 6s loop at 12 fps = 72 frames. Plenty of headroom.

## The ten dense posters

Distilled from measuring 32 high-performing infographic GIFs. The evidence is in
`references/poster-analysis.md` and `references/corpus-motion.json`. **These encode the
mechanics that made those posters work, not their appearance** -- the visual identity
is ours and swaps with one class.

Each is a working file in `templates/poster-*.html`, rendered in `examples/`.

| template | shape | reach for it when |
|---|---|---|
| **spine** | centre process, annotation gutters both sides | one sequence, and the commentary *is* the value |
| **columns** | 2-4 column compare on shared row labels | "here are the options and the trade-off" |
| **quad** | numbered card grid with ghost numerals | N peers with no ordering between them |
| **rail** | vertical icon rail on a continuous spine | ordered stages of one thing |
| **radial** | hub plus satellites | everything relates to one centre, not to each other |
| **arcs** | concentric nested bands | a maturity model where each layer encloses the last |
| **venn** | three sets and the middle | "you need all three", and the pairs are quotable |
| **matrix** | category rail plus dense catalogue | there are a lot of these and they group |
| **road** | serpentine numbered path | a journey whose steps are uneven in weight |
| **layers** | horizontal stack with slot rails | an architecture where tiers sit on each other |

**Choosing the wrong shape is the most common failure, and it is not a style mistake.**
`radial` asserts the satellites are unrelated to each other. `arcs` asserts each layer
strictly encloses the one inside it. `venn` asserts the pairwise overlaps are real and
nameable. If the claim is false for your content, the poster is lying and a reader who
knows the domain will see it before they read a word.

### Themes

Six, set with one class on `.stage`: `t-paper` (default, bright and clinical),
`t-ink` (dark), `t-warm`, `t-mono`, `t-signal`, `t-slate`.

```html
<div class="stage t-ink"> ... </div>
```

Structure and theme are separated in `poster.css`. A template written once renders in
any theme, and a new theme is ~20 tokens copied from an existing block with no template
edit. Offer two or three themes of the *same* poster as the variants, rather than
rendering shapes that do not fit the content.

### Skins: reskin a finished poster without touching its markup

A theme swap gets ~80% of a restyle. A **skin** is that swap plus one override block,
and it finishes the job. Six ship with the skill:

```bash
node scripts/skin.mjs --list
node scripts/skin.mjs poster.html flow -o poster-flow.html
```

| skin | stage class | look |
|---|---|---|
| `flow` | `t-ink flow` | gradient, midnight indigo to cyan on near-black |
| `aurora` | `t-ink flow` | gradient, emerald to violet on near-black |
| `daylight` | `t-paper flow day` | the gradient language on a light ground |
| `spark` | `t-spark spark` | monochrome, hairline borders, diamond nodes |
| `marker` | `t-marker marker` | white ink on pure black, outline boxes, thick dashed connectors |
| `msft` | `t-paper msft` | Microsoft marketing house style: cool off-white, white cards, thin blue elbows, one glowing dark card |

Note the name collision: `templates/flow.html` is a **motion variant** (an animated
sequence) and `templates/skins/flow.css` is a **skin** (a restyle of a poster). They are
unrelated. `skin.mjs` only ever reads `templates/skins/`.

The base poster's body is copied byte-for-byte, so **every skin of a poster carries
identical content** and a content fix is made once in the base and re-skinned outward,
rather than hand-copied into each variant and drifting. The four skins in
`templates/skins/` each regenerate their shipped poster byte-for-byte from the base;
that is the test that they are real extractions rather than approximations.

`spark` is worth reading even if you never use it. It ports a design system whose own
rule is *"monochrome is the point"*, which reserves colour for real product data. So its
structure is entirely neutral and the **product logos are the only colour on the
poster**. Emphasis is carried by border weight instead of fill.

`marker` is the highest-contrast skin: pure `#000` ground, white ink, every box an
outline, every connector a thick white dash. It is the one to reach for when the poster
has to survive a dark feed and a phone screen. Its wires go 5 -> 7.5 and its dots 11 ->
13px, which puts it at **1.75% motion against the 1.16% of the colour original** — still
inside the gate, but it is the loudest thing the skill ships.

`msft` is the Microsoft marketing house style, ported from a product-announcement
graphic: a cool off-white ground that is never pure white, white cards on hairline
`#e5eaf5` borders with a very soft shadow, near-black headlines over blue-grey body copy,
blue-to-violet gradient rules instead of coloured fills, and thin solid blue elbow
connectors ending in filled dots. Its signature is that **exactly one card is inverted**
near-black and carries a soft rainbow glow. Here that is `.plane`, because the control
plane is this poster's hero and inverting it says so without adding a word. Ask for it by
name — "MSFT style".

Five things a skin breaks silently, none of which any gate will catch:

- **A `.stage.X` block for an X the stage does not carry is dead CSS.** The poster still
  renders and `checkvars.mjs` still passes, because the theme it *did* get resolves every
  property — it simply renders in the wrong palette, and it looks deliberate. `msft`
  shipped this: it declared `stage: t-paper msft` while its variable block selected
  `.stage.t-msft`, so `t-paper`'s amber and crimson accents came through a skin that
  defines neither. `skin.mjs` now refuses to apply a skin that selects an undeclared
  stage class.
- **`t-ink` inverts `--paper`** to `#0d1017`. Any rule doing `color: var(--paper)` on a
  coloured fill flips to dark-on-light and becomes unreadable. Two rules needed explicit
  `color: #fff` overrides for exactly this.
- **A rotated square's bounding box is sqrt(2) larger than the square.** Turning a
  circular `.dot` into a diamond with `transform: rotate(45deg)` pushed its corner
  through the rail's `overflow: hidden` and it rendered as a clipped triangle. Shrink the
  dot and raise it off the edge.
- **`--brand` is the headline's keyword colour**, via `.title .k`. Setting it to the
  ground colour on a dark skin deletes two words from the headline and leaves a valid,
  well-formed, gate-passing poster titled *"The     Ecosystem"*. `marker` set
  `--brand: #000` on black and lost "Microsoft Agent". Grep every consumer of a variable
  before flattening it: `--brand` also feeds `--bar-bg`, `.rule span`, `.fam > .fh` and
  `.met b`. The same flattening turned the byline avatar (`background: var(--a1h)` on
  `color: var(--a1)`) into a blank white circle.
- **An accent that was subtle at low contrast is a collision at high contrast.** `.xrail`
  and `.zrail` are `bottom: 0` inside `overflow: hidden` boxes, with their dots at
  `bottom: -4px` so they sit half-clipped on the edge. In accent colour that reads as a
  track running under the content. In white, against a white border, the rail dashes and
  the border merge into a crenellated double line and the dots read as printing blobs.
  `marker` insets the rail (`left/right: 16px; bottom: 12px`) and drops it to grey.
  Invisible at full size; obvious the moment you crop it.

A sixth is now fixed in the base rather than per skin. **An empty `.lg` is a placeholder
for a mark the skill does not carry** — Microsoft Defender is the only one today.
`.lg.plain` hid it on the stock poster, so the gap had never shown; `msft` gives `.lg` a
white fill and a border and it reappeared as an empty box that reads as a broken image.
`poster.css` now strips the decoration off `.lg:empty` — `background`, `border`,
`box-shadow`, `padding` — and keeps the box in flow, because the placeholder exists to
hold the indent so the heading lines up with its neighbours that *do* have marks.
`display: none` also kills the box, and I shipped that first; it silently lost the
alignment. Every declaration is `!important`, because a skin's `.skin .lg` rule carries
the same specificity as `.lg:empty` and is injected later, so without it the box comes
straight back. A mark whose *file* is missing still has an `<img>` child and is not
`:empty`, so real breakage is still visible.

So: skin, then `checkvars.mjs`, then capture a still, then **look at it** — and crop
anything where two elements meet.

#### Motion is a design choice, so measure it after restyling

Restyling changes how much of the poster moves, and the direction is not obvious. `msft`'s
first cut used `stroke-dasharray: 26 4` — the cleanest possible connector, a 4px gap in a
30px period — and scored **0.60% moving, the second-lowest in the set**. Going to `20 10`
keeps the same 30px period, so it still seams, and roughly doubles the edge that changes
per frame. With an 11px dot, a stronger rail and a 3s breathing glow on the inverted card
it lands at **1.77%**, next to `marker`'s 1.75% and above the `1.16%` colour original.

Large-area glows are the cheapest motion available on a light skin, because a dark card on
a light ground swings the glow's edge by dozens of grey levels rather than a handful — the
amplitude floor the base stylesheet warns about. They cost file size: `msft` went 1.24 MB
-> 2.72 MB when the glow was added, still well inside the 4.6 MB budget.

#### Fonts: measure, never assume

`ui-rounded`, `"SF Pro Rounded"`, `"SF Compact Rounded"` and `".SF NS Rounded"` **do not
resolve** in this Chrome. `marker` originally shipped a comment asserting the opposite.
The faces that do resolve and give the rounded geometric display look are **"Arial
Rounded MT Bold"** and **Quicksand**.

`"Segoe UI"`, `"Segoe UI Variable"`, `"Segoe UI Semibold"` and Selawik **do not resolve
either** — they are Windows faces, and Selawik, the metric-compatible open substitute, is
not installed. **Open Sans** resolves and is the closest humanist stand-in; Inter and
Helvetica Neue also resolve. `msft` keeps the Segoe names at the head of its stack so the
poster renders correctly when built on Windows and lands on Open Sans here. Measured
results on this machine, all at `font: 600 60px`, against a bogus-name fallback of 518.86:

| face | width | resolves |
|---|---|---|
| `Segoe UI`, `Segoe UI Variable`, `Segoe UI Semibold`, `Selawik`, `SF Pro Text` | 518.86 | no |
| `Open Sans` | 579.03 | yes |
| `Inter` | 599.00 | yes |
| `Helvetica Neue` | 575.59 | yes |
| `system-ui` | 555.11 | yes |

Test a font name by rendering it in an `inline-block` and comparing its width against a
**deliberately bogus font name** — not against `system-ui`. Two traps sit in that check:

- A `<div>` takes the container width, so every candidate measures identically and the
  probe silently measures nothing.
- The default fallback is a **serif**, so a name that failed to resolve still differs
  from `system-ui` and reads as a hit. The first run of this probe concluded
  "ui-rounded RESOLVES" for exactly that reason.

"Arial Rounded MT Bold" carries a **single weight**, so applying it at the root collapses
the 400/500/700/800 hierarchy the dense item lists depend on. Scope it to display and
label chrome only — `.title`, `.plane`, `.fam > .fh`, `.fsp`, `.dyn .dl`, `.xc`, `.zc`,
`.cta`, `.by .av`.

#### Checking a dashed loop is seamless

`wire-travel` runs `stroke-dashoffset: 0 -> -120`, so the dash period **must divide 120**
or the pattern tears once per loop. `18 12` = 30 and 120/30 = 4, so it is safe; the
chunkier-looking `16 12` = 28 is not.

Do not try to verify this with a whole-frame pixel difference. Both the full frame and a
crop of the wire band scored the 71 -> 0 wrap at 5.66 against 5.63 and 5.70 for ordinary
one-frame steps — but the half-loop-apart **control** scored 5.73, i.e. barely above an
adjacent frame. Once the dash shifts more than its own width the metric saturates and can
no longer tell any two phases apart, so it could not have detected a tear. Read the phase
directly instead: crop the same narrow window from frames 69, 70, 71, 0, 1, magnify with
`scale=...:flags=neighbor`, and `vstack` them. A seamless loop marches by a constant step
across the wrap. Include a static element (a joint stem) in the crop as the alignment
control.

### Product logos

`assets/logos/` carries 17 vetted Microsoft product marks as SVG, from Microsoft's
published architecture icon sets, with `SOURCES.txt` recording every set URL and sha256.

**Read `references/logos.md` before using any of them.** It covers the licence terms
that dictate the `.lg` CSS, the substring trap that silently hands you Service Fabric
when you searched for Fabric, why there is no Defender mark, and the pulse animation
that ran for weeks without animating anything while the gate said ok.

### The rules these posters obey, and why

Every one was measured across the 32-file corpus. Do not relax one without re-measuring.

1. **Motion under 2.5% of pixels.** 31 of 32 references animate under 2%; the median is
   0.805%. Motion is a garnish that signals "this is alive", not a feature.
2. **Text never animates.** Zero of the 32 move type. A reader arrives at a random point
   in the loop, so anything absent for part of the loop is absent when they arrive.
3. **Motion goes on connectors**, panel edges and small icons: `.wire`, `.spark`,
   `.joint`, `.edge-lift`, `.tick`.
4. **Density is the payload.** 30-90 discrete labelled elements. If it reads comfortably
   at arm's length it is under-filled for this format.
5. **Strokes are sized against the canvas.** References use connectors at 1.5-1.8% of
   canvas width. Anything under ~0.4% is invisible to a scrolling reader.
6. **It always closes with an ask.** Use `.cta`; no poster should omit it.

### Poster workflow

1. Pick the shape from the table by what the content *claims*, not by what looks nice.
2. Copy `templates/poster-<shape>.html` into the working directory. Keep the structure:
   the SVG coordinates are per-mille and tuned to the region they sit in.
3. Replace the copy. Fill the density -- a half-empty poster reads as a failed poster.
4. **`node scripts/checkvars.mjs work/*.html`** before rendering.
5. Render: `node scripts/render_gif.mjs work/poster.html -o work/poster.gif --duration 6 --fps 12`
6. **`node scripts/motion.mjs work/poster.gif`** and fix anything OVER or STILL.
7. **Open it with `view` and actually look at it.** Every real defect found while
   building these ten was found by looking, and every one of them was silent.

### The gates, and what each one is for

```bash
node scripts/checkvars.mjs --selftest      # prove it fires on a planted token
node scripts/checkvars.mjs templates/*.html
node scripts/motion.mjs --selftest         # prove the metric on a real frozen control
node scripts/motion.mjs examples/poster-*.gif
```

`checkvars.mjs` catches **undefined CSS custom properties**. This is not pedantry:
`var(--nope)` is not an error, CSS drops the whole declaration, so white text on a
now-transparent card is invisible and nothing anywhere complains. Three templates
shipped that way at once.

`motion.mjs` fails a GIF above 2.5% (motion is competing with the content) and below
0.05% (nothing moves, so ship a PNG). Its selftest compares a real frozen render
against the animated original, because a *synthetic* control is invalid here -- ffmpeg
error-diffuses across large flat fills and invents 0.39% motion in an image that
cannot move.

### Poster failure modes

- **Wires invisible, gate reads 0.00%** - strokes too thin for the canvas. `.wire` is
  5px at 1080 wide, not 2.5px. The gate is right; do not raise the threshold.
- **A travelling dot does not travel** - `.spark` animates `offset-distance`, which does
  nothing without an `offset-path`. Give the dot the same path data as its wire.
- **Wires float in empty space** - `.wirelayer` needs `position: relative` on the actual
  diagram region, not on an ancestor.
- **Connector stubs come out squashed** - a `viewBox` whose aspect does not match its
  element distorts geometry even with `vector-effect: non-scaling-stroke`. Put the layer
  across the full width.
- **Motion barely registers** - stubs are too short. A 9-per-mille stub is ~9px; ten of
  them move 140px out of 1.46M. Run connectors down the long gutters.
- **Invisible white-on-white text** - an undefined token. `.fam-N` sets `--l`, `--h` and
  `--b`; there is no `--f1`. Run `checkvars.mjs`.
- **An SVG shape slides instead of pulsing** - `transform-origin: center` resolves
  against the SVG *viewport* unless `transform-box: fill-box` is set. It still looks
  like an animation, so it survives review. `.tick` sets it; do it yourself on any new
  transform animation you write for SVG.
- **The gate passes but the diagram is dead** - read the band profile, not just the
  total. `bands[t/m/b]` with a 0.0 in the middle means all the motion is in decorative
  rails and the actual diagram never moves.
- **A label is wider than the region it labels** - compute the region's width at the
  label's height rather than positioning by eye. This is how the venn lens label ended
  up crossing both arcs.

### SVG connector convention

`.wirelayer` is always `viewBox="0 0 1000 1000"` with `preserveAspectRatio="none"`, so
every coordinate is per-mille **per axis** and stays correct if the region resizes.
`.wirelayer .wire` carries `vector-effect: non-scaling-stroke` so the stroke does not
distort with it. Compute gutter positions from the layout rather than eyeballing them.

## The six motion variants

Every one is a working file in `templates/`. Start from the closest fit and replace
the copy. Never start from a blank page.

| name | what moves | best for |
|---|---|---|
| **Stack** | cards land one by one, connectors draw between them | a process or pipeline, "the five steps to X" |
| **Ambient** | nothing enters or exits; only the decoration moves | the feed, where the viewer lands mid-loop |
| **Flow** | stages step across, a dot travels each connector | input to transform to output, 3-4 stages |
| **Hub** | spokes draw outward from one centre | architecture, "one X, many Y" |
| **Versus** | rows reveal in pairs across a drawn centre rule | old way against new way |
| **Layers** | bands stack bottom-up with fill bars | a stack diagram or maturity ladder |

**Ambient is the one to reach for when you are unsure.** Every other variant spends
part of its loop incomplete, so a viewer who scrolls past at the wrong moment sees a
half-built picture. Ambient has every word on screen at every instant and puts the
motion in the chrome around it. It is the only variant that is readable at 100% of
the loop. Its cost is that it cannot show a sequence.

## Workflow (motion variants)

1. **Take the concept.** Steps, layers, or a before/after. If the user gave a reference
   image or colour screenshot, pull the palette and layout rhythm from it, never the copy.
2. **Reduce the copy first.** A step gets a 2-4 word title and one line under it. If a
   line can't be visualized or could be said by anyone, cut it. Long sentences kill these.
3. **Pick 3-4 variants** that genuinely suit the content, and always include Ambient.
   Do not render all six unless asked; two of them will fight the content and waste a
   render. A numbered process should not be shown as a Hub.
4. **Copy each template into the working directory** and replace the copy. Keep the
   template's structure: the coordinates are tuned to 1080x1350 and reflow is what
   breaks these.
5. **Lint before rendering.** `node scripts/qa.mjs work/*.html`. It catches the two
   mistakes that cost a full render, in a second rather than a minute.
6. **Render each variant.** About 40-60s each.
7. **Build the gallery and hand it over.**
   `node scripts/gallery.mjs work/*.gif -o work/gallery.html --title "<the concept>"`
   One self-contained HTML file, every variant playing, a download button under each.
   Tell the user the variant names so they can answer with a word.
8. **Gate the winner** with `node scripts/qa.mjs work/winner.gif` and open it with `view`
   before presenting it as final.
9. **Iterate on the winner.** Re-render is ~40-60s, so change things freely.

## Rendering

```bash
node scripts/render_gif.mjs deck.html -o post.gif --duration 6 --fps 12
node scripts/render_gif.mjs deck.html --still 4.5 -o preview.png   # single frame
```

Options: `--width/--height` (default 1080x1350), `--duration` (must equal one full loop
of the CSS cycle; the renderer measures the real cycle and refuses to build otherwise),
`--fps`, `--colors`, `--dither` (on only for heavy gradients),
`--max-mb` (default 4.6, auto-retries with fewer colours then smaller dimensions),
`--still T` for a single PNG, `--keep-frames` to inspect frames.

**Any poster with a large smooth gradient must be rendered
`--dither --colors 200`.** At the 128-colour default with dithering off, a big radial
mesh quantises into visible contour rings - measured on a dark emerald-to-violet poster,
where the background broke into concentric arcs across the whole top-right corner. Bayer
dithering plus the wider palette removes them for about +0.25 MB, well inside the 4.6 MB
budget.

`motion.mjs` scored 1.13% before and after, identically. **No gate sees banding.** The
only way to catch it is to pull a frame out of the finished GIF and look at the flat
areas:

```bash
ffmpeg -i post.gif -vf "select=eq(n\,20),crop=1080:340:0:0" -frames:v 1 band.png
```

Flat-fill posters are fine at the defaults; this is a gradient-only tax.

Before capturing, the renderer reads the resolved duration of every running animation
and compares it to `--duration`. A mismatch is an error naming both numbers, and a
duration that is a whole multiple of the cycle is also an error, because every frame
after the first cycle is a duplicate. It reads the animations rather than the `--loop`
custom property on purpose: `base.css` declares a `:root` default, so reading the
property answers 6s even for a deck that overrides `--loop` further down.

`render_gif.mjs` uses the Playwright that ships with the Playwright MCP server plus the
system Google Chrome, so nothing needs installing on macOS. Set `PLAYWRIGHT_HOME` if
Playwright lives somewhere else. `scripts/render_gif.py` is the equivalent for Linux
containers that have the Python `playwright` package instead; it takes the same flags.

## The QA gate

```bash
node scripts/qa.mjs deck.html          # before rendering
node scripts/qa.mjs post.gif           # after rendering
node scripts/qa.mjs --selftest         # prove the detectors still discriminate
```

On HTML it fails on `animation-delay`, a hardcoded `animation-duration`, a remote font
`@import`, a stylesheet whose path does not resolve, and an animation class or
`animation-name` that nothing defines. That last one matters because CSS does not error
on it: the element simply never animates and the GIF looks subtly dead.

On a GIF it fails over 5 MB, over 400 frames, and on a GIF where nothing moves.

**It does not check the loop seam, deliberately.** A whole-frame difference between the
last frame and the first cannot separate a legitimate synchronised exit from a wrong-phase
jump, because both are large. Measured: a GIF rendered at the wrong duration scored 1.80
at the seam while a correct one scored 2.16, so the broken file looked *better* than the
good one. The renderer checks the loop instead, where the exact scrub times are still
available, and refuses to build a GIF whose cycle does not close.

`--selftest` runs every HTML detector against a known violation *and* a known-good
sample, and fails if either direction is wrong. Run it after editing a detector. A
checker that has only ever been seen returning "clean" has not been shown to work.

## Writing the HTML

Link `assets/base.css`, put everything inside `<div class="stage">`, and position
children absolutely. The stage is a fixed 1080x1350 box, so nothing reflows between
frames and SVG connector maths stays exact.

The one rule that matters:

> **Every animation runs for `var(--loop)` and repeats infinitely. Stagger the entrance
> with the index classes. Never use `animation-delay`, and never set an element's
> `animation-duration`.**

`animation-delay` shifts the entire cycle, so a delayed element also *exits* late and the
loop turns into random blinking. The index classes shift only the entrance; everything
exits together at 92-100%. The renderer pauses all animations and scrubs them to an exact
time per frame, so one shared duration keeps everything on one timeline.

### Sequenced classes (enter, hold, exit together)

| class | effect |
|---|---|
| `.rise-1` .. `.rise-8` | fade + lift in at position N. Cards, text, rows. |
| `.pop-1` .. `.pop-8` | scale-in with overshoot at position N. Icons, nodes, badges. |
| `.draw-1` .. `.draw-8` | SVG path draws itself at position N. Set `--len` to path length. |
| `.flow-1` .. `.flow-8` | dot travels a path at position N via `offset-path`. |
| `.glow-1` .. `.glow-8` | halo pulses once, starting at position N. |
| `.fill-1` .. `.fill-8` | progress bar scales from the left at position N. |
| `.anim-rise`, `.anim-pop`, `.anim-draw`, `.anim-flow`, `.anim-glow`, `.anim-fill` | aliases for index 1. Use only when one element animates alone. |
| `.anim-sweep` | light sweep across a headline. Once per GIF, never on body text. |

Stagger pattern for a 5-step stack: `.rise-1` through `.rise-5` on the cards, the same
index on each card's inner icon (`.pop-3` on card 3's node) so the icon lands with its
card, and the connector *into* card N gets `.draw-N`. Footer and attribution take the
highest index so they arrive last.

### Ambient classes (no entrance, no exit, seamless)

Frame 0% and frame 100% are identical, so these loop with no seam and can run underneath
text that never moves.

| class | effect |
|---|---|
| `.pulse-1` .. `.pulse-6` | card border brightens and settles, in sequence |
| `.amb-glow` | halo breathing in and out |
| `.amb-drift` | slow vertical drift. Background halos and blobs. |
| `.amb-shimmer` | gradient travelling across a headline, continuously |
| `.amb-scan` | light bar sweeping down the frame and re-entering |
| `.amb-orbit` | dot running a closed `offset-path` forever |
| `.amb-spin` | slow rotation |

> **Ambient rule: text elements carry no animation class at all.** Put the motion on the
> chrome around them. The moment you add `.rise-3` to a heading in an Ambient layout you
> have given up the only thing the variant is for.

Connectors: draw the SVG absolutely positioned behind the cards, give each path `--len`
from `path.getTotalLength()` (or an over-estimate; the dash maths still works), and give
it the index of the card it leads to.

## Design rules (motion variants)

- One idea per card. These work because every card is scannable in 1.5s.
- Title 68-78px, card headings 34-38px, body 24-26px. Below 22px it dies in the feed.
- Accent colour on headings and numbers only. Body copy stays dim. Never three accents.
- In sequenced variants, motion carries the order: step 1 lands, its connector draws,
  step 2 lands. If everything appears at once, the GIF is a static image that flickers.
- Keep 25-30% of the frame as breathing room. Dense is unreadable at mobile size.
- Sequenced variants hold the finished state for the last ~40% of the loop, because
  viewers land mid-loop and need a moment where the whole thing is readable.

See `references/layouts.md` for worked layouts, palettes and copy-paste motion recipes,
and `references/poster-analysis.md` for what was measured across the 32-file corpus and
why each poster rule is set where it is.

## Failure modes (both families)

- **Nothing moves / every frame identical** - never pass `animations="disabled"` to
  `page.screenshot`. Playwright implements that by fast-forwarding animations to their
  end state, which overrides the scrubbed time. `qa.mjs` catches this on the GIF.
- **Elements blink out at random times** - `animation-delay` was used instead of an index
  class, so each element runs its own offset cycle. `qa.mjs` catches this on the HTML.
- **The loop jumps at the seam** - `--duration` does not equal one full CSS loop. The
  renderer measures the real cycle and refuses to build, naming the number to use, so
  this should never reach a GIF. If it does, the deck is animating on more than one
  period and they only line up at their common multiple.
- **Ambient variant blinks** - something in it is using a sequenced class. Only the
  `.amb-*` and `.pulse-*` families are seam-free.
- **Text looks fuzzy** - keep `--scale 2`, and avoid gradients directly behind small text.
- **File too big** - reduce the area in motion. A full-frame gradient shift costs far
  more than a moving dot; Ambient is the most expensive variant for exactly that reason.
  Then drop to `--fps 10`, then shorten the loop, and only then shrink dimensions.
- **Fonts wrong** - system stacks only. A remote `@import` fails silently and reflows
  the layout after the coordinates were tuned.
