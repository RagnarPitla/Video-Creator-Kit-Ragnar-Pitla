import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {z} from 'zod';
import {Motes} from '../components/Motes';
import {Stage} from '../components/Stage';
import {cameraDrift, EASE} from '../lib/motion';

export const s07ContinuitySchema = z.object({
  caption: z.string(),
});

/**
 * Replaces the handshake in slot S07, 138 frames, over the line "after the
 * implementation team rolls off, Mia is still there".
 *
 * Two people reviewed the old shot independently and both rejected the same
 * thing. Ashley: "After the team rolls off, this is good. We just might need
 * to be more abstract instead of showing the hands." Ragnar was blunter: "this
 * hands is bad, it doesn't look like hand, we can change to text or convey it
 * via text or other visuals."
 *
 * They are right for a reason worth writing down. Drawn hands sit in the
 * uncanny valley at any budget below a real illustrator, and this film has no
 * other anatomy in it - every other shot is diagrammatic. The handshake was the
 * one place the visual language broke, which is why it read as wrong even to
 * viewers who could not name the problem.
 *
 * Both replacements below use only what the film already has: the cyan thread,
 * the paper field, and Segoe UI. Neither draws a person.
 */

const CYAN = '#1EC3BD';
const CYAN_LIT = '#3FE3DC';
const PARTNER = '#98A4B4';

/**
 * Points sampled off the cubic below at t = 0.30, 0.55 and 0.78, so the dots
 * sit on the line rather than near it. Recompute these if the path moves.
 */
const MILESTONES: [number, number, string][] = [
  [258, 870, 'DISCOVER'],
  [537, 796, 'IMPLEMENT'],
  [795, 693, 'GO-LIVE'],
];

/* ------------------------------------------------------------ variant A */

/**
 * "Two lanes, one continues."
 *
 * The literal shape of the sentence. Two lines run the length of the project
 * side by side. At the hand-off they touch, once. The partner's line disperses
 * into the field; Mia's brightens and leaves frame right, which is the only
 * way to say "still there" about something the viewer will not see end.
 *
 * The lines exit past the frame edge on purpose. A line that stops inside the
 * frame has an ending, and the whole point of the shot is that this one does
 * not.
 */
