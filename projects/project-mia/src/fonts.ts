import {staticFile} from 'remotion';

// Segoe UI is the Microsoft brand typeface. Weights follow the Microsoft type
// ramp: Light 300, Semilight 350, Regular 400, Semibold 600.
//
// Declared as plain CSS @font-face rules against files in public/fonts/.
//
// Two earlier approaches both failed the 4608-frame render. @remotion/fonts
// loadFont() opens one delayRender() per face, so a single wedged tab stalls
// the whole render until the timeout kills it. Inlining the faces as base64
// data URIs put ~2MB of CSS text in every tab and failed the same way around
// frame 1000. Real files are fetched once, shared through the HTTP cache, and
// keep the bundle small.
//
// There is deliberately no delayRender() here. Remotion already waits on
// document.fonts.ready before it captures a frame, and a delayRender() that
// depends on font loading is exactly what broke the render twice. Note that
// setTimeout cannot be used as an escape hatch inside a render: Remotion fakes
// timers so animation is deterministic, so a real-world timeout never fires.
const FACES: [string, string][] = [
	['300', 'fonts/segoeui-light.woff'],
	['350', 'fonts/segoeui-semilight.woff'],
	['400', 'fonts/segoeui-regular.woff'],
	['600', 'fonts/segoeui-semibold.woff'],
];

if (typeof document !== 'undefined') {
	const style = document.createElement('style');
	style.textContent = FACES.map(
		([weight, file]) =>
			`@font-face{font-family:"Segoe UI";font-style:normal;font-weight:${weight};font-display:block;src:url("${staticFile(file)}") format("woff");}`,
	).join('\n');
	document.head.appendChild(style);
}

// Use the literal string 'Segoe UI' in style props so the Remotion Studio can
// still edit typography visually.
