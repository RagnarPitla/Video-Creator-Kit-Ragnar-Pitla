import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";

export const TypeLine: React.FC<{
  text: string;
  startFrame: number;
  cps?: number;
  cursor?: boolean;
  style?: React.CSSProperties;
  paint?: React.CSSProperties;
}> = ({ text, startFrame, cps = 42, cursor = false, style, paint }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const elapsed = Math.max(0, frame - startFrame);
  const shown = Math.min(text.length, Math.floor((elapsed / fps) * cps));
  const typing = frame >= startFrame && shown < text.length;
  const half = Math.round(fps / 2);

  return (
    <div style={{ position: "relative", whiteSpace: "pre", ...style }}>
      <span style={{ visibility: "hidden" }}>{text || "\u00a0"}</span>
      <span
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          ...(paint ? { width: "100%", ...paint } : null),
        }}
      >
        {text.slice(0, shown)}
        {cursor && typing ? (
          <span style={{ opacity: frame % (half * 2) < half ? 1 : 0.25 }}>
            {"\u2588"}
          </span>
        ) : null}
      </span>
    </div>
  );
};
