#!/usr/bin/env bash
# Gate for the heart-voice launcher. Every row prints what it measured.
set -uo pipefail
cd "$(mktemp -d)"
pass=0; fail=0
chk () { # name  got  want
  if [ "$2" = "$3" ]; then printf "  PASS  %-34s %s\n" "$1" "$2"; pass=$((pass+1))
  else printf "  FAIL  %-34s got=%s want=%s\n" "$1" "$2" "$3"; fail=$((fail+1)); fi
}
PY=~/.local/share/heart-voice/venv/bin/python
SKILL=~/.copilot/skills/heart-voice/scripts

echo "--- catalogue matches the presets actually on disk ---"
chk "catalogue vs cache" "$(PYTHONPATH=$SKILL $PY - <<'EOF'
import os, glob
from _kokoro import VOICES
d = glob.glob(os.path.expanduser("~/.cache/huggingface/hub/models--hexgrad--Kokoro-82M/snapshots/*/voices"))
disk = {os.path.basename(f)[:-3] for f in glob.glob(d[0] + "/*.pt")} if d else set()
print("match" if disk == set(VOICES) else f"drift +{sorted(disk-set(VOICES))} -{sorted(set(VOICES)-disk)}")
EOF
)" "match"
chk "catalogue size" "$(PYTHONPATH=$SKILL $PY -c 'from _kokoro import VOICES; print(len(VOICES))')" "54"
chk "voices lists all of them" "$(heart-voice voices 2>/dev/null | grep -cE '^  .*[a-z]{2}_ ')" "17"

echo "--- one voice per language family speaks ---"
for v in af_heart bm_george ef_dora ff_siwis hf_alpha if_sara pf_dora jf_alpha zf_xiaoxiao; do
  HEART_VOICE=$v heart-voice say "Test one two three." "$v.wav" >/dev/null 2>&1
  got=$(ffmpeg -hide_banner -nostats -i "$v.wav" -af volumedetect -f null - 2>&1 \
        | grep -oE 'max_volume: [-0-9.]+' | grep -oE '[-0-9.]+$')
  chk "$v peak dBFS" "$([ -n "$got" ] && $PY -c "print('audible' if $got > -40 else 'silent')" || echo missing)" "audible"
done

echo "--- language derived from the voice name, not hardcoded ---"
lang () { HEART_VOICE=$1 heart-voice doctor 2>/dev/null | sed -n 's/^lang *: //p'; }
chk "af_heart lang"    "$(lang af_heart)"    "American English"
chk "bm_george lang"   "$(lang bm_george)"   "British English"
chk "zf_xiaoxiao lang" "$(lang zf_xiaoxiao)" "Mandarin Chinese"
chk "jf_alpha lang"    "$(lang jf_alpha)"    "Japanese"

echo "--- error paths fail cleanly ---"
# zz_none starts with a REAL language code, so a prefix-only check would pass it.
HEART_VOICE=zz_none heart-voice say "x" bad.wav >/dev/null 2>err.txt; rc=$?
chk "bogus voice exit code"  "$rc" "1"
chk "bogus voice: traceback" "$(grep -c Traceback err.txt)" "0"
chk "bogus voice: suggests"  "$(grep -c 'voices are:' err.txt)" "1"
chk "bogus voice: no wav"    "$([ -f bad.wav ] && echo written || echo none)" "none"
chk "no args exit code"      "$(heart-voice >/dev/null 2>&1; echo $?)" "1"

echo "--- cached run does not touch the network or print noise ---"
chk "say output lines" "$(HEART_VOICE=af_heart heart-voice say "Clean." c.wav 2>&1 | wc -l | tr -d ' ')" "1"

echo
echo "  $pass passed, $fail failed"
[ $fail -eq 0 ]
