import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {elevation} from '../lib/material';
import {EASE} from '../lib/motion';

/**
 * A running tally of what Mia has produced, top right.
 *
 * Every item here is something the narration explicitly claims, incremented at
 * the scene that claims it - no invented benchmark, no percentage nobody can
 * source. The argument it makes is cumulative rather than stated: by the close
 * the viewer has watched the work pile up without a person doing it.
 *
 * Each entry is [frame the claim is made, label]. Counts step, they do not
 * tween, because a counter that scrubs through fractional values reads as
 * decoration rather than as a record.
 */
const EVENTS: {at: number; label: string}[] = [
	{at: 640, label: 'Demo assets built'},
	{at: 700, label: 'RFP responses drafted'},
	{at: 780, label: 'Workshops captured'},
	{at: 900, label: 'Charter drafted'},
	{at: 960, label: 'Work streams established'},
	{at: 1140, label: 'Success by Design embedded'},
	{at: 1290, label: 'Requirements drafted'},
	{at: 1440, label: 'Fit-gap completed'},
	{at: 1620, label: 'Configuration plans drafted'},
	{at: 1830, label: 'Options evaluated'},
	{at: 1930, label: 'Decisions recorded'},
	{at: 2050, label: 'Blueprint aligned'},
	{at: 2280, label: 'Go-live checks run'},
	{at: 2620, label: 'Environment monitored'},
	{at: 2762, label: 'Releases explained'},
	{at: 3200, label: 'Evidence linked'},
	{at: 3600, label: 'Configuration applied'},
	{at: 4000, label: 'Fields mapped'},
	{at: 4180, label: 'Migration validated'},
];

export const EvidenceMeter: React.FC = () => {
	const frame = useCurrentFrame();

	const live = interpolate(
		frame,
		[600, 648, 4300, 4360],
		[0, 1, 1, 0],
		{extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EASE.inOut},
	);
	if (live <= 0.001) return null;

	const done = EVENTS.filter((e) => frame >= e.at);
	const count = done.length;
	const latest = done[done.length - 1];
	const sinceLatest = latest ? frame - latest.at : 999;

	/** The newest line gets a brief flash so the eye is told what just changed. */
	const flash = interpolate(sinceLatest, [0, 10, 62, 82], [0, 1, 1, 0], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
		easing: EASE.out,
	});
	const bump = interpolate(sinceLatest, [0, 14], [1.06, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
		easing: EASE.out,
	});

	return (
		<div
			style={{
				position: 'absolute',
				right: 86,
				// The chip hangs below the tally, and at top: 74 its lower edge
				// reached into the top-right card of the statement of work scene.
				// 44 keeps the whole stack clear of every scene beneath it.
				top: 44,
				opacity: live,
				pointerEvents: 'none',
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'flex-end',
				gap: 12,
			}}
		>
			<div
				style={{
					display: 'flex',
					alignItems: 'baseline',
					gap: 14,
					padding: '14px 24px',
					borderRadius: 14,
					background: 'linear-gradient(150deg, rgba(255,255,255,0.96) 0%, rgba(245,250,253,0.9) 100%)',
					border: '1px solid rgba(198,213,229,0.9)',
					boxShadow: elevation(14),
					scale: String(bump),
				}}
			>
				<span
					style={{
						fontFamily: 'Consolas, Segoe UI',
						fontWeight: 600,
						fontSize: 40,
						color: '#12A79F',
						lineHeight: 1,
						minWidth: 54,
						textAlign: 'right',
					}}
				>
					{count}
				</span>
				<span
					style={{
						fontFamily: 'Segoe UI',
						fontWeight: 600,
						fontSize: 15,
						letterSpacing: '0.08em',
						textTransform: 'uppercase',
						color: '#8794A3',
					}}
				>
					Artefacts produced
				</span>
			</div>

			{latest && flash > 0.01 ? (
				<div
					style={{
						display: 'flex',
						alignItems: 'center',
						gap: 10,
						padding: '9px 18px',
						borderRadius: 11,
						opacity: flash,
						translate: `0px ${(1 - flash) * -8}px`,
						background: 'rgba(255,255,255,0.92)',
						border: '1px solid rgba(30,195,189,0.42)',
						boxShadow: elevation(8),
					}}
				>
					<div
						style={{
							width: 8,
							height: 8,
							borderRadius: '50%',
							background: '#1EC3BD',
							boxShadow: '0 0 9px rgba(30,195,189,0.7)',
						}}
					/>
					<span
						style={{
							fontFamily: 'Segoe UI',
							fontWeight: 400,
							fontSize: 21,
							color: '#3A4450',
						}}
					>
						{latest.label}
					</span>
				</div>
			) : null}
		</div>
	);
};
