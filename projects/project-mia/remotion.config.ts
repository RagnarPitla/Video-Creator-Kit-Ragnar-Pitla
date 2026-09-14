import {Config} from '@remotion/cli/config';

Config.setVideoImageFormat('jpeg');
Config.setOverwriteOutput(true);

// Every render tab loads the embedded Segoe UI faces, which can exceed the
// 28s default when many tabs start at once.
Config.setDelayRenderTimeoutInMilliseconds(120000);
