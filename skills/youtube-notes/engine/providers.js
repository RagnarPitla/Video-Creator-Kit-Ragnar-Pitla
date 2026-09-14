'use strict';

/**
 * providers.js — pluggable summarization back-ends.
 *
 * The Electron app and the CLI/skill all call summarizeWith(). The engine is
 * deliberately CLI-agnostic: whichever agent CLI is installed and authed does
 * the thinking. Order of preference is configurable.
 *
 * Verified invocations (live-tested):
 *   claude : claude -p --output-format json [--model sonnet]   (prompt on stdin)
 *            -> parse JSON, return .result  (json output strips global-hook noise)
 *   copilot: copilot -p - -s --available-tools "" [--model X]  (prompt on stdin)
 *   codex  : codex exec -s read-only --skip-git-repo-check [-m X] -  (prompt on stdin)
 *   api    : Anthropic Messages API via ANTHROPIC_API_KEY
 *   extractive: pure-JS, no LLM (guarantees a note always gets written)
 */

const { run, resolveBin } = require('./util');

const PROVIDER_IDS = ['anthropic-api', 'claude', 'copilot', 'codex', 'extractive'];

let _detectCache = null;

/** Detect which providers are usable. Cached for the process. */
async function detectProviders({ force = false } = {}) {
  if (_detectCache && !force) return _detectCache;

  const out = {};

  out['anthropic-api'] = {
    id: 'anthropic-api',
    label: 'Anthropic API',
    available: !!process.env.ANTHROPIC_API_KEY,
    authed: !!process.env.ANTHROPIC_API_KEY,
    reason: process.env.ANTHROPIC_API_KEY ? 'ANTHROPIC_API_KEY set' : 'no ANTHROPIC_API_KEY',
  };

  const claudeBin = resolveBin('claude');
  out['claude'] = {
    id: 'claude',
    label: 'Claude CLI',
    available: !!claudeBin,
    authed: !!claudeBin, // runs without friction per live test
    bin: claudeBin || '',
    reason: claudeBin ? `found at ${claudeBin}` : 'claude not on PATH',
  };

  const copilotBin = resolveBin('copilot');
  out['copilot'] = {
    id: 'copilot',
    label: 'GitHub Copilot CLI',
    available: !!copilotBin,
    authed: !!copilotBin,
    bin: copilotBin || '',
    reason: copilotBin ? `found at ${copilotBin}` : 'copilot not on PATH',
  };

  const codexBin = resolveBin('codex');
  let codexAuthed = false;
  if (codexBin) {
    try {
      const res = await run('codex', ['login', 'status'], { timeoutMs: 8000 });
      codexAuthed = res.code === 0 && !/not logged in|logged out|unauthorized/i.test(res.stdout + res.stderr);
    } catch {
      codexAuthed = false;
    }
  }
  out['codex'] = {
    id: 'codex',
    label: 'Codex CLI',
    available: !!codexBin,
    authed: codexAuthed,
    bin: codexBin || '',
    reason: !codexBin ? 'codex not on PATH' : codexAuthed ? 'logged in' : 'installed but not logged in (run: codex login)',
  };

  out['extractive'] = {
    id: 'extractive',
    label: 'Extractive (no LLM)',
    available: true,
    authed: true,
    reason: 'always available — pure JS, no model',
  };

  _detectCache = out;
  return out;
}

/**
 * Choose a provider id given config. 'auto' walks providerOrder and returns
 * the first available + authed provider (extractive is the guaranteed floor).
 */
async function pickProvider(config = {}) {
  const detected = await detectProviders();
  const explicit = (config.provider || 'auto').toLowerCase();

  if (explicit !== 'auto') {
    const d = detected[explicit];
    if (d && d.available && d.authed !== false) return explicit;
    // explicit choice unavailable — fall through to auto with a note
  }

  const order = Array.isArray(config.providerOrder) && config.providerOrder.length
    ? config.providerOrder
    : PROVIDER_IDS;
  for (const id of order) {
    const d = detected[id];
    if (d && d.available && d.authed !== false) return id;
  }
  return 'extractive';
}

/* ------------------------------------------------------------------ *
 * Invocation
 * ------------------------------------------------------------------ */

function combinePrompt(system, user) {
  return `${system}\n\n===== BEGIN TASK =====\n\n${user}`;
}

/**
 * Summarize with a specific provider. Returns markdown (the note body).
 * Throws on hard failure so the pipeline can fall back.
 */
async function summarizeWith(providerId, { system, user, model = '', signal = null, timeoutMs = 240000 } = {}) {
  switch (providerId) {
    case 'anthropic-api':
      return await callAnthropicApi({ system, user, model, signal, timeoutMs });
    case 'claude':
      return await callClaude({ system, user, model, signal, timeoutMs });
    case 'copilot':
      return await callCopilot({ system, user, model, signal, timeoutMs });
    case 'codex':
      return await callCodex({ system, user, model, signal, timeoutMs });
    case 'extractive':
      throw new Error('extractive handled by summarize.js, not providers.summarizeWith');
    default:
      throw new Error(`Unknown provider: ${providerId}`);
  }
}

