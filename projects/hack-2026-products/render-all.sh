#!/usr/bin/env bash
# Renders one banner, one vision still and one film per product into Hack-2026/media.
# Images first (fast) so a layout problem shows up before the long renders.
set -u

cd "$(dirname "$0")" || exit 1
R=./node_modules/.bin/remotion
E=src/index.ts
M=/Users/ragnarpitla/Desktop/rbuild-ai/Hack-2026/media
mkdir -p "$M/images" "$M/videos" "$M/banners"

IDS="ProjectHarnessBuilder AgentMemoryFoundry AgentTeamVault AgentEvaluationWorkbench DynamicsAutopilot FieldRelay"

slug() {
  case "$1" in
    ProjectHarnessBuilder)     echo "project-harness-builder" ;;
    AgentMemoryFoundry)        echo "agent-memory-foundry" ;;
    AgentTeamVault)            echo "agent-team-vault" ;;
    AgentEvaluationWorkbench)  echo "agent-evaluation-workbench" ;;
    DynamicsAutopilot)         echo "dynamics-autopilot" ;;
    FieldRelay)                echo "field-relay" ;;
  esac
}

echo "=== BANNERS ==="
for id in $IDS; do
  s=$(slug "$id")
  if $R still "$E" "${id}Banner" "$M/banners/${s}-banner.png" >/dev/null 2>&1; then
    echo "ok   banner $s"
  else
    echo "FAIL banner $s"
  fi
done

echo "=== STILLS ==="
for id in $IDS; do
  s=$(slug "$id")
  if $R still "$E" "${id}Vision" "$M/images/${s}-vision.png" >/dev/null 2>&1; then
    echo "ok   still  $s"
  else
    echo "FAIL still  $s"
  fi
done

echo "=== FILMS ==="
for id in $IDS; do
  s=$(slug "$id")
  if $R render "$E" "$id" "$M/videos/${s}.mp4" --codec=h264 --crf=20 --muted >/dev/null 2>&1; then
    echo "ok   film   $s"
  else
    echo "FAIL film   $s"
  fi
done

echo "=== DONE ==="
