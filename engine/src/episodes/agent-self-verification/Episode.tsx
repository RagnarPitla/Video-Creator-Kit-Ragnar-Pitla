import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import {
  S01,
  S02,
  S03,
  S04,
  S05,
  S06,
  S07,
  S08,
  S09,
  S10,
  S11,
  S12,
  S13,
  S14,
  S15,
  S16,
  S17,
  S18,
  S19,
  S20,
} from "./scenes";

/**
 * "Why your agent says done when it isn't" -- 8401 frames at 30fps, 1920x1080.
 *
 * The shot table below is `projects/agent-self-verification/board/shots.json`
 * verbatim. It tiles the timeline with no gap and no overlap: 0 + 699 = 699,
 * ..., 8014 + 387 = 8401. `python3 board/check_map.py` is the proof, and nothing
 * here is allowed to drift from it.
 */

type Shot = {
  id: string;
  start: number;
  durationInFrames: number;
  Component: React.FC;
};

const SHOTS: Shot[] = [
  { id: "S01", start: 0, durationInFrames: 699, Component: S01 },
  { id: "S02", start: 699, durationInFrames: 400, Component: S02 },
  { id: "S03", start: 1099, durationInFrames: 237, Component: S03 },
  { id: "S04", start: 1336, durationInFrames: 546, Component: S04 },
  { id: "S05", start: 1882, durationInFrames: 620, Component: S05 },
  { id: "S06", start: 2502, durationInFrames: 633, Component: S06 },
  { id: "S07", start: 3135, durationInFrames: 204, Component: S07 },
  { id: "S08", start: 3339, durationInFrames: 436, Component: S08 },
  { id: "S09", start: 3775, durationInFrames: 665, Component: S09 },
  { id: "S10", start: 4440, durationInFrames: 343, Component: S10 },
  { id: "S11", start: 4783, durationInFrames: 387, Component: S11 },
  { id: "S12", start: 5170, durationInFrames: 379, Component: S12 },
  { id: "S13", start: 5549, durationInFrames: 288, Component: S13 },
  { id: "S14", start: 5837, durationInFrames: 102, Component: S14 },
  { id: "S15", start: 5939, durationInFrames: 265, Component: S15 },
  { id: "S16", start: 6204, durationInFrames: 351, Component: S16 },
  { id: "S17", start: 6555, durationInFrames: 376, Component: S17 },
  { id: "S18", start: 6931, durationInFrames: 607, Component: S18 },
  { id: "S19", start: 7538, durationInFrames: 476, Component: S19 },
  { id: "S20", start: 8014, durationInFrames: 387, Component: S20 },
];

export const AgentSelfVerificationEpisode: React.FC = () => (
  // The root fill is what stops a one-frame hole between sequences from reading
  // as black. Every scene also paints its own Canvas, but this is the floor.
  <AbsoluteFill style={{ backgroundColor: "#0D0D0D" }}>
    <Audio src={staticFile("agent-self-verification-narration.wav")} />
    {SHOTS.map(({ id, start, durationInFrames, Component }) => (
      <Sequence key={id} from={start} durationInFrames={durationInFrames} name={id}>
        <Component />
      </Sequence>
    ))}
  </AbsoluteFill>
);
