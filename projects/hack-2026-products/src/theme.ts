export const theme = {
  bg0: "#070615",
  bg1: "#0E0B26",
  bg2: "#161038",
  ink: "#F6F4FF",
  inkSoft: "#B9B2E8",
  inkFaint: "#6F67A8",
  rule: "#2A2358",
  fps: 30,
  width: 1920,
  height: 1080,
  font: '"Helvetica Neue", Helvetica, Arial, system-ui, sans-serif',
  mono: '"SF Mono", Menlo, Consolas, "Courier New", monospace',
} as const;

export const DURATION_FRAMES = 1560; // 52 seconds at 30fps, well under the 2:00 cap
