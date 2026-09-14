import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';

type Person = {
  x: number;
  y: number;
  height: number;
  opacity: number;
  blur: number;
  walk: number;
  flip?: boolean;
};

const PEOPLE: Person[] = [
  {x: 30, y: 39, height: 96, opacity: 0.3, blur: 1.6, walk: 10},
  {x: 50, y: 40, height: 118, opacity: 0.34, blur: 1.4, walk: -14, flip: true},
  {x: 88, y: 44, height: 158, opacity: 0.4, blur: 1.2, walk: 18},
  {x: 20, y: 47, height: 208, opacity: 0.46, blur: 1, walk: -20},
  {x: 78, y: 52, height: 262, opacity: 0.5, blur: 0.8, walk: 26, flip: true},
];

/**
 * Soft grey figures that give the hall a human scale, the way the reference
 * frame does. Deliberately low contrast so they never compete with the copy.
 */
export const People: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  return (
    <AbsoluteFill>
      {PEOPLE.map((person, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: `${person.x}%`,
            top: `${person.y}%`,
            translate: `calc(-50% + ${((frame / fps) * person.walk).toFixed(2)}px) -50%`,
            opacity: person.opacity,
            filter: `blur(${person.blur}px)`,
            scale: person.flip ? '-1 1' : '1 1',
          }}
        >
          <svg
            width={person.height * 0.42}
            height={person.height}
            viewBox="0 0 100 240"
            fill="rgba(72,88,106,1)"
          >
            <circle cx="50" cy="21" r="15" />
            <path d="M50 40c-13 0-21 8-24 24l-6 34c-1.5 8 9 10 11 2.5l5-24 1 22-6 74c-1.5 9 10.5 10.5 12.5 2l6.5-54 6.5 54c2 8.5 14 7 12.5-2l-6-74 1-22 5 24c2 7.5 12.5 5.5 11-2.5l-6-34c-3-16-11-24-24-24z" />
          </svg>
        </div>
      ))}
    </AbsoluteFill>
  );
};
