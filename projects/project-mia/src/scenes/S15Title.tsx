import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {z} from 'zod';
import {Motes} from '../components/Motes';
import {Wordmark} from '../components/Wordmark';
import {cameraDrift, EASE, floatAt, settle} from '../lib/motion';

export const s15Schema = z.object({
	title: z.string(),
});

type Kind = 'person' | 'book' | 'check';

const INK = {
	person: {ring: '#2B6BE4', fill: '#EDF3FE', glyph: '#2B6BE4'},
	book: {ring: '#E0479B', fill: '#FDEEF5', glyph: '#E0479B'},
	check: {ring: '#7B4FD8', fill: '#F2EDFD', glyph: '#7B4FD8'},
};

type Node = {
	id: number;
	kind: Kind;
	x: number;
	y: number;
	/** Frame the node lands on. */
	enter: number;
	/** Slightly paler variant, as in the reference art. */
	pale?: boolean;
};

/**
 * Positions traced from the reference title card and mapped to 1920x1080.
 *
 * Entry order deliberately sets the four corner people first, so the shape of
 * the network is established before it is filled in. Popping them left to right
 * made the card read as a list rather than a graph.
 */
const NODES: Node[] = [
	{id: 1, kind: 'person', x: 346, y: 279, enter: 26},
	{id: 5, kind: 'person', x: 1533, y: 299, enter: 33},
	{id: 6, kind: 'person', x: 291, y: 824, enter: 40},
	{id: 10, kind: 'person', x: 1606, y: 806, enter: 47},
	{id: 2, kind: 'check', x: 688, y: 262, enter: 56},
	{id: 9, kind: 'check', x: 1256, y: 816, enter: 63},
	{id: 3, kind: 'book', x: 965, y: 211, enter: 72, pale: true},
	{id: 8, kind: 'book', x: 985, y: 897, enter: 79, pale: true},
	{id: 4, kind: 'book', x: 1376, y: 360, enter: 88},
	{id: 7, kind: 'book', x: 584, y: 830, enter: 95},
];

const EDGES: [number, number][] = [
	[1, 2],
	[2, 3],
	[3, 4],
	[4, 5],
	[4, 9],
	[1, 6],
	[2, 7],
	[6, 7],
	[7, 8],
	[8, 9],
	[9, 10],
];

const R = 56;
const BY_ID = new Map(NODES.map((n) => [n.id, n]));

const PersonGlyph: React.FC<{c: string}> = ({c}) => (
	<g fill={c}>
		<circle cx="24" cy="16.5" r="6.6" />
		<path d="M11.5 36.5c0-6.9 5.6-12.5 12.5-12.5s12.5 5.6 12.5 12.5v1.5a1.5 1.5 0 0 1-1.5 1.5H13a1.5 1.5 0 0 1-1.5-1.5z" />
	</g>
);

const BookGlyph: React.FC<{c: string}> = ({c}) => (
	<g stroke={c} strokeWidth="2.1" fill="none" strokeLinecap="round" strokeLinejoin="round">
		<path d="M24 15.5c-3-2.2-6.6-3-10.5-3H11a1 1 0 0 0-1 1v18a1 1 0 0 0 1 1h2.5c3.9 0 7.5.8 10.5 3 3-2.2 6.6-3 10.5-3H37a1 1 0 0 0 1-1v-18a1 1 0 0 0-1-1h-2.5c-3.9 0-7.5.8-10.5 3z" />
		<path d="M24 15.5v20" />
		<path d="M14.5 20h5M14.5 25h5M28.5 20h5M28.5 25h5" />
	</g>
);

const CheckGlyph: React.FC<{c: string}> = ({c}) => (
	<g stroke={c} strokeWidth="2.1" fill="none" strokeLinecap="round" strokeLinejoin="round">
		<path d="M24 10.5 37.5 24 24 37.5 10.5 24z" />
		<path d="M18.5 24.2l3.8 3.8 7.2-7.6" />
	</g>
);

