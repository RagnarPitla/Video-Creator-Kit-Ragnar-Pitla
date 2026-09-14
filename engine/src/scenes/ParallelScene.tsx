import React from "react";
import { Callout, Canvas, ParallelBars } from "../../../shared/brand/ailabs-explainer";

const COLUMN: React.CSSProperties = { display: "flex", flexDirection: "column", gap: 30 };

/**
 * Shot 5 -- the payoff. Same five agents, same 20-frame fill per agent, only `mode`
 * differs.
 *
 * The parallel column is full at frame 26 and the sequential one is still crawling
 * at frame 100. Nothing on screen says "faster"; the two shapes argue it, which is
 * why this is the reference video's closing visual. `sequentialGap` is deliberately
 * larger than `fillDuration` so the bars barely overlap -- overlapping bars read as
 * "a bit staggered" rather than "one at a time".
 */
export const ParallelScene: React.FC = () => (
  <Canvas padding={120} driftScale={1.018} driftPx={{ x: 10, y: -6 }}>
    <div style={{ display: "flex", gap: 120, alignItems: "flex-start" }}>
      <div style={COLUMN}>
        <Callout tone="dim" fontSize={24} from={0}>
          one at a time
        </Callout>
        <ParallelBars
          mode="sequential"
          count={5}
          from={6}
          fillDuration={20}
          sequentialGap={24}
          barWidth={540}
          labelWidth={150}
          fontSize={24}
        />
        {/* Lands the frame after the last sequential bar tops out (6 + 4*24 + 20). */}
        <Callout tone="accent" fontSize={34} from={126}>
          3h 41m
        </Callout>
      </div>

      <div style={COLUMN}>
        <Callout tone="dim" fontSize={24} from={0}>
          all at once
        </Callout>
        {/* accentRow is left undefined on purpose: five accent bars at once would
            spend the whole ~2% budget on a shape the viewer already understands. */}
        <ParallelBars
          mode="parallel"
          count={5}
          from={6}
          fillDuration={20}
          barWidth={540}
          labelWidth={150}
          fontSize={24}
        />
        <Callout tone="accent" fontSize={34} from={30}>
          10 min
        </Callout>
      </div>
    </div>
  </Canvas>
);
