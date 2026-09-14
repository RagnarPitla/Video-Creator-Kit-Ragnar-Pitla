import { linearTiming, TransitionSeries } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { wipe } from "@remotion/transitions/wipe";
import React from "react";
import { AbsoluteFill } from "remotion";
import { CrtOverlay } from "./components/CrtOverlay";
import { DosChrome } from "./components/DosChrome";
import type { EpisodeConfig } from "./episode";
import { SceneRenderer } from "./scenes/SceneRenderer";
import { type Theme, ThemeContext } from "./theme";

export type EpisodeVideoProps = {
  episode: EpisodeConfig;
  theme: Theme;
};

const transitionFrames = 12;

export const EpisodeVideo: React.FC<EpisodeVideoProps> = ({
  episode,
  theme,
}) => {
  const timeline = episode.scenes.flatMap((scene, index) => {
    const transition = index === 0 ? "none" : (scene.transition ?? "fade");
    const overlap = transition === "none" ? 0 : transitionFrames;
    const sequence = (
      <TransitionSeries.Sequence
        key={`scene-${scene.id}`}
        durationInFrames={scene.durationInFrames + overlap}
        premountFor={30}
      >
        <SceneRenderer episode={episode} scene={scene} />
      </TransitionSeries.Sequence>
    );

    if (transition === "none") {
      return [sequence];
    }

    const transitionElement =
      transition === "wipe" ? (
        <TransitionSeries.Transition
          key={`transition-${scene.id}`}
          presentation={wipe({ direction: "from-left" })}
          timing={linearTiming({ durationInFrames: transitionFrames })}
        />
      ) : (
        <TransitionSeries.Transition
          key={`transition-${scene.id}`}
          presentation={fade()}
          timing={linearTiming({ durationInFrames: transitionFrames })}
        />
      );

    return [transitionElement, sequence];
  });

  return (
    <ThemeContext.Provider value={theme}>
      <AbsoluteFill style={{ backgroundColor: theme.paper }}>
        <TransitionSeries>{timeline}</TransitionSeries>
        <DosChrome episode={episode} />
        <CrtOverlay />
      </AbsoluteFill>
    </ThemeContext.Provider>
  );
};
