import { Composition } from "remotion";
import { StyleProof } from "./StyleProof";
import { AgentSelfVerificationEpisode } from "./episodes/agent-self-verification/Episode";
import { AgentWorksFilm } from "./films/agentworks/Film";
import { TOTAL_FRAMES as AGENTWORKS_FRAMES } from "./films/agentworks/cut";

/**
 * `StyleProof` is a style reference and a regression test in one. It exercises every
 * component in the `ailabs-explainer` library at the sizes the reference video uses,
 * so a still pulled from any of its six holds can be diffed against
 * `references/ailabs-unlazy/analysis/`.
 *
 * `AgentSelfVerification` is the first full episode built on that library. Its 8401
 * frames are the tiling in `projects/agent-self-verification/board/shots.json`.
 *
 * `AgentWorks` is the Microsoft Hackathon 2026 submission film. Its duration is not
 * a literal: it is imported from the cut sheet, which derives it from
 * `projects/hack-2026-agentworks/audio/beats.json` and throws at module load if the
 * shots stop tiling it. A number typed here by hand is a number that can disagree
 * with the narration it is supposed to be carrying.
 */
export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="StyleProof"
      component={StyleProof}
      durationInFrames={1200}
      fps={30}
      width={1920}
      height={1080}
    />
    <Composition
      id="AgentSelfVerification"
      component={AgentSelfVerificationEpisode}
      durationInFrames={8401}
      fps={30}
      width={1920}
      height={1080}
    />
    <Composition
      id="AgentWorks"
      component={AgentWorksFilm}
      durationInFrames={AGENTWORKS_FRAMES}
      fps={30}
      width={1920}
      height={1080}
    />
  </>
);
