import React from "react";
import { AbsoluteFill } from "remotion";
import { useTheme } from "../theme";

export const SceneShell: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const theme = useTheme();

  return (
    <AbsoluteFill
      style={{
        backgroundColor: theme.paper,
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
