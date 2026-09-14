import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {z} from 'zod';
import {Handshake} from '../components/Handshake';
import {Motes} from '../components/Motes';
import {Stage} from '../components/Stage';
import {Thread} from '../components/Thread';
import {ThreadPulse} from '../components/ThreadPulse';
import {cameraDrift, EASE} from '../lib/motion';

export const s07Schema = z.object({
  caption: z.string(),
});

// The clasp sits at (500, 250) inside the 1000x560 artwork. At 1120 wide the
// forearms leave both frame edges and the lower arm still clears the journey
// rail at y 1015 by about 55px once the push scale is applied.
const ART_W = 1120;
const ART_H = (ART_W * 560) / 1000;
const CLASP_X = 960;
const CLASP_Y = 500;
const ART_LEFT = CLASP_X - (500 * ART_W) / 1000;
const ART_TOP = CLASP_Y - (250 * ART_W) / 1000;

/**
 * Placeholder 14 (4.67 sec). The agreement lands and the thread stays with the
 * customer.
 *
 * Review note 10: this was two full walking figures. It is now only the
 * handshake, which is the part of the shot that carries the meaning. Because
 * nobody walks off any more, the ending changed too: instead of the figures
 * leaving frame, the hands ease apart while the thread stays anchored to the
 * point where they met. That is the caption, made literal.
 */
export const S07Handshake: React.FC<z.infer<typeof s07Schema>> = ({caption}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const seconds = frame / fps;

  const approach = interpolate(frame, [0, 50], [0, 1], {
    easing: Easing.bezier(0.28, 0.86, 0.16, 1),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Two damped shakes once the hands are together. Real hands settle rather
  // than stopping dead, so the amplitude decays instead of being switched off.
  const shakeGate = interpolate(frame, [50, 60, 104, 120], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const shake = Math.sin((frame - 50) * 0.30) * 13 * shakeGate;

  const release = interpolate(frame, [120, 138], [0, 1], {
    easing: EASE.out,
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const pulse = interpolate(frame, [52, 96], [0, 1], {
    easing: EASE.out,
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const head = interpolate(frame, [44, 92], [0, 1], {
    easing: Easing.bezier(0.28, 0.84, 0.16, 1),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // The thread ends on the clasp and stays there when the hands part.
  const threadPoints = [
    {x: -140, y: 940},
    {x: 340, y: 880},
    {x: 690, y: 700},
    {x: CLASP_X - 24, y: CLASP_Y + 22},
  ];

  const captionIn = interpolate(frame, [92, 116], [0, 1], {
    easing: EASE.out,
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const push = interpolate(frame, [0, 138], [1.03, 1.09], {
    easing: EASE.drift,
    extrapolateRight: 'clamp',
  });
  const cam = cameraDrift(seconds, 0.8);

  return (
    <AbsoluteFill style={{backgroundColor: '#EEF3F8'}}>
      <Stage
        vanishX={960}
        vanishY={488}
        zoomFrom={1.08}
        zoomTo={1.0}
        fieldOpacity={0.2}
        people={false}
        scrim={0.6}
      />
      <Motes count={16} seed={7} opacity={0.6} />

      <AbsoluteFill style={{scale: String(push), translate: `${cam.x}px ${cam.y}px`}}>
        {/* The moment of agreement, marked once. */}
        <div
          style={{
            position: 'absolute',
            left: CLASP_X,
            top: CLASP_Y + shake,
            translate: '-50% -50%',
            width: 44 + pulse * 300,
            height: 44 + pulse * 300,
            borderRadius: '50%',
            border: '3px solid #1EC3BD',
            opacity: (1 - pulse) * approach,
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: CLASP_X,
            top: CLASP_Y + shake,
            translate: '-50% -50%',
            width: 26,
            height: 26,
            borderRadius: '50%',
            background: '#1EC3BD',
            opacity: Math.min(1, approach) * (1 - pulse * 0.35),
            boxShadow: '0 0 26px rgba(30, 195, 189, 0.75)',
          }}
        />

        <div
          style={{
            position: 'absolute',
            left: ART_LEFT,
            top: ART_TOP + shake,
            width: ART_W,
            height: ART_H,
          }}
        >
          <Handshake width={ART_W} approach={approach} release={release} />
        </div>

        <Thread points={threadPoints} head={head} width={5} leadLength={0.26} />
        <ThreadPulse
          points={threadPoints}
          pulses={[
            {start: 96, duration: 48},
            {start: 118, duration: 46},
          ]}
          width={4.5}
          trail={0.2}
          glowId="s07-pulse"
        />
      </AbsoluteFill>

      <AbsoluteFill
        style={{alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 118}}
      >
        <div
          style={{
            fontFamily: 'Segoe UI',
            fontWeight: 350,
            fontSize: 78,
            letterSpacing: '-0.012em',
            color: '#34383F',
            opacity: captionIn,
            translate: `0 ${(1 - captionIn) * 26}px`,
          }}
        >
          {caption}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