export const S07Threads: React.FC<z.infer<typeof s07ContinuitySchema>> = ({caption}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const seconds = frame / fps;

  // Both lines draw in together: the delivery was joint, so the shot should
  // not imply Mia arrived late.
  const draw = interpolate(frame, [0, 58], [0, 1], {
    easing: Easing.bezier(0.26, 0.86, 0.18, 1),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const meet = interpolate(frame, [52, 74], [0, 1], {
    easing: EASE.out,
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // The partner line does not get cut, it disperses. A cut would read as the
  // engagement failing; a fade reads as it finishing.
  const roll = interpolate(frame, [76, 124], [0, 1], {
    easing: Easing.bezier(0.4, 0, 0.7, 1),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const carry = interpolate(frame, [74, 138], [0, 1], {
    easing: Easing.bezier(0.22, 0.8, 0.2, 1),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const captionIn = interpolate(frame, [92, 116], [0, 1], {
    easing: EASE.out,
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const push = interpolate(frame, [0, 138], [1.02, 1.07], {
    easing: EASE.drift,
    extrapolateRight: 'clamp',
  });
  const cam = cameraDrift(seconds, 0.8);

  const NODE = {x: 1046, y: 566};

  // Approach legs, then the single line that carries on.
  const partnerPath = `M -80 806 C 300 792, 640 726, ${NODE.x} ${NODE.y}`;
  const miaApproach = `M -80 906 C 300 900, 660 780, ${NODE.x} ${NODE.y}`;
  const miaCarry = `M ${NODE.x} ${NODE.y} C 1360 496, 1660 462, 2020 440`;

  return (
    <AbsoluteFill style={{backgroundColor: '#EEF3F8'}}>
      <Stage
        vanishX={960}
        vanishY={488}
        zoomFrom={1.06}
        zoomTo={1.0}
        fieldOpacity={0.2}
        people={false}
        scrim={0.6}
      />
      <Motes count={16} seed={7} opacity={0.6} />

      <AbsoluteFill style={{scale: String(push), translate: `${cam.x}px ${cam.y}px`}}>
        <svg
          width={1920}
          height={1080}
          viewBox="0 0 1920 1080"
          style={{position: 'absolute', left: 0, top: 0}}
        >
          <defs>
            <filter id="s07c-glow" x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="9" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Partner line, drifting up as it goes. Things that leave a project
              do not sink, and a downward drift would read as failure. */}
          <g
            opacity={(1 - roll) * 0.95}
            transform={`translate(0 ${-roll * 26})`}
            filter={roll > 0.05 ? 'url(#s07c-glow)' : undefined}
          >
            <path
              d={partnerPath}
              fill="none"
              stroke={PARTNER}
              strokeWidth={4.5}
              strokeLinecap="round"
              pathLength={1}
              strokeDasharray={`${0.012 + roll * 0.05} ${roll * 0.075}`}
              strokeDashoffset={roll > 0 ? 0 : undefined}
              style={
                roll > 0
                  ? undefined
                  : {strokeDasharray: '1 1', strokeDashoffset: 1 - draw}
              }
            />
          </g>

          {/* Mia's approach leg, which stays. */}
          <path
            d={miaApproach}
            fill="none"
            stroke={CYAN}
            strokeWidth={5}
            strokeLinecap="round"
            pathLength={1}
            strokeDasharray="1 1"
            strokeDashoffset={1 - draw}
            opacity={0.9 + meet * 0.1}
          />

          {/* The continuation. Wide soft pass under a bright core, which is how
              every other thread in the film is built. */}
          <path
            d={miaCarry}
            fill="none"
            stroke={CYAN}
            strokeWidth={17}
            strokeLinecap="round"
            strokeOpacity={0.13}
            pathLength={1}
            strokeDasharray="1 1"
            strokeDashoffset={1 - carry}
          />
          <path
            d={miaCarry}
            fill="none"
            stroke={CYAN_LIT}
            strokeWidth={5.5}
            strokeLinecap="round"
            pathLength={1}
            strokeDasharray="1 1"
            strokeDashoffset={1 - carry}
            filter="url(#s07c-glow)"
          />

          {/* The hand-off, marked once. */}
          <circle
            cx={NODE.x}
            cy={NODE.y}
            r={16 + meet * 118}
            fill="none"
            stroke={CYAN}
            strokeWidth={3}
            opacity={(1 - meet) * 0.9}
          />
          <circle
            cx={NODE.x}
            cy={NODE.y}
            r={11}
            fill={CYAN}
            opacity={Math.min(1, draw * 1.4)}
            filter="url(#s07c-glow)"
          />
        </svg>

        <Label
          text="IMPLEMENTATION TEAM"
          x={330}
          y={716 - roll * 30}
          opacity={Math.min(draw * 1.6, 1) * (1 - roll) * (1 - captionIn * 0.65)}
          color={PARTNER}
        />
        <Label
          text="MIA"
          x={112}
          y={840}
          opacity={Math.min(draw * 1.6, 1) * (1 - captionIn * 0.5)}
          color={CYAN}
          strong
        />
        <Label
          text="STILL RUNNING"
          x={1548}
          y={404}
          opacity={interpolate(carry, [0.45, 0.8], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          })}
          color={CYAN}
          strong
        />

        {/* What the two of them travelled through together. Without these the
            shot says "one line stopped" but not when, and the whole point is
            that Mia carries on past the moment every other engagement ends. */}
        {MILESTONES.map(([mx, my, name], i) => {
          const on = interpolate(draw, [0.32 + i * 0.16, 0.5 + i * 0.16], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          });
          return (
            <div key={name as string}>
              <div
                style={{
                  position: 'absolute',
                  left: (mx as number) - 5,
                  top: (my as number) - 5,
                  width: 10,
                  height: 10,
                  borderRadius: 999,
                  background: '#EEF3F8',
                  border: `2.5px solid ${CYAN}`,
                  opacity: on,
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  left: (mx as number) - 4,
                  top: (my as number) + 16,
                  fontFamily: 'Segoe UI',
                  fontWeight: 400,
                  fontSize: 17,
                  letterSpacing: '0.16em',
                  color: '#93A0B0',
                  opacity: on * (1 - captionIn * 0.75),
                  whiteSpace: 'nowrap',
                }}
              >
                {name}
              </div>
            </div>
          );
        })}
      </AbsoluteFill>

      <Caption text={caption} opacity={captionIn} />
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------ variant B */

/**
 * "The roster empties."
 *
 * Ragnar's other suggestion, taken literally: convey it with text. The people
 * who staffed the project are named as roles, not drawn, and they leave one at
 * a time. One name does not leave, and the frame closes on it.
 *
 * This is the safer of the two variants for a stakeholder audience, because
 * nothing about it can be misread. It is also the one that survives being
 * watched on a phone with the sound off.
 */
export const S07Roster: React.FC<z.infer<typeof s07ContinuitySchema>> = ({caption}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const seconds = frame / fps;

  const ROLES = [
    'SOLUTION ARCHITECT',
    'FUNCTIONAL CONSULTANTS',
    'DATA MIGRATION TEAM',
    'PROJECT MANAGER',
  ];

  const captionIn = interpolate(frame, [96, 118], [0, 1], {
    easing: EASE.out,
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Mia moves from the end of the roster to the centre once it is alone. The
  // move is the point: nothing else had to change for it to still be there.
  const solo = interpolate(frame, [96, 126], [0, 1], {
    easing: Easing.bezier(0.24, 0.82, 0.18, 1),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const push = interpolate(frame, [0, 138], [1.02, 1.06], {
    easing: EASE.drift,
    extrapolateRight: 'clamp',
  });
  const cam = cameraDrift(seconds, 0.7);

  return (
    <AbsoluteFill style={{backgroundColor: '#EEF3F8'}}>
      <Stage
        vanishX={960}
        vanishY={470}
        zoomFrom={1.05}
        zoomTo={1.0}
        fieldOpacity={0.18}
        people={false}
        scrim={0.62}
      />
      <Motes count={14} seed={11} opacity={0.55} />

      <AbsoluteFill
        style={{
          scale: String(push),
          translate: `${cam.x}px ${cam.y}px`,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 20,
            transform: `translateY(${-64 + solo * 34}px)`,
          }}
        >
          {ROLES.map((role, i) => {
            const arrive = interpolate(frame, [6 + i * 9, 28 + i * 9], [0, 1], {
              easing: EASE.out,
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            });
            // They leave in the order they arrived, which is how engagements
            // actually wind down.
            const leave = interpolate(frame, [58 + i * 11, 86 + i * 11], [0, 1], {
              easing: Easing.bezier(0.4, 0, 0.7, 1),
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            });
            return (
              <div
                key={role}
                style={{
                  fontFamily: 'Segoe UI',
                  fontWeight: 350,
                  fontSize: 40,
                  letterSpacing: '0.16em',
                  color: '#7A8494',
                  opacity: arrive * (1 - leave),
                  transform: `translateY(${(1 - arrive) * 16 - leave * 26}px)`,
                  // The rows collapse as they empty so Mia is not left
                  // floating in a column of holes.
                  height: 48 * (1 - leave),
                  overflow: 'hidden',
                  lineHeight: '48px',
                }}
              >
                {role}
              </div>
            );
          })}

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 22,
              marginTop: 10 + solo * 18,
              transform: `scale(${1 + solo * 0.34})`,
            }}
          >
            <span
              style={{
                width: 15 + solo * 5,
                height: 15 + solo * 5,
                borderRadius: 999,
                background: CYAN,
                boxShadow: `0 0 ${16 + solo * 26}px rgba(30,195,189,${0.55 + solo * 0.35})`,
                opacity: interpolate(frame, [14, 34], [0, 1], {
                  extrapolateLeft: 'clamp',
                  extrapolateRight: 'clamp',
                }),
              }}
            />
            <span
              style={{
                fontFamily: 'Segoe UI',
                fontWeight: 600,
                fontSize: 46,
                letterSpacing: '0.2em',
                color: '#2E343C',
                opacity: interpolate(frame, [14, 34], [0, 1], {
                  extrapolateLeft: 'clamp',
                  extrapolateRight: 'clamp',
                }),
              }}
            >
              MIA
            </span>
          </div>

          <div
            style={{
              fontFamily: 'Segoe UI',
              fontWeight: 300,
              fontSize: 30,
              letterSpacing: '0.13em',
              color: CYAN,
              opacity: solo,
              transform: `translateY(${(1 - solo) * 14 + 22}px)`,
            }}
          >
            STILL RUNNING
          </div>
        </div>
      </AbsoluteFill>

      <Caption text={caption} opacity={captionIn} />
    </AbsoluteFill>
  );
};

/* ----------------------------------------------------------- shared bits */

const Caption: React.FC<{text: string; opacity: number}> = ({text, opacity}) => (
  <AbsoluteFill style={{alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 118}}>
    <div
      style={{
        fontFamily: 'Segoe UI',
        fontWeight: 350,
        fontSize: 78,
        letterSpacing: '-0.012em',
        color: '#34383F',
        opacity,
        translate: `0 ${(1 - opacity) * 26}px`,
      }}
    >
      {text}
    </div>
  </AbsoluteFill>
);

const Label: React.FC<{
  text: string;
  x: number;
  y: number;
  opacity: number;
  color: string;
  strong?: boolean;
}> = ({text, x, y, opacity, color, strong}) => (
  <div
    style={{
      position: 'absolute',
      left: x,
      top: y,
      fontFamily: 'Segoe UI',
      fontWeight: strong ? 600 : 400,
      fontSize: strong ? 25 : 23,
      letterSpacing: '0.15em',
      color,
      opacity,
      whiteSpace: 'nowrap',
    }}
  >
    {text}
  </div>
);
