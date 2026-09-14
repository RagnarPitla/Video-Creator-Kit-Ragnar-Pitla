import React from 'react';
import {Img, staticFile} from 'remotion';
import {raised} from '../lib/material';

/**
 * A single Dynamics 365 product icon on a white tile, matching the card
 * language used everywhere else in the film.
 *
 * The icons are loaded as external files rather than inlined. Every Microsoft
 * product SVG carries gradient definitions with ids like `paint0_linear_3989`,
 * and inlining fifteen of them into one document makes those ids collide, so
 * several icons would silently render with another product's gradient.
 */
export const ProductTile: React.FC<{
	slug: string;
	size: number;
	/** 0 drifting free, 1 docked on the thread. */
	bound: number;
}> = ({slug, size, bound}) => {
	return (
		<div
			style={{
				width: size,
				height: size,
				borderRadius: size * 0.235,
				background: '#FFFFFF',
				border: `1.5px solid rgba(30, 195, 189, ${bound * 0.45})`,
				boxShadow: raised(size * 0.19, '28, 42, 64'),
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
			}}
		>
			<Img
				src={staticFile(`d365/${slug}.svg`)}
				style={{width: size * 0.64, height: size * 0.64}}
			/>
		</div>
	);
};