async function callClaude({ system, user, model, signal, timeoutMs }) {
  const args = ['-p', '--output-format', 'json'];
  args.push('--model', model || 'sonnet');
  const res = await run('claude', args, {
    input: combinePrompt(system, user),
    timeoutMs,
    signal,
  });
  if (res.code !== 0) {
    throw new Error(`claude exited ${res.code}: ${(res.stderr || res.stdout || '').slice(0, 400)}`);
  }
  // --output-format json => { result: "...", is_error: bool, ... }
  const text = res.stdout.trim();
  try {
    const obj = JSON.parse(text);
    if (obj && obj.is_error) {
      // e.g. "Not logged in · Please run /login" — fail over to the next provider.
      throw new Error('claude not ready: ' + (obj.result || JSON.stringify(obj.error || obj)).slice(0, 200));
    }
    if (obj && typeof obj.result === 'string') return stripHookNoise(obj.result);
    if (obj && obj.error) throw new Error('claude error: ' + JSON.stringify(obj.error));
  } catch (e) {
    if (/claude (not ready|error)/.test(e.message)) throw e;
    // Not JSON (older CLI / hook noise) — best-effort strip.
    if (text) return stripHookNoise(text);
    throw e;
  }
  return stripHookNoise(text);
}

async function callCopilot({ system, user, model, signal, timeoutMs }) {
  const args = ['-p', '-', '-s', '--available-tools', ''];
  if (model) args.push('--model', model);
  const res = await run('copilot', args, {
    input: combinePrompt(system, user),
    timeoutMs,
    signal,
  });
  if (res.code !== 0) {
    throw new Error(`copilot exited ${res.code}: ${(res.stderr || res.stdout || '').slice(0, 400)}`);
  }
  return stripHookNoise(res.stdout.trim());
}

async function callCodex({ system, user, model, signal, timeoutMs }) {
  const args = ['exec', '-s', 'read-only', '--skip-git-repo-check'];
  if (model) args.push('-m', model);
  args.push('-'); // read prompt from stdin
  const res = await run('codex', args, {
    input: combinePrompt(system, user),
    timeoutMs,
    signal,
  });
  if (res.code !== 0) {
    throw new Error(`codex exited ${res.code}: ${(res.stderr || res.stdout || '').slice(0, 400)}`);
  }
  return stripCodexFraming(res.stdout.trim());
}

async function callAnthropicApi({ system, user, model, signal, timeoutMs }) {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error('ANTHROPIC_API_KEY not set');
  const body = {
    model: model || 'claude-sonnet-4-6',
    max_tokens: 4096,
    system,
    messages: [{ role: 'user', content: user }],
  };
  const ac = new AbortController();
  if (signal && signal.aborted) ac.abort();
  const onAbort = () => ac.abort();
  if (signal) signal.addEventListener('abort', onAbort);
  const timer = setTimeout(() => ac.abort(), timeoutMs);
  try {
    const resp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(body),
      signal: ac.signal,
    });
    if (!resp.ok) {
      const t = await resp.text().catch(() => '');
      throw new Error(`Anthropic API ${resp.status}: ${t.slice(0, 300)}`);
    }
    const data = await resp.json();
    const text = (data.content || []).map((b) => b.text || '').join('').trim();
    if (!text) throw new Error('Anthropic API returned empty content');
    return text;
  } finally {
    clearTimeout(timer);
    if (signal) signal.removeEventListener('abort', onAbort);
  }
}

/* ------------------------------------------------------------------ *
 * Output cleaners
 * ------------------------------------------------------------------ */

/**
 * Remove injected-hook noise (e.g. a "Wiki commands: …" greeting some
 * environments instruct the model to append on its first reply), and tidy up
 * any orphaned horizontal-rule separators left behind.
 */
function stripHookNoise(text) {
  if (!text) return '';
  const isNoise = (l) =>
    /wiki commands:/i.test(l) ||
    /`wiki this`|`end session`|`lint wiki`|`wiki status`|`help wiki`/i.test(l);
  let out = text
    .split('\n')
    .filter((l) => !isNoise(l))
    .join('\n');
  // collapse a now-empty "--- \n\n ---" block or a dangling trailing rule
  out = out.replace(/\n+-{3,}\s*\n+-{3,}\s*\n*/g, '\n\n');
  out = out.replace(/\n+-{3,}\s*$/g, '\n');
  out = out.replace(/\n{3,}/g, '\n\n');
  return out.trim();
}

/** codex exec prints some framing lines; keep just the markdown body. */
function stripCodexFraming(text) {
  // Drop common codex banner/log lines if present.
  const cleaned = text
    .split('\n')
    .filter((l) => !/^\s*(\[?codex\]?|workdir:|model:|provider:|approval:|sandbox:|tokens used:|--+)\s*/i.test(l))
    .join('\n')
    .trim();
  return stripHookNoise(cleaned);
}

module.exports = {
  PROVIDER_IDS,
  detectProviders,
  pickProvider,
  summarizeWith,
  combinePrompt,
  stripHookNoise,
};
