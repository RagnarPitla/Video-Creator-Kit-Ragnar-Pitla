# Verification gates

Three tools in this kit check a finished video. They were written by different
agents for different films and they cover **different blind spots**, so running
one and calling the file verified is how defects ship.

| Tool | Covers | Cannot see |
|---|---|---|
| `shared/lib/verify/gate.sh` | decode, frame count, black runs, audio level at head and tail | white washes, anything about the edit |
| `shared/lib/video-gates/contrast.mjs` | white washes and any blank-frame dip, by luma spread | audio, frame count |
| `shared/lib/video-gates/qa.mjs` | frame count, audio **presence**, black frames | audio level, white washes |
| `shared/lib/verify/stills.sh` | builds a labelled contact sheet you read yourself | nothing automatically - it is for your eyes |
| `shared/lib/video-gates/qc-verify.mjs` | that a QC reel really shows the film frames it claims to | anything about the film itself - it gates the proxy, not the picture |

The overlap is not waste. The gaps are the point:

- `gate.sh` has no white or contrast check at all. On a light film, a boundary
  can be **completely blank white** and it passes.
- `qa.mjs` tests only that an audio stream exists, not that it makes a sound. A
  silent track passes. `gate.sh` measures dB at head and tail and catches it.
- Neither sees a caption that contradicts the frame under it. Only stills do.

## What to run

```bash
bash shared/lib/verify/gate.sh out.mp4 --fps 30 --expect-frames 4608
node shared/lib/video-gates/contrast.mjs out.mp4
```

`gate.sh` for structure and audio, `contrast.mjs` for the light-film blind spot.
Both exit non-zero on failure, so they compose in a script.

## Swapping one camera source into a finished edit

Replacing a host's camera with a re-export (eye-contact correction, a colour
pass, a re-upload) is not a drop-in even when the vendor says the timeline is
untouched. Two tools cover the two ways it goes wrong:

```bash
python3 shared/lib/verify/measure-offset.py ORIGINAL NEW --centre 14.20
python3 shared/lib/verify/verify-source.py REBUILT ORIGINAL
```

**Measure the offset from audio, never from video.** `measure-offset.py`
correlates the log-energy envelope and resolves to a few milliseconds; on a real
swap it returned +14.197s against an assumed 14.20, i.e. a tenth of a frame.
Video motion correlation cannot do this. On a talking head, static frames half a
second apart score 0.999 against each other, so a frame-based test reads noise
in the third decimal and reports a confident wrong answer.

Three things that produce false verdicts here, all observed:

- **Correlating the waveform instead of the envelope.** Studio-Sound-style
  processing rewrites the waveform and preserves the timing. A sample-level
  correlation of a processed export against its original scores near zero and
  reads as "different recording".
- **Not reporting speech coverage.** A window of silence correlated against
  another window of silence yields a decisive-looking number that means nothing.
  Print speech% beside every score.
- **Getting the lag sign backwards.** The tell is a peak pinned to the edge of
  the search window with a *negative* correlation. Widen or flip; do not accept
  an edge peak.

**Then scan the rebuilt source for black.** `verify-source.py` runs
`blackdetect` over the whole file in one decode pass. This exists because a
vendor export arrived with 19.5 seconds of black in it while reporting a healthy
duration, a healthy frame count, and a clean audio alignment. Sampling a frame
every N seconds is not a substitute: a gap shorter than the step falls between
probes and the file passes.

Note the frame-rate caveat in that tool. If the new source was rate-converted
(28.583 -> 30fps is common from Descript), duplicated frames distort the motion
map and drag the fine-alignment peak off centre by a frame. That reads as a
timing error and is not one - confirm against `measure-offset.py` before
re-cutting anything.

**Splice on a cut that already changes layout.** When the replacement cannot
cover the whole timeline, the join has to land where the frame was going to
change anyway. A gaze correction appearing mid-shot is visible; the same
correction appearing across a SOLO -> DUO cut is not.

## Gate the whole film, never a window

`contrast.mjs` with no `--from`/`--to` measures the entire file. Those flags are
for investigating one boundary, not for signing off.

A film gated only over narrow ranges passed every check for four rounds of
review. The first full-range run on the same file returned **15 failing
boundaries and 64 blank frames**, seven of them long enough to see, two of them
completely blank white for a third of a second. Nothing about the film had
changed. Only the range had.

