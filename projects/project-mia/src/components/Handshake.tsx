import React from 'react';

/**
 * Two forearms meeting in a clasp, drawn flat in the same slate tones as
 * Figure so the film keeps one language for people.
 *
 * Review note 10 replaced the two full figures in the handshake scene with
 * this. Full bodies made the shot about the two individuals; the agreement is
 * the subject, so the frame now holds only the agreement.
 *
 * A flat handshake fails in one specific way, and the first build of this
 * component failed in exactly that way: it drew the gripping fingers as bars
 * across the whole of the near hand, which turns the clasp into a hairbrush.
 * The fix is anatomical. In a handshake the hand nearer camera is in front, so
 * what you actually see is
 *
 *   - the back of the near hand, clean, with no bars on it at all,
 *   - the near hand's four fingers wrapped around the FAR hand, sitting to the
 *     left of the near hand's own body,
 *   - the near hand's thumb hooked over the top edge of the far hand,
 *   - the far hand otherwise almost entirely hidden.
 *
 * So the grip cue lives on the far hand, left of centre, and the near hand
 * stays a single unbroken shape. That is the whole difference between reading
 * as a handshake and reading as a lump.
 *
 * Everything is capsules: a line with a round cap and a wide stroke is a
 * rounded bar. Shapes that must not fuse with what is under them are drawn
 * twice, once oversize in the background colour to knock a gap out and once at
 * true size on top.
 *
 * viewBox is 1000x560 with the clasp centred at (500, 250). The forearms run
 * out to x = -460 and x = 1460 so they bleed off both frame edges rather than
 * ending in two round stumps in mid air.
 */
type Pt = {x: number; y: number};

/** 21 degrees. Shallower than this and the two arms read as one bar. */
const SLOPE = 0.3839;
/** Unit vector along the far (left) forearm, wrist to fingertips. */
const FAR_DIR: Pt = {x: 0.9336, y: -SLOPE};
/** Perpendicular to FAR_DIR, pointing down and to the right. */
const FAR_PERP: Pt = {x: SLOPE, y: 0.9336};

const add = (p: Pt, d: Pt, k: number): Pt => ({x: p.x + d.x * k, y: p.y + d.y * k});
const lerp = (a: Pt, b: Pt, t: number): Pt => ({
	x: a.x + (b.x - a.x) * t,
	y: a.y + (b.y - a.y) * t,
});

const Cap: React.FC<{
	a: Pt;
	b: Pt;
	w: number;
	tone: string;
	opacity?: number;
}> = ({a, b, w, tone, opacity = 1}) => (
	<line
		x1={a.x}
		y1={a.y}
		x2={b.x}
		y2={b.y}
		stroke={tone}
		strokeWidth={w}
		strokeLinecap="round"
		opacity={opacity}
	/>
);

/** Far arm: off frame lower left, rising to the clasp. */
const FAR_ARM_OUT: Pt = {x: -460, y: 250 + 960 * SLOPE};
const FAR_WRIST: Pt = {x: 386, y: 250 + 114 * SLOPE};
const FAR_TIP: Pt = add(FAR_WRIST, FAR_DIR, 150);

/** Near arm: off frame lower right, rising to the clasp. */
const NEAR_ARM_OUT: Pt = {x: 1460, y: 250 + 960 * SLOPE};
const NEAR_WRIST: Pt = {x: 630, y: 300};
const NEAR_TIP: Pt = {x: 492, y: 243};

/**
 * The four fingers of the near hand, wrapped around the far hand. They are
 * perpendicular to the far forearm and span 132 units of it, which puts them
 * entirely on the far hand and clear of the near hand's back.
 */
const GRIP_NEAR: Pt = {x: 509, y: 243};
const GRIP_FAR: Pt = add(GRIP_NEAR, FAR_DIR, -144);

export const Handshake: React.FC<{
	width: number;
	/** 0 = arms fully off frame, 1 = clasped. */
	approach: number;
	/** Small extra separation used to ease the hands apart at the end. */
	release?: number;
	/** Background colour, used for the knockout gaps between shapes. */
	bg?: string;
}> = ({width, approach, release = 0, bg = '#EFF4F9'}) => {
	const height = (width * 560) / 1000;

	// Depth reads the same way it does in the conference room: the nearer body
	// is the darker one. The scene is near white and the grade lightens it
	// further, so both tones run darker than they look on paper.
	const farArm = '#9DACBD';
	const farHand = '#A7B5C5';
	const nearArm = '#6E7F94';
	const nearHand = '#7B8CA1';

	const shiftA = -(1 - approach) * 640 - release * 34;
	const shiftB = (1 - approach) * 640 + release * 34;

	const fingers = [0, 1 / 3, 2 / 3, 1].map((t) => {
		const c = lerp(GRIP_NEAR, GRIP_FAR, t);
		return {a: add(c, FAR_PERP, -82), b: add(c, FAR_PERP, 86)};
	});

	return (
		<svg
			width={width}
			height={height}
			viewBox="0 0 1000 560"
			style={{overflow: 'visible'}}
		>
			{/* Contact shadow, so the clasp sits in the room rather than floating. */}
			<ellipse
				cx={500}
				cy={452}
				rx={196 * approach}
				ry={18 * approach}
				fill="rgba(38, 62, 90, 0.14)"
				style={{filter: 'blur(10px)'}}
			/>

			{/* Far limb. Only its forearm and the top edge of its hand ever show. */}
			<g transform={`translate(${shiftA} 0)`}>
				<Cap a={FAR_ARM_OUT} b={FAR_WRIST} w={116} tone={farArm} />
				<Cap
					a={{x: 214, y: 250 + 286 * SLOPE}}
					b={{x: 258, y: 250 + 242 * SLOPE}}
					w={124}
					tone={farArm}
					opacity={0.45}
				/>
				<Cap a={FAR_WRIST} b={FAR_TIP} w={142} tone={farHand} />
			</g>

			{/* Near limb, in front. */}
			<g transform={`translate(${shiftB} 0)`}>
				{/* Knockout first, so the near arm cuts a clean gap out of the far
				    arm instead of fusing with it into one grey bar. */}
				<Cap a={NEAR_ARM_OUT} b={NEAR_WRIST} w={116 + 18} tone={bg} />
				<Cap a={NEAR_WRIST} b={NEAR_TIP} w={156 + 18} tone={bg} />

				<Cap a={NEAR_ARM_OUT} b={NEAR_WRIST} w={116} tone={nearArm} />
				<Cap
					a={{x: 786, y: 250 + 286 * SLOPE}}
					b={{x: 742, y: 250 + 242 * SLOPE}}
					w={124}
					tone={nearArm}
					opacity={0.45}
				/>
				{/* The back of the near hand. One unbroken shape. */}
				<Cap a={NEAR_WRIST} b={NEAR_TIP} w={156} tone={nearHand} />

				{/* Fingers wrapped around the far hand. Knockouts give the gaps
				    between them; without those they merge into one slab. */}
				{fingers.map((f, i) => (
					<Cap key={`fk${i}`} a={f.a} b={f.b} w={34 + 14} tone={bg} />
				))}
				{fingers.map((f, i) => (
					<Cap key={`f${i}`} a={f.a} b={f.b} w={34} tone={nearHand} />
				))}

				{/* Thumb, hooked over the top edge of the far hand. */}
				<Cap a={{x: 438, y: 214}} b={{x: 546, y: 172}} w={48 + 15} tone={bg} />
				<Cap a={{x: 438, y: 214}} b={{x: 546, y: 172}} w={48} tone={nearHand} />
			</g>
		</svg>
	);
};
