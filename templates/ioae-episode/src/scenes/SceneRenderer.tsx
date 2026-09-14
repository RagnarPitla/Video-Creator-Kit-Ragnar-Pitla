import React from "react";
import type { EpisodeConfig, EpisodeScene } from "../episode";
import { Boot } from "./Boot";
import { Bullets } from "./Bullets";
import { Comparison } from "./Comparison";
import { Quote } from "./Quote";
import { Stats } from "./Stats";
import { Steps } from "./Steps";
import { TakeawaysOutro } from "./TakeawaysOutro";
import { Terminal } from "./Terminal";
import { Title } from "./Title";

export const SceneRenderer: React.FC<{
  episode: EpisodeConfig;
  scene: EpisodeScene;
}> = ({ episode, scene }) => {
  switch (scene.type) {
    case "boot":
      return <Boot {...scene.props} />;
    case "title":
      return <Title episode={episode} props={scene.props} />;
    case "bullets":
      return <Bullets {...scene.props} />;
    case "steps":
      return <Steps {...scene.props} />;
    case "comparison":
      return <Comparison {...scene.props} />;
    case "quote":
      return <Quote {...scene.props} />;
    case "terminal":
      return <Terminal {...scene.props} />;
    case "stats":
      return <Stats {...scene.props} />;
    case "takeaways-outro":
      return <TakeawaysOutro episode={episode} props={scene.props} />;
  }
};
