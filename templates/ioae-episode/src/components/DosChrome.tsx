import React from "react";
import {
  AbsoluteFill,
  Interactive,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import type { EpisodeConfig } from "../episode";
import { useTheme } from "../theme";

export const DosChrome: React.FC<{ episode: EpisodeConfig }> = ({
  episode,
}) => {
  const frame = useCurrentFrame();
  const theme = useTheme();
  const { durationInFrames } = useVideoConfig();
  const percent = Math.round((frame / Math.max(1, durationInFrames - 1)) * 100);
  const filled = Math.round((frame / Math.max(1, durationInFrames - 1)) * 24);
  const episodeTitle = [
    episode.episodeLabel,
    "//",
    episode.title,
    episode.subtitle,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <Interactive.Div
        name="Status bar"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: 1920,
          height: 78,
          backgroundColor: theme.barBg,
          color: theme.barInk,
          fontFamily: "VTThreeTwoThree",
          fontSize: 44,
          letterSpacing: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingLeft: 40,
          paddingRight: 40,
        }}
      >
        <span>{episode.brand}</span>
        <span>{episodeTitle}</span>
        <span>{episode.drive}</span>
      </Interactive.Div>

      <Interactive.Div
        name="Function key bar"
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          width: 1920,
          height: 72,
          backgroundColor: theme.barBg,
          color: theme.barInk,
          fontFamily: "VTThreeTwoThree",
          fontSize: 38,
          letterSpacing: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingLeft: 40,
          paddingRight: 40,
        }}
      >
        <span>{episode.fkeys.join(" ")}</span>
        <span>
          {"["}
          {"\u2588".repeat(filled)}
          {"\u2591".repeat(24 - filled)}
          {"] "}
          {percent}
          {"%"}
        </span>
      </Interactive.Div>

      <Interactive.Div
        name="Hairline"
        style={{
          position: "absolute",
          top: 78,
          left: 0,
          width: 1920,
          height: 4,
          backgroundColor: theme.barBg,
          opacity: interpolate(frame, [0, 20], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      />
    </AbsoluteFill>
  );
};
