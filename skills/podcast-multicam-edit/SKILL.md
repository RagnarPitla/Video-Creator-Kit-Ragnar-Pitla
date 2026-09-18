---
name: podcast-multicam-edit
description: |
  Cut separate per-person podcast recordings into one finished multi-camera episode. Use when
  you have individual camera files for each host plus a screen recording and need a single
  edited video, when deciding who should be on screen at each moment, when a shot holds on one
  person while somebody else is the one talking, when a composited tile renders black, when the
  mix comes out mono or sounds half-empty, when a shared screen is unreadable after being
  scaled down, when a transcript loses sync or invents dialogue over silence, when you need to
  find and cut the flubs, dead air and repeated answers in a recorded episode, or when re-cutting
  an already-approved edit into a V2 without re-rendering the whole thing. Covers speaker
  detection from isolated mics, the layout set, the edit decision list, and the verification
  gate. Not for building an animated title sequence, and not for
  scripting or publishing an episode (use ragnar-video-studio).
---

# Editing a multi-camera podcast

The job: several recordings of the same conversation, each showing one thing, become one
video that always shows the right thing. Everything else here serves that sentence.

The reason this is automatable at all is that the decision "who should be on screen" is
almost entirely determined by "who is talking", and that is measurable rather than a
matter of taste. Measure it, and the edit falls out. Guess it, and you will hand-scrub a
thirty-minute timeline.

## Do this first, before any planning

**Test whether the microphones are isolated.** This single measurement decides whether the
rest of the work is exact or approximate, and it takes one command.

Take windows where host A is clearly loud and read host B's track across the same windows.
If B's track sits near the noise floor, the mics are isolated: each file carries only its
owner, so speaker detection is a threshold on one number and it is *right*, not probable.
If B's track is merely quieter, the mics bleed, and you must fall back to relative energy
between tracks with hysteresis, accept errors around overlaps, and hand-check the result.

On the reference episode the isolated case held with enormous margin - when one host was
above -30 dB the other's track averaged below -110 dB, which is digital silence. Do not
assume you will be that lucky. Measure. The whole edit is built on this number.

`scripts/analyze.py` reports it as `crosstalk` and refuses to continue silently if the
margin is ambiguous.

## The order of work

Each step consumes the previous step's output. Skipping ahead is what produces edits that
have to be redone.

1. **Probe every source.** Duration, resolution, frame rate, audio channel count. Expect
   them to disagree on all four; that disagreement causes a specific bug covered below.
   Confirm the files are actually synced - if durations differ by more than a frame or two,
   find the offset before anything else, because every later timestamp inherits it.
2. **Build the energy envelope** for each host, then threshold it into speech turns. This
   file is the backbone. Both the cuts and the on-screen active-speaker highlight read from it.
3. **Scan the screen recording** to find where the demo actually happens.
4. **Transcribe**, so cutaways can be placed on topic instead of on a stopwatch.
5. **Write the edit decision list** - a table of (timestamp, layout) and nothing else.
6. **Render, assemble, verify, then look at stills.**

## Choosing the layout at each moment

Six layouts cover a two-host show. The names are used throughout the scripts.

- `DUO` - both hosts side by side. The default, and the safe frame. When unsure, use this.
- `SOLO_R` / `SOLO_T` - one host full frame. For a sustained turn by that person only.
- `DEMO` - the shared screen large, both hosts small down the left. Whenever the screen
  carries the point.
- `ANIM_DUO` - an animated card where the screen would go, hosts still on the left.
- `ANIM_FULL` - the animation alone, full frame.

The rules that matter, in priority order:

**Never hold on a face while the other person is talking.** This is the one viewers notice
and the only one that generated a complaint on the reference episode. Any solo shot
containing a real turn from the other host must become `DUO` for the length of that turn.
Apply it to *every* solo shot regardless of length. A first pass that only guarded long
shots left a four-second stretch of one host talking over a full-frame shot of the other,
because the offending shot was twenty-five seconds and the guard started at forty-five.

