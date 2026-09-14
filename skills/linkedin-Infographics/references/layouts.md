# Layouts, palettes, and motion recipes

## Contents
1. The six variants
2. Layout archetypes
3. Palettes
4. Motion recipes (copy-paste)
5. Ambient recipes (text stays put)
6. Copy patterns

---

## 1. The six variants

Each has a working deck in `templates/`. Copy one and replace the copy; do not start
from a blank file. The names are what `variants.json` and the gallery use.

| Variant | Template | Motion sits on | Best for |
|---|---|---|---|
| **Stack** | `stack.html` | the cards themselves | processes, 4-6 numbered steps |
| **Ambient** | `ambient.html` | the chrome only, never the text | quotes, single claims, dense copy |
| **Flow** | `flow.html` | cards plus a travelling dot | input -> transform -> output |
| **Hub** | `hub.html` | spokes drawing outward | architecture, one core many surfaces |
| **Versus** | `versus.html` | paired rows revealing | old way / new way |
| **Layers** | `layers.html` | bands rising bottom-up | stack diagrams |

Pick **Ambient** whenever the copy is long enough that a reader needs more than one
loop to finish it. Every other variant re-enters its text each cycle, which restarts
the reader.

## 2. Layout archetypes

**Vertical stack** (the reference style). 4-6 numbered cards down the page, offset
number badges on the left edge, icon cluster on the right of each card, dashed connectors
snaking between them. Best for processes and pipelines. Card height ~200px at 1080x1350.

**Diagonal flow.** Cards step left-to-right as they descend. Reads faster than a straight
stack, holds fewer steps (3-4). Good for "input -> transform -> output".

**Hub and spoke.** One center node, 4-6 satellites, connectors drawing outward in
sequence. Best for architecture ("one harness, many surfaces"), not for sequences.
Keep spoke lines clear of the satellite labels - route the line to the node's edge,
not its centre, or the label sits on top of the wire.

**Split before/after.** Vertical rule down the middle, dim left column, accent right
column, rows revealing in pairs. Best for "old way / new way" posts. The rule itself can
take `.draw-1`.

**Layer cake.** Horizontal bands stacking bottom-up, each labeled. Best for stack
diagrams (model / harness / policy / audit). Bands rise in with `.rise-N`, bottom first.

Everything is positioned inside `.stage`, a fixed 1080x1350 box whose children are
absolutely positioned. That is deliberate: if the layout can reflow between frames, SVG
connector coordinates drift and the wires stop meeting the cards.

## 3. Palettes

Set these on `:root` to override base.css.

```css
/* Midnight (reference default) */
--bg-0:#0a0620; --bg-1:#150c33; --accent:#ff8a3d; --accent-2:#8b5cf6;

/* Slate + cyan - technical, cooler */
--bg-0:#070d14; --bg-1:#0f1c2b; --accent:#22d3ee; --accent-2:#3b82f6;

/* Ink + lime - high contrast, stands out in a blue feed */
--bg-0:#0b0f0a; --bg-1:#13200f; --accent:#a3e635; --accent-2:#22c55e;

/* Paper - light mode, rare in feed so it interrupts the scroll */
--bg-0:#f6f4ee; --bg-1:#ffffff; --ink:#141414; --ink-dim:#5b5b5b;
--card:rgba(0,0,0,.035); --card-line:rgba(0,0,0,.10); --accent:#d94f04;
```

Matching a user's screenshot: sample the background, the heading accent, and one
secondary. Ignore everything else in the image. Three colors carry the whole design.

## 4. Motion recipes

**Never use `animation-delay`.** Use the numbered class instead. Every numbered class
runs the full `var(--loop)` and bakes its stagger into the keyframe percentages, so all
elements start and finish on the same cycle. An `animation-delay` shifts an element's
local time, so during the captured window it reaches its exit early and re-enters
mid-GIF. That is the blinking this skill exists to avoid, and `scripts/qa.mjs` fails
the build on it.

Indexes run 1-8. Entrance for index N starts at `3 + 6*(N-1)` percent and settles at
`9 + 6*(N-1)` percent; everything exits together over 92-100 percent.

