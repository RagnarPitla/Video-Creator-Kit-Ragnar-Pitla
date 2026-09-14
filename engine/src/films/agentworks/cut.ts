/**
 * The cut sheet. `projects/hack-2026-agentworks/audio/beats.json` verbatim, plus
 * the shot tiling derived from it.
 *
 * The narration is the authority. Every beat's audio starts on its own
 * `startFrame` and nothing in this file is allowed to move one, because the wavs
 * were rendered against these numbers and Ragnar may re-record over them.
 *
 * The shots tile the same timeline with no gap and no overlap. That is asserted at
 * module load rather than trusted: a shot whose length changed and whose neighbour
 * did not is the failure mode that no typecheck and no output gate can see.
 */

export type Beat = {
  n: number;
  text: string;
  audio: string;
  startFrame: number;
  durationFrames: number;
};

export const FPS = 30;
export const TOTAL_FRAMES = 3727;

/** beats.json, unedited. */
export const BEATS: Beat[] = [
  { n: 1, text: "The dashboard suite runs 522 tests. Zero failing.", audio: "beat-01.wav", startFrame: 0, durationFrames: 139 },
  { n: 2, text: "Seven rows on that page, each an agent and its vendor. Claude Code, Anthropic. All seven correct.", audio: "beat-02.wav", startFrame: 155, durationFrames: 208 },
  { n: 3, text: "Change that vendor to OpenAI. Run it again.", audio: "beat-03.wav", startFrame: 379, durationFrames: 93 },
  { n: 4, text: "Nothing went red. The site said Claude Code was made by OpenAI.", audio: "beat-04.wav", startFrame: 489, durationFrames: 124 },
  { n: 5, text: "The nearest check emptied that field and confirmed the page complained. It tested presence. It never tested truth.", audio: "beat-05.wav", startFrame: 629, durationFrames: 208 },
  { n: 6, text: "The method is an arm. Mutate one value, run the suite, restore the file.", audio: "beat-06.wav", startFrame: 854, durationFrames: 157 },
  { n: 7, text: "Then run it on a comment, where nothing real changed. Same failures means the gate is not reading your change.", audio: "beat-07.wav", startFrame: 1027, durationFrames: 198 },
  { n: 8, text: "Second case. A page ships its status definitions as prose. Swap two of them.", audio: "beat-08.wav", startFrame: 1242, durationFrames: 170 },
  { n: 9, text: "A staleness gate fired. It fired the same way for the comment. Drift, not falsehood.", audio: "beat-09.wav", startFrame: 1428, durationFrames: 176 },
  { n: 10, text: "Regenerating the copy, the natural repair, turned it green with the false definition shipped.", audio: "beat-10.wav", startFrame: 1621, durationFrames: 177 },
  { n: 11, text: "A gate that turns green by regenerating is not a gate on content.", audio: "beat-11.wav", startFrame: 1815, durationFrames: 117 },
  { n: 12, text: "Both came out of the same loop. Three sessions on one board, each running the others' findings against its own code.", audio: "beat-12.wav", startFrame: 1948, durationFrames: 206 },
  { n: 13, text: "Both are closed. The published values are bound to the source now, and the arms that were green go red.", audio: "beat-13.wav", startFrame: 2170, durationFrames: 180 },
  { n: 14, text: "Third case, and it is this script. The ledger said 43 arms. A grep with no word boundary, counting harm and warm.", audio: "beat-14.wav", startFrame: 2367, durationFrames: 244 },
  { n: 15, text: "Corrected to 37. Before this script was finished, 38.", audio: "beat-15.wav", startFrame: 2628, durationFrames: 130 },
  { n: 16, text: "Fourth case, and it is not ours. A session read a commit hash and a diffstat and reported the work landed.", audio: "beat-16.wav", startFrame: 2775, durationFrames: 194 },
  { n: 17, text: "The commits do not exist. HEAD had never moved.", audio: "beat-17.wav", startFrame: 2985, durationFrames: 91 },
  { n: 18, text: "It found that and published the warning itself.", audio: "beat-18.wav", startFrame: 3093, durationFrames: 77 },
  { n: 19, text: "Run one command whose answer you already know, before you trust any of this.", audio: "beat-19.wav", startFrame: 3186, durationFrames: 141 },
  { n: 20, text: "Five products, all under build.", audio: "beat-20.wav", startFrame: 3343, durationFrames: 69 },
  { n: 21, text: "Promotion needs a passing suite and a closed independent review bound to the same source digest. No product has both.", audio: "beat-21.wav", startFrame: 3429, durationFrames: 220 },
  { n: 22, text: "Zero of five, on the record.", audio: "beat-22.wav", startFrame: 3665, durationFrames: 62 },
];

