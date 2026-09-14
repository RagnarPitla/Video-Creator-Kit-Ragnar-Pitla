#!/usr/bin/env bash
# Build the mix, concatenate the segments, mux, and run the gate.
#
# Audio is built once at full length and muxed on at the end. It is never
# seeked per segment, so sync cannot drift no matter how the cut list changes.
#
# Usage: assemble.sh <root> <output.mp4>
set -euo pipefail

ROOT="$(cd "${1:?root}" && pwd)"
OUT="${2:?output.mp4}"
cd "$ROOT"

PY="${PY:-python3}"
FPS=30

# --- 1. mix -----------------------------------------------------------------
# Both host mics are mono. amix of two mono sources yields a MONO master, which
# some players route to a single ear. Pan to stereo explicitly and confirm the
# channel count on the FINISHED file, not on this intermediate.
if [ ! -f mix.m4a ]; then
  echo "==> building mix"
  mapfile -t AF < <("$PY" -c "
import json;print('\n'.join(h['file'] for h in json.load(open('show.json'))['hosts']))")
  ARGS=(); FC=""
  for i in "${!AF[@]}"; do ARGS+=(-i "${AF[$i]}"); FC+="[$i:a]"; done
  ffmpeg -v error -y "${ARGS[@]}" \
    -filter_complex "${FC}amix=inputs=${#AF[@]}:duration=longest:normalize=0,\
loudnorm=I=-16:TP=-1.5:LRA=11" -c:a aac -b:a 192k mix.m4a
fi
DUR=$("$PY" -c "import json;print(json.load(open('show.json'))['duration'])")

# --- 2. concat --------------------------------------------------------------
echo "==> concatenating"
"$PY" - <<'EOF'
import json
segs = json.load(open("edl.json"))
open("concat.txt", "w").write("".join(f"file 'seg/s{s['i']:03d}.mp4'\n" for s in segs))
print(f"  {len(segs)} segments")
EOF
ffmpeg -v error -f concat -safe 0 -i concat.txt -c copy -y _video.mp4

# --- 3. mux -----------------------------------------------------------------
echo "==> muxing"
FO=$("$PY" -c "print(f'{$DUR-1.5:.2f}')")
ffmpeg -v error -i _video.mp4 -i mix.m4a \
  -filter_complex "[0:v]fade=t=out:st=${FO}:d=1.5[v];\
[1:a]pan=stereo|c0=c0|c1=c0,afade=t=in:st=0:d=0.5,afade=t=out:st=${FO}:d=1.5[a]" \
  -map "[v]" -map "[a]" \
  -c:v libx264 -preset medium -crf 18 -pix_fmt yuv420p -g $FPS -r $FPS \
  -c:a aac -b:a 192k -ac 2 -movflags +faststart -shortest -y "$OUT"
rm -f _video.mp4

# --- 4. gate ----------------------------------------------------------------
# Every check reads the ENCODED OUTPUT. Checking the segments or the
# intermediate proves nothing about what ships.
echo "==> gate"
FRAMES=$(ffprobe -v error -select_streams v:0 -count_frames \
  -show_entries stream=nb_read_frames -of csv=p=0 "$OUT" | tr -d ',')
CH=$(ffprobe -v error -select_streams a:0 -show_entries stream=channels -of csv=p=0 "$OUT")
BLACK=$(ffmpeg -v info -i "$OUT" -vf blackdetect=d=0.15:pic_th=0.98 -an -f null - 2>&1 \
  | grep -c black_start || true)
HEAD=$(ffmpeg -t 3 -i "$OUT" -af volumedetect -f null - 2>&1 \
  | awk '/mean_volume/{print $NF" "$(NF-1)}')

echo "  frames      : $FRAMES"
echo "  channels    : $CH   (must be 2)"
echo "  black frames: $BLACK   (must be 0)"
echo "  head audio  : $HEAD   (both at -91 dB means a silent head)"
[ "$CH" = "2" ]   || { echo "FAIL: not stereo"; exit 1; }
[ "$BLACK" = "0" ] || { echo "FAIL: black frames"; exit 1; }
echo "  PASS"
echo
echo "The gate proves the file is not broken. It CANNOT tell you the edit is"
echo "good. Extract stills at the opening, at every new cut and at any"
echo "timestamp in the feedback, and LOOK at them before shipping."
