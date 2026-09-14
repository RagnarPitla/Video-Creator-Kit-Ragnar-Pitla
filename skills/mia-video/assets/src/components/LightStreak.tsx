import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';

/**
 * The cyan comet that shoots through the hall - the one bright accent in an
 * otherwise near-white frame, so it decides where the eye lands.
 */
export const LightStreak: React.FC<{
  startFrame?: number;
  travelFrames?: number;
  y?: number;
  scale?: number;
  reverse?: boolean;
}> = ({startFrame = 0, travelFrames = 105, y = 46, scale = 1, reverse = false}) => {
  const frame = useCurrentFrame();

  const progress = interpolate(
    frame,
    [startFrame, startFrame + travelFrames],
    reverse ? [116, -18] : [-18, 116],
    {
      easing: Easing.bezier(0.32, 0, 0.2, 1),
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    },
  );

  const opacity = interpolate(
    frame,
    [
      startFrame,
      startFrame + 12,
      startFrame + travelFrames - 24,
      startFrame + travelFrames,
    ],
    [0, 1, 1, 0],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
  );

  const tailOffset = reverse ? 320 : -320;

  return (
    <AbsoluteFill>
      <div
        style={{
          position: 'absolute',
          left: `${progress}%`,
          top: `${y}%`,
          translate: '-50% -50%',
          scale,
          opacity,
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            translate: '-50% -50%',
            width: 980,
            height: 300,
            borderRadius: '50%',
            filter: 'blur(46px)',
            background:
              'radial-gradient(ellipse at center, rgba(120,225,255,0.62) 0%, rgba(52,190,236,0.3) 42%, rgba(52,190,236,0) 72%)',
          }}
        />

        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            translate: `calc(-50% + ${tailOffset}px) -50%`,
            width: 700,
            height: 30,
            borderRadius: 99,
            filter: 'blur(7px)',
            background: reverse
              ? 'linear-gradient(270deg, rgba(52,190,236,0) 0%, rgba(70,208,246,0.5) 62%, rgba(214,250,255,0.95) 100%)'
              : 'linear-gradient(90deg, rgba(52,190,236,0) 0%, rgba(70,208,246,0.5) 62%, rgba(214,250,255,0.95) 100%)',
          }}
        />

        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            translate: '-50% -50%',
            width: 330,
            height: 92,
            borderRadius: '50%',
            border: '3px solid rgba(126,226,255,0.72)',
            rotate: '-3deg',
            filter: 'blur(1.4px)',
            boxShadow: '0 0 26px rgba(70,208,246,0.55)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            translate: '-50% -50%',
            width: 214,
            height: 62,
            borderRadius: '50%',
            border: '2px solid rgba(180,242,255,0.8)',
            rotate: '-3deg',
            filter: 'blur(1px)',
          }}
        />

        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            translate: '-50% -50%',
            width: 1180,
            height: 3,
            filter: 'blur(2px)',
            background:
              'linear-gradient(90deg, rgba(180,240,255,0) 0%, rgba(226,252,255,0.9) 50%, rgba(180,240,255,0) 100%)',
          }}
        />

        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            translate: '-50% -50%',
            width: 96,
            height: 40,
            borderRadius: '50%',
            background:
              'radial-gradient(ellipse at center, #FFFFFF 0%, #C6F4FF 42%, rgba(120,225,255,0) 78%)',
            boxShadow: '0 0 60px rgba(120,225,255,0.9)',
          }}
        />
      </div>
    </AbsoluteFill>
  );
};
