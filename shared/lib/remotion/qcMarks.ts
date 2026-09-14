/**
 * The QC reel's mark list, in one place.
 *
 * This module exists because it was got wrong once. `Root.tsx` held QC_EXTRA
 * and `scripts/gen-marks.ts` held its own copy; the copy went stale at 9
 * entries against Root's 20, so the generated mark file described 35 marks
 * while the rendered reel contained 46. The verifier would then have compared
 * the wrong frames and reported green. A mark list that lives in two files is
 * a mark list that is wrong.
 *
 * Boundaries come from the cut itself (`cutBoundaries`), never hand-listed, so
 * a shot added later cannot be forgotten. Boundaries are where this film has
 * historically broken - every V17 white flash was at one.
 *
 * QC_EXTRA is the hand-picked mid-shot part: frames where composition rather
 * than a cut is what needs checking. These are the eleven product shots and
 * four drawn console scenes measured for the V18 clean-UI work.
 */

export const QC_EXTRA = [
	440, 500, 518, 590, 660, 710, 770, 840, 1200, 1380, 1540, 1900, 2150, 2280,
	2380, 3200, 3400, 3700, 4050, 4300,
];

/** Boundaries plus extras, deduped and sorted - the same list QcReel renders. */
export const qcMarks = (boundaries: number[]): number[] =>
	Array.from(new Set([...boundaries, ...QC_EXTRA])).sort((a, b) => a - b);
