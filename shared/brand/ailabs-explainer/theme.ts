import React from "react";

/**
 * Every colour and every geometry constant in the `ailabs-explainer` style comes
 * from here. The values are measured off the reference video, not invented -- see
 * `references/ailabs-unlazy/TEARDOWN.md` section 4 for the sampling method.
 *
 * The geometry tokens live in the theme alongside the palette on purpose. In this
 * style the radii and pill heights carry as much of the identity as the colours
 * do: a 7px pill reads as a line of body text, a 24px pill reads as a button.
 */
export type Theme = {
  /** Primary background. 77% of the reference's diagram frames are this exact value. */
  bg: string;
  /** Near-pure black used only behind punched-in screen recordings. */
  bgDeep: string;
  /** Cool dark slate. The only "material" in the style -- cards, nodes, panels. */
  surface: string;
  /** Recessed panels: url fields, terminal bodies, inset wells. */
  surfaceAlt: string;
  /** Stands in for a heading line. Never real text unless the word is the point. */
  pillBright: string;
  /** Stands in for body copy. */
  pillDim: string;
  /**
   * Terracotta. EXACTLY ONE accent colour in the whole style, held to roughly 2%
   * of frame coverage. It marks the single thing being narrated right now.
   * When the accent moves, the viewer's eye moves. That is the entire trick.
   */
  accent: string;
  /** Thin bezier connectors between nodes. */
  connector: string;
  trafficRed: string;
  trafficYellow: string;
  trafficGreen: string;

  /** Pill corner radius. Measured at ~7px on 1080p. */
  radiusPill: number;
  /** Card / node corner radius. Measured between 10 and 14px on 1080p. */
  radiusCard: number;
  /** Default skeleton line height. Measured between 14 and 18px on 1080p. */
  pillHeight: number;
  /** Connector stroke width. Measured at ~2px. */
  connectorWidth: number;
  /** Monospace family. Real text is monospace, lowercase, small. No display type. */
  mono: string;
};

export const ailabsTheme: Theme = {
  bg: "#0D0D0D",
  bgDeep: "#030303",
  surface: "#2C3439",
  surfaceAlt: "#1A1F21",
  pillBright: "#8A9199",
  pillDim: "#5A6169",
  accent: "#CE6F57",
  connector: "#6B7280",
  trafficRed: "#FF5F57",
  trafficYellow: "#FEBC2E",
  trafficGreen: "#28C840",

  radiusPill: 7,
  radiusCard: 12,
  pillHeight: 16,
  connectorWidth: 2,
  mono: "JetBrains Mono",
};

export const ThemeContext = React.createContext<Theme>(ailabsTheme);

export const useTheme = (): Theme => React.useContext(ThemeContext);

/**
 * The only three states a skeleton element is allowed to be in. Restricting the
 * vocabulary to three tones is what keeps the accent budget at ~2%: if a component
 * cannot express "slightly important", it cannot leak a fourth colour into the frame.
 */
export type Tone = "bright" | "dim" | "accent";

export const toneColor = (t: Theme, tone: Tone): string =>
  tone === "accent" ? t.accent : tone === "bright" ? t.pillBright : t.pillDim;

/**
 * Deterministic pseudo-random in [0,1) from an integer seed.
 *
 * Skeleton copy has to look like real ragged text, but Remotion renders frames out
 * of order across threads, so `Math.random()` would produce a different paragraph on
 * every frame. This is a plain integer hash: same seed, same value, every process.
 */
export const seededUnit = (seed: number): number => {
  let x = (seed + 0x9e3779b9) | 0;
  x = Math.imul(x ^ (x >>> 16), 0x21f0aaad);
  x = Math.imul(x ^ (x >>> 15), 0x735a2d97);
  x = x ^ (x >>> 15);
  return (x >>> 0) / 4294967296;
};
