import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {z} from 'zod';
import {Caption} from '../components/Caption';
import {Motes} from '../components/Motes';
import {Panel, Row} from '../components/Panel';
import {Stage} from '../components/Stage';
import {Thread} from '../components/Thread';
import {ThreadPulse} from '../components/ThreadPulse';
import {cameraDrift, EASE, floatAt, settle} from '../lib/motion';

export const s09Schema = z.object({
  sources: z.array(z.object({label: z.string(), meta: z.string()})),
  libraryTitle: z.string(),
  knowledge: z.array(z.string()),
  caption: z.string(),
  /**
   * Caption reveal window, in scene frames. Defaults to the 168-249 the scene
   * was built with, which assumes it owns the whole 249-frame slot.
   *
   * V15B splits this slot and gives the scene 189 frames. At the default the
   * caption is only a quarter revealed when the shot ends - a still at the last
   * frame showed "Pre-sales work" where the line is "Pre-sales work stops being
   * disposable." Nothing else catches that: the slot sums are correct, tsc is
   * happy, and qa.mjs only counts frames.
   */
  captionStart: z.number().optional(),
  captionEnd: z.number().optional(),
});

/**
 * Fills the 8.3 sec that ran black from 00:20.4 to 00:28.7. The narration over
 * it is "respond to RFPs, and turn recorded demos and discovery workshops into
 * reusable project knowledge", so the shot has to show collection, not just
 * motion: three unlike pre-sales artifacts converging into one library.
 */
const TILE_X = 430;
const TILE_Y = [250, 480, 710];
const LIB_X = 1400;
const LIB_Y = 480;

const FEEDS = [
  [
    {x: 640, y: 250},
    {x: 840, y: 268},
    {x: 1010, y: 372},
    {x: 1136, y: 404},
  ],
  [
    {x: 640, y: 480},
    {x: 880, y: 480},
    {x: 1136, y: 480},
  ],
  [
    {x: 640, y: 710},
    {x: 840, y: 692},
    {x: 1010, y: 588},
    {x: 1136, y: 556},
  ],
];

const SEND = [56, 88, 120];

