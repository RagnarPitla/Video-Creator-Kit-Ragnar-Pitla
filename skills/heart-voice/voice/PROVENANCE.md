# Narration voice provenance

## What is here

| File | SHA256 | Size |
|---|---|---|
| `af_heart.pt` | `0ab5709b8ffab19bfd849cd11d98f75b60af7733253ad0d67b12382a102cb4ff` | 523,425 B |
| `config.json` | `5abb01e2403b072bf03d04fde160443e209d7a0dad49a423be15196b9b43c17f` | 2,351 B |

Both are unmodified copies from `hexgrad/Kokoro-82M` at revision
`f3ff3571791e39611d31c381e3a41a3af07b4987`.

## What is not here

The model weights, `kokoro-v1_0.pth`, are 327 MB. GitHub rejects files over 100 MB, so
they are downloaded by `setup.sh` and verified against
`496dba118d1a58f5f3db2efc88dbdc216e0483fc89fe6e47ee1f2c53f18ad1e4`.

That hash is independently checkable: the Kokoro model card lists `496dba11` as the v1.0
release SHA256, so the pin can be confirmed against upstream rather than taken on trust
from this repo.

## Why the voice is committed and the weights are not

The weights are one file that every Kokoro user shares, and a wrong copy fails loudly:
torch will not load a corrupted checkpoint.

The voice preset is the opposite. It is small, there are 54 of them, and picking the wrong
one fails *quietly*. Narration in a different preset is still valid audio with a plausible
duration, but the films' scene boundaries are computed from measured per-segment durations,
so every cut point would move and nothing would report an error. Committing the exact
523 KB removes that failure entirely.

Verify with `node skills/heart-voice/verify.mjs vo4`, which re-renders segments and
compares durations against the shipped manifest.

## Licence

Kokoro-82M is Apache License 2.0, which permits redistribution. The model card states:
"This is an Apache-licensed model, and Kokoro has been deployed in numerous projects and
commercial APIs. We welcome the deployment of the model in real use cases."

- Model: <https://huggingface.co/hexgrad/Kokoro-82M>
- Voices: <https://huggingface.co/hexgrad/Kokoro-82M/blob/main/VOICES.md>
- Code: <https://github.com/hexgrad/kokoro>

Kokoro v1.0 is built on `yl4579/StyleTTS2-LJSpeech`.

## Not a voice clone

`af_heart` is a stock Kokoro preset, synthetic and shipped with the model. It is not a
clone of anyone's voice and carries no personal-voice consent obligations. Ragnar's own
spoken voice is a separate, explicitly authorised workflow and is not used in these films.
