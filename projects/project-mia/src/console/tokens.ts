/**
 * The Mia Console, rebuilt as Remotion components.
 *
 * Why rebuild rather than record: the console screenshots Ashley shared are
 * 1920x1080 browser captures at roughly 90% zoom, so the type inside them
 * lands around 11-13px. Projected in a film that has to stay legible on a
 * conference-room screen, that is unreadable, and cropping to fix it loses the
 * navigation that tells you where in the product you are. Everything here is
 * drawn at film scale instead: the same layout and the same words, at type
 * sizes that survive the projector.
 *
 * The other reason is that half of what Ashley asked for does not exist as a
 * recording yet. She was explicit about it - "I know this isn't how it looks
 * today, but that's the vision" for the configuration plan, and "I started
 * doing some of this recording, but I didn't finish" for the today section.
 * A drawn console can show the vision honestly. A doctored screenshot cannot.
 *
 * Fidelity is deliberate where it is cheap: nav order, wave names, phase
 * grouping, skill ids like op-playbook-gather-requirements@1, and the
 * Pending/Discovery/Agent badge row are all taken from the real frames rather
 * than invented, because those are the details that make a viewer who uses the
 * product recognise it.
 */

export const C = {
	/** App surfaces. Warmer than pure white so it sits in the film's paper. */
	paper: '#FFFFFF',
	shell: '#F7F8FB',
	rail: '#FBFBFD',
	line: '#E6E9F0',
	lineSoft: '#EFF1F6',

	/** Type. */
	ink: '#1F2430',
	body: '#4A5261',
	mute: '#8A93A3',
	faint: '#AEB6C4',

	/** Mia purple, read off the console's M mark and primary buttons. */
	brand: '#6C3FD6',
	brandSoft: '#F1EBFD',
	brandLine: '#D9CBF7',

	/** The film's cyan. Used only for the thread, never for product chrome. */
	thread: '#1EC3BD',

	/** Status. */
	ok: '#12885A',
	okSoft: '#E6F5ED',
	warn: '#B4690E',
	warnSoft: '#FDF3E4',
	info: '#2B6BE4',
	infoSoft: '#EAF1FE',
	idle: '#8A93A3',
	idleSoft: '#F0F2F6',
} as const;

export const FONT = 'Segoe UI';

/** Radii and shadows, kept in one place so every panel agrees. */
export const R = {sm: 6, md: 10, lg: 14, xl: 20} as const;

export const SHADOW = {
	card: '0 1px 2px rgba(31,36,48,0.05), 0 6px 18px rgba(31,36,48,0.06)',
	panel: '0 18px 60px rgba(31,36,48,0.14), 0 2px 6px rgba(31,36,48,0.06)',
	float: '0 30px 90px rgba(31,36,48,0.20), 0 4px 12px rgba(31,36,48,0.08)',
} as const;
