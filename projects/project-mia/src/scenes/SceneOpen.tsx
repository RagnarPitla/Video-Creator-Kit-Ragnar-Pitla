import React from 'react';
import {
  AbsoluteFill,
  Easing,
  Interactive,
  interpolate,
  useCurrentFrame,
} from 'remotion';
import {z} from 'zod';
import {Stage} from '../components/Stage';
import {SplitWords} from '../components/WordMask';

export const sceneOpenSchema = z.object({
  kicker: z.string(),
  wordmark: z.string(),
  tagline: z.string(),
});

export const SceneOpen: React.FC<z.infer<typeof sceneOpenSchema>> = ({
  kicker,
  wordmark,
  tagline,
}) => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill>
      <Stage
        vanishX={960}
        vanishY={508}
        zoomFrom={1.16}
        zoomTo={1.0}
        streak
        streakStart={8}
        streakTravel={118}
        streakY={44}
        streakScale={1}
        scrim={0.5}
      />

      <AbsoluteFill
        style={{
          padding: '178px 142px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 40,
        }}
      >
        <Interactive.Div
          name="Kicker"
          style={{
            fontFamily: 'Segoe UI',
            fontSize: 44,
            fontWeight: 500,
            letterSpacing: '0.46em',
            textTransform: 'uppercase',
            color: '#54697F',
            paddingLeft: '0.46em',
            opacity: interpolate(frame, [4, 26], [0, 1], {
              easing: Easing.bezier(0.16, 1, 0.3, 1),
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            }),
            translate: interpolate(frame, [4, 30], ['0px 18px', '0px 0px'], {
              easing: Easing.bezier(0.16, 1, 0.3, 1),
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            }),
          }}
        >
          {kicker}
        </Interactive.Div>

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            columnGap: '0.22em',
            fontFamily: 'Segoe UI',
            fontWeight: 300,
            fontSize: 290,
            lineHeight: 1,
            letterSpacing: '-0.015em',
            color: '#0C1B2A',
          }}
        >
          <SplitWords text={wordmark} start={12} stagger={7} />
        </div>

        <Interactive.Div
          name="Accent rule"
          style={{
            height: 3,
            borderRadius: 99,
            background:
              'linear-gradient(90deg, rgba(25,182,228,0) 0%, #19B6E4 50%, rgba(25,182,228,0) 100%)',
            width: interpolate(frame, [30, 66], [0, 620], {
              easing: Easing.bezier(0.16, 1, 0.3, 1),
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            }),
          }}
        />

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            columnGap: '0.3em',
            maxWidth: 1300,
            textAlign: 'center',
            fontFamily: 'Segoe UI',
            fontWeight: 300,
            fontSize: 78,
            lineHeight: 1.24,
            color: '#33475C',
          }}
        >
          <SplitWords text={tagline} start={44} stagger={3} />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
