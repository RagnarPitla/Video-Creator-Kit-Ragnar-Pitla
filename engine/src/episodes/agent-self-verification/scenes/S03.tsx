import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import {
  Canvas,
  Card,
  Pill,
  PillBlock,
  ailabsTheme,
} from "../../../../../shared/brand/ailabs-explainer";

/**
 * S03 -- "it is not a bug in any of those products, it is structural".
 * Frames 1099-1335 (237). Local cue frames: structural 0
 *
 * Three product rows, deliberately unnamed -- naming them would spend real text
 * on three brands and put the emphasis on who rather than what. One accent rule
 * sweeps through all three, which is the whole claim: the same cut runs through
 * every one of them.
 */

const ROW_W = 1120;
const ROW_H = 150;
const ROW_GAP = 34;
const STACK_H = ROW_H * 3 + ROW_GAP * 2;

export const S03: React.FC = () => {
  const frame = useCurrentFrame();

  // The rule enters from the left edge of the stack and leaves past the right.
  const x = interpolate(frame, [34, 206], [-30, ROW_W + 30], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const ruleOpacity = interpolate(frame, [26, 40], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <Canvas padding={130} drift driftScale={1.015} driftPx={{ x: -8, y: -5 }}>
      <div style={{ position: "relative", width: ROW_W, height: STACK_H }}>
        <div style={{ display: "flex", flexDirection: "column", gap: ROW_GAP }}>
          {[0, 1, 2].map((i) => (
            // All three rows are present at the cut. Their contents fill in.
            <Card key={i} width={ROW_W} height={ROW_H} padding={30} from={0}>
              <div style={{ display: "flex", alignItems: "center", gap: 32, height: "100%" }}>
                <div
                  style={{
                    width: 62,
                    height: 62,
                    borderRadius: 14,
                    backgroundColor: ailabsTheme.surfaceAlt,
                    flexShrink: 0,
                  }}
                />
                {/* Sized to the row. At 1420 wide the pills filled half the card
                    and the right side sat empty in every one of the three. */}
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <Pill width={340} height={16} tone="bright" from={4 + i * 6} />
                  <PillBlock
                    lines={2}
                    width={946}
                    height={12}
                    gap={12}
                    seed={11 + i}
                    from={10 + i * 6}
                  />
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* The one accent: a single rule cutting through all three at once. */}
        <div
          style={{
            position: "absolute",
            left: x,
            top: -26,
            width: 5,
            height: STACK_H + 52,
            borderRadius: 3,
            backgroundColor: ailabsTheme.accent,
            opacity: ruleOpacity,
          }}
        />
      </div>
    </Canvas>
  );
};
