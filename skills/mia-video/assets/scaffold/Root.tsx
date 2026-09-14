import React from 'react';
import {AbsoluteFill, Composition} from 'remotion';
import './fonts';
import {BrandBackdrop} from './components/BrandBackdrop';
import {Caption} from './components/Caption';
import {FilmGrade} from './components/FilmGrade';
import {Motes} from './components/Motes';
import {Stage} from './components/Stage';
import {DEFAULT_LOOK, LOOKS} from './lib/look';

/** Replace this with your own scenes. It exists so the scaffold renders. */
const FirstScene: React.FC = () => (
  <AbsoluteFill style={{backgroundColor: '#EEF3F8'}}>
    <Stage vanishX={960} vanishY={500} zoomFrom={1.02} zoomTo={1.08} />
    <BrandBackdrop start={0} strength={0.07} height={1180} rings />
    <Motes count={26} seed={1} />
    <Caption text="Replace this scene." start={10} end={140} size={54} />
  </AbsoluteFill>
);

export const RemotionRoot: React.FC = () => (
  <Composition
    id="Film"
    component={() => (
      <FilmGrade look={LOOKS[DEFAULT_LOOK]}>
        <FirstScene />
      </FilmGrade>
    )}
    durationInFrames={150}
    fps={30}
    width={1920}
    height={1080}
  />
);
