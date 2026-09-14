# Poster analysis: what actually performs

Cited by `assets/poster.css` and `scripts/motion.mjs`. This file records what was
measured, how, and which conclusions are safe to build on. If you loosen a rule in
either of those files, re-measure first and update this document.

## The corpus

32 GIFs collected from high-performing Instagram and LinkedIn infographic accounts,
plus 3 JPEGs, at `~/Desktop/zlink-Inspo/GIF`. They were chosen for engagement, not
for aesthetics, so the point of the exercise was to find the *mechanics* that travel,
not to copy the look. The visual identity in `poster.css` is deliberately our own.

## Geometry

| property | finding |
|---|---|
| width | **28 of 32** are exactly 800px wide |
| shape | **19 of 32** are 800 x 999-1001, i.e. a 4:5 portrait |
| orientation | 29 of 32 portrait; 3 are wider than tall |
| frames | 30 frames is the mode (15 of 32) |

800px is a delivery constraint, not a design one: it is what the source platform
serves. We render at 1080x1350, the same 4:5 at higher resolution, because LinkedIn's
limit is 5 MB and 400 frames rather than a pixel cap.

## Finding 1: motion is a garnish, not the point

Per-file percentage of pixels that change anywhere in the loop:

| statistic | value |
|---|---|
| n | 32 |
| minimum | 0.19% |
| median | **0.805%** |
| mean | 1.203% |
| maximum | 12.18% |
| under 2% | **31 of 32** |

These are re-measured with the metric that currently ships, not inherited from an
earlier run. An earlier pass using a fixed 400px analysis width gave 0.226 / 0.772 /
1.191 / 11.964 -- the same story, but do not quote those, they were produced by a
metric this skill no longer uses.

The single file above 2% is a decorative editorial illustration -- a figure walking
into a keyhole, no text and no data anywhere in it. That was confirmed by extracting
and looking at its frames, not inferred from its shape. **Shape does not predict
motion; content type does.** The other two files that are wider than tall are genuine
posters and measure 0.664% and 0.947%, comfortably inside the band.

This is encoded as `POSTER_MAX = 2.5` in `scripts/motion.mjs`. The gate fails a render
above it and also fails one below `POSTER_MIN = 0.05`, because a GIF that does not
move should have been a PNG.

For calibration, the six older entrance-animation templates in this skill measure
5.66% to 12.98% under the same metric. They are a different system with a different
job -- they animate content in, deliberately -- and are not gated by this budget.

## Finding 2: text never moves

Zero of the 32 animate type. Not a fade, not a slide, not a counter.

The reason is structural. A reader meets the poster at a random point in the loop, so
any element that is absent for part of the loop is absent when someone arrives. Every
word must be legible at every instant. Motion goes on connectors, panel edges and
small icons, never on anything carrying meaning.

## Finding 3: motion lives on the connectors

Magenta motion-overlay maps over the whole corpus put almost all changing pixels on:

- connector lines between panels (the dominant case)
- panel border glows
- small icon pulses
- a travelling dot riding a line

This is why `poster.css` provides `.wire`, `.joint`, `.spark`, `.edge-lift` and `.tick`
and nothing that animates a text node.

## Finding 4: density is the payload

Each poster carries roughly 30 to 90 discrete labelled elements. These are made to be
screenshotted and read later, not glanced at. Small type is correct here; a poster
that reads comfortably at arm's length is under-filled for this format.

## Finding 5: stroke weight is proportional to the canvas

The reference posters use connectors and dots at roughly 1.5-1.8% of canvas width
(a 14px dot on an 800px canvas). This is much chunkier than a typical diagram.

Nine of the ten templates in this family originally shipped at 2.5px on a 1080px
canvas, which is 0.23% -- around seven times thinner than what performs. They read as
dead, and `motion.mjs` scored them at 0.00%. The gate was right and the design was
wrong. `.wire` is now 5px, `.wire.thin` 3.2px, joints r=7 to r=9.

## Finding 6: it always ends in an ask

Every poster in the set closes with a full-bleed bar carrying a handle, a prompt or
both. `.cta` exists for this and no template should omit it.

## The archetype catalogue

Thirteen shapes were identified in the corpus; ten are built as templates. Each is a
working file in `templates/`, gated and visually verified.

| template | shape | reach for it when |
|---|---|---|
| `poster-spine` | centre process, annotation gutters both sides | one sequence, and the commentary is the value |
| `poster-columns` | 2-4 column compare with shared row labels | "here are the options and the trade" |
| `poster-quad` | numbered card grid with ghost numerals | N peers with no ordering between them |
| `poster-rail` | vertical icon rail on a continuous spine | ordered stages of one thing |
| `poster-radial` | hub plus satellites | everything relates to one centre, not to each other |
| `poster-arcs` | concentric nested bands | a maturity model where each layer encloses the last |
| `poster-venn` | three sets and the middle | "you need all three", and the pairs are quotable |
| `poster-matrix` | category rail plus dense catalogue | there are a lot of these and they group |
| `poster-road` | serpentine numbered path | a journey whose steps are uneven in weight |
| `poster-layers` | horizontal stack with slot rails | an architecture where tiers sit on each other |

Not yet built: mindmap (left-spine bracket tree), sketch (hand-drawn paper),
role-table.

Choosing wrongly is the most common failure. `radial` claims the satellites are
unrelated to each other; `arcs` claims each layer strictly encloses the one inside it.
If either claim is false for your content, the shape is lying and a reader who knows
the domain will see it.

