#!/usr/bin/env bash
# Extract frames from a video and tile them into one labelled contact sheet.
#
#   stills.sh <video>                          even sweep across the whole file
#   stills.sh <video> <t> [t ...]              those timestamps, in seconds
#   stills.sh <video> --seams <edl.json>       every cut seam, both sides
#
#   -o FILE      output png (default <video>-stills.png beside the video)
#   --sample N   how many frames the even sweep takes (default 12)
#   --cols N     grid width (default 2)
#   --width N    per-frame width (default 640)
#
# Every frame is labelled with its own timestamp. That is not decoration: an
# unlabelled sheet is impossible to check, because you cannot tell which cell
# is which and you will confidently read the wrong one. Build the grid with
# tile, never a hand-written xstack layout - a malformed layout string drops
# inputs silently and you get a sheet that looks fine and shows the wrong
# frames.
set -uo pipefail

VIDEO=""; OUT=""; COLS=2; FW=640; SAMPLE=12; TIMES=()
while [ $# -gt 0 ]; do
  case "$1" in
    -o|--out)  OUT="$2"; shift 2 ;;
    --cols)    COLS="$2"; shift 2 ;;
    --width)   FW="$2"; shift 2 ;;
    --sample)  SAMPLE="$2"; shift 2 ;;
    -h|--help) sed -n '2,18p' "$0" | sed 's/^# \?//'; exit 0 ;;
    --seams)
      command -v python3 >/dev/null || { echo "need python3 for --seams" >&2; exit 2; }
      while read -r t; do TIMES+=("$t"); done < <(python3 - "$2" <<'PY'
import json, sys
E = json.load(open(sys.argv[1]))
t = 0.0
for i, s in enumerate(E):
    d = s.get("dur", s["end"] - s["start"])
    if i and abs(s["start"] - E[i-1]["end"]) > 0.05:
        print(f"{max(0,t-0.25):.2f}"); print(f"{t+0.25:.2f}")
    t += d
PY
)
      shift 2 ;;
    *.png)     OUT="$1"; shift ;;
    *)         if [ -z "$VIDEO" ]; then VIDEO="$1"; else TIMES+=("$1"); fi; shift ;;
  esac
done

[ -n "$VIDEO" ] || { sed -n '2,18p' "$0" | sed 's/^# \?//'; exit 2; }
[ -f "$VIDEO" ] || { echo "no such file: $VIDEO" >&2; exit 2; }
[ -n "$OUT" ] || OUT="${VIDEO%.*}-stills.png"

# No timestamps given: sample evenly across the whole file. This is the sweep you
# run before you know where to look; --seams is the one you run when you do.
if [ "${#TIMES[@]}" -eq 0 ]; then
  DUR=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$VIDEO" | tr -d ',')
  [ -n "$DUR" ] || { echo "could not read duration of $VIDEO" >&2; exit 2; }
  N=${SAMPLE:-12}
  while read -r t; do TIMES+=("$t"); done < <(
    awk -v d="$DUR" -v n="$N" 'BEGIN{for(i=0;i<n;i++) printf "%.2f\n", d*(i+0.5)/n}')
fi

FONT=""
for f in /System/Library/Fonts/Menlo.ttc /System/Library/Fonts/Supplemental/Courier New.ttf \
         /Library/Fonts/IBMPlexMono-Regular.ttf /usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf; do
  [ -f "$f" ] && { FONT="$f"; break; }
done

TMP=$(mktemp -d); trap 'rm -rf "$TMP"' EXIT
i=0
for t in "${TIMES[@]}"; do
  lbl=$(awk -v s="$t" 'BEGIN{printf "%d:%05.2f", int(s/60), s-60*int(s/60)}')
  # a colon is an option separator inside a filter description, so escape it
  lbl_esc=$(printf '%s' "$lbl" | sed 's/:/\\:/g')
  if [ -n "$FONT" ]; then
    VF="scale=${FW}:-2,drawtext=fontfile='${FONT}':text='${lbl_esc}':x=10:y=10:fontsize=26:fontcolor=white:box=1:boxcolor=black@0.75:boxborderw=8"
  else
    VF="scale=${FW}:-2"
  fi
  ffmpeg -y -v error -ss "$t" -i "$VIDEO" -frames:v 1 -vf "$VF" \
         "$TMP/$(printf %04d $i).png" || { echo "could not read frame at ${t}s" >&2; exit 1; }
  i=$((i+1))
done

ROWS=$(( (i + COLS - 1) / COLS ))
ffmpeg -y -v error -framerate 1 -i "$TMP/%04d.png" \
       -vf "tile=${COLS}x${ROWS}:padding=6:margin=6:color=#202020" -frames:v 1 "$OUT"

echo "$OUT  ${i} frames, ${COLS}x${ROWS}"
echo "now look at it. The gate cannot see the wrong person on screen."
