import React from "react";
import { PixelArt } from "./PixelArt";
import { SPRITES, type SpriteName } from "./sprites";

export const Sprite: React.FC<{
  name: SpriteName;
  pixel: number;
  startFrame?: number;
  framesPerRow?: number;
}> = ({ name, pixel, startFrame, framesPerRow }) => (
  <PixelArt
    rows={SPRITES[name]}
    pixel={pixel}
    startFrame={startFrame}
    framesPerRow={framesPerRow}
  />
);
