'use strict';

/**
 * util.js — zero-dependency helpers shared across the engine.
 *
 * Everything here is pure Node built-ins so the core works identically
 * whether it is invoked from the Electron app, the standalone CLI, or a
 * Claude Code skill/agent shelling out to `node`.
 */

const { spawn } = require('node:child_process');
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

/* ------------------------------------------------------------------ *
 * Binary discovery + PATH augmentation
 *
 * macOS GUI apps (Electron launched from Finder/Dock) DO NOT inherit the
 * login shell PATH, so /opt/homebrew/bin (yt-dlp, ffmpeg) and ~/.local/bin
 * (claude) are invisible. We rebuild a sane PATH and resolve binaries by
 * scanning known locations + the real login-shell PATH. This is the single
 * biggest reliability fix for the packaged app.
 * ------------------------------------------------------------------ */

function nvmBinDirs() {
  const dirs = [];
  try {
    const base = path.join(os.homedir(), '.nvm', 'versions', 'node');
    for (const v of fs.readdirSync(base)) {
      dirs.push(path.join(base, v, 'bin'));
    }
  } catch {
    /* no nvm — fine */
  }
  return dirs;
}

let _loginPathCache;
/** Run the user's login shell once to read the REAL PATH (fix-path equivalent). */
function loginShellPath() {
  if (_loginPathCache !== undefined) return _loginPathCache;
  _loginPathCache = [];
  if (process.platform === 'win32') return _loginPathCache;
  try {
    const shell = process.env.SHELL || '/bin/zsh';
    const out = execFileSync(shell, ['-lic', 'command -v true >/dev/null 2>&1; printf "%s" "$PATH"'], {
      encoding: 'utf8',
      timeout: 4000,
      stdio: ['ignore', 'pipe', 'ignore'],
    });
    _loginPathCache = String(out).split(path.delimiter).filter(Boolean);
  } catch {
    /* shell probe failed — rely on known dirs */
  }
  return _loginPathCache;
}

/** Ordered list of directories likely to hold CLI tools. */
function binDirs() {
  const home = os.homedir();
  const known = [
    '/opt/homebrew/bin',
    '/opt/homebrew/sbin',
    '/usr/local/bin',
    '/usr/bin',
    '/bin',
    '/usr/sbin',
    '/sbin',
    path.join(home, '.local', 'bin'),
    path.join(home, 'bin'),
    path.join(home, '.bun', 'bin'),
    path.join(home, '.deno', 'bin'),
    path.join(home, '.cargo', 'bin'),
    'C:\\Windows\\System32',
    path.join(home, 'AppData', 'Local', 'Microsoft', 'WindowsApps'),
  ];
  const fromPath = (process.env.PATH || '').split(path.delimiter).filter(Boolean);
  // PATH first (respects user intent), then login-shell PATH, known dirs, nvm.
  const all = [...fromPath, ...loginShellPath(), ...known, ...nvmBinDirs()];
  // de-dupe, preserve order
  return [...new Set(all)];
}

/** Build a process env whose PATH includes all known bin dirs. */
function augmentedEnv(extra = {}) {
  const PATH = binDirs().join(path.delimiter);
  return { ...process.env, PATH, ...extra };
}

const _binCache = new Map();

/**
 * Resolve an executable to an absolute path, scanning known dirs.
 * Returns null if not found. Results are cached for the process.
 */
function resolveBin(name) {
  if (_binCache.has(name)) return _binCache.get(name);
  const exts = process.platform === 'win32' ? ['.exe', '.cmd', '.bat', ''] : [''];
  for (const dir of binDirs()) {
    for (const ext of exts) {
      const candidate = path.join(dir, name + ext);
      try {
        fs.accessSync(candidate, fs.constants.X_OK);
        _binCache.set(name, candidate);
        return candidate;
      } catch {
        /* keep looking */
      }
    }
  }
  _binCache.set(name, null);
  return null;
}

/* ------------------------------------------------------------------ *
 * Process runner — promisified spawn with stdin, timeout, output caps,
 * and a registry so the app can kill every child on quit.
 * ------------------------------------------------------------------ */

const _activeChildren = new Set();

/** Kill every tracked child process (call from app 'before-quit'). */
function killAllChildren() {
  for (const child of _activeChildren) {
    try { child.kill('SIGKILL'); } catch {}
  }
  _activeChildren.clear();
}

