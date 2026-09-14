import { loadFont as loadJetBrainsMono } from "@remotion/google-fonts/JetBrainsMono";

/**
 * The style uses exactly one typeface. Real words are rare enough in this
 * vocabulary (`unlazy`, `gates.md`, `10 min`) that a single monospace at three
 * weights covers every case, and a second family would immediately read as a
 * different video.
 *
 * Resolves to the family literal 'JetBrains Mono', which is what `theme.mono` holds.
 */
loadJetBrainsMono("normal", {
  weights: ["400", "500", "700"],
  subsets: ["latin"],
});

export const MONO = "JetBrains Mono";
