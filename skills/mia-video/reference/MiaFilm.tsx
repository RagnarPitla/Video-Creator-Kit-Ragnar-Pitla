import React from 'react';
import {
  AbsoluteFill,
  Audio,
  OffthreadVideo,
  Sequence,
  staticFile,
} from 'remotion';
import {z} from 'zod';
import {S01Opening} from './scenes/S01Opening';
import {S02Retailer} from './scenes/S02Retailer';
import {S03StatementOfWork} from './scenes/S03StatementOfWork';
import {S04ConferenceRoom} from './scenes/S04ConferenceRoom';
import {S05FlowBoxes} from './scenes/S05FlowBoxes';
import {S06Montage} from './scenes/S06Montage';
import {S07Handshake} from './scenes/S07Handshake';
import {S08ThoughtBubble} from './scenes/S08ThoughtBubble';
import {S09Presales} from './scenes/S09Presales';
import {S10GoLive} from './scenes/S10GoLive';
import {S11Steady} from './scenes/S11Steady';
import {S12Documentation} from './scenes/S12Documentation';
import {S13Configuration} from './scenes/S13Configuration';
import {S14Migration} from './scenes/S14Migration';
import {S16SuccessByDesign} from './scenes/S16SuccessByDesign';
import {S17FitGap} from './scenes/S17FitGap';
import {S18End} from './scenes/S18End';
import {S15Title} from './scenes/S15Title';
import {FILM_COPY} from './film-copy';
import {EvidenceMeter} from './components/EvidenceMeter';
import {FilmGrade} from './components/FilmGrade';
import {JourneyRail} from './components/JourneyRail';
import {DEFAULT_LOOK, LOOKS, type LookName} from './lib/look';

export const miaFilmSchema = z.object({
  narration: z.boolean(),
  look: z.enum(['studio', 'depth', 'product']),
  /** A film-wide overlay. 'rail' shows where in the journey we are, 'evidence'
   * tallies what Mia has produced. Two different arguments over one cut. */
  overlay: z.enum(['none', 'rail', 'evidence']),
});

/**
 * The whole film, 4608 frames at 30 fps, which is the 153.6 sec of the original
 * cut to the frame.
 *
 * The original was 43 percent black: 65.9 sec across four stretches where the
 * narration kept going but no picture was ever produced. Every one of those is
 * covered here, so the timeline below has no gaps and no black.
 *
 * Slots marked `source` are the finished brand assets lifted out of the
 * original cut, because they are real artifacts that should not be imitated:
 * the Project Mia title animation, the Success by Design slide, the screen
 * recording of the configuration plan document, and the Microsoft end card.
 * Everything else is generated.
 *
 * Source clips were extracted with the last frame cloned for a few frames, so
 * a slot slightly longer than its footage holds rather than cutting to black.
 */
type Slot = {
  from: number;
  duration: number;
  label: string;
  node: React.ReactNode;
};

const clip = (file: string) => (
  <OffthreadVideo src={staticFile(file)} muted style={{width: '100%', height: '100%'}} />
);

export const SLOTS: Slot[] = [
  {from: 0, duration: 282, label: 'S01 Opening', node: <S01Opening {...FILM_COPY.s01} />},
  {from: 282, duration: 240, label: 'Title', node: <S15Title {...FILM_COPY.s15} />},
  {from: 522, duration: 90, label: 'S02 Retailer', node: <S02Retailer {...FILM_COPY.s02} />},
  {from: 612, duration: 249, label: 'S09 Pre-sales', node: <S09Presales {...FILM_COPY.s09} />},
  {
    from: 861,
    duration: 243,
    label: 'S03 Statement of Work',
    node: <S03StatementOfWork {...FILM_COPY.s03} />,
  },
  {from: 1104, duration: 129, label: 'Success by Design', node: <S16SuccessByDesign {...FILM_COPY.s16} />},
  {
    from: 1233,
    duration: 180,
    label: 'S04 Conference room',
    node: <S04ConferenceRoom {...FILM_COPY.s04} />,
  },
  {from: 1413, duration: 150, label: 'S05 Flow boxes', node: <S05FlowBoxes {...FILM_COPY.s05} />},
  {
    from: 1563,
    duration: 393,
    label: 'Configuration plan (source)',
    node: <S17FitGap {...FILM_COPY.s17} />,
  },
  {from: 1956, duration: 276, label: 'S06 Montage', node: <S06Montage {...FILM_COPY.s06} />},
  {from: 2232, duration: 189, label: 'S10 Go-live', node: <S10GoLive {...FILM_COPY.s10} />},
  {from: 2421, duration: 138, label: 'S07 Handshake', node: <S07Handshake {...FILM_COPY.s07} />},
  {from: 2559, duration: 300, label: 'S11 Steady state', node: <S11Steady {...FILM_COPY.s11} />},
  {
    from: 2859,
    duration: 270,
    label: 'S08 Thought bubble',
    node: <S08ThoughtBubble {...FILM_COPY.s08} />,
  },
  {
    from: 3129,
    duration: 351,
    label: 'S12 Documentation',
    node: <S12Documentation {...FILM_COPY.s12} />,
  },
  {
    from: 3480,
    duration: 450,
    label: 'S13 Configuration',
    node: <S13Configuration {...FILM_COPY.s13} />,
  },
  {from: 3930, duration: 438, label: 'S14 Migration', node: <S14Migration {...FILM_COPY.s14} />},
  {from: 4368, duration: 240, label: 'Outro + end card', node: <S18End {...FILM_COPY.s18} />},
];

export const FILM_FRAMES = 4608;

export const MiaFilm: React.FC<z.infer<typeof miaFilmSchema>> = ({
  narration,
  look = DEFAULT_LOOK,
  overlay = 'none',
}) => {
  const graded = LOOKS[look as LookName] ?? LOOKS[DEFAULT_LOOK];
  return (
    <AbsoluteFill style={{backgroundColor: '#EEF3F8'}}>
      {narration ? <Audio src={staticFile('narration.m4a')} /> : null}
      <FilmGrade look={graded}>
        {SLOTS.map((slot) => (
          <Sequence
            key={slot.label}
            from={slot.from}
            durationInFrames={slot.duration}
            name={slot.label}
          >
            {slot.node}
          </Sequence>
        ))}

        {overlay === 'rail' ? <JourneyRail /> : null}
        {overlay === 'evidence' ? <EvidenceMeter /> : null}
      </FilmGrade>
    </AbsoluteFill>
  );
};
