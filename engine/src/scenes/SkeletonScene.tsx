import React from "react";
import { Callout, Canvas, Card, Pill, PillBlock } from "../../../shared/brand/ailabs-explainer";

/**
 * Shot 1 -- the skeleton vocabulary on its own: one accent line, grey pills for
 * everything else, two recessed sub-cards. If this shot reads as "a page" without
 * containing a single readable word, the vocabulary is working.
 */
export const SkeletonScene: React.FC = () => (
  <Canvas padding={110} driftPx={{ x: -10, y: -6 }}>
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 54 }}>
      <Callout boxed from={4} fontSize={26}>
        ailabs-explainer
      </Callout>

      <Card width={1180} height={470} padding={64} from={14}>
        <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
          {/* The one accent in the shot: the heading the narrator is on. */}
          <Pill width={268} height={18} tone="accent" from={30} />
          <div style={{ height: 26 }} />
          <PillBlock lines={3} width={880} height={16} tone="bright" from={40} seed={7} />

          <div style={{ flex: 1 }} />

          <div style={{ display: "flex", gap: 40 }}>
            {[0, 1].map((i) => (
              <Card key={i} tone="surfaceAlt" width={506} height={158} padding={34} from={72 + i * 10}>
                <Pill width={132} height={14} tone="bright" from={86 + i * 10} />
                <div style={{ height: 20 }} />
                <PillBlock
                  lines={2}
                  width={430}
                  height={12}
                  gap={12}
                  seed={3 + i}
                  from={92 + i * 10}
                />
              </Card>
            ))}
          </div>
        </div>
      </Card>

      <Callout tone="dim" fontSize={24} from={110}>
        pills, not text
      </Callout>
    </div>
  </Canvas>
);
