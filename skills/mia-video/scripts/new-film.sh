#!/usr/bin/env bash
# Scaffold a Microsoft-house-style Remotion film from the mia-video skill.
# Usage: new-film.sh <target-dir> [project-name]
#
# Deliberately does not use `npx create-video`: it prompts for a name even with
# --yes, which makes it unusable from a script, and its alpha channel moves.
# Everything is written directly and pinned instead.
set -euo pipefail

SKILL="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TARGET="${1:-}"

if [ -z "$TARGET" ]; then
	echo "usage: new-film.sh <target-dir> [project-name]" >&2
	exit 1
fi
if [ -e "$TARGET" ]; then
	echo "refusing to overwrite existing path: $TARGET" >&2
	exit 1
fi
NAME="${2:-$(basename "$TARGET")}"

echo "==> writing project"
mkdir -p "$TARGET/src/components" "$TARGET/src/lib" "$TARGET/src/scenes" \
	"$TARGET/public/fonts" "$TARGET/reference"

sed "s/PROJECT_NAME/$NAME/" "$SKILL/assets/scaffold/package.json" > "$TARGET/package.json"
cp "$SKILL/assets/scaffold/tsconfig.json" "$TARGET/"
cp "$SKILL/assets/scaffold/index.ts" "$SKILL/assets/scaffold/Root.tsx" "$TARGET/src/"
cp "$SKILL/assets/remotion.config.ts" "$TARGET/"

echo "==> design system"
cp "$SKILL/assets/src/components/"*.tsx "$TARGET/src/components/"
cp "$SKILL/assets/src/lib/"*.ts "$TARGET/src/lib/"
cp "$SKILL/assets/src/fonts.ts" "$TARGET/src/"
cp -R "$SKILL/assets/public/d365" "$TARGET/public/"
cp "$SKILL/assets/public/d365-logo.png" "$SKILL/assets/public/grain.png" "$TARGET/public/"
cp -R "$SKILL/reference/." "$TARGET/reference/"

# Segoe UI is not redistributed with the skill. Reuse it from an existing film
# on this machine when one is present; otherwise fonts.ts falls back to a
# system stack and the type will be close but not right.
FOUND=""
for CAND in "$HOME/Desktop"/*/mia-remotion/public/fonts "$HOME/Desktop"/*/public/fonts; do
	if [ -f "$CAND/segoeui-regular.woff" ]; then FOUND="$CAND"; break; fi
done
if [ -n "$FOUND" ]; then
	cp "$FOUND"/segoeui-*.woff "$TARGET/public/fonts/"
	echo "    fonts: copied from $FOUND"
else
	echo "    fonts: NOT FOUND - add segoeui-{light,semilight,regular,semibold}.woff"
	echo "           to $TARGET/public/fonts/ before rendering"
fi

echo "==> installing"
( cd "$TARGET" && npm i --silent --no-audit --no-fund )

echo "==> typecheck"
( cd "$TARGET" && npx tsc --noEmit )

cat <<EOF

Scaffolded $NAME at $TARGET  (typecheck passed)

Next:
  1. Put the narration audio in public/ and transcribe it:
       whisper <audio> --model large-v3 --output_format srt
  2. Convert segment timings to frames at 30fps. Those are your scene bounds.
  3. Write src/film-copy.ts first - all on-screen text, one file, no 'as const'.
  4. Copy reference/MiaFilm.tsx as the timeline and edit its SLOTS.
  5. Build scenes from reference/scenes/ - each starts with <Stage>.
  6. npx remotion studio --no-open

Re-time before using: components/JourneyRail.tsx and components/EvidenceMeter.tsx
both carry the Mia film's frame numbers.

Verify before you ship - both gates, every time:
  node $SKILL/scripts/qa.mjs out.mp4 --frames=<n>
  node $SKILL/scripts/contrast.mjs out.mp4 --allow=<intended fades>

qa.mjs finds black frames. On a light film the failure mode is white, which it
cannot see, so contrast.mjs is not optional.
EOF
