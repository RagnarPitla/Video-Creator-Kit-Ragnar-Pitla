import React from "react";
import { AbsoluteFill, Easing, Img, interpolate, OffthreadVideo, useCurrentFrame } from "remotion";
import { useTheme } from "../theme";
import { entranceFade } from "../motion";

export type Focal = {
  /** Horizontal point of interest as a fraction of the source, 0 = left, 1 = right. */
  x: number;
  /** Vertical point of interest as a fraction of the source. */
  y: number;
  /** Magnification. The style rule is 2 to 3; below 2 the viewer has to squint. */
  zoom: number;
};

export type ScreenRecProps = {
  /** Path under `public/`, or a remote URL. */
  src: string;
  /** Defaults to guessing from the extension. */
  kind?: "video" | "image";
  /** Where the shot starts. */
  focal: Focal;
  /** Where it drifts to. Omit for a static punch-in. */
  focalTo?: Focal;
  /** Window size on the canvas. Defaults to a 16:9 well inside a 1080p frame. */
  width?: number;
  height?: number;
  from?: number;
  /** Frames the pan takes. Defaults to the whole sequence via `durationInFrames`. */
  durationInFrames?: number;
  radius?: number;
  /** Frames the window takes to fade up. */
  fadeIn?: number;
  style?: React.CSSProperties;
};

const isVideo = (src: string) => /\.(mp4|webm|mov|m4v)(\?|$)/i.test(src);

/**
 * Real footage, punched in hard and framed on the one thing being named.
 *
 * The practical rule from the teardown: if the viewer has to squint at a real UI,
 * the shot is wrong. So this component has no "fit" mode. It always magnifies, and
 * it always parks the focal point dead centre, which is why the transform is
 * translate-then-scale off a 0 0 origin rather than a transform-origin percentage
 * (that would pin the focal point wherever it already happened to be).
 *
 * It sits on `bgDeep`, not `bg`, so the recording's own black does not read as a
 * lighter rectangle floating on the canvas.
 */
export const ScreenRec: React.FC<ScreenRecProps> = ({
  src,
  kind,
  focal,
  focalTo,
  width = 1600,
  height = 900,
  from = 0,
  durationInFrames,
  radius = 18,
  fadeIn = 12,
  style,
}) => {
  const t = useTheme();
  const frame = useCurrentFrame();

  const span = durationInFrames ?? 240;
  const p = interpolate(frame, [from, from + span], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    // Linear would be a dolly. Eased at both ends reads as a camera settling.
    easing: Easing.inOut(Easing.quad),
  });

  const end = focalTo ?? focal;
  const fx = interpolate(p, [0, 1], [focal.x, end.x]);
  const fy = interpolate(p, [0, 1], [focal.y, end.y]);
  const z = interpolate(p, [0, 1], [focal.zoom, end.zoom]);

  const opacity = entranceFade(frame, from, fadeIn, undefined);

  // Put the source fraction (fx, fy) at the centre of the window: scale about the
  // top-left, then slide the scaled point back to 50%/50%.
  const tx = (0.5 - fx * z) * width;
  const ty = (0.5 - fy * z) * height;

  const useVideo = kind ? kind === "video" : isVideo(src);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: t.bgDeep,
        alignItems: "center",
        justifyContent: "center",
        ...style,
      }}
    >
      <div
        style={{
          width,
          height,
          borderRadius: radius,
          overflow: "hidden",
          backgroundColor: t.bgDeep,
          opacity,
        }}
      >
        <div
          style={{
            width,
            height,
            transform: `translate(${tx}px, ${ty}px) scale(${z})`,
            transformOrigin: "0 0",
          }}
        >
          {useVideo ? (
            <OffthreadVideo
              src={src}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <Img src={src} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          )}
        </div>
      </div>
    </AbsoluteFill>
  );
};
