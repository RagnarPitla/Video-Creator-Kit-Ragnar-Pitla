# Shared local handoff

This Mac uses one installed launcher at `~/.local/bin/heart-voice`. Copilot CLI,
Claude Code and Codex can call the same executable under this OS account. Projects
keep their scripts, audio and receipts, not separate model installations.

Tell another agent:

> Use the heart-voice skill to narrate this script locally. No paid APIs.

If its skill discovery does not list the name, have it read
`~/.agents/skills/heart-voice/SKILL.md`. That is a link to the canonical skill, not
another implementation.

## Installed setup

Verified on 2026-09-22:

- Launcher: `~/.local/bin/heart-voice`
- Preserved helper: `~/.copilot/skills/heart-voice/scripts/heart-voice`
- Shared Kokoro helper: `~/.copilot/skills/heart-voice/scripts/_kokoro.py`
- Shared Python: `~/.local/share/heart-voice/venv/bin/python`
- Model: `hexgrad/Kokoro-82M`
- Cache: `~/.cache/huggingface/hub/models--hexgrad--Kokoro-82M/`
- Current snapshot: `snapshots/f3ff3571791e39611d31c381e3a41a3af07b4987/`
- Weights within that snapshot: `kokoro-v1_0.pth`
- Heart preset within that snapshot: `voices/af_heart.pt`
- All 54 presets cached in that snapshot's `voices/` (339 MB), so no voice needs
  the network. The launcher sets `HF_HUB_OFFLINE` itself once it sees the weights
  and the requested preset on disk, and leaves it unset otherwise so a cold cache
  still downloads.

The public `af_heart_0.wav` audition is a listening sample, not the installed voice
or a cloning reference. Model and preset locations can change after an update;
record the actual cached paths and hashes for the take.

## The voice name selects the language

Kokoro's voice prefix *is* its `lang_code`: `a` American, `b` British, `e` Spanish,
`f` French, `h` Hindi, `i` Italian, `j` Japanese, `p` Brazilian Portuguese,
`z` Mandarin. The launcher derives it from `HEART_VOICE`, so `bm_george` gets
British phonemisation and `zf_xiaoxiao` gets Mandarin without any extra flag.

All nine language families were rendered and measured on 2026-09-22. Japanese needs
`misaki[ja]` plus `python -m unidic download`, and Mandarin needs `misaki[zh]`; both
are installed here. On a machine without them the launcher prints the exact install
line instead of a traceback.

Auditions for all 54 voices, one line each plus a per-family contact sheet, are in
`~/Desktop/kokoro-voice-demos/` (see its `index.md`).

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
env HEART_VOICE=af_heart HF_HUB_OFFLINE=1 TRANSFORMERS_OFFLINE=1 \
  "$HOME/.local/bin/heart-voice" doctor
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
  HEART_VOICE=af_heart HF_HUB_OFFLINE=1 TRANSFORMERS_OFFLINE=1 \
  HF_HUB_DISABLE_TELEMETRY=1 \
  "$HOME/.local/bin/heart-voice" script \
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

The skill file is portable; a model cache and Python environment are not. Do not
claim this Mac's setup exists remotely, copy private credentials, or substitute a
hosted service. If doctor is unavailable or fails, use the current Studio setup
instructions and complete a local generation check before promising narration.

Official model and preset documentation:

- <https://huggingface.co/hexgrad/Kokoro-82M>
- <https://huggingface.co/hexgrad/Kokoro-82M/blob/main/VOICES.md>