## How the metric works, and why it is built this way

`scripts/motion.mjs` extracts frames, computes a per-pixel max-minus-min across the
loop, erodes, and reports the surviving percentage plus a top/middle/bottom band
profile.

Three decisions in it are load-bearing and were each forced by a measurement:

**Erosion at 7-of-8 neighbours.** GIF palette dithering is not low-amplitude noise.
On a provably frozen image, ffmpeg's encoder flips anti-aliased edge pixels between
palette entries with a range up to 150 grey levels, and the affected pixels are
contiguous. Neither a threshold nor light erosion separates that from real motion. At
5-of-8 a static poster still read 0.50%, because a 2-row dither band scores exactly 5.
At 7-of-8 a 2px artifact dies and a blob interior (which scores 8) survives.

**The control is a real poster, not a synthetic fixture.** A large flat synthetic fill
makes the encoder error-diffuse, producing a 7-row wedge and 0.39% phantom motion on
an image that could not move. Real posters are mostly white with small coloured
elements and the encoder is stable on them. The control is now one frame of a real
render, frozen and re-encoded through the same pipeline: it reads 0.000% against
12.978% for the animated original. **A control must match the content statistics, not
just the geometry.**

**The analysis scale is relative (0.5x), not a fixed pixel width.** A fixed 400px was
calibrated for the 800px corpus. Applied to a 1080px render it halves everything
again, and a legitimate 5px connector lands at 1.85px, which 7-of-8 erosion
annihilates. That reported 0.00% on nine posters. A constant factor makes the metric
say the same thing about the same design at any canvas size, and the corpus still
measures in its original band, so the 2.5% budget carries over unchanged.

## Defects found while building this family

Recorded because each one failed silently and will recur.

1. **`var(--f1)` never existed.** `.fam-N` sets `--l`, `--h` and `--b`, not per-family
   tokens. An undefined custom property is not an error: CSS drops the declaration and
   the element renders transparent, so white text on a white card is invisible and
   nothing in the pipeline complains. It shipped in three templates at once and was
   caught by looking at a picture. `scripts/checkvars.mjs` now gates it, and
   immediately found two more (`--r`, `--bg`) that had gone unnoticed.

2. **`.spark` was dead in every template.** It animates `offset-distance`, which does
   nothing without an `offset-path`. A circle with no `offset-path` sits at its cx/cy
   looking perfectly deliberate. Give the dot the same path data as the wire it rides.

3. **The SVG pinned to the wrong ancestor.** `.wirelayer` needs a `position: relative`
   parent that is the actual diagram region. Pinned one level too high, the wires
   render floating in empty space.

4. **A `viewBox` whose aspect does not match its element squashes everything.** The
   layers seam was in a 34px-wide box with a `0 0 100 1000` viewBox, so its connector
   stubs came out 17px long and the poster failed the gate at 0.05%.

5. **The serpentine connected the wrong stops.** `poster-road` linked 2 to 4 instead
   of 2 to 3. It looked plausible; only tracing the reading order caught it.

6. **Stub connectors are too short to carry motion.** A 9-per-mille stub is about 9px.
   Ten of them animate roughly 140 square pixels out of 1.46 million. Connectors
   belong in the long gutters, running most of the poster.

7. **A lens label wider than its lens.** `poster-venn` placed a 104px label in the
   part of the A-and-B lens that is only 36px wide, so the text crossed both arcs. The
   lens width at height y is computable in one line; the label was positioned by eye
   instead. Every coordinate in that template is now derived from the circle radius,
   with the formula in a comment next to it.

8. **`transform-origin: center` does not mean the shape's centre on SVG.** Without
   `transform-box: fill-box` it resolves against the SVG viewport, so `.tick` slid a
   dot across the frame instead of pulsing it in place -- and it still looked like a
   deliberate animation. Verified by rendering the loop start and midpoint and
   measuring the displacement: the broken form moves the dot ~14px, the fixed form
   ~0.5px. `.tick` now sets `transform-box`.

9. **A poster can pass the total budget while its diagram is dead.** `poster-venn`
   measured 0.19% overall with a **0.0% middle band**: the only motion was on two
   decorative rails top and bottom. Read the band profile, not just the total. It now
   animates the outline of the all-three region, which is the claim it is making.

### Note on venn and the floor of the band

`poster-venn` measures 0.21%, against a corpus minimum of 0.19%. That is not a defect
to tune away. A venn has almost no long connectors by construction, so it genuinely
belongs at the bottom of the distribution, and real posters measure there. Resist
adding motion for the metric's sake -- the gate's floor is 0.05%, which is the level
that means "this should have been a PNG".

## Verification commands

```sh
node scripts/checkvars.mjs --selftest        # prove the CSS-token gate fires
node scripts/checkvars.mjs templates/*.html  # gate every template
node scripts/motion.mjs --selftest           # prove the metric on a real control
node scripts/motion.mjs examples/poster-*.gif
```

Gate `poster-*.gif` specifically, not `examples/*.gif`. The six older
entrance-animation renders live in the same folder and are deliberately far above this
budget, so the wider glob exits 1 on files that are not in breach of anything.

All ten templates currently measure 0.21% to 1.08%, inside the corpus poster band of
0.19% to 1.81%.

Read the band profile as well as the total. A poster whose middle band is 0.0% has a
static diagram, whatever its headline number says.
