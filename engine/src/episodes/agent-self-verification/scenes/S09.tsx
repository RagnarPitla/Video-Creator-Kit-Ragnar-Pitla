import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import {
  Callout,
  Canvas,
  Card,
  Pill,
  useTheme,
} from "../../../../../shared/brand/ailabs-explainer";

/**
 * S09 -- the three rules. Frames 3775-4439 (665), a 22.1s hold.
 *
 * Local cue frames:
 *   three-rules 0 | rule-one 51 | rule-two 350 | never-failed 442
 *
 * The three numerals are on screen at the cut. Rule one expands at its cue and
 * collapses back to a bright line when rule two takes over, so the accent moves
 * exactly once inside the hold and the frame is never carrying two claims.
 *
 * Rule three is deliberately left unnamed here -- it is S11's whole job, and
 * naming it twice would spend the real-text budget for nothing.
 */

const RULE_ONE_IN = 51;
const RULE_TWO_IN = 350;

const Numeral: React.FC<{ n: string; active: boolean; done: boolean }> = ({ n, active, done }) => {
  const t = useTheme();
  return (
    <div
      style={{
        width: 74,
        height: 74,
        flexShrink: 0,
        borderRadius: 74,
        border: `2px solid ${active ? t.accent : done ? t.pillBright : t.connector}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: t.mono,
        fontSize: 34,
        lineHeight: 1,
        fontWeight: 500,
        color: active ? t.accent : done ? t.pillBright : t.pillDim,
      }}
    >
      {n}
    </div>
  );
};

export const S09: React.FC = () => {
  const frame = useCurrentFrame();
  const t = useTheme();

  const oneActive = frame >= RULE_ONE_IN && frame < RULE_TWO_IN;
  const oneDone = frame >= RULE_TWO_IN;
  const twoActive = frame >= RULE_TWO_IN;

  // Rule one's evidence folds away as rule two opens. This is an exit, not an
  // entrance, so it is safe to drive it straight off `interpolate`.
  const oneBodyOut = interpolate(frame, [RULE_TWO_IN - 18, RULE_TWO_IN], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <Canvas padding={130} drift driftScale={1.02} driftPx={{ x: -8, y: -6 }}>
      <Card width={1100} height={580} padding={64} from={0}>
        <div style={{ display: "flex", flexDirection: "column", gap: 46, height: "100%" }}>
          {/* rule one */}
          <div style={{ display: "flex", gap: 34 }}>
            <Numeral n="1" active={oneActive} done={oneDone} />
            <div style={{ display: "flex", flexDirection: "column", gap: 20, paddingTop: 8 }}>
              <div
                style={{
                  fontFamily: t.mono,
                  fontSize: 38,
                  lineHeight: 1,
                  fontWeight: 500,
                  color: oneActive ? t.accent : oneDone ? t.pillBright : t.pillDim,
                  opacity: interpolate(frame, [RULE_ONE_IN, RULE_ONE_IN + 14], [0, 1], {
                    extrapolateLeft: "clamp",
                    extrapolateRight: "clamp",
                  }),
                }}
              >
                written before the work
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 14,
                  opacity: oneBodyOut,
                  height: oneBodyOut * 76,
                  overflow: "hidden",
                }}
              >
                <Pill width={700} height={13} tone="dim" from={RULE_ONE_IN + 22} />
                <Pill width={560} height={13} tone="dim" from={RULE_ONE_IN + 32} />
                <Pill width={640} height={13} tone="dim" from={RULE_ONE_IN + 42} />
              </div>
            </div>
          </div>

          {/* rule two */}
          <div style={{ display: "flex", gap: 34 }}>
            <Numeral n="2" active={twoActive} done={false} />
            <div style={{ display: "flex", flexDirection: "column", gap: 20, paddingTop: 8 }}>
              {/*
                Placeholder. Rule three carried one from frame 18 but rule two
                did not, so between local 51 and 350 the card read 1, blank, 3
                -- as if the list had skipped an item. Frame 4000 of the render
                is the evidence. It hands over to the real text at RULE_TWO_IN.
              */}
              <div
                style={{
                  position: "absolute",
                  opacity: interpolate(
                    frame,
                    [18, 32, RULE_TWO_IN - 8, RULE_TWO_IN + 4],
                    [0, 1, 1, 0],
                    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
                  ),
                }}
              >
                <div style={{ paddingTop: 14 }}>
                  <Pill width={496} height={16} tone="dim" from={0} />
                </div>
              </div>
              <div
                style={{
                  fontFamily: t.mono,
                  fontSize: 38,
                  lineHeight: 1,
                  fontWeight: 500,
                  color: twoActive ? t.accent : t.pillDim,
                  opacity: interpolate(frame, [RULE_TWO_IN, RULE_TWO_IN + 14], [0, 1], {
                    extrapolateLeft: "clamp",
                    extrapolateRight: "clamp",
                  }),
                }}
              >
                must have failed once
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <Pill width={720} height={13} tone="dim" from={RULE_TWO_IN + 22} />
                {/* never-failed @ 442: the consequence, in three words. */}
                {/* Gated as a unit. An unconditional tick would sit on screen
                    for 452 frames before the words it introduces. */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                    height: 40,
                    opacity: interpolate(frame, [452, 466], [0, 1], {
                      extrapolateLeft: "clamp",
                      extrapolateRight: "clamp",
                    }),
                  }}
                >
                  <div style={{ width: 22, height: 2, backgroundColor: t.connector }} />
                  <Callout tone="dim" fontSize={26} from={452} duration={16}>
                    otherwise a decoration
                  </Callout>
                </div>
              </div>
            </div>
          </div>

          {/* rule three, still unnamed */}
          <div style={{ display: "flex", gap: 34 }}>
            <Numeral n="3" active={false} done={false} />
            <div style={{ paddingTop: 22 }}>
              <Pill width={430} height={16} tone="dim" from={18} />
            </div>
          </div>
        </div>
      </Card>
    </Canvas>
  );
};