**Sequenced cards**
```html
<div class="card rise-1">...</div>
<div class="card rise-2">...</div>
<div class="card rise-3">...</div>
```

**Connector that draws, then sends a dot**

Give a connector the index of the card it leads **to**, so the line arrives just after
its destination appears.

```html
<svg class="wires" width="1080" height="1350">
  <path d="M180 300 C 180 380, 620 360, 620 440"
        class="draw-2" style="--len:300"
        fill="none" stroke="rgba(255,255,255,.28)" stroke-width="3"
        stroke-dasharray="8 8"/>
</svg>
<div class="dot flow-2"
     style="offset-path:path('M180 300 C 180 380, 620 360, 620 440')"></div>
```

`--len` must be at least the path length or the line will not finish drawing.
`offset-path` needs the same `d` string as the path. `.dot` is a 13px accent circle.

**Active node pulse** - `.glow-N` on the one node that matters, N matching its card.
Only ever one glowing node per card.

**Counter-style reveal** - `.pop-N` on the digit, plus `.fill-N` on a bar under it.
`.fill-N` already lands after `.pop-N`; do not try to offset it further.

**Headline sweep** - `.anim-sweep` on the `h1`. Use once per GIF, never on body text.

**The un-numbered `.anim-*` classes** (`.anim-rise`, `.anim-pop`, `.anim-draw`,
`.anim-flow`, `.anim-glow`, `.anim-fill`) are the index-1 timing. Use them only when a
single element animates alone. The moment there are two, switch to numbers.

## 5. Ambient recipes (text stays put)

Ambient motion loops without ever entering or exiting: frame 0 and frame 100 are the
same, so there is no seam and nothing disappears. This is what lets the copy stay
readable for the whole loop.

**The rule: in an Ambient deck, no text element carries a sequenced class.** Headline,
body, labels and pills get no animation at all. Motion goes on the chrome behind and
around them. Mixing one `.rise-N` into an Ambient deck reintroduces the blinking.

| Class | What it does | Put it on |
|---|---|---|
| `.amb-glow` | halo breathing in and out | a card or node behind the text |
| `.amb-drift` | slow vertical float | a background blob, never text |
| `.amb-shimmer` | light sweeping through the glyphs | the `h1` only |
| `.amb-scan` | bar sweeping down and re-entering | a full-width 2px line |
| `.amb-spin` | continuous rotation | a ring or dashed circle |
| `.amb-orbit` | dot running a closed `offset-path` | `.dot` on a circular path |
| `.pulse-1..6` | staggered breathing, returns to rest | cards, when you want life in them |

`.pulse-N` is the bridge: it is staggered like `.rise-N` but each cycle returns to its
starting state, so cards can have a heartbeat without the copy resetting.

```html
<div class="stage">
  <div class="halo amb-drift"></div>
  <div class="scanline amb-scan"></div>
  <h1 class="amb-shimmer">Agents do not fail loudly</h1>
  <p class="at" style="top:520px">They fail quietly, and keep going.</p>
  <div class="card pulse-1 at" style="top:700px">...</div>
  <div class="card pulse-2 at" style="top:900px">...</div>
</div>
```

Ambient is the most expensive variant to encode, because a large soft gradient in motion
defeats the GIF palette. If it lands over 5 MB the renderer drops colors automatically;
shrinking the moving area is the better fix.

## 6. Copy patterns

- Title: a claim, not a label. "The 5-step stack to turn signals into pipeline" beats
  "Signal-to-pipeline process".
- Card heading: verb + object, 2-4 words. "Route signals to the engine".
- Card body: one line, under 12 words, concrete enough to picture.
- Bullets: max 4 per card, max 6 words each, fragments not sentences.
- Pills at the bottom: 3-5 one-word outcomes. They read as a payoff line.
- Attribution block bottom-right: name, title, handle. Keeps the asset yours when it
  gets reposted without credit.
- Nothing below 22px. It is unreadable in the feed and `qa.mjs` will flag it.
