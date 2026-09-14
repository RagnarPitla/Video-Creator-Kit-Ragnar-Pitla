import React from "react";
import { Composition } from "remotion";
import "./fonts";
import { EpisodeVideo, type EpisodeVideoProps } from "./EpisodeVideo";
import { episodeConfig, totalDurationInFrames } from "./episode";
import { colorTheme, lightTheme } from "./theme";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="InOurAiEra"
        component={EpisodeVideo}
        durationInFrames={totalDurationInFrames}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={
          {
            episode: episodeConfig,
            theme: lightTheme,
          } satisfies EpisodeVideoProps
        }
      />
      <Composition
        id="InOurAiEraColor"
        component={EpisodeVideo}
        durationInFrames={totalDurationInFrames}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={
          {
            episode: episodeConfig,
            theme: colorTheme,
          } satisfies EpisodeVideoProps
        }
      />
    </>
  );
};
