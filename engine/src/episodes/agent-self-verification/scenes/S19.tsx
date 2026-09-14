import React from "react";
import { interpolate, spring, useCurrentFrame } from "remotion";
import {
  Callout,
  Canvas,
  ENTRANCE_SPRING,
  useTheme,
} from "../../../../../shared/brand/ailabs-explainer";

/**
 * S19 -- the arithmetic. Frames 7538-8013 (476).
 *
 * Local cue: real-cause 0 (470 frames)
 *   0-90    "the real cause was one line of arithmetic"
 *   90-190  "a spring evaluated at frame zero returns exactly zero"
 *   190-320 "anything that begins its entrance on the first frame is invisible"
 *   320-470 "every scene opened on a black frame"
 *
 * Accent per shots.json: the zero at frame zero. One dot and one label.
 *
 * The curve is the real `ENTRANCE_SPRING` sampled at 30fps, not a drawn
 * approximation -- `spring({frame: 0})` is 0.0000 and the plot has to show that
 * honestly. Sampling a spring as *data* is fine; what the episode warns against
 * is using it as an undefended entrance, which nothing here does.
 */

const PLOT_W = 860;
const PLOT_H = 400;
const SPAN = 24;

const POINTS: Array<[number, number]> = [];
for (let i = 0; i <= SPAN * 2; i++) {
  const f = i / 2;
  const v = spring({ frame: f, fps: 30, config: ENTRANCE_SPRING });
  POINTS.push([(f / SPAN) * PLOT_W, PLOT_H - v * PLOT_H]);
}

const PATH = POINTS.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`).join(" ");

const PATH_LEN = POINTS.reduce((sum, p, i) => {
  if (i === 0) return 0;
  const q = POINTS[i - 1];
  return sum + Math.hypot(p[0] - q[0], p[1] - q[1]);
}, 0);

const MiniStrip: React.FC<{ top: number; from: number }> = ({ top, from }) => {
  const frame = useCurrentFrame();
  const t = useTheme();
  return (
    <div style={{ position: "absolute", left: 0, top, display: "flex", gap: 7 }}>
      {new Array(6).fill(0).map((_, i) => {
        const at = from + i * 5;
        const p = interpolate(frame, [at, at + 10], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        return (
          <div
            key={i}
            style={{
              width: 78,
              height: 44,
              borderRadius: 3,
              backgroundColor: i === 0 ? t.bgDeep : t.surface,
              border: `1px solid ${t.surfaceAlt}`,
              boxSizing: "border-box",
              opacity: p,
            }}
          />
        );
      })}
    </div>
  );
};

export const S19: React.FC = () => {
  const frame = useCurrentFrame();
  const t = useTheme();

  const draw = interpolate(frame, [62, 196], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const dot = interpolate(frame, [204, 224], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <Canvas padding={130} drift driftScale={1.02} driftPx={{ x: -8, y: 8 }}>
      <div style={{ position: "relative", width: 1660, height: 700 }}>
        {/* axes, present at the cut */}
        {/* An explicit box. Left to shrink-to-fit around absolutely positioned
            children this div computes to zero width, and the `exactly 0` label
            wrapped onto two lines across the x-axis -- which the first still
            probe at frame 7920 showed and no structural gate would have. */}
        <div style={{ position: "absolute", left: 140, top: 130, width: PLOT_W + 60, height: PLOT_H + 60 }}>
          <div style={{ position: "absolute", left: -2, top: 0, width: 3, height: PLOT_H, backgroundColor: t.connector }} />
          <div style={{ position: "absolute", left: -2, top: PLOT_H, width: PLOT_W + 40, height: 3, backgroundColor: t.connector }} />

          <svg width={PLOT_W} height={PLOT_H} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
            <path
              d={PATH}
              fill="none"
              stroke={t.pillBright}
              strokeWidth={4}
              strokeLinecap="round"
              strokeDasharray={PATH_LEN}
              strokeDashoffset={PATH_LEN * (1 - draw)}
            />
          </svg>

          {/* the value at frame zero */}
          <div
            style={{
              position: "absolute",
              left: -13,
              top: PLOT_H - 13,
              width: 26,
              height: 26,
              borderRadius: 26,
              backgroundColor: t.accent,
              opacity: dot,
            }}
          />
          <div
            style={{
              position: "absolute",
              left: -19,
              top: PLOT_H - 19,
              width: 38,
              height: 38,
              borderRadius: 38,
              border: `4px solid ${t.accent}`,
              boxSizing: "border-box",
              opacity: dot * 0.8,
            }}
          />
          <Callout
            tone="accent"
            fontSize={42}
            from={232}
            duration={16}
            x={48}
            y={PLOT_H - 82}
            style={{ whiteSpace: "nowrap" }}
          >
            exactly 0
          </Callout>

          <Callout tone="dim" fontSize={22} from={20} duration={14} x={-70} y={-10}>
            1
          </Callout>
          <Callout tone="dim" fontSize={22} from={20} duration={14} x={PLOT_W - 46} y={PLOT_H + 22}>
            frame
          </Callout>
        </div>

        {/* every scene opened the same way */}
        <div style={{ position: "absolute", left: 1130, top: 168 }}>
          <Callout tone="dim" fontSize={26} from={330} duration={16}>
            every scene
          </Callout>
          <div style={{ position: "relative", marginTop: 26, width: 503, height: 254 }}>
            <MiniStrip top={0} from={250} />
            <MiniStrip top={70} from={268} />
            <MiniStrip top={140} from={286} />
            <MiniStrip top={210} from={304} />
          </div>
        </div>
      </div>
    </Canvas>
  );
};
