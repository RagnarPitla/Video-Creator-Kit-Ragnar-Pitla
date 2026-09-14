import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import {
  Callout,
  Canvas,
  useTheme,
} from "../../../../../shared/brand/ailabs-explainer";

/**
 * S11 -- rule three, read the pixels. Frames 4783-5169 (387).
 *
 * Local cue: rule-three 0 (381 frames). Beats inside it:
 *   0-40    "the gate reads pixels, not promises"
 *   40-150  "decodes every frame ... and measures brightness"
 *   150-260 "if a frame is blank it says so, and it gives you the frame number"
 *
 * Accent per shots.json: the blank frame and its number. Nothing else.
 * The scan head is `pillBright`, not accent, so the accent lands once.
 */

const TILES = 11;
const TILE_W = 132;
const TILE_H = 74;
const GAP = 12;
const STRIP_W = TILES * TILE_W + (TILES - 1) * GAP;
const BLANK = 5;

const FILL_START = 40;
const FILL_STAGGER = 9;
const SCAN_FROM = 60;
const SCAN_TO = 210;
const BLANK_AT = 170;

/** Deterministic per-tile texture. Never Math.random -- frames render out of order. */
const bars = (i: number): number[] => {
  const out: number[] = [];
  for (let k = 0; k < 3; k++) {
    const u = ((i * 37 + k * 61) % 23) / 23;
    out.push(Math.round(38 + u * 58));
  }
  return out;
};

export const S11: React.FC = () => {
  const frame = useCurrentFrame();
  const t = useTheme();

  const scanX = interpolate(frame, [SCAN_FROM, SCAN_TO], [-10, STRIP_W + 10], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const scanOn = interpolate(frame, [SCAN_FROM, SCAN_FROM + 8, SCAN_TO - 8, SCAN_TO], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  /**
   * The accent moves with the sentence rather than waiting for its shots.json
   * target. The first pass had no accent at all until 170 -- 5.7s of a shot with
   * nothing directing the eye. Only one of these is ever above zero:
   *   12-64    the rule being stated
   *   66-162   the decode head, while the narration is on measuring every frame
   *   170-end  the blank frame and its number  (the shots.json target)
   */
  const aCaption = interpolate(frame, [12, 26, 52, 64], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const aHead = interpolate(frame, [66, 78, 150, 162], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <Canvas padding={130} drift driftScale={1.03} driftPx={{ x: 10, y: -6 }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 54 }}>
        <div style={{ width: STRIP_W, display: "flex", position: "relative" }}>
          <div style={{ opacity: 1 - aCaption }}>
            <Callout tone="dim" fontSize={26} from={14} duration={16}>
              reads pixels, not promises
            </Callout>
          </div>
          {aCaption > 0 ? (
            <div style={{ position: "absolute", left: 0, top: 0, opacity: aCaption }}>
              <Callout tone="accent" fontSize={26} from={14} duration={16}>
                reads pixels, not promises
              </Callout>
            </div>
          ) : null}
        </div>

        <div style={{ position: "relative", width: STRIP_W, height: TILE_H + 44 }}>
          {/* perforation rails, present at the cut so the strip has a body */}
          {[0, TILE_H + 34].map((top) => (
            <div
              key={top}
              style={{
                position: "absolute",
                left: 0,
                top,
                width: STRIP_W,
                height: 10,
                display: "flex",
                gap: 14,
                overflow: "hidden",
              }}
            >
              {new Array(48).fill(0).map((_, i) => (
                <div
                  key={i}
                  style={{
                    width: 16,
                    height: 10,
                    flexShrink: 0,
                    borderRadius: 2,
                    backgroundColor: t.surfaceAlt,
                  }}
                />
              ))}
            </div>
          ))}

          {/*
            The tile bed. Unconditional, so the strip is a body at the cut rather
            than two rails over black. The first render's shot head at 4783 had a
            luma spread of 12 across the whole frame -- past the blank gate, but
            visually nothing. Same class of failure as S16, just under threshold.
          */}
          <div style={{ position: "absolute", left: 0, top: 22, display: "flex", gap: GAP }}>
            {new Array(TILES).fill(0).map((_, i) => (
              <div
                key={i}
                style={{
                  width: TILE_W,
                  height: TILE_H,
                  borderRadius: 4,
                  backgroundColor: t.surface,
                }}
              />
            ))}
          </div>

          <div style={{ position: "absolute", left: 0, top: 22, display: "flex", gap: GAP }}>
            {new Array(TILES).fill(0).map((_, i) => {
              const at = FILL_START + i * FILL_STAGGER;
              const fill = interpolate(frame, [at, at + 12], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              });
              const isBlank = i === BLANK && frame >= BLANK_AT;
              return (
                <div
                  key={i}
                  style={{
                    width: TILE_W,
                    height: TILE_H,
                    borderRadius: 4,
                    backgroundColor: isBlank ? t.bgDeep : t.surface,
                    border: isBlank ? `5px solid ${t.accent}` : `1px solid ${t.surfaceAlt}`,
                    boxSizing: "border-box",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    gap: 9,
                    paddingLeft: 16,
                    opacity: fill,
                  }}
                >
                  {!isBlank &&
                    bars(i).map((w, k) => (
                      <div
                        key={k}
                        style={{
                          width: w,
                          height: 9,
                          borderRadius: 9,
                          backgroundColor: k === 0 ? t.pillBright : t.pillDim,
                        }}
                      />
                    ))}
                </div>
              );
            })}
          </div>

          {/* the decode head -- accent while the narration is on the measuring,
              grey again before the blank frame takes the accent at 170 */}
          <div
            style={{
              position: "absolute",
              left: scanX,
              top: 12,
              width: 3,
              height: TILE_H + 20,
              backgroundColor: t.pillBright,
              opacity: scanOn * 0.85 * (1 - aHead),
            }}
          />
          {aHead > 0 ? (
            <div
              style={{
                position: "absolute",
                left: scanX - 3,
                top: 4,
                width: 8,
                height: TILE_H + 36,
                backgroundColor: t.accent,
                opacity: scanOn * aHead,
              }}
            />
          ) : null}
        </div>

        {/* the number the gate hands back */}
        <div style={{ position: "relative", width: STRIP_W, height: 92 }}>
          <div
            style={{
              position: "absolute",
              left: BLANK * (TILE_W + GAP) + TILE_W / 2 - 1,
              top: 0,
              width: 3,
              height: 34,
              backgroundColor: t.accent,
              opacity: interpolate(frame, [200, 214], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
            }}
          />
          <Callout
            tone="accent"
            fontSize={40}
            from={206}
            duration={16}
            x={BLANK * (TILE_W + GAP) + TILE_W / 2 - 108}
            y={44}
          >
            frame 180
          </Callout>
        </div>
      </div>
    </Canvas>
  );
};
