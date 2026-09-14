import React from "react";
import { useCurrentFrame } from "remotion";
import { Callout, Canvas, Terminal } from "../../../../../shared/brand/ailabs-explainer";

/**
 * S10 -- the gate proven against a known-bad input. Frames 4440-4782 (343).
 *
 * Local cue: proven 0 (336 frames)
 *   0-115   "before I trusted mine, I ran it against the broken render"
 *   116-210 "exit one, and it named the four bad frames"
 *   210-262 "then against the fixed render"
 *   262-284 "exit zero"
 *   284-336 "now a pass carries information"
 *
 * Both panels are on screen at the cut and only the typing is scheduled, which is
 * what `typeDelay` is for -- `from` would have delayed the panel too.
 *
 * `Terminal` paints an accent caret unconditionally and has no prop to turn it
 * off, so two terminals in one frame means two accents. The first still probe at
 * frame 4740 showed exactly that: two carets plus an exit code, three accents in
 * a style that allows one. Rather than edit the shared library, each panel is
 * wrapped in a `grayscale(1)` filter while it is not the thing being narrated.
 * Everything else in the panel is already grey, so the filter only ever touches
 * the caret. The accent then runs: top caret -> `exit 1` -> bottom caret ->
 * `exit 0`, one at a time.
 *
 * Every string is traceable. `blank frames at 180, 390, 750, 1080` and the exit
 * codes are the `research.md` results table; the fixed-render block is its
 * verbatim recorded run.
 */

const COMMAND = "node scripts/blank-frames.mjs out/style-proof.mp4 --allow-head 5";

const TOP_LIVE_UNTIL = 168;
const EXIT_ONE_UNTIL = 214;
const BOTTOM_LIVE_UNTIL = 286;

const Run: React.FC<{
  label: string;
  labelFrom: number;
  typeDelay: number;
  outputs: string[];
  exitCode: string;
  exitFrom: number;
  exitAccent: boolean;
  live: boolean;
}> = ({ label, labelFrom, typeDelay, outputs, exitCode, exitFrom, exitAccent, live }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
    <div style={{ display: "flex", alignItems: "center", width: 1240 }}>
      <Callout tone="dim" fontSize={23} from={labelFrom}>
        {label}
      </Callout>
      <div style={{ flex: 1 }} />
      <Callout tone={exitAccent ? "accent" : "dim"} fontSize={26} from={exitFrom} duration={14}>
        {exitCode}
      </Callout>
    </div>
    <div style={{ filter: live ? undefined : "grayscale(1)" }}>
      <Terminal
        prompt="~/video-agent-kit/engine"
        command={COMMAND}
        outputs={outputs}
        width={1240}
        fontSize={24}
        from={0}
        typeDelay={typeDelay}
        cps={20}
        outputStagger={12}
      />
    </div>
  </div>
);

export const S10: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <Canvas padding={120} drift={false}>
      <div style={{ display: "flex", flexDirection: "column", gap: 44 }}>
        <Run
          label="the broken render"
          labelFrom={8}
          typeDelay={16}
          outputs={[
            "  frames scanned  1200",
            "  blank frames at 180, 390, 750, 1080",
            "FAIL: 4 blank frame(s) in 4 run(s).",
          ]}
          exitCode="exit 1"
          exitFrom={168}
          exitAccent={frame >= TOP_LIVE_UNTIL && frame < EXIT_ONE_UNTIL}
          live={frame < TOP_LIVE_UNTIL}
        />

        <Run
          label="the fixed render"
          labelFrom={214}
          typeDelay={168}
          outputs={[
            "  frames scanned  1200",
            "  ok    f0-4 (5 frame(s)) within allowed head",
            "PASS: no blank frames outside the first 5.",
          ]}
          exitCode="exit 0"
          exitFrom={286}
          exitAccent={frame >= BOTTOM_LIVE_UNTIL}
          live={frame >= EXIT_ONE_UNTIL && frame < BOTTOM_LIVE_UNTIL}
        />
      </div>
    </Canvas>
  );
};
