import React from "react";
import { useCurrentFrame } from "remotion";
import { useTheme } from "../theme";

/**
 * Renders a 90s style pixel sprite from a character map, revealed row by row.
 */
export const PixelArt: React.FC<{
  rows: string[];
  pixel: number;
  startFrame?: number;
  framesPerRow?: number;
}> = ({ rows, pixel, startFrame = 0, framesPerRow = 1.5 }) => {
  const frame = useCurrentFrame();
  const t = useTheme();
  const palette: Record<string, string> = {
    ".": "transparent",
    "#": t.ink,
    b: t.blue,
    c: t.teal,
    m: t.magenta,
    r: t.red,
    g: t.green,
    y: t.amber,
    s: t.fill,
  };
  const revealed = Math.floor(
    Math.max(0, frame - startFrame) / Math.max(0.001, framesPerRow),
  );

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {rows.map((row, y) => (
        <div key={y} style={{ display: "flex", height: pixel }}>
          {row.split("").map((char, x) => (
            <div
              key={x}
              style={{
                width: pixel,
                height: pixel,
                backgroundColor: palette[char] ?? "transparent",
                opacity: y <= revealed ? 1 : 0,
              }}
            />
          ))}
        </div>
      ))}
    </div>
  );
};
