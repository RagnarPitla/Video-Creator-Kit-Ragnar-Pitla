import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Backdrop} from './Backdrop';
import {FloatingField} from './FloatingField';
import {LightStreak} from './LightStreak';
import {People} from './People';

/**
 * Everything behind the copy: hall, people, floating glass, comet, scrim.
 * Each scene dials this in differently so the shots do not look identical.
 */
export const Stage: React.FC<{
  vanishX?: number;
  vanishY?: number;
  zoomFrom?: number;
  zoomTo?: number;
  fieldOpacity?: number;
  people?: boolean;
  streak?: boolean;
  streakStart?: number;
  streakTravel?: number;
  streakY?: number;
  streakScale?: number;
  streakReverse?: boolean;
  /** 0 = no veil, 1 = full white veil under the copy. */
  scrim?: number;
}> = ({
  vanishX = 960,
  vanishY = 520,
  zoomFrom = 1.14,
  zoomTo = 1.02,
  fieldOpacity = 1,
  people = true,
  streak = false,
  streakStart = 0,
  streakTravel = 105,
  streakY = 46,
  streakScale = 1,
  streakReverse = false,
  scrim = 0.55,
}) => {
  return (
    <AbsoluteFill>
      <Backdrop
        vanishX={vanishX}
        vanishY={vanishY}
        zoomFrom={zoomFrom}
        zoomTo={zoomTo}
      />
      {people ? <People /> : null}
      <FloatingField opacity={fieldOpacity} />      {streak ? (
        <LightStreak
          startFrame={streakStart}
          travelFrames={streakTravel}
          y={streakY}
          scale={streakScale}
          reverse={streakReverse}
        />
      ) : null}
      <AbsoluteFill
        style={{
          opacity: scrim,
          background:
            'radial-gradient(78% 72% at 50% 50%, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.8) 46%, rgba(255,255,255,0.12) 100%)',
        }}
      />
    </AbsoluteFill>
  );
};
