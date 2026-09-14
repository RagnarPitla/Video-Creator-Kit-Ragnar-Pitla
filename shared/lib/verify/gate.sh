#!/usr/bin/env bash
# Verify a finished render from the encoded file itself.
#
#   gate.sh <video> [--fps N] [--expect-frames N] [--min-audio-db N] [--no-audio]
#
# Checks, in the order a render actually fails:
#   1. the file decodes end to end
#   2. frame count agrees with duration x fps
#   3. no black runs
#   4. audio exists, is stereo, and is at a sane level at head and tail
#
# Exits non-zero and names the failure. Everything is read from the encoded
# output, never from the segments or the intermediate, because that is where
# muxing and concat bugs actually show up.
#
# What this cannot tell you: whether the edit is any good. It cannot see the
# wrong person on screen, a caption that contradicts the frame under it, or a
# cut that lands mid-word. Probe stills and read the seams back by ear.
set -uo pipefail

VIDEO=""; FPS=""; EXPECT=""; MIN_DB="-40"; WANT_AUDIO=1
while [ $# -gt 0 ]; do
  case "$1" in
    --fps)            FPS="$2"; shift 2 ;;
    --expect-frames)  EXPECT="$2"; shift 2 ;;
    --min-audio-db)   MIN_DB="$2"; shift 2 ;;
    --no-audio)       WANT_AUDIO=0; shift ;;
    -h|--help)        sed -n '2,18p' "$0" | sed 's/^# \?//'; exit 0 ;;
    *)                VIDEO="$1"; shift ;;
  esac
done

[ -n "$VIDEO" ] || { echo "usage: gate.sh <video> [--fps N] [--expect-frames N]" >&2; exit 2; }
[ -f "$VIDEO" ] || { echo "FAIL  no such file: $VIDEO" >&2; exit 2; }
command -v ffprobe >/dev/null || { echo "FAIL  ffprobe not on PATH" >&2; exit 2; }

fails=0
note() { printf '  %-22s %s\n' "$1" "$2"; }
bad()  { printf '  %-22s %s\n' "$1" "$2"; fails=$((fails+1)); }

probe() { ffprobe -v error -select_streams "$1" -show_entries "$2" -of csv=p=0 "$VIDEO" 2>/dev/null | head -1 | tr -d ','; }

echo "gate: $VIDEO"

# --- container -------------------------------------------------------------
DUR=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$VIDEO" | tr -d ',')
VCODEC=$(probe v:0 stream=codec_name)
W=$(probe v:0 stream=width); H=$(probe v:0 stream=height)
RFR=$(probe v:0 stream=r_frame_rate)
[ -n "$VCODEC" ] || bad "video stream" "MISSING"
note "video" "$VCODEC ${W}x${H} @ $RFR, ${DUR}s"

# --- decodes end to end ----------------------------------------------------
DECODE_ERR=$(ffmpeg -v error -i "$VIDEO" -f null - 2>&1 | head -5)
if [ -n "$DECODE_ERR" ]; then bad "decode" "errors: $(echo "$DECODE_ERR" | head -1)"
else note "decode" "clean"; fi

# --- frame count -----------------------------------------------------------
N=$(ffprobe -v error -select_streams v:0 -count_frames \
      -show_entries stream=nb_read_frames -of csv=p=0 "$VIDEO" | tr -d ',')
if [ -z "$FPS" ]; then FPS=$(awk -F/ '{ if ($2) printf "%.6f", $1/$2; else print $1 }' <<<"$RFR"); fi
WANT=${EXPECT:-$(awk -v d="$DUR" -v f="$FPS" 'BEGIN{printf "%d", d*f+0.5}')}
DELTA=$(( N > WANT ? N - WANT : WANT - N ))
if [ "$DELTA" -le 2 ]; then note "frames" "$N (expected ~$WANT)"
else bad "frames" "$N but expected ~$WANT - concat or timeline mismatch"; fi

# --- black runs ------------------------------------------------------------
BLACK=$(ffmpeg -v info -i "$VIDEO" -vf "blackdetect=d=0.4:pix_th=0.10" -an -f null - 2>&1 \
        | grep -c black_start)
if [ "$BLACK" -eq 0 ]; then note "black frames" "none"
else bad "black frames" "$BLACK run(s) - a tile or input probably failed to composite"; fi

# --- audio -----------------------------------------------------------------
if [ "$WANT_AUDIO" -eq 1 ]; then
  ACODEC=$(probe a:0 stream=codec_name)
  CH=$(probe a:0 stream=channels)
  if [ -z "$ACODEC" ]; then bad "audio" "MISSING"
  else
    note "audio" "$ACODEC, ${CH}ch"
    [ "${CH:-0}" -ge 2 ] || bad "channels" "mono - some players route this to one ear; pan to stereo on the mux"
    for pos in head tail; do
      if [ "$pos" = head ]; then SEEK="-ss 0 -t 20"
      else SEEK="-ss $(awk -v d="$DUR" 'BEGIN{printf "%.2f", (d>40?d-40:0)}') -t 20"; fi
      MEAN=$(ffmpeg -v info $SEEK -i "$VIDEO" -af volumedetect -f null - 2>&1 \
             | awk '/mean_volume/{print $(NF-1)}' | head -1)
      if [ -z "$MEAN" ]; then bad "audio $pos" "could not measure"
      elif awk -v m="$MEAN" -v t="$MIN_DB" 'BEGIN{exit !(m<t)}'; then
        bad "audio $pos" "${MEAN} dB - below ${MIN_DB} dB, likely silent"
      else note "audio $pos" "${MEAN} dB"; fi
    done
  fi
fi

echo
if [ "$fails" -eq 0 ]; then
  echo "PASS  the file is not broken. It does not prove the edit is good -"
  echo "      probe stills at every cut and look at them."
  exit 0
fi
echo "FAIL  $fails check(s) failed"
exit 1
