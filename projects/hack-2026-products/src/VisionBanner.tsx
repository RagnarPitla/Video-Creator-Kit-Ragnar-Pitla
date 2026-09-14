import React from "react";
import { AbsoluteFill } from "remotion";
import { theme } from "./theme";
import type { Product } from "./products";

/**
 * Bright product-showcase banner: vivid gradient field, headline stack, and an
 * angled browser mockup that runs off the bottom edge.
 *
 * Rendered as a single frame. Nothing here animates.
 */

type Skin = { from: string; mid: string; to: string; chip: string };

const SKINS: Record<string, Skin> = {
  ProjectHarnessBuilder: { from: "#3B2BD1", mid: "#2F6BE8", to: "#22C1E6", chip: "#7C6CFF" },
  AgentMemoryFoundry: { from: "#4B25C9", mid: "#3B5BEA", to: "#28A9F0", chip: "#8B7CFF" },
  AgentTeamVault: { from: "#6A21D6", mid: "#4A4DEA", to: "#29A6F2", chip: "#A47CFF" },
  AgentEvaluationWorkbench: { from: "#2C2FCC", mid: "#2A72EE", to: "#1FC6DE", chip: "#6E8BFF" },
  DynamicsAutopilot: { from: "#2A1FC7", mid: "#3363EE", to: "#20B6EA", chip: "#6C7CFF" },
  FieldRelay: { from: "#5A1FD2", mid: "#3F58EC", to: "#22B2F0", chip: "#9B7CFF" },
};

const UI = {
  panel: "#171334",
  panelDeep: "#0E0B24",
  white: "#FFFFFF",
  bodyInk: "#C9C4EA",
};

const BrowserMock: React.FC<{ p: Product; skin: Skin }> = ({ p, skin }) => (
  <div
    style={{
      width: 1520,
      borderRadius: 20,
      background: UI.white,
      boxShadow: "0 60px 120px rgba(6,10,60,0.45), 0 12px 34px rgba(6,10,60,0.28)",
      overflow: "hidden",
      border: "1px solid rgba(255,255,255,0.6)",
    }}
  >
    {/* chrome */}
    <div
      style={{
        height: 46,
        background: "#F4F5FA",
        display: "flex",
        alignItems: "center",
        padding: "0 20px",
        gap: 9,
        borderBottom: "1px solid #E4E6F0",
      }}
    >
      {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => (
        <div key={c} style={{ width: 12, height: 12, borderRadius: 999, background: c }} />
      ))}
      <div
        style={{
          marginLeft: 18,
          height: 24,
          flex: 1,
          maxWidth: 460,
          borderRadius: 999,
          background: "#E9EBF3",
          display: "flex",
          alignItems: "center",
          padding: "0 14px",
          fontFamily: theme.mono,
          fontSize: 12,
          color: "#7A80A0",
        }}
      >
        {p.name.toLowerCase().replace(/\s+/g, "-")}
      </div>
    </div>

    {/* hero */}
    <div style={{ display: "flex", height: 760, background: UI.panel }}>
      <div
        style={{
          flex: "0 0 55%",
          padding: "56px 48px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          background: `linear-gradient(150deg, ${UI.panel} 0%, ${UI.panelDeep} 100%)`,
        }}
      >
        <div
          style={{
            fontSize: 50,
            lineHeight: 1.14,
            fontWeight: 700,
            color: UI.white,
            letterSpacing: -1.4,
            marginBottom: 26,
          }}
        >
          {p.close}
        </div>
        <div
          style={{
            fontSize: 22,
            lineHeight: 1.6,
            color: UI.bodyInk,
            marginBottom: 36,
            maxWidth: 660,
          }}
        >
          {p.tagline}
        </div>
        <div
          style={{
            alignSelf: "flex-start",
            background: skin.chip,
            color: UI.white,
            fontSize: 16,
            fontWeight: 700,
            padding: "13px 28px",
            borderRadius: 8,
            letterSpacing: 0.2,
          }}
        >
          How it works
        </div>
      </div>

      {/* terminal */}
      <div
        style={{
          flex: 1,
          padding: "44px 44px 44px 8px",
          display: "flex",
          alignItems: "center",
        }}
      >
        <div
          style={{
            width: "100%",
            background: "#0A0820",
            borderRadius: 12,
            border: "1px solid #2A2358",
            padding: "24px 26px",
            fontFamily: theme.mono,
            fontSize: 16,
            lineHeight: 2.0,
            boxShadow: "0 22px 44px rgba(0,0,0,0.4)",
          }}
        >
          <div
            style={{
              color: "#6F67A8",
              fontSize: 13,
              letterSpacing: 1.4,
              marginBottom: 10,
              textTransform: "uppercase",
            }}
          >
            {p.name}
          </div>
          {p.beats.map((b, i) => (
            <div key={i} style={{ whiteSpace: "nowrap", overflow: "hidden" }}>
              <span style={{ color: skin.chip }}>$ </span>
              <span style={{ color: "#E8E6FA" }}>
                {b.label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}
              </span>
            </div>
          ))}
          <div style={{ whiteSpace: "nowrap", overflow: "hidden" }}>
            <span style={{ color: skin.chip }}>$ </span>
            <span style={{ color: "#E8E6FA" }}>verify --all</span>
          </div>
          <div
            style={{
              height: 1,
              background: "#2A2358",
              margin: "14px 0",
            }}
          />
          <div style={{ color: "#5DD6A0", whiteSpace: "nowrap" }}>ok  chain verified</div>
          <div style={{ color: "#5DD6A0", whiteSpace: "nowrap" }}>ok  receipt written</div>
        </div>
      </div>
    </div>
  </div>
);

export const VisionBanner: React.FC<{ product: Product }> = ({ product: p }) => {
  const skin = SKINS[p.id] ?? SKINS.ProjectHarnessBuilder;

  return (
    <AbsoluteFill style={{ fontFamily: theme.font, overflow: "hidden" }}>
      {/* vivid field */}
      <AbsoluteFill
        style={{
          background: `linear-gradient(135deg, ${skin.from} 0%, ${skin.mid} 48%, ${skin.to} 100%)`,
        }}
      />
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(60% 46% at 18% 8%, rgba(255,255,255,0.26) 0%, transparent 62%)",
        }}
      />
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(52% 40% at 88% 96%, rgba(255,255,255,0.16) 0%, transparent 66%)",
        }}
      />

      <AbsoluteFill style={{ alignItems: "center", paddingTop: 74 }}>
        <div
          style={{
            fontSize: 76,
            fontWeight: 700,
            color: UI.white,
            letterSpacing: -2,
            lineHeight: 1.02,
            textAlign: "center",
            textShadow: "0 3px 22px rgba(4,10,60,0.30)",
          }}
        >
          {p.name}
        </div>
        <div
          style={{
            marginTop: 16,
            fontSize: 27,
            fontWeight: 500,
            color: "rgba(255,255,255,0.93)",
            letterSpacing: 0.2,
            textAlign: "center",
          }}
        >
          Microsoft Global Hackathon 2026
          <span style={{ opacity: 0.55 }}>{"   /   "}</span>
          Hack for Agents in the Enterprise
        </div>

        <div
          style={{
            marginTop: 62,
            transform: "perspective(2100px) rotateX(7deg) rotateZ(-1.1deg)",
            transformOrigin: "50% 0%",
          }}
        >
          <BrowserMock p={p} skin={skin} />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
