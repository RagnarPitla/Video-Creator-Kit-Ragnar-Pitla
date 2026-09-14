'use strict';

/**
 * index.js — the engine's public API. Used by the Electron main process,
 * the standalone CLI, and (indirectly) the Claude Code skill/agent.
 */

const fs = require('node:fs');
const path = require('node:path');

const util = require('./util');
const { loadConfig, saveUserConfig, userConfigPath } = require('./config');
const { generateNotes } = require('./pipeline');
const transcript = require('./transcript');
const { detectProviders, pickProvider } = require('./providers');
const { styleKeys, STYLES } = require('./voice');
const { rebuildLibraryIndex } = require('./note-writer');

/**
 * Environment doctor — what's installed, what's missing, what we'll use.
 * @returns {Promise<object>}
 */
async function doctor(overrides = {}) {
  const config = loadConfig(overrides);
  const ytDlp = util.resolveBin('yt-dlp');
  const ffmpeg = util.resolveBin('ffmpeg');
  let ytDlpVersion = '';
  if (ytDlp) {
    try {
      const r = await util.run('yt-dlp', ['--version'], { timeoutMs: 8000 });
      ytDlpVersion = r.stdout.trim().split('\n')[0] || '';
    } catch {}
  }

  const providers = await detectProviders({ force: true });
  const chosen = await pickProvider(config);
  const whisper = transcript.whisperAvailable();

  let outputWritable = false;
  try {
    util.ensureDir(config.outputDir);
    const probe = path.join(config.outputDir, '.write-probe');
    fs.writeFileSync(probe, 'ok');
    fs.unlinkSync(probe);
    outputWritable = true;
  } catch {}

  return {
    node: process.version,
    platform: process.platform,
    ytDlp: { found: !!ytDlp, path: ytDlp || '', version: ytDlpVersion },
    ffmpeg: { found: !!ffmpeg, path: ffmpeg || '' },
    whisper: { available: !!whisper, mode: whisper || 'not installed' },
    providers,
    chosenProvider: chosen,
    outputDir: config.outputDir,
    outputWritable,
    userConfigPath: userConfigPath() || '(none — using defaults)',
    styles: styleKeys(),
  };
}

module.exports = {
  // engine
  generateNotes,
  doctor,
  // config
  loadConfig,
  saveUserConfig,
  // providers
  detectProviders,
  pickProvider,
  // transcript (exposed for advanced use / testing)
  transcript,
  // meta
  styles: STYLES,
  styleKeys,
  rebuildLibraryIndex,
  util,
};
