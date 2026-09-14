# editorial-type

The third register for `ig-video-animations`, alongside `ink-board`. Same
narration, same palette, no handwriting.

It exists because of one note on the ink-board bold cut: *"i do like what you
did but can we do V2? with text or editing instead, writing feels very basic."*
The slabs and counted figures had landed; the hand lettering had not. Drawn
letterforms read as a whiteboard explainer, and a whiteboard explainer is a
genre with a ceiling.

So this register drops the two things that define the ink board: the pen, and
the roaming camera. What is left is typography and cutting.

## The rules

**Two faces, no others.** Anton for anything that is a statement. Inter for
kickers, captions, data labels and section names. A third face is a tell.

**Everything is upper case in Anton.** Anton has no lower-case rhythm at 190px.

**Cards are full-bleed and own the whole frame.** This is the structural
difference from a board. A board composes many elements onto one shared canvas,
so every element needs collision-free geometry and the camera needs a sorted
move list. A card has one owner, so the only authoring errors left are cue
order and text that is too long, and both are gated at build time.

**Hard cuts only.** No dissolve, no wipe, no slide. A card runs until the next
card's cue and then it is gone. A crossfade between cards would land the film
back in the genre it is trying to leave.

**Nothing draws on.** Type rises into a fixed mask: the glyphs are already
finished and they move into view behind a hard edge. Sweeping a stroke along a
letterform is handwriting by another name.

**No boil.** The ink board redraws its paths 7.5 times a second to keep the
line alive. Boiling a typeface makes it look broken.

**Content sits low, air sits high.** Cards are anchored to the bottom of a band
that ends at y=1520, just above the caption. Centred, a two-line statement
leaves 500 units of dead paper above and below and the frame reads as a slide
with generous margins.

**Two elements never cut.** A progress rail across the top, and a ghost chapter
numeral in the upper third that changes only at a section boundary. Across
forty hard cuts they are the only things holding still, which is what makes the
cuts read as one film rather than forty images.

## Card kinds

| Kind | For | Shape |
|---|---|---|
| `title` | A statement | Kicker, 1-4 Anton lines, accent rule, optional sub |
| `stat` | One number | Kicker, a counted figure at 440px, sub |
| `list` | Enumerating things the narration enumerates | Numbered rows sliding in on a stagger |
| `quote` | A statement with one line struck in accent | As `title`, one line punched at the end of the reveal |
| `split` | Pairing a thing with what it is | Label above value, last value in accent |
| `chart` | A series | Stroke-dashoffset sweep, marked points, peak counted |
| `web` | Things connected to a hub | Edges grow outward from the centre |

## What the build gates

`build_cards.py` refuses to write JSON on any of these, because none of them
produce an error at render time:

1. **A cue not in the narration.** Resolved with a Python mirror of `cueTime`,
   in the same order: exact word run, then loose contains on the word stream,
   then segment text.
2. **Cards out of chronological order.** `TypeFilm` sorts by resolved cue, so an
   out-of-order deck plays in an order nobody authored and looks intentional.
3. **A reveal longer than the hold.** The last line is cut off mid-rise and
   reads as a dropped frame.
4. **A card taller than the safe band.** The flex box grows past the caption
   line and the last row renders under the burned-in caption. Invisible in any
   still probed before that row arrives.

Text width is not gated, it is derived: `fit()` sizes each card so the longest
line clears the 904-unit column. Anton's advance is close to 0.443 em, measured
off a render rather than guessed; the helper uses 0.455 to leave a margin.

## Numbers

| | |
|---|---|
| Frame | 1080 x 1920 |
| Column | 904 units, 88 padding each side |
| Content band | y 150 to 1520, content anchored to the bottom |
| Captions | from y 1520 down. Nothing composed may enter it |
| Display sizes | 240 single-line title, 190 multi-line, 132 quote, 96 list, 440 stat |
| Rail | 8 units, progress in accent over foreground at 13% |
| Chapter numeral | 300px Anton at 7% foreground |

## Where it lives

`~/Desktop/rbuild-ai/Prod-Tools/ig-video-animations`

| File | What |
|---|---|
| `engine/src/type/Type.tsx` | `MaskLine`, `Kicker`, `Rule`, `Counter`, `slot` |
| `engine/src/type/Cards.tsx` | The seven card kinds |
| `engine/src/lib/cards.ts` | Deck schema. Add an enum value in the same edit that teaches the renderer to draw it |
| `engine/src/lib/TypeFilm.tsx` | Deck to film: cue resolution, hard cuts, audio, captions, rail, chapter |
| `episodes/001-palantir/build_cards.py` | The episode 001 deck and its four gates |

## Traps

**`slot` is not `stagger`.** `lib/timing.ts` exports a `stagger(index, count,
progress, overlap)`; `type/Type.tsx` exports `slot(p, i, n, overlap)`. Both take
four numbers in a different order, so a same-named pair would swap silently and
render wrong without erroring. They are deliberately named apart.

**`tabular-nums` on every counter.** Without it the glyphs have different
advance widths and a counting figure jitters sideways the whole way up.

**Key each card on its id.** Without the key React reconciles a title card into
the next title card and animates the old glyphs into the new text, which is a
morph, not a cut.

**`dim` is for rules, not text.** Foreground at 20% alpha is a hairline. A label
at that alpha is unreadable on a still and worse in motion. Secondary text uses
63%.

**A missing zod enum value takes out the whole composition** and surfaces as
"Could not find composition with ID X", which points at the registration - the
one thing that was correct.
