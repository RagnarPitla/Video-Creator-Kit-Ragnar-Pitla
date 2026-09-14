import React from "react";
import { AbsoluteFill } from "remotion";
import { useTheme } from "../theme";

/**
 * Padded content area for every scene. Leaves room for the DOS status bar and
 * function key strip and keeps text inside a generous safe area.
 */
export const SceneShell: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const t = useTheme();

  return (
    <AbsoluteFill
      style={{
        backgroundColor: t.paper,
        paddingTop: 168,
        paddingBottom: 150,
        paddingLeft: 148,
        paddingRight: 148,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {children}
    </AbsoluteFill>
  );
};
