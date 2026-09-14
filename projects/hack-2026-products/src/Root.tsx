import React from "react";
import { Composition } from "remotion";
import { PRODUCTS } from "./products";
import { ProductFilm, FILM_FRAMES } from "./ProductFilm";
import { VisionStill } from "./VisionStill";
import { VisionBanner } from "./VisionBanner";
import { ClassFlowBanner } from "./ClassFlowBanner";
import { theme } from "./theme";

/**
 * Twelve compositions: one film and one vision still per product.
 *
 * The film duration is imported from the cut rather than typed here, so the
 * registry cannot disagree with the shots it is registering. FILM_FRAMES is
 * 1560 at 30fps, which is 52 seconds, inside the platform's 2:00 ceiling.
 */
export const RemotionRoot: React.FC = () => (
  <>
    {PRODUCTS.map((p) => (
      <React.Fragment key={p.id}>
        <Composition
          id={p.id}
          component={ProductFilm as React.FC<Record<string, unknown>>}
          durationInFrames={FILM_FRAMES}
          fps={theme.fps}
          width={theme.width}
          height={theme.height}
          defaultProps={{ product: p } as Record<string, unknown>}
        />
        <Composition
          id={`${p.id}Vision`}
          component={VisionStill as React.FC<Record<string, unknown>>}
          durationInFrames={1}
          fps={theme.fps}
          width={theme.width}
          height={theme.height}
          defaultProps={{ product: p } as Record<string, unknown>}
        />
        <Composition
          id={`${p.id}Banner`}
          component={VisionBanner as React.FC<Record<string, unknown>>}
          durationInFrames={1}
          fps={theme.fps}
          width={theme.width}
          height={theme.height}
          defaultProps={{ product: p } as Record<string, unknown>}
        />
      </React.Fragment>
    ))}
    {/* ClassFlow Copilot is a K-8 school product, so it gets its own light
        sky banner rather than the dark enterprise VisionBanner. */}
    <Composition
      id="ClassFlowBanner"
      component={ClassFlowBanner as React.FC<Record<string, unknown>>}
      durationInFrames={1}
      fps={theme.fps}
      width={theme.width}
      height={theme.height}
    />
  </>
);
