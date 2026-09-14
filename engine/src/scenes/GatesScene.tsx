import React from "react";
import { Canvas, ChecklistGates, Connector, Terminal } from "../../../shared/brand/ailabs-explainer";

/**
 * Shot 4 -- a command and the gates it has to clear, joined by a standalone
 * Connector so the causality is drawn rather than narrated.
 *
 * This is the one shot where real words earn their place: a gate is a claim about
 * observable behaviour, and `the checkout page loads` cannot be a grey pill without
 * losing the entire point.
 */
export const GatesScene: React.FC = () => (
  <Canvas padding={120} driftScale={1.02} driftPx={{ x: -8, y: 6 }}>
    <div style={{ position: "relative", width: 1620, height: 780 }}>
      <div style={{ position: "absolute", left: 40, top: 20 }}>
        <Terminal
          prompt="~/desktop/checkout"
          command="npx agent build"
          outputs={["planning ...", "3 gates written to gates.md"]}
          width={760}
          fontSize={26}
          from={0}
          cps={22}
        />
      </div>

      <Connector
        from={{ x: 420, y: 292 }}
        to={{ x: 648, y: 372 }}
        fromFrame={58}
        duration={18}
      />

      <div style={{ position: "absolute", left: 620, top: 380 }}>
        <ChecklistGates
          width={940}
          fontSize={28}
          from={78}
          stagger={30}
          rows={[
            { label: "the checkout page loads", sub: ["opened it, no console errors"] },
            { label: "prices render from the api", sub: ["3 requests, all 200"] },
            { label: "the cart survives a reload", sub: 2 },
          ]}
        />
      </div>
    </div>
  </Canvas>
);
