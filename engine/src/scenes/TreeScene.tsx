import React from "react";
import { useCurrentFrame } from "remotion";
import { Callout, Canvas, TreeDiagram } from "../../../shared/brand/ailabs-explainer";

/**
 * The accent's itinerary through the 12s hold. This is the behaviour the whole
 * style exists for: the shot never cuts, but the subject changes three times
 * because one pill changes colour.
 */
const ACCENT_STOPS: { at: number; id: string; label: string }[] = [
  { at: 0, id: "l0n0", label: "the root task" },
  { at: 150, id: "l1n1", label: "one branch" },
  { at: 250, id: "l2n7", label: "a leaf that has to prove it" },
];

/**
 * Shot 3 -- the hero motif, rebuilt from `analysis/m_340s.jpg`: one root, three mid
 * nodes, nine leaves, curved connectors drawing on top-down.
 *
 * The defaults in TreeDiagram are the measured ones, so this scene passes almost
 * nothing: matching the reference frame is the library's job, not the scene's.
 */
export const TreeScene: React.FC = () => {
  const frame = useCurrentFrame();
  const stop =
    [...ACCENT_STOPS].reverse().find((s) => frame >= s.at) ?? ACCENT_STOPS[0];

  return (
    <Canvas padding={120} driftScale={1.03} driftPx={{ x: -16, y: -10 }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 46 }}>
        {/* from={0} rather than a delay: the root has to be on screen on the shot's
            first frame or the cut lands on an empty canvas. The wave still runs --
            level 1 at frame 26, level 2 at 52. See motion.ts. */}
        <TreeDiagram depth={3} branching={3} highlight={stop.id} from={0} />
        <Callout
          // Remounting on the stop id restarts the fade, so the label changes with
          // the accent instead of silently swapping text mid-hold.
          key={stop.id}
          tone="dim"
          fontSize={24}
          from={stop.at}
          duration={16}
        >
          {stop.label}
        </Callout>
      </div>
    </Canvas>
  );
};
