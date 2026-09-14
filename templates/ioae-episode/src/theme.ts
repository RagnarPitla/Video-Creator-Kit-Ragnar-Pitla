import React from "react";

export type Theme = {
  paper: string;
  ink: string;
  blue: string;
  teal: string;
  magenta: string;
  red: string;
  green: string;
  amber: string;
  grey: string;
  fill: string;
  barBg: string;
  barInk: string;
  scanRgb: string;
  flicker: string;
  vignette: string;
  rainbow: string[] | null;
};

export type ThemeColorName =
  | "paper"
  | "ink"
  | "blue"
  | "teal"
  | "magenta"
  | "red"
  | "green"
  | "amber"
  | "grey";

export const lightTheme: Theme = {
  paper: "#ffffff",
  ink: "#151515",
  blue: "#0000aa",
  teal: "#00707a",
  magenta: "#a800a8",
  red: "#c01c1c",
  green: "#0a7a2f",
  amber: "#b45f06",
  grey: "#8a8a80",
  fill: "#c9c7bd",
  barBg: "#151515",
  barInk: "#ffffff",
  scanRgb: "10,10,10",
  flicker: "#0a0a0a",
  vignette:
    "inset 0 0 220px rgba(10,10,10,0.18), inset 0 0 60px rgba(10,10,10,0.1)",
  rainbow: null,
};

export const colorTheme: Theme = {
  paper: "#000000",
  ink: "#f4f4f4",
  blue: "#2f9bff",
  teal: "#3ad0c8",
  magenta: "#ff6bd6",
  red: "#e8412c",
  green: "#5cc93f",
  amber: "#f5a623",
  grey: "#8f8f88",
  fill: "#3a3a34",
  barBg: "#0b3a8f",
  barInk: "#ffffff",
  scanRgb: "255,255,255",
  flicker: "#ffffff",
  vignette: "none",
  rainbow: ["#e8412c", "#f5a623", "#f7e04b", "#5cc93f", "#2f9bff"],
};

export const ThemeContext = React.createContext<Theme>(lightTheme);

export const useTheme = (): Theme => React.useContext(ThemeContext);

export const headingPaint = (theme: Theme): React.CSSProperties =>
  theme.rainbow
    ? {
        backgroundImage: `linear-gradient(115deg, ${theme.rainbow.join(", ")})`,
        WebkitBackgroundClip: "text",
        backgroundClip: "text",
        color: "transparent",
      }
    : { color: theme.ink };

export const themeColor = (theme: Theme, color: ThemeColorName): string =>
  theme[color];
