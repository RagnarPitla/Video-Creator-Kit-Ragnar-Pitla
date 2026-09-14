import rawEpisode from "../episode.json";
import type { SpriteName } from "./components/sprites";
import type { ThemeColorName } from "./theme";

export type Host = {
  key: string;
  name: string;
  color: string;
};

export type BootSceneProps = {
  header: string;
  systemLines: string[];
  memoryTest?: {
    label: string;
    totalKb: number;
    startFrame?: number;
    endFrame?: number;
    okText?: string;
  };
  detectedLines: string[];
  finalLine: string;
  sprite?: SpriteName;
};

export type TitleSceneProps = {
  eyebrow: string;
  hostPrefix: string;
  sprite?: SpriteName;
};

export type BulletsSceneProps = {
  eyebrow?: string;
  heading: string;
  lead?: string;
  bullets: string[];
  footer?: string;
  sprite?: SpriteName;
};

export type StepsSceneProps = {
  heading: string;
  steps: Array<{ label: string; text: string }>;
  footer?: string;
  sprite?: SpriteName;
};

export type ComparisonSceneProps = {
  heading: string;
  left: {
    title: string;
    accent: ThemeColorName;
    lines: string[];
  };
  right: {
    title: string;
    accent: ThemeColorName;
    lines: string[];
  };
  footer?: string;
};

export type QuoteSceneProps = {
  lines: string[];
  highlightLine?: number;
  attribution: string;
  gloss?: string;
};

export type TerminalSceneProps = {
  heading: string;
  lines: Array<{ text: string; tone?: ThemeColorName }>;
  wiring?: string;
  badges?: string[];
  footer?: string;
};

export type StatsSceneProps = {
  heading: string;
  subhead?: string;
  columns?: {
    label: string;
    value: string;
    detail: string;
  };
  items: Array<{
    label: string;
    value: string;
    detail: string;
    meter: number;
    accent: ThemeColorName;
  }>;
  footer?: string;
};

export type TakeawaysOutroSceneProps = {
  heading: string;
  marker: string;
  items: string[];
  closingQuote?: string;
  next?: string;
  links?: string[];
  cta?: string;
  hostPrefix: string;
  prompt: string;
  sprite?: SpriteName;
};

type SceneBase<TType extends string, TProps> = {
  id: string;
  type: TType;
  transition?: "fade" | "wipe" | "none";
  durationInFrames: number;
  props: TProps;
};

export type EpisodeScene =
  | SceneBase<"boot", BootSceneProps>
  | SceneBase<"title", TitleSceneProps>
  | SceneBase<"bullets", BulletsSceneProps>
  | SceneBase<"steps", StepsSceneProps>
  | SceneBase<"comparison", ComparisonSceneProps>
  | SceneBase<"quote", QuoteSceneProps>
  | SceneBase<"terminal", TerminalSceneProps>
  | SceneBase<"stats", StatsSceneProps>
  | SceneBase<"takeaways-outro", TakeawaysOutroSceneProps>;

export type EpisodeConfig = {
  brand: string;
  episodeLabel: string;
  title: string;
  subtitle: string;
  drive: string;
  fkeys: string[];
  hosts: Host[];
  scenes: EpisodeScene[];
};

const supportedSceneTypes = new Set<EpisodeScene["type"]>([
  "boot",
  "title",
  "bullets",
  "steps",
  "comparison",
  "quote",
  "terminal",
  "stats",
  "takeaways-outro",
]);

const parseEpisode = (value: unknown): EpisodeConfig => {
  if (!value || typeof value !== "object") {
    throw new Error("episode.json must contain an object.");
  }

  const candidate = value as Record<string, unknown>;
  for (const key of ["brand", "episodeLabel", "title", "subtitle", "drive"]) {
    if (typeof candidate[key] !== "string") {
      throw new Error(`episode.json field "${key}" must be a string.`);
    }
  }

  if (!Array.isArray(candidate.fkeys) || candidate.fkeys.length === 0) {
    throw new Error('episode.json field "fkeys" must be a non-empty array.');
  }
  if (!Array.isArray(candidate.hosts) || candidate.hosts.length === 0) {
    throw new Error('episode.json field "hosts" must be a non-empty array.');
  }
  if (!Array.isArray(candidate.scenes) || candidate.scenes.length === 0) {
    throw new Error('episode.json field "scenes" must be a non-empty array.');
  }

  const ids = new Set<string>();
  for (const sceneValue of candidate.scenes) {
    if (!sceneValue || typeof sceneValue !== "object") {
      throw new Error("Each scene must be an object.");
    }
    const scene = sceneValue as Record<string, unknown>;
    if (typeof scene.id !== "string" || scene.id.length === 0) {
      throw new Error("Each scene needs a non-empty id.");
    }
    if (ids.has(scene.id)) {
      throw new Error(`Scene id "${scene.id}" is duplicated.`);
    }
    ids.add(scene.id);
    if (
      typeof scene.type !== "string" ||
      !supportedSceneTypes.has(scene.type as EpisodeScene["type"])
    ) {
      throw new Error(`Scene "${scene.id}" has an unsupported type.`);
    }
    if (
      scene.transition !== undefined &&
      scene.transition !== "fade" &&
      scene.transition !== "wipe" &&
      scene.transition !== "none"
    ) {
      throw new Error(`Scene "${scene.id}" has an unsupported transition.`);
    }
    if (
      !Number.isInteger(scene.durationInFrames) ||
      (scene.durationInFrames as number) <= 0
    ) {
      throw new Error(
        `Scene "${scene.id}" needs a positive integer durationInFrames.`,
      );
    }
    if (!scene.props || typeof scene.props !== "object") {
      throw new Error(`Scene "${scene.id}" needs a props object.`);
    }
  }

  return value as EpisodeConfig;
};

export const episodeConfig = parseEpisode(rawEpisode);

export const totalDurationInFrames = episodeConfig.scenes.reduce(
  (total, scene) => total + scene.durationInFrames,
  0,
);