/** Small pictogram per pre-sales artifact. Abstract, no product chrome. */
const SourceGlyph: React.FC<{index: number; size: number}> = ({index, size}) => {
  if (index === 0) {
    return (
      <svg width={size} height={size} viewBox="0 0 48 48">
        <rect
          x="10"
          y="5"
          width="28"
          height="38"
          rx="4"
          fill="#FFFFFF"
          stroke="#7C90A6"
          strokeWidth="2"
        />
        <path d="M16 15h16M16 22h16M16 29h10" stroke="#A8B8C9" strokeWidth="2" strokeLinecap="round" />
        <circle cx="34" cy="33" r="7" fill="#1EC3BD" opacity="0.16" />
        <path d="M31 33l2.2 2.4L37.4 30" stroke="#1EC3BD" strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (index === 1) {
    return (
      <svg width={size} height={size} viewBox="0 0 48 48">
        <rect x="5" y="10" width="38" height="26" rx="4" fill="#FFFFFF" stroke="#7C90A6" strokeWidth="2" />
        <path d="M20 19l10 5.5-10 5.5z" fill="#1EC3BD" />
        <path d="M17 41h14" stroke="#A8B8C9" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <svg width={size} height={size} viewBox="0 0 48 48">
      <circle cx="15" cy="17" r="6" fill="#FFFFFF" stroke="#7C90A6" strokeWidth="2" />
      <circle cx="33" cy="17" r="6" fill="#FFFFFF" stroke="#7C90A6" strokeWidth="2" />
      <path d="M5 39c0-6 4.5-10 10-10s10 4 10 10" stroke="#7C90A6" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M23 39c0-6 4.5-10 10-10s10 4 10 10" stroke="#A8B8C9" strokeWidth="2" fill="none" strokeLinecap="round" />
    </svg>
  );
};

export const S09Presales: React.FC<z.infer<typeof s09Schema>> = ({
  sources,
  libraryTitle,
  knowledge,
  caption,
  captionStart,
  captionEnd,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const seconds = frame / fps;
  const cam = cameraDrift(seconds, 1);
  const push = interpolate(frame, [0, 249], [1.01, 1.058], {
    easing: EASE.drift,
    extrapolateRight: 'clamp',
  });

  const libIn = settle({frame, fps, start: 34, duration: 46, bounce: 13});

  return (
    <AbsoluteFill style={{backgroundColor: '#EEF3F8'}}>
      <Stage
        vanishX={1180}
        vanishY={470}
        zoomFrom={1.1}
        zoomTo={1.0}
        fieldOpacity={0.42}
        people={false}
        scrim={0.5}
      />
      <Motes count={26} seed={9} opacity={0.85} />

      <AbsoluteFill style={{scale: String(push), translate: `${cam.x}px ${cam.y}px`}}>
        {FEEDS.map((pts, i) => {
          const head = interpolate(frame, [18 + i * 12, 96 + i * 12], [0, 1], {
            easing: EASE.out,
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          });
          return (
            <React.Fragment key={`feed-${i}`}>
              <Thread
                points={pts}
                head={head}
                width={4}
                leadLength={0.3}
                glowId={`s09-feed-${i}`}
              />
              <ThreadPulse
                points={pts}
                pulses={[
                  {start: SEND[i], duration: 34},
                  {start: SEND[i] + 74, duration: 34},
                ]}
                width={4}
                trail={0.42}
                glowId={`s09-pulse-${i}`}
              />
            </React.Fragment>
          );
        })}

        {sources.map((source, i) => {
          const appear = settle({frame, fps, start: i * 7, duration: 40, bounce: 12});
          const drift = floatAt(seconds, i * 11 + 5, 9, 7, 0.72);
          const lit = interpolate(frame, [SEND[i] - 12, SEND[i] + 8], [0, 1], {
            easing: EASE.out,
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          });

          return (
            <div
              key={source.label}
              style={{
                position: 'absolute',
                left: TILE_X - 215 + drift.x - (1 - appear) * 66,
                top: TILE_Y[i] - 75 + drift.y,
                width: 430,
                height: 150,
                opacity: appear,
                scale: String(interpolate(appear, [0, 1], [0.9, 1])),
                display: 'flex',
                alignItems: 'center',
                gap: 22,
                padding: '0 26px',
                borderRadius: 16,
                background: 'linear-gradient(150deg,#FFFFFF 0%,#F5FAFD 100%)',
                border: `1px solid ${
                  lit > 0.5 ? 'rgba(30,195,189,0.5)' : 'rgba(198,213,229,0.9)'
                }`,
                boxShadow: `0 22px 46px rgba(88,118,150,${0.14 + lit * 0.07})`,
              }}
            >
              <div
                style={{
                  width: 74,
                  height: 74,
                  flexShrink: 0,
                  borderRadius: 14,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'rgba(233,241,248,0.9)',
                }}
              >
                <SourceGlyph index={i} size={44} />
              </div>
              <div style={{display: 'flex', flexDirection: 'column', gap: 7}}>
                <span
                  style={{
                    fontFamily: 'Segoe UI',
                    fontWeight: 400,
                    fontSize: 29,
                    color: '#2E343C',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {source.label}
                </span>
                <span
                  style={{
                    fontFamily: 'Segoe UI',
                    fontWeight: 350,
                    fontSize: 23,
                    color: '#8794A3',
                  }}
                >
                  {source.meta}
                </span>
              </div>
            </div>
          );
        })}

        <div
          style={{
            position: 'absolute',
            left: LIB_X - 260,
            top: LIB_Y - 212 + floatAt(seconds, 91, 5, 4, 0.5).y,
            opacity: libIn,
            scale: String(interpolate(libIn, [0, 1], [0.9, 1])),
          }}
        >
          <Panel title={libraryTitle} width={520} height={424}>
            {knowledge.map((label, i) => {
              const land = settle({
                frame,
                fps,
                start: SEND[i] + 16,
                duration: 40,
                bounce: 11,
              });
              return (
                <div
                  key={label}
                  style={{
                    opacity: land,
                    translate: `${(1 - land) * -26}px 0px`,
                  }}
                >
                  <Row label={label} state={land > 0.6 ? 'done' : 'active'} size={26} />
                </div>
              );
            })}
            <div
              style={{
                marginTop: 'auto',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                opacity: interpolate(frame, [150, 178], [0, 1], {
                  easing: EASE.out,
                  extrapolateLeft: 'clamp',
                  extrapolateRight: 'clamp',
                }),
              }}
            >
              <span
                style={{
                  fontFamily: 'Segoe UI',
                  fontWeight: 350,
                  fontSize: 23,
                  color: '#8794A3',
                }}
              >
                Reusable on every future project
              </span>
            </div>
          </Panel>
        </div>
      </AbsoluteFill>

      <Caption
        text={caption}
        start={captionStart ?? 168}
        end={captionEnd ?? 249}
        size={62}
        bottom={88}
      />
    </AbsoluteFill>
  );
};