**But do not cut to backchannel.** "Okay", "mm-hmm" and "thank you" run about a second.
Cutting to those produces a flash in and out that reads worse than the error it fixes.
Require roughly two seconds of continuous speech before the rule fires. Below that, real
editors stay on the speaker, and so should you.

**Give any inserted shot a floor of about three and a half seconds.** A shorter cut reads
as a glitch rather than a decision. The two-shot is always a defensible frame, so extend
it to the floor rather than dropping the cut and leaving the wrong face up.

**Hosts belong in the opening frame.** A cold open on a full-frame animation with no
people in it looks like a corporate bumper, not a show. Put the title card in `ANIM_DUO`
so both hosts are visible from the first second. The people are the brand.

**Change is not relevance.** The obvious way to find the demo is to diff sampled frames of
the screen recording and call the still parts idle. This is wrong in a specific and
damaging way: a results dashboard sitting motionless on screen is the payoff of the whole
episode, and a change metric scores it zero. Sample frames and *look at them* before
declaring any region dead.

## Traps that cost real time

**Composited tiles render black.** After seeking an input, sources with different frame
rates fail to composite and the tile comes out black with no error. Reset the presentation
timestamps on *every* video input before overlaying. Miss one input and only that tile is
black, which reads like a cropping bug and sends you looking in the wrong place.

**Never seek audio per segment.** Render every segment video-only, concatenate, then mux
one full-length mix over the top. Sync then holds by construction and no amount of segment
churn can drift it. The alternative - seeking audio per segment - accumulates error you
will not notice until the last minute of the episode.

**Two mono mics mix down to a mono master.** Some players route that to one ear. Pan to
stereo explicitly on the final mux and confirm the channel count on the finished file, not
on the intermediate.

**Do not transcribe a long file in one call.** Whisper-family models lose timestamp sync on
long inputs, and the failure is silent: the middle of the episode comes back nearly empty
while one late minute holds an implausible pile of segments. Chunk at around five minutes
and offset each chunk's timestamps. The tell is a density histogram with a hole in it -
compute one and check before trusting any transcript.

**Whisper invents dialogue over silence.** Cross-filter every segment against the energy
envelope and drop any segment that is mostly below the speech threshold. On the reference
episode this removed roughly forty percent of segments, all of them hallucinated.

**Whisper also garbles real speech into stock phrases.** A run of "Thank you. Thank you."
over loud, clean audio is not silence and not a hallucination over nothing - it is a
mangling of real content. Check the energy before you conclude anything from the text. On
the reference episode that exact string sat over one of the best lines in the episode, and
cutting on the transcript alone would have removed it.

**An apparent stutter at a chunk boundary is usually an artifact.** Because you chunk the
transcript, the seam between chunks can duplicate a few words and read as a stumble the
host never made. Before cutting any repetition, check whether it sits within a couple of
seconds of a multiple of the chunk length, and if it does, re-transcribe that window alone.
On the reference episode one of the planned cuts evaporated this way.

**Word-level timestamps hide disfluencies but leave the gap.** Asking for word timings
returns a tidied transcript with the false starts and the audible "sorry" removed, yet the
time they occupied is still there as a hole between two consecutive words. So do not read
the words to find a flub - read the gaps. Any gap of more than about a second between
adjacent words, with speech-level energy inside it, is a disfluency, and its edges are the
cut points. Use a plain transcribe pass on that narrow window when you need to know what
was actually said.

**Scaled-down screen shares have a readability floor.** A 4K capture of a high-DPI desktop
is a 2x image of a normal one, so the usable text size is half what the pixel count
suggests. Render a candidate crop at two or three widths, look at them, and pick the
smallest that is still readable. Do not reason about it from the numbers.

**Long renders stall between agent turns.** Hold them open with a foreground loop that
prints progress rather than polling repeatedly; repeated short polls let the work go
dormant between turns and the render crawls.

## Revising an approved edit

