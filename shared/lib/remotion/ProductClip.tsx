import React from 'react';
import {
	AbsoluteFill,
	OffthreadVideo,
	interpolate,
	staticFile,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';
import {EASE} from '../lib/motion';
import {useCleanUI} from '../lib/cleanUI';

/**
 * Where the picture stops when `plate` is on, in the recording's own
 * coordinates - that is, film pixels at scale 1.
 *
 * Two things here were wrong in the first attempt and are worth stating,
 * because both produce the exact artefact the plate exists to remove:
 *
 * 1. **The feather was 24px.** A feather is a band of partial opacity, so any
 *    line of interface that lands inside it renders half-erased. That is the
 *    defect, just narrower - a 24px smear instead of a 250px one. It is now 0.
 *    The picture ends on a hard edge; there is no setting between shown and
 *    not shown.
 *
 * 2. **The plate was fixed while the picture moves.** ProductClip scales the
 *    recording about the frame centre, from `zoomFrom` to `push`, so content
 *    sweeps downward through any fixed line. consoleHome pushes 1.12 to 1.26,
 *    which drags a row roughly 40px past a stationary plate over 90 frames -
 *    long enough to guarantee it catches something. So the plate is now
 *    transformed by the same scale as the picture: it cuts the same *row* of
 *    the recording for the whole shot, and a line placed in a gap stays in
 *    that gap.
 *
 * Individual shots override it with `plateTop` where the recording puts
 * content unusually high or low.
 */
const PLATE_TOP = 872;
const PLATE_FEATHER = 0;

/**
 * Height of the picture band when a shot uses `fit`. Everything below is the
 * frame. It is the full 1080: Ragnar's brief for V19 is "only make the actual
 * screen full screen", so a product shot is the recording edge to edge with
 * nothing of the film's around it - no band, no paper, no caption.
 */
const BAND_H = 1080;

/**
 * A shot of the real Mia Console, full bleed.
 *
 * Every other scene in this film is drawn. This one is not: it is a recording
 * of the product at https://mango-desert-0f88f590f.7.azurestaticapps.net,
 * captured at 1920x1080 with a pointer drawn into the page, so the frame is
 * the software itself rather than an illustration of it. It is deliberately
 * not put inside a laptop shell - a device frame shrinks the UI to the point
 * where the labels stop being readable, and the labels are the evidence.
 *
 * `from` is the second in the source clip where this shot starts, so the
 * segment can be aimed at the exact moment the narration is describing.
 *
 * The push is small on purpose. Scaling a screen recording past about 1.04
 * starts to soften the type, and the type is the reason the shot is here.
 * `zoomFrom` exists for captures framed wider than the rest - clip-01-intake
 * sits the console card in about 54 percent of the frame where clip-11 gives
 * it 69 - so that shot can start already tight instead of pushing 25 percent
 * across three seconds to get there.
 *
 * `fadeInFrames` and `fadeOutFrames` default to the original 14 and 16. Set
 * either to 0 for a hard cut. This matters when ProductClips run back to back:
 * the shots are sequential, not overlapping, so one clip's fade out plays
 * *before* the next one's fade in rather than crossing with it, and the film
 * dips through blank paper for the sum of the two. Measured on V15A at the
 * zavaProfile -> zavaEnv boundary, frame contrast fell from 18 to 5.9 for 13
 * frames. Four boundaries did that inside an 11.3s passage. Between two
 * screens of the same product a hard cut is the correct grammar anyway.
 */
export const ProductClip: React.FC<{
	src: string;
	from: number;
	label?: string;
	caption?: string;
	/** Frame at which the caption arrives. */
	captionAt?: number;
	push?: number;
	zoomFrom?: number;
	fadeInFrames?: number;
	fadeOutFrames?: number;
	/**
	 * Ends the picture on a hard edge above the caption instead of dissolving
	 * it into the paper. See PLATE_TOP below for why the soft version is wrong.
	 */
	plate?: boolean;
	/** Raises the plate for a recording that puts content unusually low. */
	plateTop?: number;
	/**
	 * Frames the shot on a region of the recording instead of cropping the
	 * bottom off it.
	 *
	 * The plate was the wrong answer to "remove the text and faded bars". It
	 * cuts the full width of the picture, so it takes the clutter and the rest
	 * of the interface with it, and Ragnar's reply was the giveaway: "why are
	 * we missing those pieces". A viewer reads a full-width cut as the render
	 * having failed, not as a crop.
	 *
	 * So: choose a region of the recording that contains the whole card, scale
	 * it to fill the picture band, and paper over the specific clutter with
	 * `patches`. Nothing is dissolved, nothing is half-drawn, and nothing the
	 * viewer needs is chopped.
	 *
	 * `cx`/`cy` is the centre of the region and `h` its height, all in the
	 * recording's own 1920x1080 pixels. The width is derived from the band
	 * aspect so the picture can never be stretched.
	 */
	fit?: {cx: number; cy: number; h: number; w?: number};
	/**
	 * Rectangles of the recording to cover, in the recording's own pixels.
	 * `fill` should be sampled off a still of the clip, not guessed - the
	 * intake card's left panel is a flat rgb(230,226,235) across the whole
	 * region, so a solid cover is seamless there, but that is a measurement,
	 * not an assumption.
	 */
	patches?: {x: number; y: number; w: number; h: number; fill: string}[];
}> = ({
	src,
	from,
	label,
	caption,
	captionAt = 28,
	push = 1.035,
	zoomFrom = 1,
	fadeInFrames = 14,
	fadeOutFrames = 16,
	plate: plateProp,
	plateTop = PLATE_TOP,
	fit,
	patches,
}) => {
	const cleanUI = useCleanUI();
	/*
	 * cleanUI used to switch the plate on for every product shot at once. That
	 * is the wrong default: a full-width crop takes the clutter and the rest of
	 * the card with it, and at a shared line it lands mid-glyph on shots whose
	 * content sits elsewhere. Measured on V18 it cut through text at frames
	 * 710, 770, 840, 1200, 1380, 2150 and 4300.
	 *
	 * Clutter is local, so the removal has to be local: frame the shot on the
	 * card with `fit`, then cover the specific region with `patches`. A shot
	 * with nothing to hide needs neither, so the default is now off.
	 */
	const plate = plateProp ?? false;
	const frame = useCurrentFrame();
	const {durationInFrames, fps} = useVideoConfig();

	const scale = interpolate(frame, [0, durationInFrames], [zoomFrom, push], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
		easing: EASE.drift,
	});

	/*
	 * The recording is scaled about the frame centre, so a row sitting at y in
	 * the unscaled picture is drawn at 540 + (y - 540) * scale. The plate is
	 * drawn outside that scaled container, so it has to apply the same
	 * transform or the picture slides underneath it.
	 */
	const plateY = 540 + (plateTop - 540) * scale;

	const fadeIn =
		fadeInFrames > 0
			? interpolate(frame, [0, fadeInFrames], [0, 1], {
					extrapolateLeft: 'clamp',
					extrapolateRight: 'clamp',
					easing: EASE.out,
				})
			: 1;

	const fadeOut =
		fadeOutFrames > 0
			? interpolate(
					frame,
					[durationInFrames - fadeOutFrames, durationInFrames],
					[1, 0],
					{
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
						easing: EASE.inOut,
					},
				)
			: 1;

	const labelIn = interpolate(frame, [10, 34], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
		easing: EASE.out,
	});

	const capIn = interpolate(frame, [captionAt, captionAt + 26], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
		easing: EASE.out,
	});

	/*
	 * Maps the chosen region of the recording onto the picture band. `s` is one
	 * number used for both axes, so the picture cannot be stretched however the
	 * region is specified. The push multiplies it, which means the shot still
	 * drifts in without the framing ever leaving the region.
	 *
	 * With `w` the region is *contained*: it is scaled until whichever of its
	 * two axes runs out first, so the whole region is on screen and the film's
	 * paper fills whatever is left at the sides. Nothing can be cut that was
	 * not cut by choosing the region. Without `w` the region's height sets the
	 * scale and the picture covers the full 1920, which crops the sides - only
	 * correct when the region is already wider than the band.
	 */
	const s = fit
		? (fit.w
				? Math.min(1920 / fit.w, BAND_H / fit.h)
				: BAND_H / fit.h) * scale
		: 1;
	const fitLeft = fit ? 960 - fit.cx * s : 0;
	const fitTop = fit ? BAND_H / 2 - fit.cy * s : 0;

	return (
		<AbsoluteFill style={{backgroundColor: '#EEF3F8', opacity: fadeIn * fadeOut}}>
			{fit ? (
				<div
					style={{
						position: 'absolute',
						inset: `0 0 auto 0`,
						height: BAND_H,
						overflow: 'hidden',
					}}
				>
					<div
						style={{
							position: 'absolute',
							left: fitLeft,
							top: fitTop,
							width: 1920 * s,
							height: 1080 * s,
						}}
					>
						<OffthreadVideo
							src={staticFile(src)}
							muted
							trimBefore={Math.round(from * fps)}
							style={{width: '100%', height: '100%'}}
						/>
						{/*
						 * Drawn inside the same transformed box as the video, so
						 * a patch measured off a still stays locked to the pixels
						 * it was measured against no matter how the shot pushes.
						 */}
						{patches?.map((r, i) => (
							<div
								key={i}
								style={{
									position: 'absolute',
									left: `${(r.x / 1920) * 100}%`,
									top: `${(r.y / 1080) * 100}%`,
									width: `${(r.w / 1920) * 100}%`,
									height: `${(r.h / 1080) * 100}%`,
									background: r.fill,
								}}
							/>
						))}
					</div>
				</div>
			) : (
				<AbsoluteFill style={{scale: String(scale), overflow: 'hidden'}}>
					<OffthreadVideo
						src={staticFile(src)}
						muted
						trimBefore={Math.round(from * fps)}
						style={{width: '100%', height: '100%', objectFit: 'cover'}}
					/>
				</AbsoluteFill>
			)}

			{/*
			 * A lens, not a spotlight - the same falloff the drawn scenes
			 * carry. It is off under `fit`: it darkens the corners by up to
			 * 14%, and on a recording that reads as the interface being
			 * dimmed rather than lit. Under `fit` nothing the film draws
			 * touches the picture band, so what is on screen is the product's
			 * own pixels and nothing else.
			 */}
			{fit ? null : (
				<AbsoluteFill
					style={{
						background:
							'radial-gradient(120% 108% at 50% 46%, rgba(0,0,0,0) 54%, rgba(22,30,44,0.14) 100%)',
						pointerEvents: 'none',
					}}
				/>
			)}

			{/*
			 * The picture ends here rather than dissolving. Always fully
			 * opaque - fading it in with the caption would put the ghosted
			 * interface back for the 26 frames of the fade, which is the exact
			 * thing this is here to remove.
			 *
			 * plateY applies the picture's own scale so the cut tracks the
			 * content instead of letting the push sweep rows through it.
			 */}
			{plate && !fit ? (
				<AbsoluteFill
					style={{
						background: `linear-gradient(180deg, rgba(238,243,248,0) ${
							plateY - PLATE_FEATHER
						}px, rgba(238,243,248,1) ${plateY}px, rgba(238,243,248,1) 100%)`,
						pointerEvents: 'none',
					}}
				/>
			) : null}

			{/*
			 * Ragnar, on V18: "i dont want text on any of the actual UI and
			 * renders". The film's own label chip sat on top of the recording, so
			 * under `fit` it is not drawn at all. Nothing the film writes is
			 * allowed inside the picture band any more - the caption lives on the
			 * paper below it, and the only words over the UI are the product's own.
			 */}
			{label && !plate && !fit ? (
				<div
					style={{
						position: 'absolute',
						left: 64,
						bottom: 152,
						opacity: labelIn,
						translate: `0px ${(1 - labelIn) * 10}px`,
						display: 'flex',
						alignItems: 'center',
						gap: 12,
						padding: '10px 18px',
						borderRadius: 999,
						background: 'rgba(255,255,255,0.86)',
						border: '1px solid rgba(198,213,229,0.9)',
						boxShadow: '0 6px 22px rgba(31,45,66,0.10)',
						backdropFilter: 'blur(6px)',
					}}
				>
					<span
						style={{
							width: 9,
							height: 9,
							borderRadius: '50%',
							background: '#1EC3BD',
							boxShadow: '0 0 9px rgba(30,195,189,0.65)',
						}}
					/>
					<span
						style={{
							fontFamily: 'Segoe UI',
							fontWeight: 600,
							fontSize: 19,
							letterSpacing: '0.09em',
							textTransform: 'uppercase',
							color: '#5A6673',
						}}
					>
						{label}
					</span>
				</div>
			) : null}

			{/*
			 * No caption over a recording. Ragnar, twice: "i dont want text on
			 * any of the actual UI and renders" and "remove text and all ...
			 * please only make the actual screen full screen". A product shot
			 * carries the product's own words and nothing else; the drawn scenes
			 * either side of it carry the narration's.
			 */}
			{caption && !fit ? (
				<>
					{/*
					 * This wash is the thing Ragnar kept pointing at. It veils
					 * everything from y=670 down at a rising opacity, so any
					 * text or progress bar the recording puts in the lower
					 * third reads as half-erased rather than absent - "text
					 * and faded bars". A plate at a fixed line did not fix it
					 * because a feather is partial opacity by another name.
					 *
					 * Under `fit` there is no wash at all: the picture ends at
					 * a hard edge at BAND_H and the caption sits on the film's
					 * own paper below it.
					 */}
					{plate || fit ? null : (
						<AbsoluteFill
							style={{
								background:
									'linear-gradient(180deg, rgba(238,243,248,0) 62%, rgba(238,243,248,0.94) 88%, rgba(238,243,248,1) 100%)',
								opacity: capIn,
								pointerEvents: 'none',
							}}
						/>
					)}
					<div
						style={{
							position: 'absolute',
							left: 64,
							right: 64,
							bottom: 62,
							opacity: capIn,
							translate: `0px ${(1 - capIn) * 14}px`,
							fontFamily: 'Segoe UI',
							fontWeight: 350,
							fontSize: 44,
							lineHeight: 1.16,
							letterSpacing: '-0.012em',
							color: '#2E343C',
						}}
					>
						{caption}
					</div>
				</>
			) : null}
		</AbsoluteFill>
	);
};
