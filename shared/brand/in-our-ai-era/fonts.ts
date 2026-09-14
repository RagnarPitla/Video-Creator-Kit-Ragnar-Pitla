import { loadFont as loadIbmPlexMono } from "@remotion/google-fonts/IBMPlexMono";
import { loadFont as loadPressStart } from "@remotion/google-fonts/PressStart2P";
import { loadFont as loadVt323 } from "@remotion/google-fonts/VT323";

// Font families resolve to 'Press Start TwoP', 'VTThreeTwoThree' and 'IBM Plex Mono'.
// Those literals are written inline in every style prop so Remotion Studio can edit them.
loadPressStart("normal", { weights: ["400"], subsets: ["latin"] });
loadVt323("normal", { weights: ["400"], subsets: ["latin"] });
loadIbmPlexMono("normal", {
  weights: ["400", "600", "700"],
  subsets: ["latin"],
});
