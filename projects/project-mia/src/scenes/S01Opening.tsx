import React from 'react';
import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {z} from 'zod';
import {BrandBackdrop} from '../components/BrandBackdrop';
import {Motes} from '../components/Motes';
import {ProductTile} from '../components/ProductTile';
import {Stage} from '../components/Stage';
import {Thread} from '../components/Thread';
import {ThreadPulse} from '../components/ThreadPulse';
import {SplitWords} from '../components/WordMask';
import {cameraDrift, EASE, floatAt, settle} from '../lib/motion';
import {buildPath} from '../lib/path';

export const s01Schema = z.object({
  caption: z.string(),
  /**
   * Names the applications rather than leaving 15 anonymous glyphs. Opt-in, so
   * cuts that do not ask for it render exactly as before.
   *
   *   chips     a label under each tile while it is loose, gone once it docks
   *   brackets  ERP / CRM / Sustainability spans drawn under the docked chain
   *   words     a capability list that reveals in the cleared top band
   */
  capabilities: z
    .enum(['none', 'chips', 'brackets', 'words', 'both'])
    .optional(),
});

const THREAD_POINTS = [
  {x: -180, y: 700},
  {x: 300, y: 648},
  {x: 760, y: 470},
  {x: 1220, y: 604},
  {x: 1660, y: 430},
  {x: 2100, y: 396},
];

/**
 * V2 beat map. V1 opened on 66 idle frames, then left a 32 frame hole between
 * the thread landing and the caption starting, then held 23 frames on a static
 * frame at the end. That is roughly four of the nine seconds spent waiting.
 * Every beat below now overlaps its neighbour.
 */
const ENTER = 0;
const THREAD_IN = 14;
const THREAD_OUT = 146;
const CAPTION_IN = 150;

type Piece = {
  /** File stem in public/d365/. */
  slug: string;
  x: number;
  y: number;
  dock: number;
  /** 0 far, 1 near. Drives entrance offset, float amplitude and focus. */
  z: number;
  enter: number;
};

const TILE = 88;

/**
 * The whole Dynamics 365 family, because the line is "every Dynamics project".
 *
 * Scatter positions sit in a top band and a bottom band, deliberately clear of
 * the y 380..720 corridor the thread runs through, so the gather reads as an
 * inward move rather than a shuffle. Dock order runs ERP first, then CRM, then
 * service, then sustainability; scatter order is interleaved against it so the
 * icons cross on their way in instead of sliding straight sideways.
 */
const PRODUCTS: [string, number, number, number][] = [
  // slug, scatter x, scatter y, z
  ['finance', 180, 232, 0.85],
  ['sales', 400, 166, 0.3],
  ['human-resources', 646, 214, 0.6],
  ['customer-insights', 884, 158, 0.95],
  ['commerce', 1124, 226, 0.45],
  ['contact-center', 1362, 172, 0.75],
  ['project-operations', 1586, 240, 0.2],
  ['customer-voice', 1792, 186, 0.55],
  ['supply-chain-management', 262, 842, 0.4],
  ['customer-services', 520, 782, 0.9],
  ['sustainability', 792, 886, 0.25],
  ['business-central', 1058, 796, 0.7],
  ['field-service', 1328, 872, 0.5],
  ['sales-insights', 1592, 788, 0.15],
  ['intelligent-order-management', 1826, 858, 0.8],
];

const DOCK_ORDER = [
  'finance',
  'supply-chain-management',
  'business-central',
  'commerce',
  'intelligent-order-management',
  'project-operations',
  'human-resources',
  'sales',
  'sales-insights',
  'customer-insights',
  'customer-services',
  'contact-center',
  'customer-voice',
  'field-service',
  'sustainability',
];

const DOCK_FROM = 0.14;
/**
 * 0.80, not the 0.855 this shot carried through V16. The chain is scaled by a
 * continuous `push` (1.008 -> 1.075) and slid along the path by `flowShift`
 * (+0.038 after THREAD_OUT), so a tile parked at 0.855 finishes the shot
 * bisected by the right edge of the frame - verified on stills at f240 and
 * f281. The left-most tile sits 146px clear of its edge, so the overflow was
 * asymmetric and read as an error rather than as the thread continuing.
 * Pulling the range in costs about 5px of gap between tiles.
 */
