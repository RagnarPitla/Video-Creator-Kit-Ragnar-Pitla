import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import { ailabsTheme } from "../../../../shared/brand/ailabs-explainer";
import { BEATS, SHOTS } from "./cut";
import * as S from "./scenes";

const SCENES: Record<string, React.FC> = {
  S01: S.S01, S02: S.S02, S03: S.S03, S04: S.S04, S05: S.S05, S06: S.S06,
  S07: S.S07, S08: S.S08, S09: S.S09, S10: S.S10, S11: S.S11, S12: S.S12,
  S13: S.S13, S14: S.S14, S15: S.S15, S16: S.S16, S17: S.S17, S18: S.S18,
  S19: S.S19, S20: S.S20, S21: S.S21, S22: S.S22,
};

/**
 * `AgentWorks` - the Microsoft Hackathon 2026 submission film for R&D AgentWorks.
 *
 * Two independent tracks over one timeline.
 *
 * The audio track is 22 separate `<Sequence>`s, one per beat, each holding one wav
 * and starting on that beat's own `startFrame`. It would be shorter to mux a single
 * pre-joined narration file, and it would be wrong: the brief says Ragnar may
 * re-record these in his own voice, and a per-beat track means a replacement wav
 * drops into one Sequence without re-timing anything else. It also means the gaps
 * between beats are real silence in the composition rather than baked into a file
 * nobody can edit.
 *
 * The picture track is `SHOTS`, which tiles the same 3727 frames with no gap and no
 * overlap - asserted at module load in `cut.ts`, not trusted here.
 *
 * The two tracks are deliberately not the same list. Twenty-one shots sit exactly on
 * their beat; S22 starts 68 frames inside beat 21 so the closing recording, not the
 * narrator, holds the last image.
 */
export const AgentWorksFilm: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: ailabsTheme.bg }}>
    {SHOTS.map((shot) => {
      const Scene = SCENES[shot.id];
      return (
        <Sequence key={shot.id} from={shot.start} durationInFrames={shot.durationInFrames} name={shot.id} layout="none">
          <Scene />
        </Sequence>
      );
    })}

    {BEATS.map((b) => (
      <Sequence
        key={b.n}
        from={b.startFrame}
        durationInFrames={b.durationFrames}
        name={`beat ${String(b.n).padStart(2, "0")}`}
        layout="none"
      >
        <Audio src={staticFile(`agentworks/${b.audio}`)} />
      </Sequence>
    ))}
  </AbsoluteFill>
);
