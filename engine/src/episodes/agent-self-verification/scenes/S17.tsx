import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import {
  Callout,
  Canvas,
  useTheme,
} from "../../../../../shared/brand/ailabs-explainer";

/**
 * S17 -- the theory I sent, drawn as I believed it. Frames 6555-6930 (376).
 *
 * Local cues: i-was-wrong 0 | my-theory 58
 *
 * Accent per shots.json: the shift I claimed was there. So the accent is the
 * offset block between the two strips -- the actual content of the wrong theory,
 * not the frame numbers, which are true and stay grey.
 *
 * The timeline is scaled 1500px / 1200 frames = 1.25 px per frame, so 180, 390,
 * 750 and 1080 land at 225, 487.5, 937.5 and 1350.
 */

const MARKS = [180, 390, 750, 1080];
const SCALE = 1.25;

const STRIP_LEFT = 300;
const TILE_W = 116;
/**
 * Taller tiles and a wider gap between the two strips: at 64px the pair sat as
 * two thin bands high in the frame with a dead lower third under them. Same
 * weight-and-area fix as S16, no extra elements.
 */
const TILE_H = 96;
const TILE_GAP = 10;
const OFFSET = TILE_W + TILE_GAP;
const STRIP_A_TOP = 250;
const STRIP_B_TOP = 432;

/**
 * The strip is present at the cut as an outline bed; only the fills are
 * scheduled. Left as bare tiles the shot ran its first 4.9s as a rule across the
 * top with nothing under it -- the same "container present, contents scheduled"
 * grammar the rest of the film uses.
 */
const Strip: React.FC<{ left: number; top: number; from: number }> = ({ left, top, from }) => {
  const frame = useCurrentFrame();
  const t = useTheme();
  return (
    <div style={{ position: "absolute", left, top, display: "flex", gap: TILE_GAP }}>
      {new Array(8).fill(0).map((_, i) => {
        const at = from + i * 7;
        const p = interpolate(frame, [at, at + 12], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        return (
          <div key={i} style={{ position: "relative", width: TILE_W, height: TILE_H }}>
            <div
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                width: TILE_W,
                height: TILE_H,
                borderRadius: 4,
                backgroundColor: t.surfaceAlt,
              }}
            />
            <div
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                width: TILE_W,
                height: TILE_H,
                borderRadius: 4,
                backgroundColor: t.surface,
                border: `1px solid ${t.surfaceAlt}`,
                boxSizing: "border-box",
                opacity: p,
              }}
            />
          </div>
        );
      })}
    </div>
  );
};

export const S17: React.FC = () => {
  const frame = useCurrentFrame();
  const t = useTheme();

  const shift = interpolate(frame, [210, 232], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <Canvas padding={130} drift driftScale={1.02} driftPx={{ x: -10, y: 8 }}>
      <div style={{ position: "relative", width: 1500, height: 600 }}>
        {/* the run, with the four failures on it */}
        <div
          style={{ position: "absolute", left: 0, top: 60, width: 1500, height: 3, backgroundColor: t.connector }}
        />
        {MARKS.map((m, i) => {
          const x = m * SCALE;
          const at = 66 + i * 12;
          const p = interpolate(frame, [at, at + 12], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          return (
            <div key={m}>
              <div
                style={{
                  position: "absolute",
                  left: x - 2,
                  top: 40,
                  width: 4,
                  height: 42,
                  backgroundColor: t.pillBright,
                  opacity: p,
                }}
              />
              <Callout
                tone="dim"
                fontSize={26}
                from={at + 4}
                duration={12}
                x={x - String(m).length * 8}
                y={94}
              >
                {String(m)}
              </Callout>
            </div>
          );
        })}

        <Callout tone="dim" fontSize={26} from={70} duration={16} x={0} y={0}>
          all at scene boundaries
        </Callout>

        {/* the two strips, one shifted -- the thing I claimed had happened */}
        <Strip left={STRIP_LEFT} top={STRIP_A_TOP} from={148} />
        <Strip left={STRIP_LEFT + OFFSET} top={STRIP_B_TOP} from={168} />

        {/* Measured as a gap, not painted as a tile. Filled at full tile height it
            read as a ninth frame in the lower strip rather than as the offset
            between the two. */}
        <div
          style={{
            position: "absolute",
            left: STRIP_LEFT,
            top: STRIP_B_TOP + TILE_H / 2 - 9,
            width: OFFSET * shift,
            height: 18,
            backgroundColor: t.accent,
          }}
        />
        {[STRIP_LEFT, STRIP_LEFT + OFFSET - 5].map((x) => (
          <div
            key={x}
            style={{
              position: "absolute",
              left: x,
              top: STRIP_B_TOP + TILE_H / 2 - 24,
              width: 5,
              height: 48,
              backgroundColor: t.accent,
              opacity: shift,
            }}
          />
        ))}

        <Callout tone="dim" fontSize={30} from={300} duration={16} x={STRIP_LEFT} y={556}>
          off by one
        </Callout>
      </div>
    </Canvas>
  );
};
