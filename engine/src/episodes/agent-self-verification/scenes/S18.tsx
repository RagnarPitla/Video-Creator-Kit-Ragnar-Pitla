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
 * S18 -- the two measurements that disproved me. Frames 6931-7537 (607), a 20.2s
 * hold and the evidentiary centre of the episode.
 *
 * Local cues: disproved 0 | evidence-one 119 | evidence-two 453
 *
 * Accent per shots.json: the measured value 3, and nothing else. That means the
 * first 119 frames carry no accent at all -- the shot is still on "it came back
 * and disproved me", and there is nothing yet to point at. Every other beat here
 * moves an element rather than the accent: the readout at 119, the swatch pair at
 * 250, the dashed nothing at 352, the fifth boundary at 453.
 *
 * The numbers are the `research.md` measurements: frame 1080 read luma 3 (the
 * bgDeep background, #030303), and frame 930 is the boundary that never flashed.
 */

const Panel: React.FC<{ left: number; top: number; label: string; labelFrom: number; children?: React.ReactNode }> = ({
  left,
  top,
  label,
  labelFrom,
  children,
}) => (
  <div style={{ position: "absolute", left, top }}>
    <Callout tone="dim" fontSize={22} from={labelFrom} duration={14}>
      {label}
    </Callout>
    <div style={{ marginTop: 16 }}>{children}</div>
  </div>
);

export const S18: React.FC = () => {
  const frame = useCurrentFrame();
  const t = useTheme();

  const swatches = interpolate(frame, [250, 274], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const ghost = interpolate(frame, [352, 376], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  /**
   * `disproved` runs 0-119 before any content lands, so the shot opened with no
   * accent for 4.9s. The accent marks the slot the measurement is about to fill,
   * then hands straight over to the value itself at 146. Never both at once.
   */
  const aSlot = interpolate(frame, [30, 46, 108, 124], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <Canvas padding={120} drift driftScale={1.03} driftPx={{ x: 8, y: -10 }}>
      <div style={{ position: "relative", width: 1680, height: 780 }}>
        {/* the panel is present at the cut -- only its contents are scheduled */}
        <Card width={1680} height={780} padding={54} from={0} />

        {/*
          Slot beds. The panel was present at frame 0 but its first content is
          scheduled at 124, so 1680x780 of surface sat empty for 4.1s. The beds
          mark where the three evidence blocks will land, so the cut opens on a
          layout rather than on a blank card.
        */}
        {(
          [
            [110, 142, 420, 236, 16, 124],
            [110, 466, 420, 180, 26, 358],
            [1030, 452, 500, 60, 36, 458],
          ] as const
        ).map(([l, tp, w, h, inAt, outAt], i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: l,
              top: tp,
              width: w,
              height: h,
              borderRadius: 6,
              border: `2px solid ${t.surfaceAlt}`,
              boxSizing: "border-box",
              opacity: interpolate(
                frame,
                [inAt, inAt + 24, outAt, outAt + 18],
                [0, 1, 1, 0],
                { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
              ),
            }}
          />
        ))}

        {aSlot > 0 ? (
          <div
            style={{
              position: "absolute",
              left: 110,
              top: 142,
              width: 420,
              height: 236,
              borderRadius: 6,
              border: `3px solid ${t.accent}`,
              boxSizing: "border-box",
              opacity: aSlot,
            }}
          />
        ) : null}

        {/* evidence one: the bad frame, decoded */}
        <Panel left={110} top={106} label="frame 1080" labelFrom={124}>
          <div
            style={{
              width: 420,
              height: 236,
              borderRadius: 6,
              backgroundColor: t.bgDeep,
              border: `2px solid ${t.connector}`,
              boxSizing: "border-box",
              opacity: interpolate(frame, [124, 146], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
            }}
          />
        </Panel>

        <div style={{ position: "absolute", left: 604, top: 132 }}>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 26 }}>
            <Callout tone="accent" fontSize={140} from={146} duration={18} rise={16}>
              3
            </Callout>
            <div style={{ paddingBottom: 30 }}>
              <Callout tone="dim" fontSize={34} from={182} duration={16}>
                not 0
              </Callout>
            </div>
          </div>
        </div>

        {/* What luma 3 actually is. A second swatch for #000000 was tried and cut:
            3 and 0 are indistinguishable at this size, so the pair read as two
            identical squares under a caption insisting they differ. One swatch
            and its name carries the claim without the frame arguing with itself. */}
        <div style={{ position: "absolute", left: 610, top: 306, display: "flex", gap: 20, alignItems: "center", opacity: swatches }}>
          <div
            style={{
              width: 132,
              height: 84,
              borderRadius: 5,
              backgroundColor: t.bgDeep,
              border: `2px solid ${t.connector}`,
              boxSizing: "border-box",
            }}
          />
          <Callout tone="dim" fontSize={24} from={278} duration={14}>
            the scene background
          </Callout>
        </div>

        {/* what an off-by-one would actually have left behind */}
        <Panel left={110} top={430} label="an off-by-one" labelFrom={358}>
          <div
            style={{
              width: 420,
              height: 180,
              borderRadius: 6,
              border: `2px dashed ${t.connector}`,
              boxSizing: "border-box",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              opacity: ghost,
            }}
          >
            <Callout tone="dim" fontSize={26} from={392} duration={14}>
              nothing
            </Callout>
          </div>
        </Panel>

        {/* evidence two: the fifth boundary, which never flashed */}
        <div
          style={{
            position: "absolute",
            left: 1030,
            top: 452,
            opacity: interpolate(frame, [458, 484], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <div
                  style={{
                    width: 4,
                    height: i === 4 ? 62 : 40,
                    backgroundColor: i === 4 ? t.pillBright : t.connector,
                  }}
                />
                {i < 4 ? <Pill width={78} height={4} tone="dim" from={0} /> : null}
              </div>
            ))}
          </div>
          {/* Right-aligned to land under the fifth tick. Left-aligned it read as a
              caption for the whole ruler, which is the opposite of the claim. */}
          <div
            style={{
              marginTop: 22,
              width: 470,
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              gap: 10,
            }}
          >
            <Callout tone="dim" fontSize={30} from={496} duration={14}>
              frame 930
            </Callout>
            <Callout tone="dim" fontSize={24} from={536} duration={14}>
              never flashed
            </Callout>
          </div>
        </div>
      </div>
    </Canvas>
  );
};
