# In Our AI Era - house style

The look for Ragnar and Tina's podcast: 90s DOS on a CRT. Blocky pixel type,
scanlines, typewriter reveals, hard-edged boxes. No gradients except the one
burned through the headings, no rounded corners, no drop shadows, no easing
that a 1993 machine could not have done.

Two deliverables share this style and must agree:

- **Animated explainers** - Remotion, `~/Desktop/rbuild-ai/in-our-ai-era-video`.
- **Multi-camera episodes** - ffmpeg, `skills/podcast-multicam-edit`. The
  animation is cut into the episode as B-roll, so its palette has to match the
  live-action chrome exactly.

Everything below is measured from shipped output, not designed on paper.

## Two themes

`theme.ts` is the only place a colour is allowed to be defined. Both themes
carry the same 16 keys, so a scene renders under either without a code change.

| | `lightTheme` - DOS on paper | `colorTheme` - black CRT |
|---|---|---|
| paper | `#ffffff` | `#000000` |
| ink | `#151515` | `#f4f4f4` |
| blue | `#0000aa` | `#2f9bff` |
| teal | `#00707a` | `#3ad0c8` |
| magenta | `#a800a8` | `#ff6bd6` |
| red | `#c01c1c` | `#e8412c` |
| green | `#0a7a2f` | `#5cc93f` |
| amber | `#b45f06` | `#f5a623` |
| grey | `#8a8a80` | `#8f8f88` |
| fill | `#c9c7bd` | `#3a3a34` |
| bar bg / ink | `#151515` / `#ffffff` | `#0b3a8f` / `#ffffff` |
| scanline rgb | `10,10,10` | `255,255,255` |
| vignette | inset, 220px | none |
| rainbow | `null` | `#e8412c #f5a623 #f7e04b #5cc93f #2f9bff` |

Light is the default and the safer read on a phone. Colour is the one that
gets used, because `headingPaint()` clips the 5-stop rainbow through the pixel
glyphs at 115 degrees and the letterforms pick up per-pixel colour shifts. On
light it falls back to solid ink - the same component, no branch at the call
site.

Ship both when a piece is going to social. Ragnar picks.

## The episode chrome is the colour theme

This is the join, and it is why the two pipelines cannot drift apart:

| Episode element | Value | Comes from |
|---|---|---|
| Top and bottom bar | `#0b3a8f` | `colorTheme.barBg` |
| Bar text | `#ffffff` / `#cfe0ff` | `colorTheme.barInk` |
| Ragnar speaking border | `#f5a623` | `colorTheme.amber` |
| Tina speaking border | `#ff6bd6` | `colorTheme.magenta` |

Change a value in `theme.ts` and the ffmpeg constants in
`skills/podcast-multicam-edit/scripts/{gfx,render}.py` have to move with it.
They are duplicated by hand - there is no shared import across a TypeScript
and a Python pipeline. Grep both before editing either.

## Type

| Role | Face | Where it loads from |
|---|---|---|
| Headings, cards, lower-thirds | Press Start 2P | Remotion: `@remotion/google-fonts`. ffmpeg/PIL: `/Library/Fonts/PressStart2P-Regular.ttf` |
| Terminal body, dense lists | VT323 | **Remotion only** |
| Labels, captions, chrome | IBM Plex Mono | Remotion: google-fonts. ffmpeg/PIL: `/Library/Fonts/IBMPlexMono-Regular.ttf` |

VT323 is not installed on this machine. Ask for it in an ffmpeg or Pillow
draw and you get a silent fallback to the system default, which is
proportional and destroys the look without erroring. Verified 2026-08-30.
Use Press Start 2P for headings and IBM Plex Mono for everything else on the
ffmpeg side; `gfx.py` already probes in that order and falls back to Courier
New Bold.

Press Start 2P is enormous per glyph. Budget roughly half the characters per
line you would for a normal mono, and measure the box rather than trusting a
character count - `gfx.py` uses `textbbox` for exactly this reason.

## Episode layouts

Canvas 1920x1080 at 30fps. Top bar 64px, bottom bar 56px, both `#0b3a8f`,
drawn over every layout except `ANIM_FULL`.

