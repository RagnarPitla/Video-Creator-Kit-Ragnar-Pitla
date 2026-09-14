import React from 'react';

/**
 * "Remove all the text and faded bars from the UI parts." - Ragnar, on V17.
 *
 * Two separate mechanisms in this film leave user interface half-erased, and
 * both of them read as a rendering fault rather than as a look:
 *
 *   1. ProductClip dissolves the bottom 38 percent of a screen recording into
 *      the paper so the caption has somewhere to sit. Wherever the recording
 *      has content down there - the intake screen's signal chips, the
 *      environment tile rows, a progress bar - it comes through at somewhere
 *      between 10 and 90 percent and reads as smeared. Measured on
 *      Mia-Film-V17-Final at frames 500, 590, 660, 710, 770, 840, 1200, 1380,
 *      1540, 2150 and 4300: all eleven product shots carry it. The same wash
 *      also paints over the label pill at bottom 152, which is why "MIA
 *      CONSOLE" is a ghost in every one of them.
 *
 *   2. Artifact puts a 30 percent scrim and a 2px blur behind its document
 *      card. That is not enough to stop the console chrome behind being read,
 *      so the left nav, the task rows and the "Wave completion" progress bar
 *      sit behind the artefact as unreadable grey type and a purple bar.
 *      Frames 1900, 3400, 3700 and 4050.
 *
 * Threading a prop for this would mean touching seven scene components and
 * every ProductClip call site, and would silently miss any added later. A
 * context set once per cut cannot miss one.
 *
 * Off by default: the delivered V17 finals must keep rendering exactly as
 * approved. Only a cut that opts in changes.
 */
export const CleanUIContext = React.createContext(false);

export const useCleanUI = () => React.useContext(CleanUIContext);
