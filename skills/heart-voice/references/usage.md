# Local handoff

`heart-voice` is one bash launcher plus a shared Python environment. Copilot CLI,
Claude Code and Codex can all call the same executable, so projects keep their
scripts, audio and receipts rather than separate model installations.

Tell another agent:

> Use the heart-voice skill to narrate this script locally. No paid APIs.

If its skill discovery does not list the name, have it read this skill's `SKILL.md`
directly.

## Calling the launcher

`bash skills/heart-voice/setup.sh` installs the model and builds the environment.
It puts nothing on your PATH, so call the launcher by path:

```sh
HV="$HOME/.copilot/skills/heart-voice/scripts/heart-voice"   # after ./install.sh
HV="$PWD/skills/heart-voice/scripts/heart-voice"             # straight from a clone
```

Putting it on PATH is optional, and is what `scripts/gate.sh` assumes:

```sh
mkdir -p ~/.local/bin && ln -sf "$HV" ~/.local/bin/heart-voice
```

The launcher resolves that symlink before it sets `PYTHONPATH`, so `_kokoro.py`
still imports when called through the link.

## What setup.sh leaves on disk

- Launcher: `skills/heart-voice/scripts/heart-voice`
- Shared Kokoro helper: `skills/heart-voice/scripts/_kokoro.py`
- Shared Python: `~/.local/share/heart-voice/venv/bin/python`, moved by `HEART_VOICE_HOME`
- Model: `hexgrad/Kokoro-82M`
- Cache: `~/.cache/huggingface/hub/models--hexgrad--Kokoro-82M/`, moved by `HF_HUB_CACHE` or `HF_HOME`
- Snapshot: `snapshots/f3ff3571791e39611d31c381e3a41a3af07b4987/`
- Weights in that snapshot: `kokoro-v1_0.pth`, 327 MB, downloaded and SHA256-verified
- Heart preset in that snapshot: `voices/af_heart.pt`, committed to this repo

Setup caches exactly one preset, `af_heart`. The other 53 download on first use.
The launcher sets `HF_HUB_OFFLINE` itself once it sees the weights and the requested
preset on disk, and leaves it unset otherwise, so a cold cache still works. Do not
force `HF_HUB_OFFLINE=1` for a voice you have never rendered on this machine: it
turns a one-time download into a failure.

The public `af_heart_0.wav` audition is a listening sample, not the installed voice
or a cloning reference. Model and preset locations can change after an update;
record the actual cached paths and hashes for the take.

## The voice name selects the language

Kokoro's voice prefix *is* its `lang_code`: `a` American, `b` British, `e` Spanish,
`f` French, `h` Hindi, `i` Italian, `j` Japanese, `p` Brazilian Portuguese,
`z` Mandarin. The launcher derives it from `HEART_VOICE`, so `bm_george` gets
British phonemisation and `zf_xiaoxiao` gets Mandarin without any extra flag.

All nine language families were rendered and measured on 2026-09-22. Japanese needs
`misaki[ja]` plus `python -m unidic download`, and Mandarin needs `misaki[zh]`;
`setup.sh` installs neither. Without them the launcher prints the exact install line
instead of a traceback.

`heart-voice voices` lists all 54 grouped by language. To audition rather than guess,
render one line per voice with `heart-voice say` and listen. The first run of each
new preset downloads it.

## Kokoro is not reproducible

The same text and voice rendered twice produces different samples, differing by up
to 0.19 in amplitude. Two fresh renders of three Farmlands narration segments
differed from each other by as much as either differed from the shipped file, so a
byte-comparison against a previous take reports a change that is not there. Sample
*count* is stable to the sample, so a frame map built from measured durations
survives a re-render. Compare durations, never bytes.

## Commands

Check the installed command rather than assuming a model lives in the project:

```sh
"$HOME/.local/share/heart-voice/venv/bin/python" -c \
  "import kokoro, soundfile, spacy; spacy.load('en_core_web_sm')"
env HEART_VOICE=af_heart "$HV" doctor
```

Stop if the import check fails. Doctor reports Python, selected voice, runtime
home and a synthesized signal probe. It can build a missing environment, so do not
use it to repair this shared setup during a video run.

The existing interface is `doctor`, `say`, `script`, and `voices`. Its fallback
usage display exits nonzero; it does not implement `--help` or `generate`.

For a whole script, save this JSON shape:

```json
{
  "segments": [
    {"id": "opening", "text": "This is PlayForge."},
    {"id": "close", "text": "Change the play. Inspect the evidence."}
  ]
}
```

Validate unique safe IDs and assert the complete destination directory is absent.
Then run from any working directory:

```sh
env -u OPENROUTER_API_KEY -u OPENAI_API_KEY -u ELEVENLABS_API_KEY -u HF_TOKEN \
  HEART_VOICE=af_heart HF_HUB_DISABLE_TELEMETRY=1 \
  "$HV" script \
  "/absolute/production/script/heart-v001.json" \
  "/absolute/production/audio/heart-v001"
```

This writes `opening-v001.wav`, `close-v001.wav` and `manifest.json`. The manifest
contains the voice, segment paths, measured seconds and peaks. The helper checks
signal but does not enforce no-overwrite, validate safe IDs, or produce model-hash
receipts. Those are caller responsibilities. Preserve old directories and use a
new version for every retry.

`heart-voice say "One line." /absolute/new-line.wav` handles a single line.
`heart-voice voices` lists all 54 presets grouped by language. Another preset
requires an explicit request. Do not inherit a different `HEART_VOICE` value when
the user asked for Heart.

## Video handoff

For Ragnar Video Studio, use its normal `vo` stage. Its voice configuration owns
the default engine and preset; verify `audio/timing.json` after generation.
The standalone runner is for pipelines that accept an external audio file.

Other engines may not have a `--voice heart` option. Read their current audio
import or alignment contract. Feed them the measured Heart take instead of
inventing a flag or running their old default synthesizer afterward.

## Another machine or OS account

The skill file is portable; a model cache and Python environment are not. Every new
machine or OS account needs its own `bash skills/heart-voice/setup.sh`. Do not claim
a setup exists remotely, copy private credentials, or substitute a hosted service.
If doctor is unavailable or fails, run setup and complete a local generation check
before promising narration.

Official model and preset documentation:

- <https://huggingface.co/hexgrad/Kokoro-82M>
- <https://huggingface.co/hexgrad/Kokoro-82M/blob/main/VOICES.md>
