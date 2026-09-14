import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import {
  Callout,
  Canvas,
  Card,
  ChecklistGates,
  Pill,
  useTheme,
} from "../../../../../shared/brand/ailabs-explainer";

/**
 * S01 -- cold open. Frames 0-698 (699), one 23.3s hold.
 *
 * Local cue frames (absolute minus the shot start of 0):
 *   open 0 | six-checks 134 | all-real 295 | still-broken 470 | not-lying 584
 *
 * The six labels are the six checks the sub-agent actually ran, from
 * `research.md` -- file size, bitrate, types, frame count, components, render.
 * They are named at `six-checks`, so the rows tick from 134 on a 26-frame
 * stagger and the last one lands at 264, inside the cue.
 *
 * Both containers -- the gate panel and the artifact tile -- are present on the
 * shot's first frame. Only their contents animate. That is the grammar the whole
 * episode is about.
 */

const CHECKS = [
  "file size",
  "bitrate",
  "types",
  "frame count",
  "components",
  "render",
];

/**
 * The panel head. It carries the accent through `all-real` (295-470), the one
 * stretch of this 23s hold where the narration is on the set of checks itself
 * rather than on any single row. Without it the shot runs 180 frames with no
 * accent at all, which the first still probe at frame 350 showed.
 */
const HeaderPill: React.FC = () => {
  const t = useTheme();
  const on = interpolate(useCurrentFrame(), [300, 318, 450, 466], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <div style={{ position: "relative", width: 190, height: 14 }}>
      <Pill width={190} height={14} tone="dim" from={14} />
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: 190,
          height: 14,
          borderRadius: 14,
          backgroundColor: t.accent,
          opacity: on,
        }}
      />
    </div>
  );
};

/** The rendered file, standing beside the checks that never looked at it. */
const ArtifactTile: React.FC = () => {
  const t = useTheme();
  const frame = useCurrentFrame();

  // still-broken @ 470: the picture the six checks never decoded goes black.
  const broken = frame >= 470;

  return (
    <Card width={620} height={568} padding={32} from={0}>
      <div style={{ display: "flex", flexDirection: "column", height: "100%", gap: 22 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Pill width={116} height={12} tone="dim" from={18} />
          <div style={{ flex: 1 }} />
          <Pill width={44} height={12} tone="dim" from={24} />
        </div>

        <div
          style={{
            flex: 1,
            borderRadius: 10,
            backgroundColor: broken ? t.bgDeep : t.surfaceAlt,
            border: broken ? `2px solid ${t.accent}` : "2px solid transparent",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 16,
          }}
        >
          {/* The picture inside the tile. It exists until the shot says it does not. */}
          {broken ? null : (
            <>
              <Pill width={276} height={16} tone="bright" from={40} />
              <Pill width={360} height={12} tone="dim" from={48} />
              <Pill width={228} height={12} tone="dim" from={54} />
            </>
          )}
        </div>

        <div style={{ height: 34, display: "flex", alignItems: "center" }}>
          <Callout tone="accent" fontSize={24} from={486} duration={14}>
            black frame
          </Callout>
        </div>
      </div>
    </Card>
  );
};

export const S01: React.FC = () => (
  <Canvas padding={130} drift driftScale={1.02} driftPx={{ x: -12, y: -7 }}>
    <div style={{ display: "flex", alignItems: "center", gap: 76 }}>
      {/* Panel present at frame 0; the rows populate from the `six-checks` cue. */}
      <Card width={730} height={700} padding={54} from={0}>
        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          <HeaderPill />
          <ChecklistGates
            width={622}
            fontSize={32}
            rowGap={26}
            from={134}
            stagger={26}
            tickDuration={11}
            rows={CHECKS.map((label) => ({ label, sub: 1 }))}
          />
        </div>
      </Card>

      <ArtifactTile />
    </div>
  </Canvas>
);