If you are passing `--to` on a final check, you are measuring the passage you
just edited and calling it the film.

## Proving a gate still works

A gate that only ever passes is indistinguishable from no gate. Before trusting
one, run it against a file you know is broken and confirm it fails, then a file
you know is good and confirm it passes. Check the **real** exit code:

```bash
node contrast.mjs known-broken.mp4 > /tmp/o.txt 2>&1; echo "exit: $?"   # want 1
node contrast.mjs known-good.mp4   > /tmp/o.txt 2>&1; echo "exit: $?"   # want 0
```

Do not read the exit code through a pipe. `node gate.mjs ... | tail -5` reports
`tail`'s status, which is 0 whatever the gate decided. That misreading has been
made in this kit more than once.

Keep the two reference files. They are the regression suite: any change to a
detector must still fail the first and pass the second.

## Never hand-compute `--expect-frames`

Read the number back from the file you actually produced. Do not derive it
from the duration you asked for.

`ffmpeg -ss 100 -t 8` returns 8.533s and 256 frames, not 240. With `-ss`
before `-i` the seek lands on the preceding keyframe and the `-t` window is
measured from there, so the clip overruns by up to one GOP. Moving `-ss`
after `-i` returns exactly 240, because the decode starts at zero and the
window is trimmed at the requested timestamp - accurate, but it decodes
everything it skips. Verified both directions 2026-08-30 against the shipped
V3 episode.

So: fast seek for probing stills, accurate seek when the frame count is load
bearing. Either way, feed your own arithmetic into `--expect-frames` and the
gate fails on a file that is fine.

Two consequences worth internalising:

- Get the count with `ffprobe -count_frames` (or `-count_packets` when you
  need it fast) against the encoded output, then pass that.
- A frame count that disagrees with the sum of the segment counts is the
  useful signal. That is how the duplicate-filename bug in `render.py` was
  caught: two EDL entries wrote to one path, one segment was never written,
  and the encode still exited 0. Nothing else noticed.

Sum the per-segment counts before concatenating. It costs one `ffprobe` per
segment and it is the only check that catches a piece silently going missing.

## What no gate can see

All four tools produce a verdict on a technically perfect frame. These defects
survive every one of them, and each has shipped:

- **A caption that contradicts the frame it sits on.** The text was written
  against what the shot was supposed to show, then the shot changed.
- **On-screen prose competing with the narration.** Check added copy against the
  SRT segment covering that frame. Single nouns and labels sit fine under voice;
  a full sentence forces the viewer to read against what they are hearing.
- **The last element of an animated layout leaving the frame.** A row scaled by
  a push or slid by a drift can start correct and finish clipped. Probe the
  **last** frame of the scene, not the first.
- **A cut landing mid-word.** Read the seams by ear.
- **Interface rendered at partial opacity.** A caption wash, a weak scrim or an
  edge blur laid over a real product recording leaves text and progress bars
  half-erased. Every gate here reads it as a normal frame, because it is one.
  See `docs/ghosted-ui-and-the-qc-reel.md`.

Probe stills, build a labelled sheet with `stills.sh`, and look at it. An
unlabelled sheet is worse than none - you cannot tell which cell is which and
you will confidently read the wrong one.

## Iterate on the reel, gate on the film

A full-length render is too slow to review more than once, and that is itself a
defect: the Project Mia white flashes survived four review rounds, and the
ghosted interface survived seventeen versions, because looking at everything cost
23 minutes each time.

Build a QC reel instead - a short window around every cut boundary plus any
frames you name, at half resolution, which renders in about 90 seconds. Derive
the boundaries from the cut rather than listing them, or a new shot gets
forgotten. `shared/lib/remotion/QcReel.tsx` is the implementation.

Then prove the reel is faithful before reviewing from it:

```bash
node shared/lib/video-gates/qc-verify.mjs \
  --reel reel.mp4 --film film.mp4 --marks 0,282,432,522
```

It compares each mark against its own film frame *and* against a frame it should
not match, and gates on the separation. A reel that seeks wrongly, or shows one
frame throughout, fails that even though it would pass a bare "similarity is
high" threshold.

The reel says nothing about audio, duration or drift against narration. Those
still need the full render and the gates above.
