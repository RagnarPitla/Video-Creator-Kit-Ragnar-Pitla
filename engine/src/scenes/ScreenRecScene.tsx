import React from "react";
import { staticFile } from "remotion";
import { Callout, Canvas, ScreenRec } from "../../../shared/brand/ailabs-explainer";

/**
 * Shot 6 -- real footage, punched in to 300% and drifting onto the command.
 *
 * `deep` and `drift={false}` are both deliberate: the recording brings its own
 * black, so the canvas drops to #030303 to stop the window reading as a lighter
 * rectangle, and the only motion in the shot is ScreenRec's own pan. Two moving
 * cameras at once is seasickness.
 *
 * The focal points are not free choices. At these zooms the visible source region
 * is x 279..990 / y 578..978 at the start and x 342..982 / y 595..955 at the end;
 * the command in `public/screen-rec.mp4` spans x 360..955, y 760..792, so it stays
 * inside both. Change the zoom and you have to re-derive them.
 */
export const ScreenRecScene: React.FC = () => (
  <Canvas deep drift={false} padding={0}>
    <ScreenRec
      src={staticFile("screen-rec.mp4")}
      focal={{ x: 0.33, y: 0.72, zoom: 2.7 }}
      focalTo={{ x: 0.345, y: 0.718, zoom: 3.0 }}
      width={1520}
      height={820}
      durationInFrames={120}
    />
    {/* Sits below the window (which ends at y=950), not on top of it. */}
    <Callout tone="dim" fontSize={24} x={200} y={988} from={30}>
      punched in until the command is unmissable
    </Callout>
  </Canvas>
);
