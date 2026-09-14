import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { useTheme } from "../theme";
import { entranceSpring } from "../motion";

export type CardProps = {
  children?: React.ReactNode;
  width?: number | string;
  height?: number | string;
  padding?: number;
  /** `surface` is a card sitting on the background; `surfaceAlt` is a well cut into one. */
  tone?: "surface" | "surfaceAlt";
  radius?: number;
  /** 1px accent hairline. The cheapest way to mark a card without spending accent area. */
  accentBorder?: boolean;
  /** Fill the card with accent instead of surface. Use for at most one card per frame. */
  accentFill?: boolean;
  from?: number;
  /** Distance the card rises through on entrance. 14px is enough to read, small enough not to swoop. */
  rise?: number;
  style?: React.CSSProperties;
};

/**
 * The rounded surface container -- cards, panels, tree nodes, chips. `surface`
 * (#2C3439) is the only "material" in the style, so this is the only component
 * allowed to paint a large filled area.
 *
 * No shadow, no gradient, no border unless asked. Flat fills are not an aesthetic
 * preference here, they are the reason the reference encodes at 222 kbps.
 */
export const Card: React.FC<CardProps> = ({
  children,
  width,
  height,
  padding = 24,
  tone = "surface",
  radius,
  accentBorder = false,
  accentFill = false,
  from,
  rise = 14,
  style,
}) => {
  const t = useTheme();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // A spring rather than an ease so several cards entering on a stagger read as
  // one physical system. damping 200 keeps it critically damped -- no overshoot,
  // because a bouncing card is a different, chattier style than this one.
  const s = entranceSpring(frame, fps, from);

  const opacity = interpolate(s, [0, 0.6], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        width,
        height,
        padding,
        boxSizing: "border-box",
        borderRadius: radius ?? t.radiusCard,
        backgroundColor: accentFill ? t.accent : t[tone],
        border: accentBorder ? `1px solid ${t.accent}` : undefined,
        opacity,
        transform: `translateY(${(1 - s) * rise}px) scale(${interpolate(s, [0, 1], [0.965, 1])})`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};
