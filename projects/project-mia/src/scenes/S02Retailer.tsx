import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {z} from 'zod';
import {DeviceScreen} from '../components/DeviceScreen';
import {Figure} from '../components/Figure';
import {Motes} from '../components/Motes';
import {Stage} from '../components/Stage';
import {Thread} from '../components/Thread';
import {cameraDrift, EASE} from '../lib/motion';

export const s02Schema = z.object({
  brand: z.string(),
  screenTitle: z.string(),
});

const THREAD_POINTS = [
  {x: -180, y: 210},
  {x: 300, y: 150},
  {x: 648, y: 336},
  {x: 512, y: 668},
  {x: 286, y: 872},
  {x: 648, y: 906},
  {x: 964, y: 648},
];

/**
 * Placeholder 03 (2.83 sec). A seller demonstrating to retail leadership, with
 * one continuous push over the seller's shoulder into the laptop display.
 */
export const S02Retailer: React.FC<z.infer<typeof s02Schema>> = ({brand, screenTitle}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const seconds = frame / fps;

  // Accelerating push: slow enough to read the room, then commits into the
  // screen. V1's symmetric curve made the whole move feel like one speed.
  const push = interpolate(frame, [0, 85], [1, 2.68], {
    easing: Easing.bezier(0.5, 0, 0.36, 1),
    extrapolateRight: 'clamp',
  });

  const head = interpolate(frame, [2, 58], [0, 1], {
    easing: Easing.bezier(0.26, 0.86, 0.18, 1),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const screenGlow = interpolate(frame, [50, 74], [0, 1], {
    easing: EASE.out,
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const cam = cameraDrift(seconds, 0.7);

  return (
    <AbsoluteFill style={{backgroundColor: '#EEF3F8'}}>
      <Stage
        vanishX={960}
        vanishY={470}
        zoomFrom={1.04}
        zoomTo={1.0}
        fieldOpacity={0.22}
        people={false}
        scrim={0.5}
      />
      <Motes count={18} seed={2} opacity={0.6} />

      <AbsoluteFill
        style={{
          scale: String(push),
          transformOrigin: '964px 620px',
          translate: `${cam.x}px ${cam.y}px`,
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 234,
            textAlign: 'center',
            fontFamily: 'Segoe UI',
            fontWeight: 300,
            fontSize: 76,
            letterSpacing: '0.34em',
            color: '#AFBCC9',
          }}
        >
          {brand}
        </div>

        <div style={{position: 'absolute', left: 660, top: 330}}>
          <Figure variant="bust" height={250} tone="#B7C3D0" />
        </div>
        <div style={{position: 'absolute', left: 1096, top: 344}}>
          <Figure variant="bust" height={236} tone="#C0CBD7" flip />
        </div>

        <div
          style={{
            position: 'absolute',
            left: 320,
            top: 742,
            right: 320,
            height: 26,
            borderRadius: 13,
            background: 'linear-gradient(180deg, #E6ECF3 0%, #CBD5E0 100%)',
            boxShadow: '0 18px 40px rgba(24, 46, 72, 0.14)',
          }}
        />

        <div style={{position: 'absolute', left: 704, top: 428}}>
          <DeviceScreen width={520} glow={screenGlow}>
            <div style={{padding: 22, display: 'flex', flexDirection: 'column', gap: 14}}>
              <div
                style={{
                  fontFamily: 'Segoe UI',
                  fontWeight: 600,
                  fontSize: 26,
                  letterSpacing: '0.02em',
                  color: '#34383F',
                }}
              >
                {screenTitle}
              </div>
              <div style={{height: 3, borderRadius: 2, background: '#1EC3BD', width: 92}} />
              {[0.92, 0.74, 0.86, 0.58].map((w, i) => (
                <div
                  key={i}
                  style={{
                    height: 15,
                    width: `${w * 100}%`,
                    borderRadius: 8,
                    background: i === 1 ? 'rgba(30,195,189,0.28)' : '#EAEEF3',
                  }}
                />
              ))}
            </div>
          </DeviceScreen>
        </div>

        <Thread points={THREAD_POINTS} head={head} width={6} leadLength={0.24} />

        <div style={{position: 'absolute', left: -30, top: 588}}>
          <Figure variant="bust" height={690} tone="#78879A" />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
