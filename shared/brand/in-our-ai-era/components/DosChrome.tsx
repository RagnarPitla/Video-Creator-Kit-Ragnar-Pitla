import React from "react";
import {
  AbsoluteFill,
  Interactive,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { useTheme } from "../theme";

/**
 * Persistent DOS application shell: an inverse-video status bar at the top and
 * a function key strip at the bottom, with a playback progress meter.
 * Sits above the scene timeline so it never wipes between scenes.
 */
export const DosChrome: React.FC = () => {
  const frame = useCurrentFrame();
  const t = useTheme();
  const { durationInFrames } = useVideoConfig();
  const percent = Math.round((frame / Math.max(1, durationInFrames - 1)) * 100);
  const filled = Math.round((frame / Math.max(1, durationInFrames - 1)) * 24);

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
          backgroundColor: t.barBg,
          color: t.barInk,
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
        <span>IN OUR AI ERA</span>
        <span>EPISODE // RUNNING AI ON YOUR OWN MACHINE (SCOUT LOCAL)</span>
        <span>C:\LOCAL</span>
      </Interactive.Div>

      <Interactive.Div
        name="Function key bar"
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          width: 1920,
          height: 72,
          backgroundColor: t.barBg,
          color: t.barInk,
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
        <span>F1 HELP F3 GGUF F5 DEMO F7 COSTS F10 QUIT</span>
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
          backgroundColor: t.barBg,
          opacity: interpolate(frame, [0, 20], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      />
    </AbsoluteFill>
  );
};
