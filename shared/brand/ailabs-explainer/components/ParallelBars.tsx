import React from "react";
import { Easing, interpolate, useCurrentFrame } from "remotion";
import { useTheme } from "../theme";

export type ParallelBarsProps = {
  /** How many rows. Labels default to `agent 1` .. `agent n`. */
  count?: number;
  /** Override the labels. Lowercase monospace, per the style. */
  labels?: string[];
  /**
   * `sequential` fills one bar at a time -- the shape of "this took three hours".
   * `parallel` fills them all at once -- the payoff shot.
   */
  mode?: "sequential" | "parallel";
  from?: number;
  /** Frames a single bar takes to fill. */
  fillDuration?: number;
  /** Extra frames between the start of one bar and the next, in sequential mode. */
  sequentialGap?: number;
  /**
   * Which row wears the accent. In sequential mode it defaults to whichever bar is
   * currently filling. In parallel mode it defaults to none: eight accent bars at
   * once would blow past the ~2% accent budget and stop meaning anything.
   */
  accentRow?: number;
  barWidth?: number;
  barHeight?: number;
  labelWidth?: number;
  rowGap?: number;
  fontSize?: number;
  style?: React.CSSProperties;
};

/**
 * The agent-parallelism motif, and the payoff visual of the reference video.
 *
 * Render it twice with the same props and only `mode` changed. The comparison does
 * the arguing: the sequential version's last bar is still empty when the parallel
 * version's are all full, and nobody has to say the word "faster".
 */
export const ParallelBars: React.FC<ParallelBarsProps> = ({
  count = 6,
  labels,
  mode = "parallel",
  from = 0,
  fillDuration = 26,
  sequentialGap = 16,
  accentRow,
  barWidth = 900,
  barHeight = 18,
  labelWidth = 190,
  rowGap = 26,
  fontSize = 26,
  style,
}) => {
  const t = useTheme();
  const frame = useCurrentFrame();

  const rows = labels ?? Array.from({ length: count }, (_, i) => `agent ${i + 1}`);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: rowGap, ...style }}>
      {rows.map((label, i) => {
        const start = mode === "sequential" ? from + i * (fillDuration + sequentialGap) : from;
        const p = interpolate(frame, [start, start + fillDuration], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.inOut(Easing.quad),
        });

        const isActive =
          accentRow !== undefined
            ? accentRow === i
            : mode === "sequential" && frame >= start && frame < start + fillDuration;

        return (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 28 }}>
            <div
              style={{
                width: labelWidth,
                textAlign: "right",
                fontFamily: t.mono,
                fontSize,
                color: isActive ? t.accent : p > 0 ? t.pillBright : t.pillDim,
              }}
            >
              {label}
            </div>

            <div
              style={{
                width: barWidth,
                height: barHeight,
                borderRadius: t.radiusPill,
                // The empty track is a recessed well, not an outline. An outline
                // would put a second colour on every row.
                backgroundColor: t.surfaceAlt,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: barWidth,
                  height: "100%",
                  borderRadius: t.radiusPill,
                  backgroundColor: isActive ? t.accent : t.pillBright,
                  transform: `scaleX(${p})`,
                  transformOrigin: "left center",
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};
