# Authoring traps

`verification-gates.md` covers checking a finished file. This covers the
failures that happen while you are building it, most of which no gate can see.

Every entry here was paid for. The measurement is included so you can tell
whether it still applies to your engine.

## Boring is usually weight, not motion

Two rounds of "the visuals are boring" were answered with more animation. Both
times it did not help.

The measurement that settled it: one frame per second was extracted from the
146-second film and PSNR-compared against its neighbour. Only **5 of 146
seconds** were near-identical. The film was never short of motion.

What was actually wrong was that every mark was an outline on cream, headings
were the same point size as body notes, and colour never got any **area**. The
page stayed beige and nothing in the frame claimed to be more important than
anything else.

The fix was vocabulary, not a motion patch: solid colour slabs behind section
titles with the type knocked out, numbers counting up instead of appearing,
and deleting outlined containers rather than nesting outlines inside outlines.

Before you add motion to a film someone called boring, measure whether it is
actually static. It usually is not.

## A schema enum failure can delete a whole composition, silently

`colorRef` was a zod enum with no `paper` member. Every knockout title failed
validation, `loadEpisode` threw, and a `try { } catch { return null }` in
`Root.tsx` swallowed it. The composition vanished from the studio list, and
the render failed with:

```
Could not find composition with ID Ep001-Palantir-V4.
Available compositions: Episode, EpisodeHorizontal, Ep001-Palantir, ...
```

That message points at the **registration**, which is the one thing that was
correct. Roughly an hour went into the wrong file.

Two rules. Add every new value to the schema enum at the same moment you add
it to the renderer's switch. And never write a bare `catch` around a board
load: log the error, or you will debug the symptom instead of the cause.

## A layer split that fails without an error

`HTML_TYPES` in `BoardFilm.tsx` decides whether an element renders into the
SVG layer or the HTML layer. Put an SVG node in the HTML layer and it renders
**nothing** and reports **nothing**. There is no console warning, no red
frame, no failed gate. The element simply is not there.

When a new element does not appear and the code looks right, check which
layer it was routed to before you check anything else.

## Anything drawn unconditionally shows up at frame 0

A `count` element was rendered with `progress={1}` so its glyphs would stay
solid while the value ran. Every sibling element passes `progress={p}` and is
invisible at `p = 0`; this one was not, so a red `0` sat on the board from
frame 0 through to its cue 14 seconds later.

It was invisible in the code review and obvious in the first still probe.
Gate on `if (p <= 0) return null`, then fade in over the first fraction of the
duration.

## On 9:16, the width term always binds

Framing a bounding box with
`z = min(FW / boxW, (CAP_TOP - 80) / boxH)` on a 1080x1920 frame means the
**width** term decides the zoom nearly every time.

Measured: every band was authored about 880 units wide, so every band resolved
to `z = 1.09`, and every shot revealed a 1760-unit strip of a 3620-unit board.
Sixteen tiles of a contact sheet were near-identical wide shots.

Frame **clusters** of 340-540 units, never whole bands. Doing that took the
episode from 14 camera moves to 27 and zooms from a flat 1.09 to 1.20-1.90.

## Sort camera moves by resolved time, not authoring order

Moves were trusted in the order they appeared in the file. A move written next
to the element it frames resolved **earlier** than a move written above it,
and the rig jumped backwards mid-shot.

`cams.sort((a, b) => a.start - b.start)` after resolving cues to frames. If
your camera list is authored inline with content, you need this.

## A label's `y` is the top of its box, not its baseline

Both learned by rendering, not by reading source.

- Glyphs start about `0.55 * size` below a label's `y`, and the visual centre
  of the text sits about `0.89 * size` below it. A highlight behind size-52
  text needs `y = label_y + 24`.
- An **icon's** `y` is also the top of its box. A label offset of `+56` lands
  *inside* an 84-unit icon. `+78` clears it.

To centre a title in a slab of height `h` starting at `by`:
`label_y = by + h/2 - 0.89 * size`.

## Two things side by side in one slab read as a subscript

A year counted up next to a section title inside the same slab was
mathematically centre-aligned with it and still read as `GOTHAM2008`. Centred
is not the same as spaced. Move the secondary figure out of the slab.

## Probe stills before you render

A full render is 4-8 minutes. A still is seconds.

`npx remotion still <comp> /tmp/p.png --frame=N`

On this style, still probes caught: a title rule struck **through** the title,
a highlight floating above its own text, a character in a black shirt, arrows
crossing their own labels, a word clipped by a box border, and the frame-0
zero above. None of those would fail a structural gate, and several survived a
scrub.

Related, from the Remotion film work: 18 still probes before one render caught
four captions that contradicted the frame beneath them, including one claiming
"four playbooks" over a frame showing three.

## Never key a render output on a cached index

An edit list carried cached `i` and `dur` fields. A hand-split segment left
two entries with `i=47` and `dur=60.45`, so both rendered 60.5s and wrote to
the same `s047.mp4` while `s055.mp4` was never written at all.

Derive the output name from list **position** and the duration from
**timestamps**, on load. And when revising an edit, match segments by content
key `(start, end, layout)`, never by index: one cut-list change renumbers
everything downstream and index reuse ships the wrong footage with an
identical frame count.

## The Desktop is iCloud-synced

`~/Desktop` has restored deleted files in batches and reverted a live source
file mid-session on this machine.

Consequences, all mandatory:

- Never `git add -A` in a repo under `~/Desktop`.
- Commit with explicit pathspecs: `git commit -F msg -- <paths>`.
  `git add <path> && git commit -m` does **not** scope a commit to that path;
  it includes everything already staged. One commit intended for `README.md`
  landed 10 files.