const DOCK_TO = 0.8;

/** What each icon actually is. Used by the 'chips' variant. */
const LABELS: Record<string, string> = {
  finance: 'Finance',
  'supply-chain-management': 'Supply Chain',
  'business-central': 'Business Central',
  commerce: 'Commerce',
  'intelligent-order-management': 'Order Management',
  'project-operations': 'Project Operations',
  'human-resources': 'Human Resources',
  sales: 'Sales',
  'sales-insights': 'Sales Insights',
  'customer-insights': 'Customer Insights',
  'customer-services': 'Customer Service',
  'contact-center': 'Contact Center',
  'customer-voice': 'Customer Voice',
  'field-service': 'Field Service',
  sustainability: 'Sustainability',
};

/**
 * DOCK_ORDER is already grouped - the first seven are the ERP applications and
 * the next seven are CRM - so these spans are contiguous stretches of the
 * thread rather than an arrangement invented for the caption. Each span is
 * annotated once its last member has finished settling, which is the dock
 * frame of that member plus the 46 frame settle.
 *
 * Sustainability (dock index 14) is deliberately left outside a span. It is
 * not a peer of ERP and CRM, and as a one-tile bracket at the end of the chain
 * it ran off the right edge of the frame.
 */
const dockOf = (i: number) =>
  DOCK_FROM + (i * (DOCK_TO - DOCK_FROM)) / (DOCK_ORDER.length - 1);

const SPANS = [
  {label: 'ERP', from: 0, to: 6},
  {label: 'CRM', from: 7, to: 13},
].map((s) => ({
  ...s,
  a: dockOf(s.from),
  b: dockOf(s.to),
  // THREAD_IN + (THREAD_OUT - THREAD_IN) * dock - 10, then the settle.
  at: Math.round(14 + 132 * dockOf(s.to) - 10 + 46),
}));

/** The capability list for the 'words' variant, in the order it reveals. */
const CAPABILITY_WORDS = [
  'ERP.',
  'CRM.',
  'Supply chain.',
  'Commerce.',
  'Field service.',
  'People.',
];

const PIECES: Piece[] = PRODUCTS.map(([slug, x, y, z], i) => ({
  slug,
  x,
  y,
  z,
  dock:
    DOCK_FROM +
    (DOCK_ORDER.indexOf(slug) * (DOCK_TO - DOCK_FROM)) / (DOCK_ORDER.length - 1),
  enter: Math.round(i * 1.1),
}));

const PULSES = [
  {start: 112, duration: 82},
  {start: 158, duration: 78},
  {start: 204, duration: 74},
  {start: 244, duration: 72},
];

/**
 * Placeholder 01 (9.4 sec). Disconnected project elements drift independently,
 * then a precise cyan intelligence thread gathers them into one flow.
 */
