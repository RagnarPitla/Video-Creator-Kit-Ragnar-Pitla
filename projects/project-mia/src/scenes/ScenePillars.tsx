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

export const scenePillarsSchema = z.object({
  kicker: z.string(),
  pillars: z.array(z.object({index: z.string(), label: z.string()})),
});

export const ScenePillars: React.FC<z.infer<typeof scenePillarsSchema>> = ({
  kicker,
  pillars,
}) => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill>
      <Stage
        vanishX={640}
        vanishY={545}
        zoomFrom={1.12}
        zoomTo={1.0}
        fieldOpacity={0.8}
        scrim={0.68}
      />

      <AbsoluteFill
        style={{
          padding: '178px 142px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: 54,
        }}
      >
        <Interactive.Div
          name="Kicker"
          style={{
            fontFamily: 'Segoe UI',
            fontSize: 44,
            fontWeight: 500,
            letterSpacing: '0.4em',
            textTransform: 'uppercase',
            color: '#54697F',
            opacity: interpolate(frame, [4, 26], [0, 1], {
              easing: Easing.bezier(0.16, 1, 0.3, 1),
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            }),
            translate: interpolate(frame, [4, 30], ['0px 16px', '0px 0px'], {
              easing: Easing.bezier(0.16, 1, 0.3, 1),
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            }),
          }}
        >
          {kicker}
        </Interactive.Div>

        <div style={{display: 'flex', flexDirection: 'column'}}>
          {pillars.map((pillar, i) => (
            <div
              key={i}
              style={{position: 'relative', paddingTop: 40, paddingBottom: 40}}
            >
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  height: 2,
                  background:
                    'linear-gradient(90deg, rgba(58,80,104,0.62) 0%, rgba(58,80,104,0.07) 100%)',
                  width: interpolate(
                    frame,
                    [14 + i * 26, 46 + i * 26],
                    ['0%', '100%'],
                    {
                      easing: Easing.bezier(0.16, 1, 0.3, 1),
                      extrapolateLeft: 'clamp',
                      extrapolateRight: 'clamp',
                    },
                  ),
                }}
              />
              <div style={{display: 'flex', alignItems: 'baseline', gap: 42}}>
                <div
                  style={{
                    width: 118,
                    flexShrink: 0,
                    fontFamily: 'Segoe UI',
                    fontSize: 44,
                    fontWeight: 500,
                    letterSpacing: '0.14em',
                    color: '#19B6E4',
                  }}
                >
                  {pillar.index}
                </div>
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    columnGap: '0.26em',
                    fontFamily: 'Segoe UI',
                    fontWeight: 300,
                    fontSize: 92,
                    lineHeight: 1.16,
                    letterSpacing: '-0.012em',
                    color: '#0C1B2A',
                  }}
                >
                  <SplitWords text={pillar.label} start={22 + i * 26} stagger={3} />
                </div>
              </div>
            </div>
          ))}
          <div
            style={{
              height: 2,
              background:
                'linear-gradient(90deg, rgba(58,80,104,0.62) 0%, rgba(58,80,104,0.07) 100%)',
              width: interpolate(
                frame,
                [14 + pillars.length * 26, 46 + pillars.length * 26],
                ['0%', '100%'],
                {
                  easing: Easing.bezier(0.16, 1, 0.3, 1),
                  extrapolateLeft: 'clamp',
                  extrapolateRight: 'clamp',
                },
              ),
            }}
          />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
