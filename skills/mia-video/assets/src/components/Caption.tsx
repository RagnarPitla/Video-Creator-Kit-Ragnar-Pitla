import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {EASE} from '../lib/motion';
import {SplitWords} from './WordMask';

/**
 * The closing line of a shot. Extracted because all six "gap" scenes end the
 * same way and the drift-up on the block is easy to get subtly wrong when it
 * is copied by hand.
 */
export const Caption: React.FC<{
  text: string;
  start: number;
  end: number;
  size?: number;
  stagger?: number;
  align?: 'center' | 'flex-start';
  bottom?: number;
  left?: number;
  maxWidth?: number;
}> = ({
  text,
  start,
  end,
  size = 66,
  stagger = 4,
  align = 'center',
  bottom = 104,
  left = 0,
  maxWidth = 1480,
}) => {
  const frame = useCurrentFrame();

  const rise = interpolate(frame, [start, end], [0, -9], {
    easing: EASE.drift,
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        alignItems: align,
        justifyContent: 'flex-end',
        paddingBottom: bottom,
        paddingLeft: left,
      }}
    >
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: align === 'center' ? 'center' : 'flex-start',
          gap: '0em 0.3em',
          maxWidth,
          fontFamily: 'Segoe UI',
          fontWeight: 350,
          fontSize: size,
          lineHeight: 1.14,
          letterSpacing: '-0.012em',
          color: '#34383F',
          textAlign: align === 'center' ? 'center' : 'left',
          translate: `0px ${rise}px`,
        }}
      >
        <SplitWords text={text} start={start} stagger={stagger} />
      </div>
    </AbsoluteFill>
  );
};
