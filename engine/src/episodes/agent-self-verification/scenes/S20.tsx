import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import {
  Callout,
  Canvas,
  Card,
  Connector,
  Pill,
  useTheme,
} from "../../../../../shared/brand/ailabs-explainer";

/**
 * S20 -- one file, twelve inheritors. Frames 8014-8400 (387), the last shot.
 *
 * Local cues: the-fix 0 | trade 131
 *
 * Accent per shots.json: the shared file. It is carried by the card hairline, the
 * accent rule across its head and the filename itself, so the accent stays on one
 * object for the whole shot while the chips fan out around it.
 *
 * The chip count is twelve because the library has exactly twelve components
 * (Canvas, Pill, PillBlock, Card, Callout, Connector, ChecklistGates, Terminal,
 * TreeDiagram, ParallelBars, ScreenRec, BrowserChrome). The caption says twelve
 * and the grid shows twelve; a caption that outran its own diagram is the exact
 * failure this episode is about.
 */

const COLS = 4;
const ROWS = 3;
const CHIP_W = 214;
const CHIP_H = 96;
const CHIP_GAP = 22;

export const S20: React.FC = () => {
  const frame = useCurrentFrame();
  const t = useTheme();

  const rule = interpolate(frame, [22, 44], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <Canvas padding={120} drift driftScale={1.02} driftPx={{ x: 10, y: -8 }}>
      <div style={{ position: "relative", width: 1680, height: 700 }}>
        {/* connectors first, so the chips sit on top of them */}
        {[0, 1, 2].map((r) => (
          <Connector
            key={r}
            from={{ x: 640, y: 350 }}
            to={{ x: 760, y: 60 + r * (CHIP_H + CHIP_GAP) + CHIP_H / 2 }}
            curvature={0.55}
            fromFrame={58 + r * 10}
            duration={40}
            width={2}
          />
        ))}

        {/* the shared file */}
        <div style={{ position: "absolute", left: 0, top: 196 }}>
          <Card width={640} height={308} padding={40} from={0} accentBorder>
            <div style={{ display: "flex", flexDirection: "column", gap: 26 }}>
              <Callout tone="accent" fontSize={38} from={12} duration={16}>
                motion.ts
              </Callout>
              <div style={{ width: 560 * rule, height: 4, borderRadius: 4, backgroundColor: t.accent }} />
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {/* 45 characters of mono. At 22px it wrapped mid-statement inside
                    the 560px content box; 20px puts it on one line. */}
                <Callout
                  tone="bright"
                  fontSize={20}
                  from={54}
                  duration={16}
                  style={{ whiteSpace: "nowrap" }}
                >
                  if (from === undefined || from &lt;= 0) return 1;
                </Callout>
                <Pill width={430} height={11} tone="dim" from={72} />
                <Pill width={370} height={11} tone="dim" from={82} />
                <Pill width={468} height={11} tone="dim" from={92} />
              </div>
            </div>
          </Card>
          <div style={{ marginTop: 30 }}>
            <Callout tone="dim" fontSize={26} from={140} duration={18}>
              four lines, twelve components
            </Callout>
          </div>
        </div>

        {/* everything that inherits it */}
        <div style={{ position: "absolute", left: 760, top: 60 }}>
          {new Array(ROWS).fill(0).map((_, r) => (
            <div key={r} style={{ display: "flex", gap: CHIP_GAP, marginBottom: CHIP_GAP }}>
              {new Array(COLS).fill(0).map((__, c) => {
                const i = r * COLS + c;
                const at = 74 + i * 6;
                return (
                  <div key={c} style={{ width: CHIP_W }}>
                    <Card width={CHIP_W} height={CHIP_H} padding={22} from={at} rise={10}>
                      <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
                        <Pill width={150 - (i % 3) * 18} height={11} tone="bright" from={at + 8} />
                        <Pill width={112 - (i % 4) * 14} height={11} tone="dim" from={at + 13} />
                      </div>
                    </Card>
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* trade @ 131 */}
        <Callout tone="dim" fontSize={24} from={196} duration={18} x={760} y={430}>
          measured, not argued
        </Callout>
      </div>
    </Canvas>
  );
};
