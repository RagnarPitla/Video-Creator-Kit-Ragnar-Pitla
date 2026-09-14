import React from 'react';
import {AbsoluteFill, staticFile, useCurrentFrame} from 'remotion';
import {rand} from '../lib/motion';
import type {Look} from '../lib/look';
import {LookContext} from '../lib/material';

/**
 * The grade. Everything the film renders sits underneath this.
 *
 * The point of these layers is that a clean white CG frame has no lens and no
 * light source, and the eye notices. A real camera in a real white room gives
 * you grain, a warm key falling off to a cool fill, corners a shade darker
 * than the centre, and softness at the edge of the image. Adding those back is
 * most of what separates "rendered" from "shot".
 *
 * Applied over the borrowed footage as well as the generated scenes, which has
 * the useful side effect of making the two sit together.
 */
export const FilmGrade: React.FC<{look: Look; children: React.ReactNode}> = ({
	look,
	children,
}) => {
	const frame = useCurrentFrame();

	// Grain has to move or it reads as a dirty lens rather than film. The plate
	// is only ever offset, never scaled, so it cannot shimmer or moire.
	const gx = Math.floor(rand(frame, 11) * 256);
	const gy = Math.floor(rand(frame, 29) * 256);

	return (
		<AbsoluteFill>
			<AbsoluteFill>
				<LookContext.Provider value={look}>{children}</LookContext.Provider>
			</AbsoluteFill>

			{look.warmth > 0 ? (
				<>
					<AbsoluteFill
						style={{
							background:
								'linear-gradient(128deg, rgba(255, 214, 158, 1) 0%, rgba(255, 233, 205, 0.4) 34%, rgba(255,255,255,0) 62%)',
							mixBlendMode: 'soft-light',
							opacity: look.warmth,
						}}
					/>
					<AbsoluteFill
						style={{
							background:
								'linear-gradient(310deg, rgba(150, 190, 255, 1) 0%, rgba(198, 220, 255, 0.34) 30%, rgba(255,255,255,0) 58%)',
							mixBlendMode: 'soft-light',
							opacity: look.warmth * 0.8,
						}}
					/>
				</>
			) : null}

			{look.bloom > 0 ? (
				<AbsoluteFill
					style={{
						background:
							'radial-gradient(ellipse 76% 68% at 50% 43%, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 68%)',
						mixBlendMode: 'screen',
						opacity: look.bloom * 0.5,
					}}
				/>
			) : null}

			{look.edgeBlur > 0 ? (
				<AbsoluteFill
					style={{
						backdropFilter: `blur(${look.edgeBlur}px)`,
						WebkitBackdropFilter: `blur(${look.edgeBlur}px)`,
						maskImage:
							'radial-gradient(ellipse 68% 66% at 50% 48%, rgba(0,0,0,0) 46%, rgba(0,0,0,1) 100%)',
						WebkitMaskImage:
							'radial-gradient(ellipse 68% 66% at 50% 48%, rgba(0,0,0,0) 46%, rgba(0,0,0,1) 100%)',
					}}
				/>
			) : null}

			{look.vignette > 0 ? (
				<AbsoluteFill
					style={{
						background:
							'radial-gradient(ellipse 74% 72% at 50% 48%, rgba(255,255,255,0) 52%, rgba(38, 56, 84, 1) 100%)',
						mixBlendMode: 'multiply',
						opacity: look.vignette,
					}}
				/>
			) : null}

			{look.grain > 0 ? (
				<AbsoluteFill
					style={{
						backgroundImage: `url(${staticFile('grain.png')})`,
						backgroundRepeat: 'repeat',
						backgroundPosition: `${gx}px ${gy}px`,
						mixBlendMode: 'overlay',
						opacity: look.grain,
					}}
				/>
			) : null}
		</AbsoluteFill>
	);
};
