import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import {
  Callout,
  Canvas,
  Card,
  Pill,
  ailabsTheme,
  useTheme,
} from "../../../../../shared/brand/ailabs-explainer";

/**
 * S06 -- kill the prior art. Frames 2502-3134 (633), a 21.1s hold.
 *
 * Local cue frames:
 *   prior-art 0 | kill-tsc 82 | kill-lint 236 | kill-tests 320 | kill-review 464
 *
 * Four named rows, struck through one at a time on the frame the narration
 * dismisses each one. Names are exactly the ones spoken in `narration.md`.
 * The reasons under them are the ones in `research.md`, kept to three words so
 * the shot is a list of names and not a paragraph.
 *
 * The accent is the strike currently being drawn, and the label it is crossing.
 * It leaves the row as soon as the next kill starts.
 */

type Kill = { name: string; reason: string; at: number };

const KILLS: Kill[] = [
  { name: "type checker", reason: "compiled fine", at: 82 },
  { name: "linter", reason: "syntax, not behaviour", at: 236 },
  { name: "unit tests", reason: "same blind spot", at: 320 },
  { name: "human review", reason: "read it four times", at: 464 },
];

const STRIKE_FRAMES = 16;
/**
 * Sized to the longest line the panel carries: "-- syntax, not behaviour" at
 * fontSize 24 is 22 + 16 + ~302 = 340, and "human review" at 44 is ~317. With
 * padding 60 either side that needs ~740. At 960 the panel ran 220px past its
 * own longest line and the right half of it was bare surface.
 */
const ROW_W = 740;

const Row: React.FC<{ kill: Kill; index: number; nextAt: number }> = ({
  kill,
  index,
  nextAt,
}) => {
  const t = useTheme();
  const frame = useCurrentFrame();

  const appear = interpolate(frame, [10 + index * 16, 26 + index * 16], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const strike = interpolate(frame, [kill.at, kill.at + STRIKE_FRAMES], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const active = frame >= kill.at && frame < nextAt;
  const dead = frame >= nextAt;
  const labelColor = active ? t.accent : dead ? t.pillDim : t.pillBright;

  return (
    <div style={{ opacity: appear, display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ position: "relative", display: "inline-block", alignSelf: "flex-start" }}>
        <div
          style={{
            fontFamily: t.mono,
            fontSize: 44,
            lineHeight: 1,
            fontWeight: 500,
            color: labelColor,
            whiteSpace: "pre",
          }}
        >
          {kill.name}
        </div>
        {/* The strike grows left to right across the label only, never past it.
            `lineHeight: 1` pins the em box to 44px, so the rule sits on the
            x-height middle instead of drifting with the font's default leading. */}
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 22,
            height: 4,
            width: `${strike * 100}%`,
            borderRadius: 2,
            backgroundColor: active ? t.accent : t.pillDim,
          }}
        />
      </div>

      {/*
        The rule and the reason enter as one unit. Left ungated, the 22x2 rule
        drew from the shot's first frame and three orphan dashes sat under the
        unstruck names -- `docs/authoring-traps.md`, "anything drawn
        unconditionally shows up at frame 0". Frame 2700 of the render is the
        evidence; tsc and the blank gate both passed it.
      */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          paddingLeft: 2,
          opacity: interpolate(frame, [kill.at + 34, kill.at + 48], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        <div style={{ width: 22, height: 2, backgroundColor: t.connector }} />
        <Callout tone="dim" fontSize={24} from={kill.at + 34} duration={14}>
          {kill.reason}
        </Callout>
      </div>
    </div>
  );
};

export const S06: React.FC = () => (
  <Canvas padding={130} drift driftScale={1.02} driftPx={{ x: -9, y: -6 }}>
    <div style={{ display: "flex", alignItems: "center", gap: 92 }}>
      {/* Panel present at the cut; the names arrive inside it. */}
      <Card width={ROW_W} height={620} padding={60} from={0}>
        <div style={{ display: "flex", flexDirection: "column", gap: 42 }}>
          <Pill width={210} height={13} tone="dim" from={4} />
          {KILLS.map((k, i) => (
            <Row
              key={k.name}
              kill={k}
              index={i}
              nextAt={i + 1 < KILLS.length ? KILLS[i + 1].at : 10_000}
            />
          ))}
        </div>
      </Card>

      {/* The thing none of them looked at, sitting there the whole time. */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 22 }}>
        <Card tone="surfaceAlt" width={420} height={272} padding={18} from={0}>
          <div
            style={{
              width: "100%",
              height: "100%",
              borderRadius: 8,
              backgroundColor: ailabsTheme.bgDeep,
            }}
          />
        </Card>
        <Callout tone="dim" fontSize={22} from={520}>
          still broken
        </Callout>
      </div>
    </div>
  </Canvas>
);
