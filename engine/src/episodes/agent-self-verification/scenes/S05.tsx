import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import {
  Callout,
  Canvas,
  Card,
  ChecklistGates,
  Pill,
  ailabsTheme,
  useTheme,
} from "../../../../../shared/brand/ailabs-explainer";

/**
 * S05 -- the two ways it shows up. Frames 1882-2501 (620), a 20.6s hold.
 *
 * Local cue frames: two-ways 0 | way-one 46 | way-two 363
 *
 * Way one: the container properties tick, over a picture that was never decoded.
 * Way two: six checks passed, so it stopped -- and four more sat in the
 * repository untouched. Those four are the accent (`shots.json`).
 *
 * Deviation from `frame-map.md`, recorded on purpose: the map says the container
 * properties tick "green". There is no green in this palette outside
 * `BrowserChrome`'s traffic lights, and a second saturated colour would break the
 * one-accent rule the whole style rests on. A ticked row goes `pillBright`.
 */

/**
 * Both slabs are sized to the wider of the two rows' painted content, not to the
 * canvas. Row 2's ten boxes need 34 + 76 + 34 + 2 + 34 + 746 + 34 + 140 + 34 =
 * 1134; row 1 needs 1048 once the checklist is sized to what it actually paints.
 * At the original 1560 each slab ran ~400px past its own content.
 */
const ROW_W = 1180;
const ROW_H = 300;

const NumberedRow: React.FC<{
  n: string;
  from: number;
  children: React.ReactNode;
}> = ({ n, from, children }) => (
  <Card width={ROW_W} height={ROW_H} padding={34} from={0}>
    <div style={{ display: "flex", alignItems: "center", gap: 34, height: "100%" }}>
      <div
        style={{
          width: 76,
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Callout tone="dim" fontSize={62} from={from} rise={4}>
          {n}
        </Callout>
      </div>
      <div
        style={{
          width: 2,
          height: "78%",
          backgroundColor: ailabsTheme.connector,
          flexShrink: 0,
          opacity: 0.7,
        }}
      />
      {children}
    </div>
  </Card>
);

/**
 * Ten checks sitting in the repository. Six were run, four were not, and the
 * four that were not are the only accent in the shot.
 *
 * The outline bed lands at local 34, not at 386 with the state. `way-two` is
 * not spoken until local 363, and without the bed the second slab sat visibly
 * empty for 4.8s -- frame 2100 of the first render is the evidence. Structure
 * arrives with the container; state arrives with the sentence.
 */
const CheckGrid: React.FC = () => {
  const t = useTheme();
  const frame = useCurrentFrame();

  return (
    <div style={{ display: "flex", gap: 14 }}>
      {Array.from({ length: 10 }, (_, i) => {
        const ran = i < 6;
        const at = ran ? 386 + i * 9 : 452 + (i - 6) * 9;
        const marked = !ran && frame >= 470;
        const bed = interpolate(frame, [34 + i * 4, 50 + i * 4], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        const live = interpolate(frame, [at, at + 10], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        return (
          <div key={i} style={{ position: "relative", width: 62, height: 62 }}>
            <div
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: 10,
                border: `2px solid ${t.surfaceAlt}`,
                opacity: bed,
              }}
            />
            <div
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: 10,
                border: `2px solid ${marked ? t.accent : ran ? t.pillBright : t.connector}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                opacity: live,
              }}
            >
              {ran ? (
                <svg width={34} height={34} viewBox="0 0 20 20" fill="none">
                  <path
                    d="M5 10.5 L8.5 14 L15.5 6.5"
                    stroke={t.pillBright}
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export const S05: React.FC = () => (
  <Canvas padding={120} drift driftScale={1.015} driftPx={{ x: -8, y: -6 }}>
    <div style={{ display: "flex", flexDirection: "column", gap: 42 }}>
      <NumberedRow n="1" from={10}>
        <div style={{ display: "flex", alignItems: "center", gap: 44, flex: 1 }}>
          {/* The picture. Never decoded, so it stays a black well. */}
          <div style={{ position: "relative" }}>
            <Card tone="surfaceAlt" width={330} height={190} padding={16} from={56}>
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  borderRadius: 8,
                  backgroundColor: ailabsTheme.bgDeep,
                }}
              />
            </Card>
            <div style={{ position: "absolute", left: 4, top: 200 }}>
              <Callout tone="dim" fontSize={22} from={236}>
                never decoded
              </Callout>
            </div>
          </div>

          {/* 620 was the declared box, but ChecklistGates paints its sub-pill at
              0.32 of that, so the row's real ink stopped ~330px short of it. */}
          <ChecklistGates
            width={460}
            fontSize={28}
            rowGap={26}
            from={70}
            stagger={46}
            rows={[
              { label: "file size", sub: 1 },
              { label: "bitrate", sub: 1 },
            ]}
          />
        </div>
      </NumberedRow>

      <NumberedRow n="2" from={22}>
        <div style={{ display: "flex", flexDirection: "column", gap: 28, flex: 1 }}>
          <Pill width={286} height={16} tone="bright" from={373} />
          {/* The label sits against the four boxes it names. Parked at the card's
              right edge it read as a heading for the whole row. */}
          <div style={{ display: "flex", alignItems: "center", gap: 34 }}>
            <CheckGrid />
            <Callout tone="accent" fontSize={26} from={478} duration={16}>
              never run
            </Callout>
          </div>
          <Pill width={430} height={11} tone="dim" from={396} />
        </div>
      </NumberedRow>
    </div>
  </Canvas>
);