export const S01Opening: React.FC<z.infer<typeof s01Schema>> = ({
  caption,
  capabilities = 'none',
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const path = buildPath(THREAD_POINTS);
  const seconds = frame / fps;

  const head = interpolate(frame, [THREAD_IN, THREAD_OUT], [0, 1], {
    easing: Easing.bezier(0.28, 0.82, 0.16, 1),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // The flow keeps creeping after it forms, so the line is never truly frozen.
  const flowShift = interpolate(frame, [THREAD_OUT, 282], [0, 0.038], {
    easing: EASE.drift,
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // A continuous push across the whole shot, twice V1's amount so it reads.
  const push = interpolate(frame, [0, 282], [1.008, 1.075], {
    easing: EASE.drift,
    extrapolateRight: 'clamp',
  });
  const cam = cameraDrift(seconds, 1);

  return (
    <AbsoluteFill style={{backgroundColor: '#EEF3F8'}}>
      <Stage
        vanishX={992}
        vanishY={496}
        zoomFrom={1.12}
        zoomTo={1.0}
        fieldOpacity={0.5}
        people={false}
        scrim={0.42}
      />
      <BrandBackdrop start={4} strength={0.075} height={1220} y={498} rings />

      <Motes count={30} seed={1} opacity={0.9} />

      <AbsoluteFill
        style={{
          scale: String(push),
          translate: `${cam.x}px ${cam.y}px`,
        }}
      >
        <Thread points={THREAD_POINTS} head={head} width={5} leadLength={0.2} />
        <ThreadPulse points={THREAD_POINTS} pulses={PULSES} width={5} trail={0.13} />

        {PIECES.map((piece, i) => {
          const seed = i * 7 + 3;
          const dockAt = THREAD_IN + (THREAD_OUT - THREAD_IN) * piece.dock - 10;

          const bind = settle({frame, fps, start: dockAt, duration: 46, bounce: 13});

          const appear = interpolate(
            frame,
            [ENTER + piece.enter, ENTER + piece.enter + 20],
            [0, 1],
            {easing: EASE.out, extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
          );

          const drift = floatAt(seconds, seed, 24 + piece.z * 16, 18 + piece.z * 14, 1);
          const target = path.at(piece.dock + flowShift);

          // Bound elements keep a small residual sway so the row never sets.
          const sway = floatAt(seconds, seed + 40, 6, 4.5, 0.7);

          const freeX = piece.x + drift.x + (1 - appear) * (piece.x - 960) * 0.16;
          const freeY = piece.y + drift.y + (1 - appear) * 46;

          const x = interpolate(bind, [0, 1], [freeX, target.x + sway.x]);
          const y = interpolate(bind, [0, 1], [freeY, target.y + sway.y]);

          const tilt = interpolate(bind, [0, 1], [drift.rot * 4.5, sway.rot * 0.8]);
          const depthScale = interpolate(bind, [0, 1], [1.06 + piece.z * 0.3, 1]);
          const scale = depthScale * interpolate(appear, [0, 1], [0.84, 1]);
          const focus = (1 - piece.z) * 1.5 * (1 - bind);

          // Expanding ring at the instant the thread takes hold. Kept thin and
          // brief so it reads as a ripple rather than a second card.
          const flash = interpolate(frame, [dockAt + 4, dockAt + 24], [0, 1], {
            easing: EASE.out,
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          });

          return (
            <React.Fragment key={piece.slug}>
            <div
              style={{
                position: 'absolute',
                left: x - TILE / 2,
                top: y - TILE / 2,
                width: TILE,
                height: TILE,
                rotate: `${tilt}deg`,
                scale: String(scale),
                opacity: appear,
                filter: focus > 0.05 ? `blur(${focus}px)` : undefined,
              }}
            >
              {flash > 0 && flash < 1 ? (
                <div
                  style={{
                    position: 'absolute',
                    inset: -TILE * 0.06,
                    borderRadius: TILE * 0.32,
                    border: '1.5px solid rgba(30, 195, 189, 0.75)',
                    opacity: (1 - flash) * 0.38,
                    scale: String(1 + flash * 0.8),
                  }}
                />
              ) : null}
              <ProductTile slug={piece.slug} size={TILE} bound={bind} />
            </div>

            {/*
             * Deliberately a sibling rather than a child of the tile, so the
             * depth blur applied to a far tile does not also soften its label.
             * The name is only useful while the icon is loose and readable; it
             * clears as the tile docks, which is also when the row gets tight
             * enough for 15 labels to collide.
             */}
            {capabilities === 'chips' || capabilities === 'both' ? (
              <div
                style={{
                  position: 'absolute',
                  left: x - 110,
                  top: y + TILE / 2 + 12,
                  width: 220,
                  textAlign: 'center',
                  fontFamily: 'Segoe UI',
                  fontWeight: 400,
                  fontSize: 21,
                  letterSpacing: '0.005em',
                  color: '#4A5563',
                  whiteSpace: 'nowrap',
                  opacity: appear * (1 - bind) * 0.92,
                }}
              >
                {LABELS[piece.slug]}
              </div>
            ) : null}
            </React.Fragment>
          );
        })}
      </AbsoluteFill>

      {/*
       * Spans are drawn outside the pushed layer on purpose: an annotation
       * that scales with the camera reads as part of the scene, and this
       * should read as a label laid over it.
       */}
      {capabilities === 'brackets' || capabilities === 'both'
        ? (() => {
            // One baseline for every span, so the annotations read as a single
            // row rather than three rules at three heights following the
            // curve. Computed from the lowest tile across all spans.
            const steps = 9;
            const geom = SPANS.map((span) => {
              let lowest = 0;
              let left = Infinity;
              let right = -Infinity;
              for (let s = 0; s <= steps; s++) {
                const p = path.at(
                  span.a + ((span.b - span.a) * s) / steps + flowShift,
                );
                lowest = Math.max(lowest, p.y);
                left = Math.min(left, p.x);
                right = Math.max(right, p.x);
              }
              return {span, lowest, left, right};
            });
            const ruleY = Math.max(...geom.map((g) => g.lowest)) + 92;

            return geom.map(({span, left, right}) => {
              const grow = interpolate(frame, [span.at, span.at + 22], [0, 1], {
                easing: EASE.out,
                extrapolateLeft: 'clamp',
                extrapolateRight: 'clamp',
              });
              if (grow <= 0) return null;

              // Clamp into the frame so a span that reaches the edge of the
              // thread cannot push its rule or its label off screen.
              const a = Math.max(56, left - 46);
              const b = Math.min(1920 - 56, right + 46);
              const midX = (a + b) / 2;

              return (
                <div key={span.label} style={{position: 'absolute', inset: 0}}>
                  <div
                    style={{
                      position: 'absolute',
                      left: a,
                      top: ruleY,
                      width: b - a,
                      height: 1,
                      backgroundColor: 'rgba(30, 195, 189, 0.55)',
                      scale: `${grow} 1`,
                    }}
                  />
                  {[a, b].map((edge) => (
                    <div
                      key={edge}
                      style={{
                        position: 'absolute',
                        left: edge,
                        top: ruleY,
                        width: 1,
                        height: 9,
                        backgroundColor: 'rgba(30, 195, 189, 0.55)',
                        opacity: grow,
                      }}
                    />
                  ))}
                  <div
                    style={{
                      position: 'absolute',
                      left: midX - 260,
                      top: ruleY + 18,
                      width: 520,
                      textAlign: 'center',
                      fontFamily: 'Segoe UI',
                      fontWeight: 400,
                      fontSize: 36,
                      letterSpacing: '0.1em',
                      color: '#39424E',
                      opacity: interpolate(
                        frame,
                        [span.at + 12, span.at + 32],
                        [0, 1],
                        {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
                      ),
                    }}
                  >
                    {span.label.toUpperCase()}
                  </div>
                </div>
              );
            });
          })()
        : null}

      {/*
       * The top band holds scattered tiles until roughly frame 120, so this
       * list waits for it to clear rather than overlapping the gather.
       */}
      {capabilities === 'words' ? (
        <AbsoluteFill
          style={{
            alignItems: 'center',
            justifyContent: 'flex-start',
            paddingTop: 116,
          }}
        >
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: '0em 0.42em',
              maxWidth: 1620,
              fontFamily: 'Segoe UI',
              fontWeight: 300,
              fontSize: 58,
              lineHeight: 1.16,
              letterSpacing: '-0.01em',
              color: '#2F343B',
            }}
          >
            <SplitWords text={CAPABILITY_WORDS.join(' ')} start={128} stagger={9} />
          </div>
          {/*
           * A summary sentence used to sit here. It landed at frame 206, which
           * is under the narration line "and continues delivering value long
           * after go-live" - unrelated prose competing with prose, forcing the
           * viewer to read one thing while hearing another. The category words
           * survive because they are single nouns, which a viewer takes in
           * without reading against the voice.
           */}
        </AbsoluteFill>
      ) : null}

      {/*
       * Review note 1: the caption "One coordinated flow." was cut. It only
       * restated the narration, so the block is now skipped when the copy is
       * empty rather than deleted, keeping the schema and the reusable scene
       * intact for other films.
       */}
      {caption.trim() === '' ? null : (
      <AbsoluteFill
        style={{
          alignItems: 'center',
          justifyContent: 'flex-end',
          paddingBottom: 132,
        }}
      >
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: '0em 0.3em',
            maxWidth: 1500,
            fontFamily: 'Segoe UI',
            fontWeight: 350,
            fontSize: 82,
            lineHeight: 1.14,
            letterSpacing: '-0.012em',
            color: '#34383F',
            translate: `0px ${interpolate(frame, [CAPTION_IN, 282], [0, -9], {
              easing: EASE.drift,
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            })}px`,
          }}
        >
          <SplitWords text={caption} start={CAPTION_IN} stagger={4} />
        </div>
      </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
