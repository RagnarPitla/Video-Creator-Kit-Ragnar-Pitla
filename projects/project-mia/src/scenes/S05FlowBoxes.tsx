import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {z} from 'zod';
import {FlowBox} from '../components/FlowBox';
import {Motes} from '../components/Motes';
import {Stage} from '../components/Stage';
import {Thread} from '../components/Thread';
import {ThreadPulse} from '../components/ThreadPulse';
import {cameraDrift, EASE, settle} from '../lib/motion';

export const s05Schema = z.object({
  steps: z.array(z.object({label: z.string()})),
  requirements: z.array(z.object({label: z.string()})),
  fitLabel: z.string(),
  gapLabel: z.string(),
});

const BOX_W = 380;
const BOX_H = 176;
const BOX_Y = 452;
const BOX_X = [300, 770, 1240];

const FIT_POINTS = [
  {x: 1620, y: 540},
  {x: 1668, y: 508},
  {x: 1710, y: 410},
  {x: 1734, y: 360},
];
const GAP_POINTS = [
  {x: 1620, y: 540},
  {x: 1668, y: 576},
  {x: 1710, y: 672},
  {x: 1734, y: 720},
];

/**
 * Placeholder 07 (4.67 sec). Business process steps emerge, requirements file
 * into them, then the thread splits the outcome into fit and gap.
 */
export const S05FlowBoxes: React.FC<z.infer<typeof s05Schema>> = ({
  steps,
  requirements,
  fitLabel,
  gapLabel,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const seconds = frame / fps;

  const splitHead = interpolate(frame, [80, 120], [0, 1], {
    easing: Easing.bezier(0.28, 0.84, 0.16, 1),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const branchLabel = interpolate(frame, [104, 126], [0, 1], {
    easing: EASE.out,
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const push = interpolate(frame, [0, 140], [1.0, 1.055], {
    easing: EASE.drift,
    extrapolateRight: 'clamp',
  });
  const cam = cameraDrift(seconds, 0.8);

  return (
    <AbsoluteFill style={{backgroundColor: '#EEF3F8'}}>
      <Stage
        vanishX={900}
        vanishY={506}
        zoomFrom={1.06}
        zoomTo={1.0}
        fieldOpacity={0.24}
        people={false}
        scrim={0.62}
      />
      <Motes count={22} seed={5} opacity={0.75} />

      <AbsoluteFill style={{scale: String(push), translate: `${cam.x}px ${cam.y}px`}}>

      {BOX_X.map((x, i) => {
        const appear = settle({frame, fps, start: 2 + i * 9, duration: 34, bounce: 12});
        const filled = settle({frame, fps, start: 38 + i * 11, duration: 26, bounce: 16});
        return (
          <React.Fragment key={x}>
            <div style={{position: 'absolute', left: x, top: BOX_Y}}>
              <FlowBox
                label={steps[i]?.label ?? ''}
                width={BOX_W}
                height={BOX_H}
                appear={appear}
                filled={filled}
              />
            </div>
            {i < BOX_X.length - 1 ? (
              <div
                style={{
                  position: 'absolute',
                  left: x + BOX_W,
                  top: BOX_Y + BOX_H / 2 - 2,
                  width: 90,
                  height: 4,
                  borderRadius: 2,
                  background: filled > 0.5 ? '#1EC3BD' : '#D3DBE4',
                  opacity: appear,
                }}
              />
            ) : null}
          </React.Fragment>
        );
      })}

      {requirements.map((req, i) => {
        const drop = settle({frame, fps, start: 32 + i * 10, duration: 36, bounce: 14});
        const targetX = BOX_X[i % BOX_X.length] + BOX_W / 2;
        const x = interpolate(drop, [0, 1], [300 + i * 430, targetX]);
        const y = interpolate(drop, [0, 1], [176, BOX_Y + BOX_H / 2]);
        const fade = interpolate(drop, [0, 0.75, 1], [1, 1, 0]);
        return (
          <div
            key={req.label}
            style={{
              position: 'absolute',
              left: x,
              top: y,
              translate: '-50% -50%',
              padding: '14px 28px',
              borderRadius: 999,
              background: '#FFFFFF',
              border: '1px solid #E4E9EF',
              boxShadow: '0 14px 32px rgba(24, 46, 72, 0.14)',
              fontFamily: 'Segoe UI',
              fontWeight: 400,
              fontSize: 36,
              letterSpacing: '0.02em',
              color: '#5C6B7C',
              opacity: fade,
              whiteSpace: 'nowrap',
            }}
          >
            {req.label}
          </div>
        );
      })}

      <ThreadPulse
        points={FIT_POINTS}
        pulses={[
          {start: 118, duration: 30},
          {start: 130, duration: 30},
        ]}
        width={4}
        trail={0.5}
        glowId="s05-fit-pulse"
      />
      <ThreadPulse
        points={GAP_POINTS}
        pulses={[
          {start: 124, duration: 30},
          {start: 136, duration: 30},
        ]}
        width={4}
        trail={0.5}
        glowId="s05-gap-pulse"
      />

      <Thread points={FIT_POINTS} head={splitHead} width={5} leadLength={0.34} glowId="fit-glow" />
      <Thread points={GAP_POINTS} head={splitHead} width={5} leadLength={0.34} glowId="gap-glow" />

      {[
        {label: fitLabel, top: 360},
        {label: gapLabel, top: 720},
      ].map((b) => (
        <div
          key={b.label}
          style={{
            position: 'absolute',
            left: 1812,
            top: b.top,
            translate: '-50% -50%',
            padding: '16px 34px',
            borderRadius: 999,
            background: '#FFFFFF',
            border: '2px solid #1EC3BD',
            boxShadow: '0 16px 38px rgba(24, 46, 72, 0.15)',
            fontFamily: 'Segoe UI',
            fontWeight: 600,
            fontSize: 40,
            letterSpacing: '0.04em',
            color: '#1EC3BD',
            opacity: branchLabel,
            scale: String(0.88 + branchLabel * 0.12),
          }}
        >
          {b.label}
        </div>
      ))}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