/**
 * Run a command and capture output.
 * @param {string} cmd  binary name or absolute path
 * @param {string[]} args
 * @param {object} [opts] { input, timeoutMs, cwd, env, maxBytes, onStderr, signal }
 * @returns {Promise<{code:number, stdout:string, stderr:string, timedOut:boolean}>}
 */
function run(cmd, args = [], opts = {}) {
  const {
    input = null,
    timeoutMs = 180000,
    cwd = process.cwd(),
    env = augmentedEnv(),
    maxBytes = 64 * 1024 * 1024,
    onStderr = null,
    signal = null,
  } = opts;

  const resolved = path.isAbsolute(cmd) ? cmd : (resolveBin(cmd) || cmd);

  return new Promise((resolve, reject) => {
    let child;
    try {
      child = spawn(resolved, args, { cwd, env, windowsHide: true });
    } catch (err) {
      reject(new Error(`Failed to spawn "${cmd}": ${err.message}`));
      return;
    }

    _activeChildren.add(child);

    let stdout = Buffer.alloc(0);
    let stderr = Buffer.alloc(0);
    let timedOut = false;
    let killed = false;

    const cleanup = () => {
      clearTimeout(timer);
      _activeChildren.delete(child);
      if (signal) signal.removeEventListener('abort', onAbort);
    };

    const onAbort = () => {
      killed = true;
      try { child.kill('SIGKILL'); } catch {}
    };
    if (signal) {
      if (signal.aborted) onAbort();
      else signal.addEventListener('abort', onAbort);
    }

    const timer = setTimeout(() => {
      timedOut = true;
      killed = true;
      try { child.kill('SIGKILL'); } catch {}
    }, timeoutMs);

    child.stdout.on('data', (d) => {
      if (stdout.length < maxBytes) stdout = Buffer.concat([stdout, d]);
    });
    child.stderr.on('data', (d) => {
      if (stderr.length < maxBytes) stderr = Buffer.concat([stderr, d]);
      if (onStderr) onStderr(d.toString('utf8'));
    });

    child.on('error', (err) => {
      cleanup();
      reject(new Error(`"${cmd}" error: ${err.message}`));
    });

    child.on('close', (code) => {
      cleanup();
      resolve({
        code: code == null ? (killed ? 137 : 1) : code,
        stdout: stdout.toString('utf8'),
        stderr: stderr.toString('utf8'),
        timedOut,
      });
    });

    if (input != null) {
      child.stdin.on('error', () => {}); // ignore EPIPE if child exits early
      child.stdin.write(input);
      child.stdin.end();
    } else {
      try { child.stdin.end(); } catch {}
    }
  });
}

/* ------------------------------------------------------------------ *
 * YouTube URL / link-list parsing
 * ------------------------------------------------------------------ */

const VIDEO_ID_RE = /^[a-zA-Z0-9_-]{11}$/;

/** Extract a video id from any YouTube URL form, or null. */
function videoIdFromUrl(raw) {
  if (!raw) return null;
  const s = raw.trim();
  if (VIDEO_ID_RE.test(s)) return s; // bare id
  let u;
  try {
    u = new URL(s);
  } catch {
    return null;
  }
  const host = u.hostname.replace(/^www\./, '').toLowerCase();
  if (host === 'youtu.be') {
    const id = u.pathname.split('/').filter(Boolean)[0];
    return id && VIDEO_ID_RE.test(id) ? id : null;
  }
  if (host.endsWith('youtube.com') || host.endsWith('youtube-nocookie.com')) {
    const v = u.searchParams.get('v');
    if (v && VIDEO_ID_RE.test(v)) return v;
    // /shorts/<id>, /embed/<id>, /live/<id>, /v/<id>
    const parts = u.pathname.split('/').filter(Boolean);
    const i = parts.findIndex((p) => ['shorts', 'embed', 'live', 'v'].includes(p));
    if (i >= 0 && parts[i + 1] && VIDEO_ID_RE.test(parts[i + 1])) return parts[i + 1];
  }
  return null;
}

/** Extract a playlist id from a URL, or null. */
function playlistIdFromUrl(raw) {
  try {
    const u = new URL(raw.trim());
    const list = u.searchParams.get('list');
    if (list) return list;
  } catch {}
  return null;
}

