import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import {
  Callout,
  Canvas,
  Card,
  Connector,
  Pill,
  PillBlock,
  useTheme,
} from "../../../../../shared/brand/ailabs-explainer";

/**
 * S15 -- exit 2, the render that wrote nothing. Frames 5939-6203 (265).
 *
 * Local cue: exit-two 0 (258 frames)
 *   0-70    "exit two, the file you named does not exist"
 *   70-150  "catches the render that silently wrote nothing"
 *   150-258 "where a naive check reads no failures as success"
 *
 * Accent per shots.json: `exit 2`, and only that. The naive checklist on the right
 * ticks in `pillBright`, not accent, so the frame still has exactly one accent --
 * which also stops the all-clear from looking like the thing being endorsed.
 */

const NaiveRow: React.FC<{ i: number }> = ({ i }) => {
  const t = useTheme();
  const at = 176 + i * 10;
  const p = interpolate(useCurrentFrame(), [at, at + 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 18, height: 40, opacity: p }}>
      <div
        style={{
          width: 24,
          height: 24,
          flexShrink: 0,
          borderRadius: 4,
          border: `2px solid ${t.pillBright}`,
          boxSizing: "border-box",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ width: 11, height: 11, borderRadius: 2, backgroundColor: t.pillBright }} />
      </div>
      <Pill width={250 - (i % 3) * 30} height={12} tone="dim" from={0} />
    </div>
  );
};

export const S15: React.FC = () => {
  const frame = useCurrentFrame();
  const t = useTheme();

  const strike = interpolate(frame, [214, 234], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <Canvas padding={120} drift driftScale={1.02} driftPx={{ x: -8, y: -8 }}>
      <div style={{ position: "relative", width: 1660, height: 640 }}>
        <Callout tone="accent" fontSize={54} from={10} duration={16} x={0} y={0}>
          exit 2
        </Callout>

        {/* the render, and the nothing it produced */}
        <Connector
          from={{ x: 372, y: 300 }}
          to={{ x: 700, y: 300 }}
          curvature={0}
          fromFrame={52}
          duration={30}
          width={3}
        />
        <div style={{ position: "absolute", left: 0, top: 210 }}>
          <Card width={372} height={180} padding={30} from={0}>
            <PillBlock lines={4} width={300} height={12} gap={13} tone="dim" from={0} />
          </Card>
        </div>

        <div
          style={{
            position: "absolute",
            left: 700,
            top: 210,
            width: 372,
            height: 180,
            borderRadius: 14,
            border: `2px dashed ${t.connector}`,
            boxSizing: "border-box",
            opacity: interpolate(frame, [44, 62], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        />
        <Callout tone="dim" fontSize={26} from={96} duration={16} x={700} y={412}>
          nothing written
        </Callout>

        {/* the naive read: no failures, therefore success */}
        <div
          style={{
            position: "absolute",
            left: 1170,
            top: 150,
            opacity: interpolate(frame, [156, 174], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        >
          <Card width={460} height={330} padding={36} from={0}>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <NaiveRow key={i} i={i} />
              ))}
            </div>
          </Card>
          <div style={{ position: "relative", marginTop: 26, height: 50 }}>
            {/* lineHeight 1 pins the glyph box so the strike can be placed at
                0.5 * fontSize. On the default line box the bar rode up through
                the ascenders instead of through the middle of the word. */}
            <Callout
              tone="dim"
              fontSize={32}
              from={214}
              duration={14}
              x={0}
              y={0}
              style={{ lineHeight: 1 }}
            >
              = success
            </Callout>
            <div
              style={{
                position: "absolute",
                left: 0,
                top: 16,
                width: 176 * strike,
                height: 3,
                backgroundColor: t.pillBright,
              }}
            />
          </div>
        </div>
      </div>
    </Canvas>
  );
};
