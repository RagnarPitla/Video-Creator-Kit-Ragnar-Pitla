'use strict';

/**
 * config.js — load + merge configuration.
 * Precedence (low -> high): config.default.json  <  user config file  <  overrides.
 */

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { expandHome } = require('./util');

const PROJECT_ROOT = path.join(__dirname, '..');

function readJsonSafe(file) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return null;
  }
}

/** Candidate user-config locations, first hit wins. */
function userConfigPath() {
  const candidates = [
    process.env.YT_NOTES_CONFIG,
    path.join(PROJECT_ROOT, 'config.json'),
    path.join(os.homedir(), '.config', 'youtube-notes-studio', 'config.json'),
    path.join(os.homedir(), '.youtube-notes-studio.json'),
  ].filter(Boolean);
  return candidates.find((p) => fs.existsSync(p)) || '';
}

function loadConfig(overrides = {}) {
  const defaults = readJsonSafe(path.join(PROJECT_ROOT, 'config.default.json')) || {};
  delete defaults._comments;

  const userPath = userConfigPath();
  const user = userPath ? readJsonSafe(userPath) || {} : {};
  delete user._comments;

  const merged = { ...defaults, ...user, ...overrides };
  merged.outputDir = expandHome(merged.outputDir || '~/Documents/YouTube Notes');
  merged._userConfigPath = userPath;
  return merged;
}

/** Persist user-facing config (not secrets) to the user config file. */
function saveUserConfig(partial) {
  const dir = path.join(os.homedir(), '.config', 'youtube-notes-studio');
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, 'config.json');
  const existing = readJsonSafe(file) || {};
  const next = { ...existing, ...partial };
  fs.writeFileSync(file, JSON.stringify(next, null, 2), 'utf8');
  return file;
}

module.exports = { loadConfig, saveUserConfig, userConfigPath, PROJECT_ROOT };
