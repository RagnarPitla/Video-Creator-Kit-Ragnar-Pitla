---
name: ioae-video-agent
description: |
  Produce a weekly episode of the "In Our AI Era" podcast, from the raw per-person recordings
  to a finished cut carrying the DOS chrome. Use when Ragnar and Tina have finished recording
  this week's episode, when starting the next episode from the template, when the animated
  companion needs new scenes for a new topic, when deciding who is on screen at each moment,
  when a cut needs a V2 or V3 after review notes, when one host's camera has to be swapped for
  a re-export, when the episode needs chapters, a title or a description, or when someone asks
  for "the next In Our AI Era video". Owns the run order and the gates between stages, and
  delegates the animation to in-our-ai-era-video and the cut to podcast-multicam-edit. Not for
  a one-off video outside this show (use ragnar-video-studio), and not for static episode
  artwork or thumbnails (use in-our-ai-era-visuals).
metadata:
  tags: podcast, video, in-our-ai-era, weekly, dos, remotion, multicam
---

# The weekly In Our AI Era episode

One episode a week, two hosts, four source files, one finished cut. The look is
settled and is not up for renegotiation each week. Your job is to pour this
week's content through a system that already works, and to catch the four or five
failures that have actually cost a day each.

The show: Ragnar Pitla and Tina van Heerden, applied AI, roughly 30 minutes. The
treatment is a 90s DOS application - a blue status bar across the top, a function
key strip along the bottom with a progress meter, and a black CRT panel between
them. Ragnar has said explicitly that the top bars are the part he likes. Do not
redesign them.

## Start here

Template: `~/Desktop/rbuild-ai/Video-Agent-Kit/templates/ioae-episode/`
Reference episode: `~/Desktop/rbuild-ai/in-our-ai-era-video/` (episode on local models)
Last finished cut: `~/Desktop/Scout-local/` (the project layout to copy)

Copy the template, edit `episode.json`, write the scenes. Everything the chrome
draws comes from that one file.

## Decide these before you build anything

Cheap now, expensive after 40 segments are rendered.

- **The episode title string.** It sits in the top bar of every single frame of
  both the animation and the cut. Changing it later means re-rendering all of it.
- **Whether the episode carries a number.** Default is the plain word `EPISODE`.
  Ragnar asked for this because release dates slip and a number that turns out to
  be wrong is worse than no number. Use `EP.NN` only when the release date is
  fixed.
- **The F-key strip.** It is a joke that has to be about this episode. Last
  episode ran `F1 HELP F3 GGUF F5 DEMO F7 COSTS F10 QUIT`.
- **The next-episode teaser** on the outro card.

## Run order

Each stage has a gate. Do not start the next one until the gate passes, because
every one of these failures is cheap to catch here and expensive to catch after
the render.

**1. Ingest.** Four files: one camera per host, one screen recording, and the
animation once it exists. Confirm the cameras are actually in sync and that both
carry audio. A host camera with a dead mic looks identical to a healthy one in
every metric except the waveform.

**2. Transcribe and analyse.** Per-host isolated audio gives you speaker
attribution for free. This is what makes "who should be on screen" mechanical
rather than a judgement call for 30 minutes of tape.

**3. Animation.** `in-our-ai-era-video` owns this. Scenes come from the episode's
argument, not from its transcript order.

**4. Cut.** `podcast-multicam-edit` owns this. The layout set and the edit
decision list live there.

**5. Gate the render.** Frame count, duration, decode, black frames, stereo.

**6. Copy.** Title, description, chapters. Chapters come from computed output
times, never from the edit decision list's note text - see below.

## The failures worth knowing about

These are the ones that have actually happened on this show.

### Probe every animation scene as a still before rendering the whole thing

A caption that contradicts the frame under it is invisible until you look. Render
the still, open it, read it against what the voice says at that moment. Eighteen
probes on one episode caught four false captions, including a card claiming
"four playbooks" over a frame showing three.

### Prove the chrome did not drift, do not eyeball it

The top and bottom bars are the part Ragnar names when he talks about this show,
and a one-pixel change to the bar height or a swapped letter-spacing looks fine
in isolation. It only reads as wrong beside last week's episode, which is after
you shipped.

There is an exact check, so use it. Point `episode.json` at a past episode's
chrome strings, render frame 0 from both that episode's project and the
template, then hash the decoded pixels of each bar:

```bash
ffmpeg -v error -i f0.png -vf "crop=1920:78:0:0"    -f rawvideo -pix_fmt rgb24 - | md5 -q   # top
ffmpeg -v error -i f0.png -vf "crop=1920:72:0:1008" -f rawvideo -pix_fmt rgb24 - | md5 -q   # bottom
```

Decode to raw pixels rather than hashing the PNGs, or encoder differences will
report a mismatch that is not there. Frame 0 is the right frame to compare
because the progress meter reads empty at 0 in every composition regardless of
length. Run this after any edit to `DosChrome.tsx`. It was clean when the
template was built: both bars matched episode 12 exactly.

### Scene boundaries are not where the arithmetic says

The animation uses a transition series, and every transition overlaps the two
scenes it joins. Scene starts are therefore the running total *minus* the
transition duration for each join so far, not the plain cumulative sum. Take a
frame number from a contact sheet by multiplying seconds by the frame rate and
you land mid-transition, on a blank or half-built card. Compute the boundaries
from the scene list, then aim a few frames before a scene ends.

### Edit-list note timestamps are source times, not output times

The notes describe what is being said, so they carry timestamps from the original
recording. The finished cut is tighter than the recording. On the local models
episode that drift reached 62 seconds by the end. Chapters built from note text
are wrong in a way nobody notices until a viewer clicks one. Compute output times
by accumulating segment durations.

### Match segments by content, never by index, when re-cutting

A V2 that splits one shot renumbers every segment after it. Reusing rendered
segments by index silently assembles different footage with an identical frame
count, which passes every check you would think to run. Key on the tuple of
start, end, layout and animation state instead.

### Check a replacement camera source for black frames before you trust it

A vendor re-export can arrive with the right duration, the right frame count and
perfect audio alignment, and still be black for the first 20 seconds. Every
normal metric reports it as healthy. Run a black-frame detection pass over the
whole file, not a sample every N seconds, which can step over the gap entirely.

### Measure a camera offset from audio, not from video

Correlating video frames of a person sitting still returns near-perfect scores at
every offset, so it discriminates nothing. Motion signatures work but get dragged
off by frame rate conversion. Use the log-energy envelope of the audio, not the
waveform - noise suppression rewrites the waveform while preserving the timing.
Print the percentage of the window that is actually speech beside the score,
because silence correlated against silence produces a confident meaningless
number.

### Hide a changed camera behind a cut that was already there

If one host's footage changes partway through - a re-export, a colour fix, a gaze
correction - the change is visible mid-shot and invisible across a layout change.
Splice at the first edit point that also changes who is on screen. Accept that
everything before that point keeps the old footage, and say so out loud rather
than hoping nobody notices.

## Assembly settings that must not drift

The mix is mono; pan it to stereo at assembly or the episode ships half-empty in
one ear. Do not trim the video to the audio length - the video runs slightly
longer by design and the fade-out is placed against the video. Keep the frame
rate and keyframe interval pinned so segment concatenation stays frame-exact.

## What this show does not do

- No episode ships without a human watching it. The gate proves the file is not
  broken; it says nothing about whether the edit is good.
- No production work runs on the animation template's example content. Replace
  `episode.json` wholesale.
- Do not put a number on an episode whose release date is not fixed.
