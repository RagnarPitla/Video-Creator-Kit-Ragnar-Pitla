#!/usr/bin/env bash
# Builds the synthetic screen recording used by the ScreenRec shot in StyleProof.
#
# The library's ScreenRec component wraps *real* footage. The proof composition
# still has to render one, so this fabricates a plausible terminal capture rather
# than shipping a borrowed frame from someone else's video. Regenerate with:
#   bash scripts/make-screen-rec.sh
set -euo pipefail

cd "$(dirname "$0")/.."
FONT="/System/Library/Fonts/Menlo.ttc"
OUT="public/screen-rec.mp4"

# Positions are chosen so the command line stays inside ScreenRec's visible region
# at both ends of its pan (source x 360..982, y 595..955 at zoom 2.7 -> 3.0).
# The caret is terracotta, not a terminal's usual cyan or green: the style allows
# exactly one accent hue anywhere in frame, and footage is not exempt from it.
ffmpeg -y -loglevel error \
  -f lavfi -i "color=c=0x0A0A0A:s=1920x1080:r=30" -t 8 \
  -vf "\
drawbox=x=0:y=0:w=1920:h=84:color=0x1A1F21@1:t=fill,\
drawbox=x=0:y=660:w=1920:h=2:color=0x222629@1:t=fill,\
drawtext=fontfile=${FONT}:text='checkout - agent':x=120:y=28:fontsize=28:fontcolor=0x8A9199,\
drawtext=fontfile=${FONT}:text='~/Desktop/checkout (0.025s)':x=360:y=200:fontsize=28:fontcolor=0x5A6169,\
drawtext=fontfile=${FONT}:text='clear':x=360:y=248:fontsize=30:fontcolor=0xE6E6E6,\
drawtext=fontfile=${FONT}:text='~/Desktop/checkout':x=360:y=690:fontsize=28:fontcolor=0x8A9199,\
drawtext=fontfile=${FONT}:text='npx skills add ailabs-explainer':x=360:y=760:fontsize=32:fontcolor=0xE6E6E6,\
drawtext=fontfile=${FONT}:text='_':x=955:y=760:fontsize=32:fontcolor=0xCE6F57:enable='lt(mod(t\,1)\,0.5)',\
drawtext=fontfile=${FONT}:text='new /agent conversation':x=360:y=838:fontsize=26:fontcolor=0x5A6169" \
  -c:v libx264 -pix_fmt yuv420p -crf 20 -movflags +faststart "${OUT}"

echo "wrote ${OUT}"
