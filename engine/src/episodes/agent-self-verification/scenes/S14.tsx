import React from "react";
import { useCurrentFrame } from "remotion";
import {
  Callout,
  Canvas,
  Card,
  Pill,
  useTheme,
} from "../../../../../shared/brand/ailabs-explainer";

/**
 * S14 -- the exit pair. Frames 5837-5938 (102), the shortest shot in the map.
 *
 * Local cue: exit-codes 0 -- "Exit zero, clean. Exit one, dirty." 96 frames for
 * seven words, so the frame carries two states and one move.
 *
 * Accent per shots.json: the active exit code. It sits on `exit 0` until the
 * sentence turns, then moves to `exit 1` at local 50. Both rows are on screen at
 * the cut; only the accent travels.
 */

const SWITCH = 50;

const Row: React.FC<{
  code: string;
  active: boolean;
  pillTone: "bright" | "dim";
  label: string;
  labelFrom: number;
}> = ({ code, active, pillTone, label, labelFrom }) => {
  const t = useTheme();
  return (
    <Card width={1180} height={190} padding={44} from={0} accentBorder={active}>
      <div style={{ display: "flex", alignItems: "center", gap: 46, height: "100%" }}>
        <div
          style={{
            width: 210,
            flexShrink: 0,
            fontFamily: t.mono,
            fontSize: 46,
            lineHeight: 1,
            fontWeight: 500,
            color: active ? t.accent : t.pillDim,
          }}
        >
          {code}
        </div>
        <div style={{ width: 2, height: 74, backgroundColor: t.connector }} />
        <div style={{ display: "flex", flexDirection: "column", gap: 15 }}>
          <Pill width={480} height={14} tone={pillTone} from={0} />
          <Pill width={360} height={14} tone="dim" from={0} />
        </div>
        <div style={{ flex: 1 }} />
        <Callout tone="dim" fontSize={28} from={labelFrom} duration={12}>
          {label}
        </Callout>
      </div>
    </Card>
  );
};

export const S14: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <Canvas padding={140} drift={false}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 48 }}>
        <Row
          code="exit 0"
          active={frame < SWITCH}
          pillTone="bright"
          label="clean"
          labelFrom={12}
        />
        <Row
          code="exit 1"
          active={frame >= SWITCH}
          pillTone="dim"
          label="dirty"
          labelFrom={SWITCH + 6}
        />
      </div>
    </Canvas>
  );
};
