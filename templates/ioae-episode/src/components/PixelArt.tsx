import React from "react";
import { useCurrentFrame } from "remotion";
import { useTheme } from "../theme";

export const PixelArt: React.FC<{
  rows: readonly string[];
  pixel: number;
  startFrame?: number;
  framesPerRow?: number;
}> = ({ rows, pixel, startFrame = 0, framesPerRow = 1.5 }) => {
  const frame = useCurrentFrame();
  const theme = useTheme();
  const palette: Record<string, string> = {
    ".": "transparent",
    "#": theme.ink,
    b: theme.blue,
    c: theme.teal,
    m: theme.magenta,
    r: theme.red,
    g: theme.green,
    y: theme.amber,
    s: theme.fill,
  };
  const revealed = Math.floor(
    Math.max(0, frame - startFrame) / Math.max(0.001, framesPerRow),
  );

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {rows.map((row, y) => (
        <div key={y} style={{ display: "flex", height: pixel }}>
          {row.split("").map((character, x) => (
            <div
              key={x}
              style={{
                width: pixel,
                height: pixel,
                backgroundColor: palette[character] ?? "transparent",
                opacity: y <= revealed ? 1 : 0,
              }}
            />
          ))}
        </div>
      ))}
    </div>
  );
};