/**
 * Parse arbitrary pasted text (newlines, spaces, commas) into a deduped
 * list of work items: { kind: 'video'|'playlist'|'unknown', id, url }.
 */
function parseLinks(text) {
  if (!text) return [];
  const tokens = String(text)
    .split(/[\s,]+/)
    .map((t) => t.trim())
    .filter(Boolean);

  const items = [];
  const seen = new Set();

  for (const tok of tokens) {
    const vid = videoIdFromUrl(tok);
    const list = playlistIdFromUrl(tok);
    // A watch URL can carry both v= and list=; prefer the explicit video.
    if (vid) {
      const key = 'v:' + vid;
      if (!seen.has(key)) {
        seen.add(key);
        items.push({ kind: 'video', id: vid, url: `https://www.youtube.com/watch?v=${vid}` });
      }
      continue;
    }
    if (list) {
      const key = 'p:' + list;
      if (!seen.has(key)) {
        seen.add(key);
        items.push({ kind: 'playlist', id: list, url: `https://www.youtube.com/playlist?list=${list}` });
      }
      continue;
    }
    // Unknown token — only keep if it actually looks like a link, so stray
    // words from pasted prose ("here are my links:") don't become failed jobs.
    const looksLikeLink = /:\/\//.test(tok) || /^www\./i.test(tok) || /youtu/i.test(tok);
    if (!looksLikeLink) continue;
    const key = 'u:' + tok;
    if (!seen.has(key)) {
      seen.add(key);
      items.push({ kind: 'unknown', id: tok, url: tok });
    }
  }
  return items;
}

/* ------------------------------------------------------------------ *
 * Filesystem + string helpers
 * ------------------------------------------------------------------ */

/** Expand a leading ~ to the user's home directory. */
function expandHome(p) {
  if (!p) return p;
  if (p === '~') return os.homedir();
  if (p.startsWith('~/') || p.startsWith('~\\')) return path.join(os.homedir(), p.slice(2));
  return p;
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

/** Make a string safe to use as a single path segment (folder or file). */
function safeSegment(name, fallback = 'untitled') {
  if (!name) return fallback;
  let s = String(name).normalize('NFC');
  // strip path separators + characters illegal on Windows/macOS
  s = s.replace(/[\\/:*?"<>|]/g, ' ');
  s = s.replace(/[\u0000-\u001f]/g, ' '); // strip control characters
  s = s.replace(/\s+/g, ' ').trim();
  s = s.replace(/[. ]+$/g, ''); // no trailing dot/space (Windows)
  if (!s) return fallback;
  return s.slice(0, 120);
}

/** A short kebab-ish slug for filenames. */
function slugify(name, fallback = 'untitled') {
  if (!name) return fallback;
  let s = String(name).normalize('NFKD').replace(/[\u0300-\u036f]/g, '');
  s = s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  return s ? s.slice(0, 80) : fallback;
}

/** yt-dlp upload_date is YYYYMMDD; return YYYY-MM-DD or ''. */
function formatUploadDate(yyyymmdd) {
  if (!yyyymmdd || !/^\d{8}$/.test(yyyymmdd)) return '';
  return `${yyyymmdd.slice(0, 4)}-${yyyymmdd.slice(4, 6)}-${yyyymmdd.slice(6, 8)}`;
}

function todayStamp() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

/** Seconds -> H:MM:SS or M:SS. */
function formatDuration(totalSeconds) {
  const s = Math.max(0, Math.floor(Number(totalSeconds) || 0));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const p = (n) => String(n).padStart(2, '0');
  return h > 0 ? `${h}:${p(m)}:${p(sec)}` : `${m}:${p(sec)}`;
}

/** ms timestamp -> [HH:MM:SS]. */
function msToTimestamp(ms) {
  const total = Math.floor((Number(ms) || 0) / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const p = (n) => String(n).padStart(2, '0');
  return `${p(h)}:${p(m)}:${p(s)}`;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

module.exports = {
  binDirs,
  augmentedEnv,
  loginShellPath,
  resolveBin,
  run,
  killAllChildren,
  videoIdFromUrl,
  playlistIdFromUrl,
  parseLinks,
  expandHome,
  ensureDir,
  safeSegment,
  slugify,
  formatUploadDate,
  todayStamp,
  formatDuration,
  msToTimestamp,
  sleep,
};
