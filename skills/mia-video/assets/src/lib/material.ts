import React from 'react';
import {DEFAULT_LOOK, LOOKS, type Look} from './look';

/**
 * Layered elevation.
 *
 * A single large soft shadow is the tell that a surface was drawn rather than
 * photographed. Real objects cast three overlapping shadows: a tight dark one
 * where they meet the surface, a mid one from the key light, and a wide faint
 * ambient one. Stacking them is cheap and does more for perceived realism than
 * any amount of gradient work on the card itself.
 *
 * `level` is roughly the height off the page in px.
 */
export const elevation = (level: number, tint = '84, 113, 145'): string =>
	[
		`0 ${(level * 0.1).toFixed(1)}px ${(level * 0.26).toFixed(1)}px rgba(${tint}, 0.14)`,
		`0 ${(level * 0.46).toFixed(1)}px ${(level * 1.05).toFixed(1)}px rgba(${tint}, 0.11)`,
		`0 ${(level * 1.28).toFixed(1)}px ${(level * 2.5).toFixed(1)}px rgba(${tint}, 0.09)`,
	].join(', ');

/** Elevation plus the thin top highlight that reads as a lit edge. */
export const raised = (level: number, tint?: string): string =>
	`${elevation(level, tint)}, inset 0 1px 0 rgba(255, 255, 255, 1)`;

/**
 * The active look, so scenes can decide how much Dynamics 365 iconography to
 * carry without every one of them taking a prop.
 */
export const LookContext = React.createContext<Look>(LOOKS[DEFAULT_LOOK]);

export const useLook = (): Look => React.useContext(LookContext);