const GLYPH: Record<Kind, React.FC<{c: string}>> = {
	person: PersonGlyph,
	book: BookGlyph,
	check: CheckGlyph,
};

export const S15Title: React.FC<z.infer<typeof s15Schema>> = ({title}) => {
	const frame = useCurrentFrame();
	const {fps, durationInFrames} = useVideoConfig();
	const seconds = frame / fps;
	const cam = cameraDrift(seconds, 0.8);

	// The wordmark lands first at oversize, then gives up room to the graph.
	const wordIn = settle({frame, fps, start: 0, duration: 40, bounce: 14});
	const shrink = interpolate(frame, [16, 58], [1.26, 1], {
		easing: EASE.out,
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});
	// A slow push for the whole shot so the card is never actually still.
	const push = interpolate(frame, [0, durationInFrames], [1, 1.045], {
		easing: EASE.drift,
		extrapolateRight: 'clamp',
	});

	const landed = (id: number) => {
		const n = BY_ID.get(id);
		if (!n) return 0;
		return settle({frame, fps, start: n.enter, duration: 44, bounce: 15});
	};

	return (
		<AbsoluteFill style={{backgroundColor: '#FCFDFE'}}>
			<AbsoluteFill
				style={{
					background:
						'radial-gradient(1150px 720px at 50% 46%, rgba(226,236,252,0.55), rgba(255,255,255,0) 72%)',
				}}
			/>
			<Motes count={22} seed={9} opacity={0.6} />

			<AbsoluteFill
				style={{
					scale: String(push),
					translate: `${cam.x}px ${cam.y}px`,
				}}
			>
				<svg
					width={1920}
					height={1080}
					viewBox="0 0 1920 1080"
					style={{position: 'absolute', inset: 0}}
				>
					<defs>
						<linearGradient id="s15edge" x1="0" y1="0" x2="1" y2="1">
							<stop offset="0%" stopColor="#12BFD6" />
							<stop offset="52%" stopColor="#22C8CE" />
							<stop offset="100%" stopColor="#4FA8E0" />
						</linearGradient>
						<filter
							id="s15glow"
							x="-30%"
							y="-30%"
							width="160%"
							height="160%"
						>
							<feGaussianBlur stdDeviation="5" result="b" />
							<feMerge>
								<feMergeNode in="b" />
								<feMergeNode in="b" />
								<feMergeNode in="SourceGraphic" />
							</feMerge>
						</filter>
						{/*
						 * Review note 4: no connector may cross the wordmark. Edges
						 * [2,7] and [4,9] ran straight through it. Rather than move
						 * traced node positions, the whole edge layer is masked so
						 * every line stops short of the lettering and resumes past
						 * it. The blur feathers the cut so it reads as depth.
						 */}
						<filter id="s15soft">
							<feGaussianBlur stdDeviation="16" />
						</filter>
						<mask id="s15clear" maskUnits="userSpaceOnUse">
							<rect x="0" y="0" width="1920" height="1080" fill="#fff" />
							<rect
								x="536"
								y="456"
								width="848"
								height="228"
								rx="114"
								fill="#000"
								filter="url(#s15soft)"
							/>
						</mask>
					</defs>
					<g mask="url(#s15clear)">
					{EDGES.map(([a, b]) => {
						const na = BY_ID.get(a);
						const nb = BY_ID.get(b);
						if (!na || !nb) return null;

						// An edge cannot exist before both of its endpoints do.
						const start = Math.max(na.enter, nb.enter) + 8;
						const draw = interpolate(frame, [start, start + 30], [0, 1], {
							easing: EASE.out,
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						});
						if (draw <= 0) return null;

						const fa = floatAt(seconds, na.id * 5 + 1, 9, 7, 1);
						const fb = floatAt(seconds, nb.id * 5 + 1, 9, 7, 1);
						const x1 = na.x + fa.x;
						const y1 = na.y + fa.y;
						const x2 = nb.x + fb.x;
						const y2 = nb.y + fb.y;

						// Stop the line at the rim of each node rather than its centre,
						// so it never shows through the translucent disc.
						const dx = x2 - x1;
						const dy = y2 - y1;
						const len = Math.hypot(dx, dy) || 1;
						const ux = dx / len;
						const uy = dy / len;
						const ax = x1 + ux * R;
						const ay = y1 + uy * R;
						const span = len - R * 2;

						// A light travels the edge once it is drawn.
						const pulseT = ((frame - start - 30) / 46) % 1;
						const showPulse = frame > start + 30 && pulseT >= 0;

						return (
							<g key={`${a}-${b}`} filter="url(#s15glow)">
								<line
									x1={ax}
									y1={ay}
									x2={ax + ux * span}
									y2={ay + uy * span}
									stroke="url(#s15edge)"
									strokeWidth={2.6}
									strokeLinecap="round"
									strokeDasharray={span}
									strokeDashoffset={span * (1 - draw)}
									opacity={0.9}
								/>
								{showPulse ? (
									<circle
										cx={ax + ux * span * pulseT}
										cy={ay + uy * span * pulseT}
										r={3.8}
										fill="#2BD0DA"
										opacity={Math.sin(pulseT * Math.PI) * 0.9}
									/>
								) : null}
							</g>
						);
					})}
					</g>
				</svg>

				<AbsoluteFill
					style={{alignItems: 'center', justifyContent: 'center'}}
				>
					{/* Review note 2 (clipped "j") and review note 12 (the end card
					    must use this same lettering) are both handled inside
					    Wordmark, so neither can be fixed here and forgotten there. */}
					<Wordmark
						text={title}
						size={150}
						style={{
							opacity: wordIn,
							scale: String(shrink * interpolate(wordIn, [0, 1], [0.94, 1])),
							translate: `0px ${interpolate(wordIn, [0, 1], [16, 0])}px`,
						}}
					/>
				</AbsoluteFill>

				{NODES.map((n) => {
					const bind = landed(n.id);
					if (bind <= 0) return null;
					const f = floatAt(seconds, n.id * 5 + 1, 9, 7, 1);
					const ink = INK[n.kind];
					const Glyph = GLYPH[n.kind];

					// Brief ring that expands as the node lands.
					const flash = interpolate(frame, [n.enter + 2, n.enter + 26], [0, 1], {
						easing: EASE.out,
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
					});

					return (
						<div
							key={n.id}
							style={{
								position: 'absolute',
								left: n.x + f.x - R,
								top: n.y + f.y - R,
								width: R * 2,
								height: R * 2,
								scale: String(interpolate(bind, [0, 1], [0.5, 1])),
								opacity: Math.min(1, bind * 1.6),
								rotate: `${f.rot * 0.6}deg`,
							}}
						>
							{flash > 0 && flash < 1 ? (
								<div
									style={{
										position: 'absolute',
										inset: 0,
										borderRadius: '50%',
										border: `2px solid ${ink.ring}`,
										opacity: (1 - flash) * 0.45,
										scale: String(1 + flash * 0.7),
									}}
								/>
							) : null}
							<div
								style={{
									width: '100%',
									height: '100%',
									borderRadius: '50%',
									background: n.pale ? '#FFFFFF' : ink.fill,
									border: `3px solid ${ink.ring}`,
									boxShadow: `0 6px 18px rgba(40, 58, 92, 0.13), 0 0 0 7px rgba(255,255,255,0.9)`,
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
								}}
							>
								<svg width={R * 1.32} height={R * 1.32} viewBox="0 0 48 48">
									<Glyph c={ink.glyph} />
								</svg>
							</div>
						</div>
					);
				})}
			</AbsoluteFill>
		</AbsoluteFill>
	);
};