- Re-run the typechecker immediately before every commit.

## ffmpeg fallbacks worth knowing

- The `psnr` filter sometimes prints nothing to stdout with `-f null -`. Fall
  back to `md5 -q` on a crop.
- To prove two renders differ only in audio, PSNR-compare the streams. x264 is
  not deterministic, so a minority of frames land in the 50-68 dB range. That
  is re-encoding, not different content. Per-frame md5 will tell you they
  differ and be useless.

## A quota wall makes an untested path look like a finished one

Measured 2026-09-05 on `IG/agent-sprawl-reel/06-render`, swapping the film's
voice from Chatterbox to Gemini.

The Gemini path had been built, gated, documented and written up as a
four-command recipe, and had stopped at the API call for a day because the free
tier gives ten TTS requests. The README recorded it as "blocked on quota, not
on code". When the quota cleared the next morning and all four batches landed
in one pass, **everything downstream of the call turned out to be broken in
three places**, none of which had ever run:

- The beat manifest had a different filename *and* a different schema:
  `audio/timeline.json` with `sceneId`/`text` against
  `audio-gemini/vo.timeline.json` with `scene`/`say`.
- The new engine did not write the trailing silence the last scene holds for,
  so the picture was 1.4s longer than the sound - exactly the last scene's
  `holdAfter`, to the millisecond.
- The two engines do not even write the same wav: `pcm_f32le` against
  `pcm_s16le`.

"Blocked on an external limit" and "done apart from an external limit" are
different states and feel identical while you are in them. If a path cannot be
run end to end, say which of its steps have never executed. A dry run against a
copy of the *other* engine's output would have found all three in minutes.

## Normalise against the fields you read, not the differences you can see

Same swap. Reconciling the two manifest schemas by putting them side by side
and mapping what visibly differed gave `scene` -> `sceneId`, which was wrong by
omission: `caption_track` also reads `beat["text"]`, spelled `say` by the other
engine.

The failure is nasty because it gets *further*. The aligner loaded the
manifest, transcribed 273 words, passed its transcript control at 1.000 and
printed a full cue-resolution summary before dying. Everything up to the crash
looked like a working integration.

Enumerate every subscript taken on the object - `grep -nE '\b(beat|b)\['` -
and normalise against that list. Reading two files and diffing them by eye
tells you what is different, not what is used.

## Run the no-op case first, on the input that is already correct

Same swap. A script that pads a short audio track to its target length was
written and pointed first at the track that was already the right length, where
the correct behaviour was to do nothing.

It crashed - `wave.Error: unknown format: 3` - because the already-correct track
was float32 and Python's `wave` module only reads integer PCM. Pointed at the
track that needed padding, which was int16, it would have worked perfectly and
been declared correct.

A tool that changes things is trivially "verified" by giving it something to
change. Only the case where it must decline tells you it can tell the
difference - and it exercises a different input, which is where the format
assumption was hiding.

## An arrival curve makes travel disappear

A wipe was written to cross the frame over 26 frames and read on screen as a
3-frame flicker. The transition was there, measured as present, and invisible.

The cause was the easing curve, not the duration. `EASE.out` is
`bezier(0.16, 1, 0.3, 1)`, which is chosen so arrivals decelerate hard. Applied
to travel it front-loads everything:

| local frame | `EASE.out` reveal | `EASE.drift` reveal |
|---|---|---|
| 1 | 13% | -25% |
| 4 | 83% | -12% |
| 7 | 110% | 26% |
| 11 | 122% | 82% |
| 15 | 125% | 112% |

By frame 7 the `out` curve has already pushed the wipe edge past the far side of
the frame. The remaining 19 frames render nothing.

Arrival curves are right for something that lands: a card settling, a title
arriving. For anything that has to cross the picture, use a near-linear curve
with soft ends. The same mistake had already been made once in the same session
on a 14-frame entrance that was over by frame 5, so it is easy to repeat.

## A camera that ramps from identity does nothing for the first seconds

A push from scale 1.000 to 1.115 sounds like an 11% move. Measured 36 frames
into a 393 frame scene it is at 1.010, and that frame came out **closer** to the
version being replaced than the rejected version had been: 2.13 against 8.26.

Any ramp that starts at the identity transform is at the identity transform
early in every scene, which is exactly where a long narration line sits. If the
camera is there to make a version look different, start it already displaced -
1.035 to 1.095 rather than 1.000 to 1.140 - so no frame of the scene shares the
old framing.

Cap the top end against composition, not against taste. At 1.140 the margin
beside a content card fell from 168px to 60px, which crowds the frame without
clipping it. 1.095 kept 97px and cost almost nothing in measured difference.

## Hard cuts are the animation you have not used yet

Asked to make a film more animated, two rounds went into layering motion on top
of the picture. Both measured as barely different from the version being
replaced.

Reading the composition rather than watching it found the real gap: every scene
and sub-shot was an adjacent `Sequence` with a hard cut between them, about 32
of them in two and a half minutes, and not one was a transition. The film had 32
opportunities to move and had taken none of them.

Before adding a motion layer, count your cuts. A transition is structural - for
part of its length the frame is genuinely not showing the scene - so it cannot
be mistaken for the picture settling, which is what a scale-and-fade is always
at risk of.

One constraint shapes the design: a cross dissolve needs two scenes on screen at
once, which means extending a `Sequence` past its window, which for a clip means
asking for frames the footage does not have. A masked wipe happens entirely
inside the incoming scene's own window, so the timing table is untouched and no
clip is asked for anything extra.
