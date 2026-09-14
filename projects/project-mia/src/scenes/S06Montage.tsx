import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {z} from 'zod';
import {Bubble} from '../components/Bubble';
import {Motes} from '../components/Motes';
import {Stage} from '../components/Stage';
import {Thread} from '../components/Thread';
import {ThreadPulse} from '../components/ThreadPulse';
import {cameraDrift, floatAt, settle} from '../lib/motion';

export const s06Schema = z.object({
  vignettes: z.array(z.object({title: z.string(), body: z.string()})),
});

const NODES = [
  {cx: 520, cy: 250, w: 500, appear: 0},
  {cx: 1430, cy: 236, w: 500, appear: 168},
  {cx: 336, cy: 762, w: 500, appear: 58},
  {cx: 1010, cy: 540, w: 460, appear: 178},
  {cx: 1568, cy: 786, w: 500, appear: 118},
];

const HUB = {x: 1010, y: 540};
const SPOKES = [0, 1, 2, 4].map((i) => {
  const n = NODES[i];
  return [
    {x: HUB.x, y: HUB.y},
    {x: HUB.x + (n.cx - HUB.x) * 0.42, y: HUB.y + (n.cy - HUB.y) * 0.3},
    {x: HUB.x + (n.cx - HUB.x) * 0.78, y: HUB.y + (n.cy - HUB.y) * 0.74},
    {x: n.cx, y: n.cy},
  ];
});

// V1 parked the camera on each finding for roughly two seconds. The holds are
// now about a second, and the pull-back gets the time instead.
const KEYS = [0, 44, 62, 100, 118, 152, 276];
const CAM_EASE = Easing.bezier(0.42, 0, 0.16, 1);

/**
 * Placeholder 13 (9.2 sec). Three findings land in quick succession, then the
 * camera pulls back to show they were one connected web all along.
 */
export const S06Montage: React.FC<z.infer<typeof s06Schema>> = ({vignettes}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const seconds = frame / fps;

  const a = NODES[0];
  const c = NODES[2];
  const e = NODES[4];

  const opts = {easing: CAM_EASE, extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
  // A slow handheld wander layered on top of the keyframed moves, so the holds
  // between findings are never frozen.
  const wander = floatAt(seconds, 21, 26, 18, 0.5);
  const cx = interpolate(frame, KEYS, [a.cx, a.cx, c.cx, c.cx, e.cx, e.cx, 960], opts) + wander.x;
  const cy = interpolate(frame, KEYS, [a.cy, a.cy, c.cy, c.cy, e.cy, e.cy, 540], opts) + wander.y;
  const scale = interpolate(frame, KEYS, [2.16, 2.16, 2.16, 2.16, 2.16, 2.16, 1], opts);

  const webHead = interpolate(frame, [172, 240], [0, 1], {
    easing: Easing.bezier(0.28, 0.84, 0.16, 1),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const cam = cameraDrift(seconds, 0.7);

  return (
    <AbsoluteFill style={{backgroundColor: '#EEF3F8'}}>
      <Stage
        vanishX={960}
        vanishY={508}
        zoomFrom={1.05}
        zoomTo={1.0}
        fieldOpacity={0.18}
        people={false}
        scrim={0.66}
      />
      <Motes count={24} seed={6} opacity={0.7} />

      <AbsoluteFill
        style={{
          transformOrigin: '0 0',
          translate: `${960 - cx * scale + cam.x}px ${540 - cy * scale + cam.y}px`,
          scale: String(scale),
        }}
      >
        {SPOKES.map((pts, i) => (
          <Thread
            key={i}
            points={pts}
            head={webHead}
            width={4}
            leadLength={0.5}
            showHead={false}
            glowId={`web-${i}`}
          />
        ))}

        {/*
         * Review note 9: the travelling pulses used to render after the cards
         * and so passed in front of them. Both thread layers now sit below the
         * bubble layer, which is where a connector belongs.
         */}
        {SPOKES.map((pts, i) => (
          <ThreadPulse
            key={i}
            points={pts}
            pulses={[{start: 232 + i * 9, duration: 44}]}
            width={4}
            trail={0.3}
            glowId={`s06-pulse-${i}`}
          />
        ))}

        {NODES.map((n, i) => {
          const v = vignettes[i];
          if (!v) return null;
          const show = settle({frame, fps, start: n.appear, duration: 32, bounce: 13});
          const hover = floatAt(seconds, i * 9 + 4, 6, 5, 0.55);
          return (
            <div
              key={v.title}
              style={{
                position: 'absolute',
                left: n.cx + hover.x,
                top: n.cy + hover.y,
                translate: '-50% -50%',
                opacity: show,
                scale: String(0.9 + show * 0.1),
              }}
            >
              <Bubble width={n.w} title={v.title} body={v.body} accent={i === 3} />
            </div>
          );
        })}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