Changing the edit decision list renumbers every segment after the change. Reusing rendered
files by index after that silently assembles the wrong footage in the wrong order, and the
result plays without error - it is simply a different, broken edit. This is the most
dangerous operation in the workflow.

Match by content, never by position. Key each segment on its start, end, layout and
animation offset, copy forward every segment whose key still exists, and render only the
keys that are new. `scripts/revise.py` does exactly this and prints the reuse count. On the
reference V2, nine of forty-seven segments were new and thirty-eight were copied, which
turned a forty-minute re-render into about six minutes.

Keep the previous cut on disk until the new one is approved.

**Derive the segment index from its position, never from a field in the file.** An edit
decision list carries a cached index and duration per entry. Hand-edit the list - split a
shot, insert a beat - and those fields go stale while the entries around them look fine.
The renderer then names two output files identically, one overwrites the other, and the
tail file is never written at all. Recompute the index from the position and the duration
from the timestamps every time the list is loaded. Both `render.py` and `revise.py`
normalise on load and `revise.py` writes the normalised list back.

**Cutting time also cuts the animation.** The animation is a continuous timeline sampled at
the segment's source offset, so removing seconds from the audio jumps the animation forward
by the same amount. Usually harmless. Occasionally it lands mid-transition, so look at the
frames either side of any seam that touches an animated shot.

**A cut inside one continuous shot is a jump cut.** Removing seconds from the middle of a
single-host shot leaves their hands and head in a different place across one frame, and it
is the most visible artifact the gate will not catch. Motivate the cut with a layout change
instead: hand the first few seconds after the seam to the two-shot, then return. This costs
one extra rendered segment and makes the removal invisible.

## The gate, and what it cannot catch

Before showing anyone the file, confirm from the *encoded output* - not from the segments,
not from the intermediate:

- Frame count matches the timeline
- No black frames
- The whole file decodes without error
- Audio is present, stereo, and at a sane level at the head

Then extract stills at the opening, at every new cut, and at any timestamp mentioned in
feedback, **and look at them**. Every layout error found on the reference episode was
invisible to the automated gate and obvious in a still. The gate proves the file is not
broken. It cannot tell you the edit is good.

Two failure classes that no automated check will ever catch, so watch for them by eye:
the wrong person on screen, and a caption that contradicts the frame under it.

**If you removed anything, listen to the seams too.** Extract a short window around each
one and transcribe it. A cut whose edges land a fraction of a second inside a word passes
every check above and is obvious the moment anyone plays it. Reading the seam back as a
whole sentence is the only proof that the removal is clean.

## Limits

This covers two hosts and one shared screen. Three or more hosts needs a different layout
set and a speaker-detection scheme that handles simultaneous turns; the cut rules still
hold but the geometry does not.

It assumes the recordings are already frame-synced. Aligning drifting sources is a separate
job and must be finished before any timestamp here means anything.

It will not fix bad source footage. Poor framing, a blown-out window or a clipped mic
survive every stage of this process.

## Scripts

`scripts/` is a working toolkit, driven by a `show.json` next to the footage:

| Script | Job |
|---|---|
| `analyze.py` | Probes sources, measures mic isolation, writes energy envelopes and speech turns, samples the screen recording |
| `transcribe.py` | Chunked transcription with the silence filter and a density check |
| `gfx.py` | Builds the frame chrome and name plates |
| `edl.py` | Holds the cut table, applies the layout rules, writes `edl.json` |
| `render.py` | Composites one segment per cut |
| `tighten.py` | Removes named time ranges, resplits the cut table and rebuilds the mix |
| `revise.py` | Content-keyed segment reuse for a revision |
| `assemble.sh` | Concatenates, muxes the mix, runs the gate |

Run them in that order. `edl.py` is the only one meant to be edited per episode.
`tighten.py` and `revise.py` are for a second pass over an edit that already exists: put the
ranges to remove in `tighten.py`, snapshot `edl.json` to `edl-prev.json` first, then let
`revise.py` work out what still has to be rendered.
