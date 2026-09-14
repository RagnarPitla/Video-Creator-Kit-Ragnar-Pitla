import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import {
  Callout,
  Canvas,
  Connector,
  useTheme,
} from "../../../../../shared/brand/ailabs-explainer";

/**
 * S16 -- the one flag. Frames 6204-6554 (351).
 *
 * Local cue: flag 0 (329 frames)
 *   0-60    "there is one flag"
 *   60-160  "a deliberate fade from black is legitimate, so you declare how many
 *            frames of it you meant"
 *   160-240 "anything past that is a defect"
 *   240-329 "the intent is declared in the command, where it is visible"
 *
 * Accent per shots.json: the bracket edge where the allowance ends. The defect
 * tile past the edge is ringed in `pillBright` so it reads as wrong without
 * taking the accent away from the boundary, which is what the sentence is about.
 */

const TILES = 14;
const TILE_W = 108;
/**
 * 61px of strip in a 1080 frame was a thin band with a dead lower third around
 * it. Taller tiles give the one object in the shot enough area to hold the
 * frame -- `docs/authoring-traps.md`: boring is a weight problem, not a motion
 * problem. The container is sized to the content so the margins come out even.
 */
const TILE_H = 108;
const GAP = 10;
const STRIP_W = TILES * TILE_W + (TILES - 1) * GAP;
const ALLOWED = 5;
const EDGE_X = ALLOWED * (TILE_W + GAP) - GAP / 2;
const DEFECT = 9;
const STRIP_TOP = 100;

export const S16: React.FC = () => {
  const frame = useCurrentFrame();
  const t = useTheme();

  const bracket = interpolate(frame, [64, 96], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const edge = interpolate(frame, [88, 108], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <Canvas padding={130} drift driftScale={1.02} driftPx={{ x: 10, y: 6 }}>
      <div style={{ position: "relative", width: STRIP_W, height: 508 }}>
        {/* the connector is drawn first so it passes beneath the label */}
        <Connector
          from={{ x: EDGE_X + 250, y: 404 }}
          to={{ x: EDGE_X + 6, y: 300 }}
          curvature={0.6}
          fromFrame={252}
          duration={34}
          width={2}
        />

        {/*
          The strip bed, drawn unconditionally so the shot has structure on its
          own first frame.

          The first full render put 20 uniform frames at 6204-6223 -- luma 13,
          the bare canvas -- because every tile entered on a stagger starting at
          local 16. That is the exact defect this episode is about, reintroduced
          while building the episode about it. `blank-frames.mjs` caught it; no
          amount of reading this file would have.
        */}
        <div style={{ position: "absolute", left: 0, top: STRIP_TOP, display: "flex", gap: GAP }}>
          {new Array(TILES).fill(0).map((_, i) => (
            <div
              key={i}
              style={{
                width: TILE_W,
                height: TILE_H,
                borderRadius: 4,
                backgroundColor: t.surface,
                opacity: i < ALLOWED ? 0.16 + 0.84 * (i / ALLOWED) : 1,
              }}
            />
          ))}
        </div>

        <div style={{ position: "absolute", left: 0, top: STRIP_TOP, display: "flex", gap: GAP }}>
          {new Array(TILES).fill(0).map((_, i) => {
            const at = 16 + i * 6;
            const p = interpolate(frame, [at, at + 12], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });
            // The declared fade: tiles 0-4 climb out of black on purpose.
            const inHead = i < ALLOWED;
            const lift = inHead ? i / ALLOWED : 1;
            const isDefect = i === DEFECT && frame >= 196;
            return (
              <div
                key={i}
                style={{
                  width: TILE_W,
                  height: TILE_H,
                  borderRadius: 4,
                  backgroundColor: isDefect ? t.bgDeep : t.surface,
                  opacity: p * (isDefect ? 1 : 0.25 + 0.75 * lift),
                  border: isDefect ? `3px solid ${t.pillBright}` : `1px solid ${t.surfaceAlt}`,
                  boxSizing: "border-box",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  gap: 12,
                  paddingLeft: 16,
                }}
              >
                {!isDefect && lift > 0.34 ? (
                  <>
                    <div
                      style={{
                        width: 74,
                        height: 10,
                        borderRadius: 8,
                        backgroundColor: t.pillBright,
                        opacity: lift,
                      }}
                    />
                    <div
                      style={{
                        width: 52,
                        height: 10,
                        borderRadius: 8,
                        backgroundColor: t.pillDim,
                        opacity: lift,
                      }}
                    />
                  </>
                ) : null}
              </div>
            );
          })}
        </div>

        {/* the allowance, bracketed */}
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 236,
            width: (EDGE_X - 6) * bracket,
            height: 4,
            backgroundColor: t.accent,
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 222,
            width: 4,
            height: 18,
            backgroundColor: t.accent,
            opacity: bracket,
          }}
        />
        {/* the edge itself: where the allowance stops */}
        <div
          style={{
            position: "absolute",
            left: EDGE_X - 3,
            top: 88 - 30 * edge,
            width: 6,
            height: 30 + (TILE_H + 130) * edge,
            backgroundColor: t.accent,
            opacity: edge,
          }}
        />

        <Callout tone="dim" fontSize={22} from={130} duration={16} x={0} y={262}>
          declared fade from black
        </Callout>
        <Callout tone="dim" fontSize={24} from={210} duration={14} x={DEFECT * (TILE_W + GAP)} y={54}>
          defect
        </Callout>

        <Callout tone="dim" fontSize={38} from={152} duration={18} x={EDGE_X + 150} y={414}>
          --allow-head 5
        </Callout>
      </div>
    </Canvas>
  );
};
