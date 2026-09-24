#!/usr/bin/env bash
# Prepare the local Kokoro narration voice on a fresh machine.
#
# Three things have to exist before `build-vo.mjs` can speak:
#
#   1. the af_heart voice preset   523 KB, committed to this repo
#   2. the model config            2.3 KB, committed to this repo
#   3. the model weights           327 MB, downloaded here
#
# Only the weights travel over the network. GitHub rejects files over 100 MB, so
# they cannot be committed, but they are pinned by SHA256 and verified after
# download. The voice itself is in the repo precisely because it is the part that
# decides how the narration sounds, and a silently different preset would change
# every timing in the films.
#
# The 2 GB Python environment is built by `heart-voice doctor`, which is called
# at the end of this script.
#
# Usage: bash skills/heart-voice/setup.sh
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
SKILL="$REPO_ROOT/skills/heart-voice"

# Pinned to the exact revision these films were narrated with. The weights hash
# is also published on the model card as the v1.0 release SHA256, so it can be
# checked against upstream without trusting this file.
REVISION="f3ff3571791e39611d31c381e3a41a3af07b4987"
WEIGHTS_SHA="496dba118d1a58f5f3db2efc88dbdc216e0483fc89fe6e47ee1f2c53f18ad1e4"
VOICE_SHA="0ab5709b8ffab19bfd849cd11d98f75b60af7733253ad0d67b12382a102cb4ff"
CONFIG_SHA="5abb01e2403b072bf03d04fde160443e209d7a0dad49a423be15196b9b43c17f"
WEIGHTS_URL="https://huggingface.co/hexgrad/Kokoro-82M/resolve/${REVISION}/kokoro-v1_0.pth"

HUB="${HF_HUB_CACHE:-${HF_HOME:-$HOME/.cache/huggingface}/hub}"
MODEL="$HUB/models--hexgrad--Kokoro-82M"
SNAP="$MODEL/snapshots/$REVISION"

# coreutils ships sha256sum and is on every Linux; macOS ships shasum and not
# sha256sum. Checking for both keeps a minimal container from failing here with
# "shasum: command not found" on an install that would otherwise have worked.
if command -v sha256sum >/dev/null 2>&1; then
  sha () { sha256sum "$1" | cut -d' ' -f1; }
elif command -v shasum >/dev/null 2>&1; then
  sha () { shasum -a 256 "$1" | cut -d' ' -f1; }
else
  echo "setup: needs sha256sum or shasum to verify downloads" >&2
  exit 1
fi

# Install a file into the blob store under its own hash and link it into the
# snapshot, which is the layout huggingface_hub expects to find offline.
place () {
  local src="$1" want="$2" rel="$3"
  local got; got="$(sha "$src")"
  if [ "$got" != "$want" ]; then
    echo "setup: $rel hash mismatch" >&2
    echo "  expected $want" >&2
    echo "  got      $got" >&2
    exit 1
  fi
  mkdir -p "$MODEL/blobs" "$(dirname "$SNAP/$rel")"
  [ -f "$MODEL/blobs/$want" ] || cp "$src" "$MODEL/blobs/$want"
  # relative link, so moving the cache does not break it
  local up; up="$(dirname "$rel")"
  local prefix="../../"
  [ "$up" != "." ] && prefix="../../../"
  ln -sf "${prefix}blobs/$want" "$SNAP/$rel"
  echo "  ok  $rel"
}

echo "Kokoro af_heart setup"
echo "  cache: $HUB"
echo ""

echo "voice and config, from this repo:"
place "$SKILL/voice/af_heart.pt" "$VOICE_SHA"  "voices/af_heart.pt"
place "$SKILL/voice/config.json" "$CONFIG_SHA" "config.json"

echo ""
echo "weights, 327 MB:"
if [ -f "$MODEL/blobs/$WEIGHTS_SHA" ]; then
  echo "  ok  already downloaded"
  mkdir -p "$SNAP"
  ln -sf "../../blobs/$WEIGHTS_SHA" "$SNAP/kokoro-v1_0.pth"
else
  tmp="$(mktemp)"
  trap 'rm -f "$tmp"' EXIT
  curl -fL --progress-bar -o "$tmp" "$WEIGHTS_URL"
  # Verify before installing. A truncated or redirected download is still a
  # file, and kokoro would fail later with an unrelated-looking torch error.
  got="$(sha "$tmp")"
  if [ "$got" != "$WEIGHTS_SHA" ]; then
    echo "setup: weights hash mismatch, refusing to install" >&2
    echo "  expected $WEIGHTS_SHA" >&2
    echo "  got      $got" >&2
    exit 1
  fi
  mkdir -p "$MODEL/blobs" "$SNAP"
  mv "$tmp" "$MODEL/blobs/$WEIGHTS_SHA"
  trap - EXIT
  ln -sf "../../blobs/$WEIGHTS_SHA" "$SNAP/kokoro-v1_0.pth"
  echo "  ok  kokoro-v1_0.pth verified"
fi

mkdir -p "$MODEL/refs"
printf '%s' "$REVISION" > "$MODEL/refs/main"

echo ""
echo "python environment (built once, a few minutes):"
# doctor builds the venv if absent and ends with a synthesis probe that asserts
# the audio carries signal, so a silent install cannot report success.
HEART_VOICE=af_heart HF_HUB_OFFLINE=1 TRANSFORMERS_OFFLINE=1 \
  bash "$SKILL/scripts/heart-voice" doctor

echo ""
echo "Ready. Regenerate a narration with:"
echo "  node build-vo.mjs narration-bench.json vo4"
