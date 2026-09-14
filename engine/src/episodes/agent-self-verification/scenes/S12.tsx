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
 * S12 -- proposes / disposes. Frames 5170-5548 (379).
 *
 * Local cues: summary 0 | exam 131
 *
 * Accent per shots.json: the single word `disposes`. The exam sheet underneath is
 * entirely greyscale, including the marks, so the accent never splits. The
 * unmarked four are dark rather than accented -- the point of the analogy is that
 * the student grades what they understood, not that the gaps are alarming.
 */

const MARKED = [true, true, false, true, true, false, true, false, true, false];

const ExamRow: React.FC<{ i: number; marked: boolean }> = ({ i, marked }) => {
  const t = useTheme();
  const at = 158 + i * 11;
  // The box is gated with the pill. Left unconditional all ten boxes landed at
  // once while the pills staggered in behind them.
  const p = interpolate(useCurrentFrame(), [at, at + 13], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 20, height: 44, opacity: p }}>
      <div
        style={{
          width: 26,
          height: 26,
          flexShrink: 0,
          borderRadius: 4,
          border: `2px solid ${marked ? t.pillBright : t.surfaceAlt}`,
          boxSizing: "border-box",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {marked ? (
          <div style={{ width: 12, height: 12, borderRadius: 2, backgroundColor: t.pillBright }} />
        ) : null}
      </div>
      <Pill
        width={330 - (i % 3) * 34}
        height={12}
        tone={marked ? "bright" : "dim"}
        from={at}
        duration={13}
      />
    </div>
  );
};

export const S12: React.FC = () => {
  const frame = useCurrentFrame();
  const t = useTheme();

  return (
    <Canvas padding={120} drift driftScale={1.02} driftPx={{ x: -10, y: 8 }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 62 }}>
        {/* the sentence, as two boxes and a link */}
        <div style={{ position: "relative", width: 1140, height: 250 }}>
          <Connector
            from={{ x: 372, y: 76 }}
            to={{ x: 768, y: 76 }}
            curvature={0}
            fromFrame={16}
            duration={26}
            width={3}
          />
          <div style={{ position: "absolute", left: 0, top: 0, display: "flex", gap: 396 }}>
            {[0, 1].map((k) => (
              <Card key={k} width={372} height={152} padding={30} from={0}>
                <PillBlock lines={3} width={300} height={13} gap={13} tone="dim" from={0} />
              </Card>
            ))}
          </div>

          <Callout tone="dim" fontSize={44} from={26} duration={16} x={0} y={186}>
            proposes
          </Callout>
          <Callout tone="accent" fontSize={44} from={62} duration={16} x={768} y={186}>
            disposes
          </Callout>
          <div
            style={{
              position: "absolute",
              left: 768,
              top: 238,
              width: 214,
              height: 6,
              borderRadius: 6,
              backgroundColor: t.accent,
              opacity: interpolate(frame, [76, 92], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
            }}
          />
        </div>

        {/* exam @ 131 -- greyscale, deliberately */}
        <div
          style={{
            opacity: interpolate(frame, [131, 149], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        >
          <Card width={920} height={306} padding={40} from={0}>
            <div style={{ display: "flex", gap: 76 }}>
              {[0, 1].map((col) => (
                <div key={col} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {MARKED.slice(col * 5, col * 5 + 5).map((m, i) => (
                    <ExamRow key={i} i={col * 5 + i} marked={m} />
                  ))}
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </Canvas>
  );
};
