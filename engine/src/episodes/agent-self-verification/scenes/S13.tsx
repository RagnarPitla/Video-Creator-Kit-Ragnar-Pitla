import React from "react";
import { Callout, Canvas, Terminal } from "../../../../../shared/brand/ailabs-explainer";

/**
 * S13 -- the command itself. Frames 5549-5836 (288).
 *
 * Local cues: in-practice 0 | command 78
 *
 * Accent per shots.json: the caret. `Terminal` supplies it, blinking on a 30-frame
 * period, and nothing else in the frame is accented -- which is the whole reason
 * the caret reads as the live thing.
 *
 * `from={0}` puts the panel on screen at the cut; the typing is delayed with
 * `typeDelay` so it starts on the `command` cue at local frame 78. Using `from`
 * for that delay would have withheld the panel too.
 *
 * 62 characters at cps 20 is 93 frames of typing: 78 -> 171, then the output block
 * lands 181/193/205 and holds to the cut.
 */

export const S13: React.FC = () => (
  <Canvas padding={130} drift driftScale={1.02} driftPx={{ x: 8, y: -8 }}>
    <div style={{ display: "flex", flexDirection: "column", gap: 30 }}>
      <Callout tone="dim" fontSize={26} from={14} duration={16}>
        one script, one line
      </Callout>
      <Terminal
        prompt="~/video-agent-kit/engine"
        command="node scripts/blank-frames.mjs out/style-proof.mp4 --allow-head 5"
        outputs={[
          "  frames scanned  1200",
          "  ok    f0-4 (5 frame(s)) within allowed head",
          "PASS: no blank frames outside the first 5.",
        ]}
        width={1380}
        fontSize={28}
        from={0}
        typeDelay={78}
        cps={20}
        outputStagger={12}
      />
    </div>
  </Canvas>
);
