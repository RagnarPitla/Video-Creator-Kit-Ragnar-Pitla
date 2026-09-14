/**
 * V5 look presets.
 *
 * These are grading and density choices, not layout choices, so a variant can
 * be swapped without re-checking a single scene's composition. Everything here
 * is applied by `FilmGrade`, except `logos`, which a handful of scenes read to
 * decide whether to show Dynamics 365 product icons alongside their content.
 */
export type LookName = 'studio' | 'depth' | 'product';

export type Look = {
	/** Film grain opacity. Above about 0.07 it starts to read as noise. */
	grain: number;
	/** Highlight bloom. Lifts whites and softens the hardest edges. */
	bloom: number;
	/** Corner falloff. Very small numbers; this is a lens, not a spotlight. */
	vignette: number;
	/** Warm key wash, as if lit by a practical rather than a render. */
	warmth: number;
	/** Edge softness in px, imitating a fast lens falling off toward the rim. */
	edgeBlur: number;
	/** How much Dynamics 365 product iconography the scenes carry. */
	logos: 'minimal' | 'rich';
};

export const LOOKS: Record<LookName, Look> = {
	/**
	 * Keynote clean. What v4 looked like, plus just enough grain that the frame
	 * stops reading as flat vector art on a large screen.
	 */
	studio: {
		grain: 0.018,
		bloom: 0.1,
		vignette: 0.04,
		warmth: 0.12,
		edgeBlur: 0,
		logos: 'minimal',
	},

	/**
	 * Photographic. Grain, lens vignette, edge falloff and a warm key, so the
	 * film reads as shot rather than rendered. This is the one that answers
	 * "make it more realistic".
	 */
	depth: {
		grain: 0.05,
		bloom: 0.3,
		vignette: 0.17,
		warmth: 0.55,
		edgeBlur: 1.7,
		logos: 'minimal',
	},

	/**
	 * The Dynamics cut. Same grade as `depth`, but the scenes that can carry
	 * product iconography do carry it.
	 */
	product: {
		grain: 0.042,
		bloom: 0.26,
		vignette: 0.14,
		warmth: 0.45,
		edgeBlur: 1.4,
		logos: 'rich',
	},
};

export const DEFAULT_LOOK: LookName = 'depth';