export type ShotId =
  | "S01" | "S02" | "S03" | "S04" | "S05" | "S06" | "S07" | "S08"
  | "S09" | "S10" | "S11" | "S12" | "S13" | "S14" | "S15" | "S16"
  | "S17" | "S18" | "S19" | "S20" | "S21" | "S22";

export type Shot = {
  id: ShotId;
  /** Beats this shot is on screen for. A shot serving two beats is deliberate. */
  beats: number[];
  start: number;
  durationInFrames: number;
  /** Is what is on screen a recording, a browser capture, or drawn? */
  kind: "drawn" | "capture" | "recording";
};

/**
 * Shot boundaries are beat boundaries except for the last two.
 *
 * S21 gives up its last 68 frames to S22 so the `Honest scope` recording is the
 * film's final image, which is what script.md section 6 placement 3 asks for. That
 * is the only place a shot boundary and a beat boundary disagree, and it is why
 * `SHOTS` is written out rather than derived from `BEATS`.
 */
export const SHOTS: Shot[] = [
  { id: "S01", beats: [1], start: 0, durationInFrames: 155, kind: "drawn" },
  { id: "S02", beats: [2], start: 155, durationInFrames: 224, kind: "capture" },
  { id: "S03", beats: [3], start: 379, durationInFrames: 110, kind: "capture" },
  { id: "S04", beats: [4], start: 489, durationInFrames: 140, kind: "capture" },
  { id: "S05", beats: [5], start: 629, durationInFrames: 225, kind: "drawn" },
  { id: "S06", beats: [6], start: 854, durationInFrames: 173, kind: "drawn" },
  { id: "S07", beats: [7], start: 1027, durationInFrames: 215, kind: "drawn" },
  { id: "S08", beats: [8], start: 1242, durationInFrames: 186, kind: "drawn" },
  { id: "S09", beats: [9], start: 1428, durationInFrames: 193, kind: "drawn" },
  { id: "S10", beats: [10], start: 1621, durationInFrames: 194, kind: "drawn" },
  { id: "S11", beats: [11], start: 1815, durationInFrames: 133, kind: "recording" },
  { id: "S12", beats: [12], start: 1948, durationInFrames: 222, kind: "drawn" },
  { id: "S13", beats: [13], start: 2170, durationInFrames: 197, kind: "drawn" },
  { id: "S14", beats: [14], start: 2367, durationInFrames: 261, kind: "drawn" },
  { id: "S15", beats: [15], start: 2628, durationInFrames: 147, kind: "drawn" },
  { id: "S16", beats: [16], start: 2775, durationInFrames: 210, kind: "drawn" },
  { id: "S17", beats: [17], start: 2985, durationInFrames: 108, kind: "drawn" },
  { id: "S18", beats: [18], start: 3093, durationInFrames: 93, kind: "drawn" },
  { id: "S19", beats: [19], start: 3186, durationInFrames: 157, kind: "drawn" },
  { id: "S20", beats: [20], start: 3343, durationInFrames: 86, kind: "capture" },
  { id: "S21", beats: [21], start: 3429, durationInFrames: 168, kind: "drawn" },
  { id: "S22", beats: [21, 22], start: 3597, durationInFrames: 130, kind: "recording" },
];

/**
 * Runs at module load, in the preview and in the render.
 *
 * Three separate things go wrong here and none of them is visible in a still: a
 * shot lengthened without its neighbour moving, a beat's audio scheduled past the
 * end of the composition, and the total drifting away from the narration. The
 * cheapest place to catch all three is the moment the file is imported.
 */
const audit = () => {
  let cursor = 0;
  for (const s of SHOTS) {
    if (s.start !== cursor) {
      throw new Error(`cut: ${s.id} starts at ${s.start}, previous shot ends at ${cursor}`);
    }
    cursor += s.durationInFrames;
  }
  if (cursor !== TOTAL_FRAMES) {
    throw new Error(`cut: shots sum to ${cursor}, narration runs to ${TOTAL_FRAMES}`);
  }
  const last = BEATS[BEATS.length - 1];
  if (last.startFrame + last.durationFrames !== TOTAL_FRAMES) {
    throw new Error("cut: beat 22 does not end on the last frame");
  }
  for (const b of BEATS) {
    if (b.startFrame + b.durationFrames > TOTAL_FRAMES) {
      throw new Error(`cut: beat ${b.n} audio runs past the end of the film`);
    }
  }
};
audit();

/** Frames where the picture changes. Derived, never hand-listed - a shot added later is reviewed automatically. */
export const CUT_POINTS: number[] = SHOTS.map((s) => s.start).filter((f) => f > 0);
