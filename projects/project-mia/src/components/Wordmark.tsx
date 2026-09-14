import React from 'react';

/**
 * The Project Mia lettering, in one place.
 *
 * Review note 12 asked the end card to use the same lettering as the opening
 * title. Both S15Title and S18End now render this, so the two cannot drift:
 * one weight, one tracking, one gradient. Only the size differs, because the
 * end card has to leave room for three pillars underneath it.
 *
 * Two details are load-bearing:
 *
 * - `lineHeight` is 1.3, not 1. With `background-clip: text` the paint box is
 *   the line box, so a descender hanging below it loses its fill entirely.
 *   That is what cut the "j" off "Project" through v6 (review note 2).
 * - The element must be shrink-to-fit. A gradient on a full-width block spans
 *   1920px, so the glyphs only ever sample the middle of the ramp and the
 *   cyan end never appears. Both callers place it inside a centring flex row.
 */
export const WORDMARK_GRADIENT =
  'linear-gradient(97deg, #10BCD4 0%, #2B6BE4 30%, #5A57DE 52%, #8A4BD3 74%, #E0479B 100%)';

export const Wordmark: React.FC<{
  text: string;
  size: number;
  style?: React.CSSProperties;
}> = ({text, size, style}) => (
  <div
    style={{
      fontFamily: 'Segoe UI',
      fontWeight: 600,
      fontSize: size,
      letterSpacing: '-0.022em',
      lineHeight: 1.3,
      paddingBottom: Math.round(size * 0.08),
      whiteSpace: 'nowrap',
      background: WORDMARK_GRADIENT,
      WebkitBackgroundClip: 'text',
      backgroundClip: 'text',
      color: 'transparent',
      ...style,
    }}
  >
    {text}
  </div>
);
