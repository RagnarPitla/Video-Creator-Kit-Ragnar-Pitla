import React from "react";
import { BrowserChrome, Canvas, Card, Pill } from "../../../shared/brand/ailabs-explainer";

/** Bar heights of the mock chart. One of them is the accent; the rest are surface. */
const BARS: number[] = [110, 166, 96, 208, 140];
const ACCENT_BAR = 3;

/**
 * Shot 2 -- the fake browser motif, rebuilt from `analysis/m_100s.jpg`.
 *
 * The window is 1440x848 with a 70px chrome bar, which is what the reference
 * measures at 1080p. Everything inside it is skeleton except the URL: `localhost:3000`
 * is one of the handful of real strings the style allows, because a URL that says
 * nothing would not read as a browser.
 */
export const BrowserScene: React.FC = () => (
  <Canvas padding={90} driftPx={{ x: 8, y: -6 }} driftScale={1.018}>
    <BrowserChrome width={1440} height={848} url="localhost:3000" from={0}>
      <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
        <div style={{ display: "flex", alignItems: "center", height: 44 }}>
          <Card width={40} height={40} padding={0} radius={10} accentFill from={16} />
          <div style={{ width: 20 }} />
          <Pill width={110} height={14} tone="bright" from={20} />
          <div style={{ flex: 1 }} />
          <div style={{ display: "flex", alignItems: "center", gap: 40 }}>
            {[70, 84, 58].map((w, i) => (
              <Pill key={w} width={w} height={12} tone="dim" from={24 + i * 3} />
            ))}
            <Card tone="surfaceAlt" width={138} height={44} padding={0} radius={8} from={34} />
          </div>
        </div>

        <div style={{ height: 46 }} />

        <div style={{ display: "flex", gap: 74 }}>
          <div style={{ width: 620, display: "flex", flexDirection: "column" }}>
            {/* Accent heading: the thing being narrated. */}
            <Pill width={126} height={22} tone="accent" from={40} />
            <div style={{ height: 24 }} />
            <Pill width={518} height={22} tone="bright" from={46} />
            <div style={{ height: 16 }} />
            <Pill width={356} height={22} tone="bright" from={50} />
            <div style={{ height: 26 }} />
            <Pill width={550} height={14} tone="dim" from={56} />
            <div style={{ height: 14 }} />
            <Pill width={446} height={14} tone="dim" from={60} />
            <div style={{ height: 38 }} />
            <Card width={228} height={62} padding={0} radius={10} accentFill from={70} />
          </div>

          <Card tone="surfaceAlt" width={626} height={310} padding={34} from={44}>
            <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
              <Pill width={186} height={14} tone="bright" from={56} />
              <div style={{ flex: 1 }} />
              <div style={{ display: "flex", alignItems: "flex-end", gap: 30 }}>
                {BARS.map((h, i) => (
                  <Card
                    key={i}
                    width={82}
                    height={h}
                    padding={0}
                    radius={6}
                    accentFill={i === ACCENT_BAR}
                    from={62 + i * 4}
                    rise={0}
                  />
                ))}
              </div>
            </div>
          </Card>
        </div>

        <div style={{ height: 44 }} />

        <div style={{ display: "flex", gap: 24 }}>
          {[0, 1, 2].map((i) => (
            <Card key={i} tone="surfaceAlt" width={424} height={208} padding={34} from={86 + i * 8}>
              <Card width={58} height={58} padding={0} radius={10} from={94 + i * 8} />
              <div style={{ height: 34 }} />
              <Pill width={222} height={14} tone="bright" from={98 + i * 8} />
              <div style={{ height: 12 }} />
              <Pill width={150} height={14} tone="dim" from={102 + i * 8} />
            </Card>
          ))}
        </div>
      </div>
    </BrowserChrome>
  </Canvas>
);
