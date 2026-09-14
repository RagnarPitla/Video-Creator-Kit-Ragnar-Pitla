---
name: jam-render
description: |
  Take a Jam Studio episode from finished script and storyboard to a verified vertical mp4:
  narration, alignment, build, render, probe. Use when the user says "render it", "make the
  video", "regenerate with my voice", "verify the cut", or a jam episode needs audio and output.
user-invokable: true
argument-hint: "[episode slug, voice, orientation]"
metadata:
  tags: render, remotion, tts, alignment, jam-studio
---

# Jam render

Script and storyboard in, verified mp4 out. Five commands, in order, every time.

```bash
./jam new    <episode> --format versus  # scaffold research, script, storyboard
./jam vo     <episode> --voice draft    # narration audio, then transcribe that audio
./jam align  <episode>                  # compile the storyboard onto the word timings
./jam render <episode>                  # 1080x1920 mp4
./jam verify <episode>                  # probe it and pull ten stills
```

Run from `~/Desktop/rbuild-ai/Video-Agent-Kit/projects/jam-studio`.

`./jam status` shows where every episode is and marks a stage STALE when something
upstream was edited after that stage ran. Trust it over memory: editing the script
after a render leaves an mp4 whose narration no longer matches the words, and nothing
else in the pipeline notices.

`./jam doctor` checks the toolchain before you blame the code.

## Timing comes from audio, never from a guess

This is the one design decision the whole pipeline rests on. `jam align` runs whisper
with word timestamps over the real narration and pins every scene to the words that
are actually spoken.

The consequence that matters: **swapping the voice does not break the video.** Record
a new VO, re-run `align`, `build`, `render`, and every visual re-syncs. The storyboard
is never touched.

So the working order is: draft voice while iterating on words and pictures, real voice
once at the end. Do not wait for the final voice to see the video.

## Voices

`brand/voices.json` holds the configs.

**`draft`** is macOS `say`. Instant. Use it for every iteration. It sounds like a
robot and that is fine — you are checking pacing, sync and legibility, not delivery.

**`ragnar`** is Chatterbox, running locally on this machine from
`~/Desktop/rbuild-ai/voice-lab/.venv`. MIT licensed, no API key, no credits, works
offline. It clones zero-shot from a reference recording, so there is no training run.

To set it up, once:

```bash
# record 20 to 40 seconds of clean speech, quiet room, normal pace
./jam voice-setup --from ~/Desktop/ragnar-sample.wav
./jam vo <episode> --voice ragnar
```

Chatterbox is slow, tens of seconds per sentence, and it regenerates the whole
narration each time. Iterate with the draft voice and switch once, at the end.

## After a script edit

Editing `script.json` invalidates everything downstream, because the words changed and
so did their timings. `./jam status` will say STALE. Re-run `vo`, `align`, `render`.

Editing `storyboard.json` only invalidates `align` onward. The audio and its word
timings still stand, so skip `vo`.

## Verification

`jam verify` is not optional and it is not a formality. It checks:

- output exists, non-zero, 1080x1920, correct fps
- video duration matches the aligned audio duration within half a second
- audio stream present and not silent
- runtime under 180 seconds (warn) and under 300 (fail)
- extracts eight stills to `out/stills/`

**Then look at the stills.** Every one. The automated checks catch a broken render;
they cannot catch an unreadable frame, a label running off the edge, a caption sitting
on top of a diagram, or an icon that means the wrong thing. Those are the failures that
actually ship, and only eyes find them.

Check each still for:

- text inside the safe band, nothing in the top 12 or bottom 18 percent
- captions not colliding with the diagram
- labels legible at phone size
- accent colours consistent with earlier beats
- something mid-draw rather than everything already complete

### Text that looks clipped is usually still drawing

`HandText` reveals a label with a left-to-right clip-path sweep. A still taken
partway through a beat catches that sweep in progress, and the result looks
exactly like a text-overflow bug: `IT IS THE WIRING` renders as `IT IS THE
WIRIN`, sliced clean down the last glyph.

This has been misdiagnosed twice. Before touching `fit()` or a highlight width,
re-render at the **end** of the beat:

```bash
# scene start + beat length, not scene start + 2s
npx remotion still src/index.ts <episode> out/check.png --frame=<end-of-beat>
```

If the text is complete there, nothing is wrong. Only chase the width estimate
when the last glyph is still missing at full reveal.

### When the width estimate really is wrong

It was, once. `fit()` in `boardlib.py` guesses text width from a per-character
em constant, because nothing in the Python compilers can measure a real glyph.
Episode 004's `WRITTEN AFTER` rendered 758px at size 96. The estimate said
686px, so `fit()` left it at 96 and the row landed 20px from the frame edge.

Re-measure the same way if it happens again:

1. Render a still at the end of the beat.
2. Read the pixel width of the text off that still.
3. Divide by `size * len(text)` to get the true em per character.
4. Raise the constant in `fit()`, never lower it.

Current constants are 0.62 for Architects Daughter caps and 0.46 for Caveat.
Changing them changes every episode, so diff `board.json` before and after and
re-render anything whose sizes moved - a committed board and a rendered mp4
that disagree is a bug you will not see until someone re-renders months later.

## Horizontal

Vertical is the default and the priority. Only produce horizontal when asked:

```bash
./jam render <episode> --orientation horizontal   # or: both
./jam verify <episode> --orientation horizontal
```

It is the same board, the same audio and the same cues rendered through a
1920x1080 composition, so the two cuts cannot drift apart. Every zoom in
`board.json` is authored against the 1080x1920 frame, and `BoardFilm` scales
them by `min(width/1080, height/1920)` — 1.0 vertically, 0.5625 wide. The column
keeps its composition and the paper background fills the sides, so the wide cut
reads as a wider sheet rather than a letterboxed phone video.

Consequence worth knowing: type is 56 percent of its vertical size in absolute
pixels. That is fine on a laptop and wrong on a phone, which is why vertical
stays the primary format. Still look at the stills — `verify` writes them with an
`h` prefix so the two sets do not overwrite each other.

## Failure modes worth knowing

**A caption reads `ever -reaching` or `auto -complete`.** Whisper split a hyphenated word
into two tokens and kept the hyphen on the second one. `joinWords` in `lib/timing.ts`
closes up anything touching a hyphen or an apostrophe, so this is handled — but it is worth
knowing what you are looking at, because the fault is in the transcript, not the script.
Grep for it before rendering:

```bash
python3 -c "import json,sys;t=json.load(open(sys.argv[1]));\
print([w['word'] for s in t['segments'] for w in s.get('words',[]) if w['word'].strip()[:1] in '-\'’'])" \
  episodes/<slug>/audio/transcript.json
```

**Align fails naming a beat.** The TTS said something the ASR heard differently.
Usually an acronym or a number. Fix the `say` text to be more speakable ("M C P"
rather than "MCP", "twenty twenty three" rather than "2023"), re-run `vo` for that
beat, re-align. Align refuses to guess boundaries because a wrong boundary desyncs
every scene after it.

**Build fails on an icon name.** Deliberate. Check the exported names in
`engine/src/lib/icons.ts` and pick a real one, or switch the scene to a `callout`.

**Render succeeds but the drawing vibrates frame to frame.** A rough.js call somewhere
lost its deterministic seed. Every ink helper takes a stable `id` string as its first
argument for exactly this reason. See the comment at the top of `engine/src/ink/rough.ts`.

**Runtime over budget.** Cut words, do not speed up the voice. The reference channel
runs 143 to 188 wpm and the low end is the definitional content. Rushing a definition
is how a comparison video stops teaching.
