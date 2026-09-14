import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {EASE} from '../lib/motion';

/**
 * The implementation journey as a rail along the bottom of frame.
 *
 * A sizzle video's problem is that a viewer four scenes in has lost track of
 * where they are in the story. The rail fixes that without narration: six
 * stages, the current one lit, the rail filling left to right across the whole
 * film. It also does the selling job on its own - you can watch the bar move
 * and read "this is one continuous run, not six disconnected projects".
 *
 * PROJECT-SPECIFIC: the frame ranges below are the Mia film's cut. Re-time
 * STAGES, and the on/off ranges in `live`, against your own timeline before
 * using this - otherwise the rail will name the wrong stage throughout.
 */
const STAGES: {label: string; from: number; to: number}[] = [
	{label: 'Pre-sales', from: 522, to: 861},
	{label: 'Statement of work', from: 861, to: 1233},
	{label: 'Design', from: 1233, to: 1956},
	{label: 'Build and migrate', from: 1956, to: 2232},
	{label: 'Go-live', from: 2232, to: 2559},
	{label: 'Run', from: 2559, to: 4368},
];

const RAIL_X = 452;
const RAIL_W = 1180;
const RAIL_Y = 1022;

export const JourneyRail: React.FC = () => {
	const frame = useCurrentFrame();

	/** Off for the opening, the title and the close - they are not stages. */
	const live = interpolate(
		frame,
		[500, 546, 4320, 4368],
		[0, 1, 1, 0],
		{extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EASE.inOut},
	);
	if (live <= 0.001) return null;

	const current = STAGES.find((st) => frame >= st.from && frame < st.to);
	/* The fill has to land on the active dot, so it is driven by stage index
	   plus progress within that stage - not by raw frame position, which put the
	   head three dots behind the one that was lit. */
	const idx = current ? STAGES.indexOf(current) : STAGES.length - 1;
	const within = current
		? (frame - current.from) / (current.to - current.from)
		: 1;
	const filled = Math.min(1, (idx + within) / (STAGES.length - 1));

	return (
		<div style={{position: 'absolute', inset: 0, pointerEvents: 'none', opacity: live}}>
			<div
				style={{
					position: 'absolute',
					left: RAIL_X,
					top: RAIL_Y,
					width: RAIL_W,
					height: 3,
					borderRadius: 2,
					background: 'rgba(150, 174, 198, 0.30)',
				}}
			/>
			<div
				style={{
					position: 'absolute',
					left: RAIL_X,
					top: RAIL_Y,
					width: RAIL_W * filled,
					height: 3,
					borderRadius: 2,
					background: 'linear-gradient(90deg, #19B6E4 0%, #29D3C0 100%)',
					boxShadow: '0 0 12px rgba(25, 182, 228, 0.45)',
				}}
			/>

			{STAGES.map((stage, i) => {
				const x = RAIL_X + (RAIL_W * i) / (STAGES.length - 1);
				const here = frame >= stage.from && frame < stage.to;
				const past = frame >= stage.to;
				return (
					<div
						key={stage.label}
						style={{
							position: 'absolute',
							left: x - (here ? 7 : 5),
							top: RAIL_Y + 1.5 - (here ? 7 : 5),
							width: here ? 14 : 10,
							height: here ? 14 : 10,
							borderRadius: '50%',
							background: past || here ? '#FFFFFF' : '#EEF3F8',
							border: `2.5px solid ${
								here ? '#19B6E4' : past ? 'rgba(30,195,189,0.6)' : 'rgba(150,174,198,0.5)'
							}`,
							boxShadow: here ? '0 0 14px rgba(25,182,228,0.5)' : 'none',
						}}
					/>
				);
			})}

			{/* Only the stage we are in is named, parked left of the rail. Naming
			    all six meant labels colliding wherever two stages sat close. */}
			<div
				style={{
					position: 'absolute',
					left: 96,
					top: RAIL_Y - 11,
					width: 312,
					textAlign: 'right',
					fontFamily: 'Segoe UI',
					fontWeight: 600,
					fontSize: 20,
					letterSpacing: '0.09em',
					textTransform: 'uppercase',
					color: '#5D6875',
				}}
			>
				{current ? current.label : ''}
			</div>
		</div>
	);
};
