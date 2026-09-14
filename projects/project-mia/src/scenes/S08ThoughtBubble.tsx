import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {z} from 'zod';
import {DeviceScreen} from '../components/DeviceScreen';
import {Figure} from '../components/Figure';
import {Motes} from '../components/Motes';
import {ProjectElement, type ElementKind} from '../components/ProjectElement';
import {Stage} from '../components/Stage';
import {Thread} from '../components/Thread';
import {ThreadPulse} from '../components/ThreadPulse';
import {cameraDrift, EASE, floatAt} from '../lib/motion';

export const s08Schema = z.object({
  screenTitle: z.string(),
  caption: z.string(),
});

const MINI: {kind: ElementKind; x: number; y: number}[] = [
  {kind: 'person', x: 612, y: 300},
  {kind: 'document', x: 790, y: 214},
  {kind: 'decision', x: 966, y: 296},
  {kind: 'step', x: 1140, y: 212},
  {kind: 'data', x: 1306, y: 302},
];

const MINI_THREAD = MINI.map((m) => ({x: m.x, y: m.y}));

const EXIT_THREAD = [
  {x: 966, y: 300},
  {x: 900, y: 470},
  {x: 720, y: 610},
  {x: 900, y: 800},
  {x: 1214, y: 792},
];

/*
 * Review note 11: the pull-back used to hold for 44 frames before it
 * started, and the scene itself began at film frame 2859. The line "That is
 * the vision" lands at 00:01:35,280 in transcript/narration.srt, which is film
 * frame 2858, so the reveal was still ahead of the words. The scene now starts
 * at 2799 and the hold is cut to 8, so the pull-back runs film 2807 to 2901 and
 * the camera is 51 frames into a 94-frame move when the line is spoken. The 60
 * frames come off S11, and the 60 extra here go to the tail so nothing rushes.
 */
const KEYS = [0, 8, 102, 152, 246, 330];
const CAM_EASE = Easing.bezier(0.4, 0, 0.18, 1);

/**
 * Placeholder 15 (9 sec). The camera pulls back to reveal the whole vision was
 * one person's thinking, then travels over their shoulder into the product.
 */
export const S08ThoughtBubble: React.FC<z.infer<typeof s08Schema>> = ({screenTitle, caption}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const seconds = frame / fps;

  const opts = {easing: CAM_EASE, extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
  const wander = floatAt(seconds, 33, 18, 13, 0.45);
  const cx = interpolate(frame, KEYS, [960, 960, 940, 940, 1214, 1214], opts) + wander.x;
  const cy = interpolate(frame, KEYS, [268, 268, 540, 540, 792, 800], opts) + wander.y;
  const scale = interpolate(frame, KEYS, [2.35, 2.35, 1, 1, 1.75, 3.1], opts);

  const miniHead = interpolate(frame, [0, 34], [0, 1], {
    easing: Easing.bezier(0.28, 0.84, 0.16, 1),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const exitHead = interpolate(frame, [190, 284], [0, 1], {
    easing: Easing.bezier(0.28, 0.84, 0.16, 1),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const bubbleIn = interpolate(frame, [16, 66], [0, 1], {
    easing: EASE.out,
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const captionIn = interpolate(frame, [110, 138], [0, 1], {
    easing: EASE.out,
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const captionOut = interpolate(frame, [188, 214], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const cam = cameraDrift(seconds, 0.6);

  return (
    <AbsoluteFill style={{backgroundColor: '#EEF3F8'}}>
      <Stage
        vanishX={960}
        vanishY={498}
        zoomFrom={1.04}
        zoomTo={1.0}
        fieldOpacity={0.16}
        people={false}
        scrim={0.68}
      />
      <Motes count={18} seed={8} opacity={0.6} />

      <AbsoluteFill
        style={{
          transformOrigin: '0 0',
          translate: `${960 - cx * scale + cam.x}px ${540 - cy * scale + cam.y}px`,
          scale: String(scale),
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: 500,
            top: 92,
            width: 980,
            height: 380,
            borderRadius: 190,
            background: 'rgba(255,255,255,0.94)',
            border: '1px solid #E1E8F0',
            boxShadow: '0 30px 74px rgba(24, 46, 72, 0.14)',
            opacity: bubbleIn,
          }}
        />
        {[
          {x: 508, y: 500, r: 30},
          {x: 452, y: 566, r: 19},
          {x: 414, y: 616, r: 11},
        ].map((d) => (
          <div
            key={d.r}
            style={{
              position: 'absolute',
              left: d.x,
              top: d.y,
              width: d.r * 2,
              height: d.r * 2,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.94)',
              border: '1px solid #E1E8F0',
              opacity: bubbleIn,
            }}
          />
        ))}

        <Thread points={MINI_THREAD} head={miniHead} width={4} leadLength={0.24} glowId="mini" />

        {MINI.map((m, i) => (
          <div
            key={i}
            style={{position: 'absolute', left: m.x, top: m.y, translate: '-50% -50%'}}
          >
            <ProjectElement kind={m.kind} size={96} bound={miniHead > (i + 0.5) / MINI.length ? 1 : 0} />
          </div>
        ))}

        <div style={{position: 'absolute', left: 236, top: 636, opacity: bubbleIn}}>
          <Figure variant="bust" height={430} tone="#7E8C9C" />
        </div>

        <div style={{position: 'absolute', left: 1004, top: 664, opacity: bubbleIn}}>
          <DeviceScreen width={420} glow={exitHead}>
            <div style={{padding: 18, display: 'flex', flexDirection: 'column', gap: 11}}>
              <div
                style={{
                  fontFamily: 'Segoe UI',
                  fontWeight: 600,
                  fontSize: 22,
                  color: '#34383F',
                }}
              >
                {screenTitle}
              </div>
              <div style={{height: 3, borderRadius: 2, background: '#1EC3BD', width: 76}} />
              {[0.94, 0.68, 0.88, 0.54, 0.8].map((w, i) => (
                <div
                  key={i}
                  style={{
                    height: 12,
                    width: `${w * 100}%`,
                    borderRadius: 6,
                    background: i === 1 ? 'rgba(30,195,189,0.3)' : '#EAEEF3',
                  }}
                />
              ))}
            </div>
          </DeviceScreen>
        </div>

        <Thread points={EXIT_THREAD} head={exitHead} width={5} leadLength={0.22} glowId="exit" />
        <ThreadPulse
          points={MINI_THREAD}
          pulses={[
            {start: 62, duration: 54},
            {start: 96, duration: 52},
            {start: 128, duration: 50},
          ]}
          width={4}
          trail={0.22}
          glowId="s08-mini-pulse"
        />
        <ThreadPulse
          points={EXIT_THREAD}
          pulses={[{start: 226, duration: 44}]}
          width={4.5}
          trail={0.24}
          glowId="s08-exit-pulse"
        />
      </AbsoluteFill>

      <AbsoluteFill style={{padding: 142}}>
        <div
          style={{
            position: 'absolute',
            left: 142,
            top: 268,
            maxWidth: 430,
            fontFamily: 'Segoe UI',
            fontWeight: 350,
            fontSize: 66,
            lineHeight: 1.16,
            letterSpacing: '-0.012em',
            color: '#34383F',
            opacity: captionIn * captionOut,
            translate: `0 ${(1 - captionIn) * 20}px`,
          }}
        >
          {caption}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
