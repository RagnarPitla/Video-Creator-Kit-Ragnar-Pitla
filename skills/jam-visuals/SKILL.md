---
name: jam-visuals
description: |
  Turn a Jam Studio narration script into storyboard.json - one drawn-on scene per beat, using
  the fixed scene vocabulary. Use when the user says "storyboard", "what visuals", "board it",
  "scene for this beat", or after a jam script.json exists and needs pictures.
user-invokable: true
argument-hint: "[episode slug]"
metadata:
  tags: storyboard, visuals, remotion, jam-studio
---

# Jam visuals

One scene per beat. The scene draws itself on while the beat is spoken. Nothing ever
appears fully formed.

Read `docs/SCHEMA.md` for the exact prop shapes and `docs/style-analysis.md` for why
the vocabulary is what it is.

## The rule everything else serves

**Show the thing being said, at the moment it is said.** Timing is not your problem —
`jam align` pins every scene to the real word timings from the narration audio. Your
problem is choosing a picture that carries the sentence's meaning rather than
decorating it.

A beat that says "MCP connects the agent to tools" gets a hub with spokes. It does not
get a stock arrangement of boxes that happens to look technical.

## Scene vocabulary

The scene types available depend on the spine in `script.json`. `./jam align` picks the
compiler from that field and **rejects any type the compiler does not know**, by name,
with the list of valid ones. That is deliberate: a silently-ignored scene is a hole in
the finished video that nobody notices until it is posted.

| Spine | Scene types |
|---|---|
| `versus` | `title` `versus` `callout` `end` |
| `narrative` | `title` `rule` `step` `stair` `callout` `end` |
| `listicle` | `title` `item` `hook` `callout` `end` |

`title`, `callout` and `end` are shared across all three and behave identically.

| Type | Use it when the beat | Density |
|---|---|---|
| `title` | opens the episode | 1 idea |
| `versus` | contrasts exactly two things | 2 cards + verdict |
| `rule` | states the one thing the viewer must hold | 1 line |
| `step` | is one beat of a mechanism | label + 2 lines + aside |
| `stair` | escalates, or subtracts, in three or more moves | 3 to 4 rows |
| `item` | is item N of a numbered list | numeral + label + 2 lines |
| `hook` | interrupts the list so it stops being a recitation | 1 line + 1 punch |
| `callout` | states the point in words that must be read | 1 to 3 lines |
| `end` | closes with the CTA | 1 |

`versus` is the workhorse. Most AI explainer beats are a contrast, and the format is
the channel's signature.

The board title is derived as `left.label vs right.label`. When a beat compares two
consequences of the same pair, both cards end up with the same label and the title
reads "You get vs You get". Set `props.heading` to name the board instead — episode
005 b6 uses `"heading": "What you trade"` over cards still labelled Workflow and
Agent, so the viewer maps them back to the mechanism board two beats earlier. Reuse
the same icon and colour as the earlier board when you do this; that is what makes
the mapping instant.

A `listicle` needs exactly one `hook`, placed so it sets up the next item. Put it before
the item that matters most, not at the arithmetic midpoint. Episode 003 puts it after
item two because item three is the expensive one.

## Density limits

The frame is 1080 wide and viewed on a phone held at arm's length. These are not
suggestions, they are legibility floors:

- One scene carries **one** idea. If a beat needs two pictures, it is two beats — go back and split the script.
- Maximum six `item` scenes in a listicle, four `stair` rows, two `lines` per step or item.
- Labels: two to four words. A label that needs a comma is a `lines` entry, not a label.
- `verdict` and `callout` lines: under nine words each.
- Nothing meaningful in the top 12 percent or bottom 18 percent of frame. Instagram and LinkedIn put their own UI there. The engine enforces the band; do not fight it by cramming.

## Colour

Palette lives in `brand/theme.json`: `ink` `red` `yellow` `blue` `green` `pencil` `paper`.

- Ink is the default for everything structural.
- One accent colour per side of a `versus`, and keep the assignment consistent for the whole episode. If MCP is green in beat one, MCP is green in beat six.
- Red means tension, cost, or the thing that breaks. Do not spend it on a neutral label.
- Yellow is only the highlighter swipe under a verdict or callout. Never a fill.
- Pencil is for de-emphasis: inactive list items, superseded nodes.

Three colours on screen at once is the ceiling, counting ink.

## Icons

Sixteen names, validated at compile time: `server` `chip` `model` `agent` `doc`
`database` `cloud` `person` `factory` `chart` `money` `lock` `gear` `laptop`
`satellite` `box`. A name outside the list stops the build with the list printed,
so a typo cannot reach a finished video.

**Avoid `box`.** It draws a plain empty square, which is byte-for-byte what the
engine's unknown-icon fallback draws. On a still you cannot tell a deliberate box
from a broken one, and neither can a reviewer. Pick something with a silhouette.

When two boards in one episode refer to the same pair, give the cards the same
icon and the same colour both times. Episode 005 repeats gear-blue for workflow
and agent-green for agent across beats 5 and 6, which is what lets the second
board be read as a consequence of the first rather than a new comparison.

## Camera

Presets: `full`, `left`, `right`, `top`, `bottom`, or explicit `{x, y, zoom}` in board
coordinates. The rig eases between scenes over 18 frames and never cuts.

Use movement to mean something:

- Open on `full`, so the viewer sees the shape of the page.
- Push into a half when the narration narrows to one side of a comparison.
- Pull back to `full` on the verdict, so the two halves are seen together at the moment they are compared.

A camera move per beat is too many. Move when the attention moves, and hold otherwise.

## Accumulation

Set `"persist": true` on a scene to leave its ink on the board for the rest of the
episode. This is how the reference videos build a filling page rather than cutting
between clean slides.

Use it for:

- the progress list in a multi-pair `versus` episode, so the viewer always sees where they are
- the nodes of a `web` being built up one spoke at a time
- a running staircase of numbers

Do not persist decorative scenes. A board with eight persisted layers is noise.

## Choosing icons

There are sixteen, and only sixteen:

```
server  chip     model      agent
doc     database cloud      person
factory chart    money      lock
gear    laptop   satellite  box
```

`./jam align` fails on any other name, on purpose. The engine's fallback for an unknown
icon is an empty square that renders silently, so a typo used to ship as a blank box in
the middle of the frame. Do not guess a name: `plug` and `hub` both sound obvious and
neither exists.

Pick the literal object, not the metaphor. A database is a `database`. An agent is an
`agent`. A protocol has no picture, so reach for the thing it runs on: MCP is a
`server`. If nothing fits, use a `callout` with words rather than forcing a wrong
picture. A wrong icon actively misleads; words merely fail to help.

## Working method

1. Read `script.json` beat by beat.
2. For each beat, write down in plain words what the viewer should be looking at. One line.
3. Only then pick the scene type that matches that line.
4. Fill props. Keep labels short enough to read at a glance.
5. Set camera and `persist`.
6. Run `./jam align <episode>`. It validates every beat has a scene, every type is known, every icon exists, every colour is a theme key. Fix everything it reports.
7. Render, then look at the stills in `out/stills/`. Reading the JSON is not review — the only real check is whether the frame is legible on a phone.

## Self-check

1. Cover the captions. Does the picture still say something?
2. Cover the picture. Does the narration still work? If either fails alone, the pairing is wrong.
3. Is any label longer than four words?
4. Is anything inside the top 12 or bottom 18 percent?
5. More than three colours in one frame?
6. Does anything appear fully formed instead of drawing on?
7. Are the accent colours consistent with earlier beats in the same episode?
