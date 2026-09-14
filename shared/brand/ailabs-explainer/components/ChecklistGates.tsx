import React from "react";
import { Easing, interpolate, useCurrentFrame } from "remotion";
import { useTheme } from "../theme";
import { Pill } from "./Pill";

export type GateRow = {
  /** The outcome, in real words. `the checkout page loads`, not a pill. */
  label: string;
  /** Evidence under the outcome. Strings render as dim mono; a number renders as skeleton pills. */
  sub?: string[] | number;
};

export type ChecklistGatesProps = {
  rows: GateRow[];
  from?: number;
  /** Frames between one row ticking and the next. 34 (~1.1s) matches the reference's cadence. */
  stagger?: number;
  /** Frames the tick itself takes to draw. */
  tickDuration?: number;
  width?: number;
  fontSize?: number;
  /** Row height including its sub-lines. */
  rowGap?: number;
  style?: React.CSSProperties;
};

/**
 * The gates motif: a checkbox, an outcome written in plain words, and the evidence
 * underneath it.
 *
 * The rule this encodes is that a gate is a claim plus its proof, so a row is never
 * allowed to be just a label. The accent sits on whichever row is ticking right now
 * and leaves as soon as the next one starts, which is the accent-moves-with-the-
 * narration behaviour the whole style is built around.
 */
export const ChecklistGates: React.FC<ChecklistGatesProps> = ({
  rows,
  from = 0,
  stagger = 34,
  tickDuration = 12,
  width = 900,
  fontSize = 30,
  rowGap = 34,
  style,
}) => {
  const t = useTheme();
  const frame = useCurrentFrame();

  const box = Math.round(fontSize * 0.95);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: rowGap, width, ...style }}>
      {rows.map((row, i) => {
        const at = from + i * stagger;
        const p = interpolate(frame, [at, at + tickDuration], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.out(Easing.cubic),
        });
        const appear = interpolate(frame, [at - 10, at], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });

        // Active for exactly one stagger window. Rows before it are done and go
        // grey; rows after it have not been claimed yet.
        const active = frame >= at && frame < at + stagger;
        const ticked = p > 0;

        return (
          <div key={i} style={{ display: "flex", gap: 22, opacity: appear }}>
            <div
              style={{
                width: box,
                height: box,
                flexShrink: 0,
                marginTop: fontSize * 0.22,
                borderRadius: 5,
                border: `2px solid ${active ? t.accent : ticked ? t.pillBright : t.connector}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg width={box} height={box} viewBox="0 0 20 20" fill="none">
                <path
                  d="M5 10.5 L8.5 14 L15.5 6.5"
                  stroke={active ? t.accent : t.pillBright}
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  pathLength={1}
                  strokeDasharray={1}
                  strokeDashoffset={1 - p}
                />
              </svg>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12, paddingTop: 2 }}>
              <div
                style={{
                  fontFamily: t.mono,
                  fontSize,
                  fontWeight: 500,
                  color: active ? t.accent : ticked ? t.pillBright : t.pillDim,
                }}
              >
                {row.label}
              </div>
              <SubLines sub={row.sub} from={at + 6} fontSize={fontSize} width={width} />
            </div>
          </div>
        );
      })}
    </div>
  );
};

const SubLines: React.FC<{
  sub: GateRow["sub"];
  from: number;
  fontSize: number;
  width: number;
}> = ({ sub, from, fontSize, width }) => {
  const t = useTheme();
  if (sub === undefined) return null;

  // A number means "some evidence lines, do not make me write them". Skeleton pills
  // are the honest rendering: the viewer is not supposed to read the evidence, only
  // to register that it exists.
  if (typeof sub === "number") {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 10, paddingLeft: 26 }}>
        {Array.from({ length: sub }, (_, k) => (
          <Pill
            key={k}
            width={Math.round(width * (0.32 + 0.14 * ((k * 7) % 3)))}
            height={12}
            tone="dim"
            from={from + k * 4}
          />
        ))}
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, paddingLeft: 26 }}>
      {sub.map((s, k) => (
        <div
          key={k}
          style={{ fontFamily: t.mono, fontSize: fontSize * 0.78, color: t.pillDim }}
        >
          <span style={{ color: t.connector, marginRight: "0.7em" }}>{"\u2514"}</span>
          {s}
        </div>
      ))}
    </div>
  );
};
