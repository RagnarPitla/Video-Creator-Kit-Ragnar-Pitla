import React from 'react';
import {Easing, interpolate, useCurrentFrame} from 'remotion';

/**
 * A single word that wipes up from behind a clipping edge.
 * Meant to be used as a flex item so the clipping never disturbs the baseline.
 */
export const WordMask: React.FC<{start: number; children: React.ReactNode}> = ({
  start,
  children,
}) => {
  const frame = useCurrentFrame();

  return (
    <span
      style={{
        display: 'block',
        overflow: 'hidden',
        paddingBottom: '0.18em',
        marginBottom: '-0.18em',
      }}
    >
      <span
        style={{
          display: 'block',
          translate: interpolate(frame, [start, start + 26], ['0em 1.25em', '0em 0em'], {
            easing: Easing.bezier(0.16, 1, 0.3, 1),
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          }),
          opacity: interpolate(frame, [start, start + 18], [0, 1], {
            easing: Easing.bezier(0.16, 1, 0.3, 1),
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          }),
        }}
      >
        {children}
      </span>
    </span>
  );
};

/**
 * Splits a string into words and staggers each one through `WordMask`.
 * Place inside a `display: flex; flex-wrap: wrap` container.
 */
export const SplitWords: React.FC<{
  text: string;
  start: number;
  stagger?: number;
  indexOffset?: number;
  wordStyle?: React.CSSProperties;
}> = ({text, start, stagger = 4, indexOffset = 0, wordStyle}) => {
  return (
    <>
      {text
        .split(' ')
        .filter(Boolean)
        .map((word, i) => (
          <WordMask key={`${word}-${i}`} start={start + (i + indexOffset) * stagger}>
            <span style={wordStyle}>{word}</span>
          </WordMask>
        ))}
    </>
  );
};
