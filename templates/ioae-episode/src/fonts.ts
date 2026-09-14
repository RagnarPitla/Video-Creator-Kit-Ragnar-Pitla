import { loadFont as loadIbmPlexMono } from "@remotion/google-fonts/IBMPlexMono";
import { loadFont as loadPressStart } from "@remotion/google-fonts/PressStart2P";
import { loadFont as loadVt323 } from "@remotion/google-fonts/VT323";

loadPressStart("normal", { weights: ["400"], subsets: ["latin"] });
loadVt323("normal", { weights: ["400"], subsets: ["latin"] });
loadIbmPlexMono("normal", {
  weights: ["400", "600", "700"],
  subsets: ["latin"],
});
