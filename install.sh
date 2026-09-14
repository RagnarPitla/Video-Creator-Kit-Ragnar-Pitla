#!/usr/bin/env bash
# Install the Video Creator Kit into GitHub Copilot CLI.
#
# Symlinks every agent and skill in this repo into ~/.copilot/ so the CLI
# discovers them. Symlinks rather than copies, so `git pull` updates your
# agents without a reinstall.
#
#   ./install.sh            install
#   ./install.sh --dry-run  show what would happen, change nothing
#   ./install.sh --uninstall remove only the links this script created

set -euo pipefail

KIT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
COPILOT_DIR="${COPILOT_HOME:-$HOME/.copilot}"
AGENT_DEST="$COPILOT_DIR/agents"
SKILL_DEST="$COPILOT_DIR/skills"

DRY_RUN=0
UNINSTALL=0
for arg in "$@"; do
  case "$arg" in
    --dry-run) DRY_RUN=1 ;;
    --uninstall) UNINSTALL=1 ;;
    -h|--help) sed -n '2,12p' "$0" | sed 's/^# \{0,1\}//'; exit 0 ;;
    *) echo "unknown option: $arg" >&2; exit 2 ;;
  esac
done

installed=0
skipped=0
removed=0

# Link one path into a destination dir. Refuses to clobber anything that is not
# already one of our links, so a teammate's own agent of the same name survives.
link_one() {
  local src="$1" dest_dir="$2" name
  name="$(basename "$src")"
  local dest="$dest_dir/$name"

  if [ "$UNINSTALL" -eq 1 ]; then
    if [ -L "$dest" ] && [[ "$(readlink "$dest")" == "$KIT_ROOT"/* ]]; then
      [ "$DRY_RUN" -eq 1 ] && echo "  would remove $dest" || { rm "$dest"; echo "  removed $name"; }
      removed=$((removed + 1))
    fi
    return
  fi

  if [ -e "$dest" ] || [ -L "$dest" ]; then
    if [ -L "$dest" ] && [ "$(readlink "$dest")" = "$src" ]; then
      skipped=$((skipped + 1))
      return
    fi
    if [ -L "$dest" ] && [[ "$(readlink "$dest")" == "$KIT_ROOT"/* ]]; then
      [ "$DRY_RUN" -eq 1 ] && echo "  would relink $name" || { rm "$dest"; ln -s "$src" "$dest"; echo "  relinked $name"; }
      installed=$((installed + 1))
      return
    fi
    echo "  SKIP $name - you already have your own, not overwriting" >&2
    skipped=$((skipped + 1))
    return
  fi

  if [ "$DRY_RUN" -eq 1 ]; then
    echo "  would link $name"
  else
    ln -s "$src" "$dest"
    echo "  linked $name"
  fi
  installed=$((installed + 1))
}

if [ "$DRY_RUN" -eq 0 ] && [ "$UNINSTALL" -eq 0 ]; then
  mkdir -p "$AGENT_DEST" "$SKILL_DEST"
fi

if [ ! -d "$AGENT_DEST" ] && [ "$UNINSTALL" -eq 1 ]; then
  echo "nothing installed at $COPILOT_DIR"; exit 0
fi

echo "Video Creator Kit"
echo "  repo:   $KIT_ROOT"
echo "  target: $COPILOT_DIR"
echo

echo "Agents:"
for f in "$KIT_ROOT"/agents/*.md; do
  [ -e "$f" ] || continue
  link_one "$f" "$AGENT_DEST"
done

echo
echo "Skills:"
for d in "$KIT_ROOT"/skills/*/; do
  [ -d "$d" ] || continue
  link_one "${d%/}" "$SKILL_DEST"
done

echo
if [ "$UNINSTALL" -eq 1 ]; then
  echo "Removed $removed links."
  exit 0
fi

if [ "$DRY_RUN" -eq 1 ]; then
  echo "Dry run. Nothing changed."
  exit 0
fi

echo "Linked $installed, already current $skipped."
echo
echo "Next:"
echo "  1. cd engine && npm install       # Remotion render engine"
echo "  2. ffmpeg -version                # required by every verification gate"
echo "  3. Start Copilot CLI and ask: \"make a 60 second explainer about X\""
echo
echo "Read README.md before your first video. The verification gates in"
echo "docs/verification-gates.md are the part people skip and regret."
