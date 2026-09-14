/**
 * Note: when using the Node.JS APIs this file does not apply -- pass the options
 * directly to the API instead.
 */

import { Config } from "@remotion/cli/config";
import { enableSharedLibraryResolution } from "./bundler-override";

Config.setRspack(true);
Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);

/**
 * The style is flat fills on near-black. CRF 23 is visually lossless on content
 * with no gradients and keeps the render close to the reference's 222 kbps, which
 * the teardown treats as a style conformance check rather than a delivery setting.
 */
Config.setCrf(23);

/**
 * Muting is deliberately NOT set globally.
 *
 * It used to be: `StyleProof` is silent, so Remotion's default silent AAC track was
 * 317 kbps of nothing, which nearly doubled the container bitrate and made the
 * flat-fill conformance check unreadable. But a global mute is a config that
 * silently deletes the audio from every future composition, and `AgentWorks`
 * carries 22 beats of locked narration. A film that renders picture-perfect and
 * mute passes the typecheck, passes `remotion compositions`, and is worthless.
 *
 * So the mute moved to the one render that wants it - see `npm run render`, which
 * passes `--muted` for StyleProof only.
 */

Config.overrideBundlerConfig(enableSharedLibraryResolution);
