import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {z} from 'zod';
import {Bubble} from '../components/Bubble';
import {Figure} from '../components/Figure';
import {Motes} from '../components/Motes';
import {Stage} from '../components/Stage';
import {Thread} from '../components/Thread';
import {ThreadPulse} from '../components/ThreadPulse';
import {cameraDrift, EASE, floatAt, settle} from '../lib/motion';

export const s04Schema = z.object({
  label: z.string(),
  requirements: z.array(z.object({text: z.string()})),
});

const SEATS = [
  {x: 700, y: 548, h: 250, tone: '#A9B6C4', flip: false, phase: 0.3},
  {x: 1042, y: 542, h: 250, tone: '#B4C0CD', flip: true, phase: 2.4},
  {x: 452, y: 636, h: 312, tone: '#7E8C9C', flip: false, phase: 4.1},
  {x: 1288, y: 646, h: 312, tone: '#8B99A8', flip: true, phase: 1.5},
];

const SLOTS = [
  {x: 226, y: 148},
  {x: 742, y: 92},
  {x: 1246, y: 164},
];

const THREAD_POINTS = [
  {x: -150, y: 486},
  {x: 470, y: 420},
  {x: 976, y: 360},
  {x: 1480, y: 438},
  {x: 2070, y: 486},
];

/**
 * Placeholder 06 (5.7 sec). A working session with no audible dialogue, where
 * requirements surface from the transcript and the thread links them.
 */
export const S04ConferenceRoom: React.FC<z.infer<typeof s04Schema>> = ({label, requirements}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const seconds = frame / fps;

  const head = interpolate(frame, [58, 128], [0, 1], {
    easing: Easing.bezier(0.28, 0.84, 0.16, 1),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const push = interpolate(frame, [0, 171], [1, 1.062], {
    easing: EASE.drift,
    extrapolateRight: 'clamp',
  });
  const cam = cameraDrift(seconds, 0.9);

  return (
    <AbsoluteFill style={{backgroundColor: '#EEF3F8'}}>
      <Stage
        vanishX={960}
        vanishY={500}
        zoomFrom={1.06}
        zoomTo={1.0}
        fieldOpacity={0.18}
        people={false}
        scrim={0.62}
      />
      <Motes count={20} seed={4} opacity={0.7} />

      <AbsoluteFill style={{scale: String(push), translate: `${cam.x}px ${cam.y}px`}}>
        <div
          style={{
            position: 'absolute',
            left: 430,
            top: 722,
            width: 1060,
            height: 202,
            borderRadius: '50%',
            background: 'linear-gradient(180deg, #F4F7FA 0%, #DDE5EE 100%)',
            border: '1px solid #E1E8F0',
            boxShadow: '0 26px 60px rgba(24, 46, 72, 0.14)',
          }}
        />

        {SEATS.map((s, i) => {
          // Independent breathing per seat, so the table never looks posed.
          const b = floatAt(seconds, i * 11 + 2, 3.5, 5.5, 0.85);
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: s.x + b.x,
                top: s.y + b.y,
                rotate: `${b.rot * 0.5}deg`,
              }}
            >
              <Figure variant="bust" height={s.h} tone={s.tone} flip={s.flip} />
            </div>
          );
        })}

        <Thread points={THREAD_POINTS} head={head} width={5} leadLength={0.22} />

        {requirements.map((r, i) => {
          const rise = settle({frame, fps, start: 6 + i * 16, duration: 44, bounce: 14});
          const slot = SLOTS[i % SLOTS.length];
          const hover = floatAt(seconds, i * 13 + 5, 7, 6, 0.6);
          const y = interpolate(rise, [0, 1], [slot.y + 430, slot.y + hover.y]);
          return (
            <div
              key={r.text}
              style={{
                position: 'absolute',
                left: slot.x + hover.x * rise,
                top: y,
                opacity: rise,
                scale: String(0.9 + rise * 0.1),
              }}
            >
              <Bubble
                width={470}
                title="Requirement"
                body={r.text}
                accent={head > 0.2 + i * 0.3}
                tail="speech"
                tailX={[0.46, 0.62, 0.2][i % 3]}
              />
            </div>
          );
        })}

        <ThreadPulse
          points={THREAD_POINTS}
          pulses={[
            {start: 116, duration: 60},
            {start: 146, duration: 58},
          ]}
          width={4.5}
          trail={0.16}
          glowId="s04-pulse"
        />
      </AbsoluteFill>

      {/*
       * Review note 8: this label used to sit at y 934, on the table and with
       * about 30px between it and each of the two foreground figures. Three
       * changes open that band up. The table is 22px higher and 14px shorter,
       * so it now ends at y 924. The label drops below it to y 944 and is set
       * 4pt smaller with tighter tracking, which takes it from 570px wide to
       * 483 and puts 26px of clear space either side at the head of the shot,
       * widening to 43 as the 1.062 push spreads the figures outward.
       *
       * It also moved out of the scaled group. Inside it, the same push walked
       * the label down about 28px over the shot, which at this height would
       * have put it into the journey rail at y 1015.
       */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 944,
          textAlign: 'center',
          fontFamily: 'Segoe UI',
          fontWeight: 600,
          fontSize: 28,
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: '#93A0AE',
        }}
      >
        {label}
      </div>
    </AbsoluteFill>
  );
};