| Layout | Geometry | Use |
|---|---|---|
| `DUO` | two 928x760 tiles at y=164, x=24 and x=968 | Conversation. The default. |
| `SOLO_R` / `SOLO_T` | 1620x912 at (150,88) | One host holding the floor for a long stretch |
| `DEMO` | screen 1480x832 at (428,128); host tiles 400x225 at (12,308) and (12,555) | Screen share, both hosts kept visible at left |
| `ANIM_DUO` | anim cropped `1920:926:0:82`, scaled to 1480x714 at (428,187); same left tiles | Animation as B-roll with hosts on it |
| `ANIM_FULL` | full frame, no chrome | Cold open, outro, full-screen cards |

Two rules that came out of shipping V3, both learned the hard way:

**The hosts own the intro.** Ragnar's note, verbatim: *"we have to be the
owners on this."* The cold open runs `ANIM_DUO`, not `ANIM_FULL` - faces on
screen alongside the title card. Same at the top of any new section.

**Never leave the wrong single face up.** If the audio has Ragnar starting a
sentence while the layout is `SOLO_T`, cut to `DUO` rather than swapping
solos. Two-shot is always a legal answer and it never looks like an error.

## Motion

Reveal by typing, not by fading. `TypeLine` exposes `text.slice(0, shown)`
where `shown = floor(elapsed / fps * cps)`, default **42 characters per
second** - fast enough to read along with, slow enough to see. `BlinkCursor`
is a solid block toggling every `round(fps / 2)` frames, so twice a second at
any frame rate. Cards land on a hard cut. Nothing moves in a curve.

Both are derived from the frame number, never from wall-clock time, so a given
frame renders identically on every run. The *encode* is a separate matter -
x264 is not bit-reproducible, and re-encoding the same frames yields a
minority of frames differing at 50-60 dB PSNR. Compare frames, not file
hashes.

Scanlines and flicker run over everything at low opacity from the theme's
`scanRgb` and `flicker`. Light theme adds an inset vignette; colour theme does
not, because the paper is already black.

## Fixed identity

- Show name: **In Our AI Era**
- Hosts: **Tina and Ragnar**, in that order, always both named
- Episode label on animated cards: the word `EPISODE` only. No number -
  releases slip and a burned-in `E.12` dates the file. The live-action chrome
  carries no episode label at all, only show name and episode title
- Outro card carries the host credit, so **it must run to completion**

The config that produced the shipped episode is
`~/Desktop/Scout-local/edit/show.json`. A new episode is that file with
`title` and the two source paths changed - everything else is the house style
and should not move:

```json
{
  "brand": "IN OUR AI ERA",
  "title": "RUNNING AI ON YOUR OWN MACHINE (SCOUT LOCAL)",
  "footer_left": "F1 HELP  F2 MODELS  F3 GGUF  F10 QUIT",
  "footer_right": "SCOUT LOCAL",
  "bar_color": "#0b3a8f",
  "hosts": [
    { "key": "rag",  "name": "RAGNAR", "color": "#F5A623", "file": "..." },
    { "key": "tina", "name": "TINA",   "color": "#FF6BD6", "file": "..." }
  ],
  "anim_crop": "1920:926:0:82"
}
```

`footer_left` is a joke that has to stay plausible: fake function keys for
whatever the episode is about. `F3 GGUF` works because the episode is about
local model files. Reuse it verbatim on an episode about something else and
it reads as a template.

### The outro trap

The host credit rule above has already cost a re-render. Trimming dead air off
the tail of an episode shortens the closing animation with it, because the
animation is a continuous timeline sampled at the segment's offset. V3 lost
the "HOSTED BY TINA + RAGNAR" credit at 97% through the card and nothing
failed - the encode was clean, the gate passed. Fixed by extending the last
shot to 14.20s so the card finishes and holds 2.0s in silence. Check the final
frames by eye on every cut.

## Verifying

`../../lib/verify/gate.sh` catches a broken encode: wrong resolution, wrong
frame count, black runs, mono audio, silent head or tail.

It cannot see the wrong person on screen, an unreadable card, a fallback font
or a truncated outro. For those, pull frames with
`../../lib/verify/stills.sh` and look at them. Every defect described on this
page was found by looking, not by a gate.
