# podcast-multicam-edit

Cuts separate per-host recordings plus a screen capture into one finished
multi-camera episode.

The judgement lives in `SKILL.md`. Read that first. This file is just how to
run it.

## Install

Already symlinked into `~/.copilot/skills`, `~/.agents/skills` and
`~/.claude/skills`. This folder is the source of truth, so editing anything
here updates all three. There is also an agent at
`~/.copilot/agents/podcast-editor.md` that owns the whole job end to end.

If this folder ever moves, the symlinks break. Re-run:

```bash
SRC=<new path>/podcast-multicam-edit
for D in ~/.copilot/skills ~/.agents/skills ~/.claude/skills; do
  rm -rf "$D/podcast-multicam-edit"; ln -s "$SRC" "$D/podcast-multicam-edit"
done
```

## Run

Put the footage in one folder with a `show.json` (copy
`show.json.example`). Then, from that folder:

```bash
S=~/.copilot/skills/podcast-multicam-edit/scripts

python $S/analyze.py .        # sources, MIC ISOLATION, envelopes, speech turns
python $S/transcribe.py .     # chunked, silence-filtered
python $S/gfx.py .            # chrome + name plates

cp $S/edl.py .                # the only file you edit per episode
# fill in CUTS, then:
python edl.py .

python $S/render.py .         # one segment per cut
bash   $S/assemble.sh . Episode.mp4
```

Read the mic isolation number `analyze.py` prints before going further. It
decides whether the whole edit is exact or approximate.

## Revise

```bash
cp edl.json edl-prev.json     # BEFORE rebuilding, or there is nothing to reuse
# edit edl.py
python edl.py .
python $S/revise.py .         # copies unchanged shots forward, prints what is new
python $S/render.py . 0 2 3   # only the indices it named
bash   $S/assemble.sh . Episode-V2.mp4
```

`revise.py` matches shots by content, never by index. Changing the cut list
renumbers everything after the change, and reusing files by index assembles the
wrong footage in the right order - it plays fine, the frame count matches, and
the gate passes. That is the worst bug available in this workflow and this
script is the only thing standing in front of it.

## Requirements

`ffmpeg`, `ffprobe`, Python with `pillow`, and `mlx-whisper` (Apple silicon) or
`openai-whisper` for transcription. Use a venv - system Python is externally
managed.

## Reference episode

"In Our AI Era" - Running AI On Your Own Machine (Scout Local), 30:08, 47 cuts,
two hosts plus a 4K screen recording and an animated title sequence. Built and
shipped with exactly these scripts. Its `edl.py` is a worked example of a
filled-in cut table.

Measurements from that episode, kept because they show what "good" looks like:
mic isolation gap over 80 dB; speaker split 71/27; 40% of transcript segments
dropped as hallucinated silence; 1400px the readability floor for the
downscaled screen share; V2 reused 38 of 47 shots.
