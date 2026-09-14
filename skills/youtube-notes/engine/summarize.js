'use strict';

/**
 * summarize.js — turn a transcript into a note body.
 *
 * Strategy: build the prompt, pick a provider, and walk a fallback chain.
 * The chain ALWAYS ends in the extractive (no-LLM) summarizer, so a usable
 * note is produced even with zero CLIs/keys available — the app never
 * "fails to produce output", which is the whole point of "works every time".
 */

const { buildSummaryPrompt } = require('./voice');
const { detectProviders, pickProvider, summarizeWith } = require('./providers');

const DEFAULT_MAX_TRANSCRIPT_CHARS = 120000; // ~30k tokens; safe for big contexts

/**
 * @param {object} args { meta, transcript:{text,plain,segments}, config, onEvent, signal }
 * @returns {Promise<{body, providerUsed, model, truncated, fallbackFrom}>}
 */
async function summarize({ meta, transcript, config = {}, onEvent = () => {}, signal = null }) {
  const style = config.summaryStyle || 'ragnar';
  const language = config.language || 'en';
  const includeMindmap = config.includeMindmap !== false;
  const customPrompt = config.summaryPromptOverride || '';
  const maxChars = config.maxTranscriptChars || DEFAULT_MAX_TRANSCRIPT_CHARS;

  let transcriptText = transcript.text || transcript.plain || '';
  let truncated = false;
  if (transcriptText.length > maxChars) {
    transcriptText = truncateMiddle(transcriptText, maxChars);
    truncated = true;
  }

  const { system, user } = buildSummaryPrompt({
    meta,
    transcriptText,
    style,
    customPrompt,
    language,
    includeMindmap,
  });

  // Build the provider attempt order.
  const detected = await detectProviders();
  const chosen = await pickProvider(config);
  const order = Array.isArray(config.providerOrder) && config.providerOrder.length
    ? config.providerOrder
    : ['anthropic-api', 'claude', 'copilot', 'codex', 'extractive'];

  const attemptOrder = [chosen, ...order.filter((p) => p !== chosen)];
  // keep only usable ones, but always allow extractive at the end
  const usable = attemptOrder.filter(
    (p) => p === 'extractive' || (detected[p] && detected[p].available && detected[p].authed !== false)
  );
  if (!usable.includes('extractive')) usable.push('extractive');

  let fallbackFrom = null;
  for (const providerId of usable) {
    if (providerId === 'extractive') {
      onEvent({ stage: 'summarize', message: 'Using extractive summary (no LLM).' });
      return {
        body: extractiveSummary({ meta, transcript, style }),
        providerUsed: 'extractive',
        model: '',
        truncated,
        fallbackFrom,
      };
    }
    try {
      onEvent({ stage: 'summarize', message: `Summarizing with ${detected[providerId].label}…` });
      const body = await summarizeWith(providerId, {
        system,
        user,
        model: config.model || '',
        signal,
        timeoutMs: config.summarizeTimeoutMs || 240000,
      });
      const cleaned = cleanBody(body || '');
      if (looksLikeSummary(cleaned)) {
        return { body: cleaned, providerUsed: providerId, model: config.model || '', truncated, fallbackFrom };
      }
      // e.g. a CLI that answered its own global instructions instead of the task,
      // or returned a one-line acknowledgement. Reject and fall through.
      throw new Error('response did not look like a note (no sections / too short)');
    } catch (err) {
      onEvent({ stage: 'summarize', level: 'warn', message: `${detected[providerId].label} failed: ${err.message}. Trying next…` });
      if (!fallbackFrom) fallbackFrom = providerId;
      // continue to next provider
    }
  }

  // Should never reach here (extractive is in usable), but be safe.
  return {
    body: extractiveSummary({ meta, transcript, style }),
    providerUsed: 'extractive',
    model: '',
    truncated,
    fallbackFrom,
  };
}

/**
 * A real note has at least one markdown section and meaningful length.
 * This rejects providers that answered their own global instructions
 * (e.g. "Understood, I'll apply those rules") instead of summarizing.
 */
function looksLikeSummary(body) {
  if (!body || body.trim().length < 80) return false;
  if (!/^##\s+/m.test(body)) return false;
  return true;
}

/** Keep head + tail of a long transcript, marking the cut. */
function truncateMiddle(text, maxChars) {
  const head = Math.floor(maxChars * 0.6);
  const tail = maxChars - head;
  return (
    text.slice(0, head) +
    `\n\n[... transcript truncated for length — ${text.length - maxChars} characters omitted from the middle ...]\n\n` +
    text.slice(text.length - tail)
  );
}

/** Strip a leading H1 or stray code fence the model may add despite instructions. */
function cleanBody(body) {
  let b = body.trim();
  // remove a wrapping ```markdown ... ``` fence
  const fence = b.match(/^```(?:markdown|md)?\s*\n([\s\S]*?)\n```$/);
  if (fence) b = fence[1].trim();
  // drop a leading single H1 title line (note-writer adds its own header)
  b = b.replace(/^#\s+.*\n+/, '');
  return b.trim();
}

/* ------------------------------------------------------------------ *
 * Extractive (no-LLM) fallback summary
 * ------------------------------------------------------------------ */

const STOPWORDS = new Set(
  ('a an the and or but if then else of to in on at by for with as is are was were be been being this that these those it its ' +
    'i you he she we they them us our your his her their my me so do does did doing have has had not no yes can could would ' +
    'should will just like get got go going about into over under up down out only very really thing things kind sort gonna ' +
    'wanna okay ok right yeah um uh').split(/\s+/)
);

function extractiveSummary({ meta, transcript, style }) {
  const segments = transcript.segments || [];
  const plain = transcript.plain || transcript.text || '';
  const sentences = splitSentences(plain);

  if (!sentences.length) {
    return `## TL;DR\nNo readable transcript text was available to summarize.\n\n## My Take\n_Generated without an LLM. Configure a provider (Claude, Copilot, Codex, or an Anthropic API key) for full notes._`;
  }

  const freq = wordFrequencies(sentences);
  const scored = sentences.map((s, i) => ({ s, i, score: scoreSentence(s, freq) }));

  // Key takeaways: top sentences, spread across the video, in original order.
  const top = scored
    .slice()
    .sort((a, b) => b.score - a.score)
    .slice(0, Math.min(8, Math.max(4, Math.round(sentences.length / 12))))
    .sort((a, b) => a.i - b.i)
    .map((x) => x.s);

  const tldr = top.slice(0, 2).join(' ');

  // "The Argument": chunk segments into ~5 timestamped parts.
  const chunks = chunkByTime(segments, 5);
  const argument = chunks
    .map((c) => `- **[${c.stamp}]** ${firstSentence(c.text)}`)
    .join('\n');

  const quotes = scored
    .slice()
    .sort((a, b) => b.s.length - a.s.length)
    .slice(0, 2)
    .map((x) => `> ${x.s.trim()}`)
    .join('\n\n');

  return [
    `## TL;DR`,
    tldr || top[0] || '',
    ``,
    `## Key Takeaways`,
    top.map((t) => `- ${t.trim()}`).join('\n'),
    ``,
    `## The Argument / How It Works`,
    argument || '_Not enough timing data to segment._',
    ``,
    `## Notable Quotes`,
    quotes || '_None extracted._',
    ``,
    `## My Take — How I'd Apply This`,
    `_These notes were generated with the extractive fallback (no LLM available). They pull the highest-signal sentences straight from the transcript. For notes in Ragnar's voice with a real "how I'd apply this" angle, configure a provider: install/sign in to the Claude, Copilot, or Codex CLI, or set an ANTHROPIC_API_KEY._`,
  ].join('\n');
}

function splitSentences(text) {
  return String(text)
    .replace(/\s+/g, ' ')
    .split(/(?<=[.!?])\s+(?=[A-Z0-9])/)
    .map((s) => s.trim())
    .filter((s) => s.length > 25 && s.length < 400);
}

function wordFrequencies(sentences) {
  const freq = new Map();
  for (const s of sentences) {
    for (const w of s.toLowerCase().match(/[a-z0-9']+/g) || []) {
      if (STOPWORDS.has(w) || w.length < 3) continue;
      freq.set(w, (freq.get(w) || 0) + 1);
    }
  }
  return freq;
}

function scoreSentence(s, freq) {
  const words = s.toLowerCase().match(/[a-z0-9']+/g) || [];
  if (!words.length) return 0;
  let sum = 0;
  for (const w of words) sum += freq.get(w) || 0;
  return sum / Math.sqrt(words.length); // normalize for length
}

function firstSentence(text) {
  const s = splitSentences(text)[0] || text.slice(0, 160);
  return s.trim();
}

function chunkByTime(segments, n) {
  if (!segments.length) return [];
  const size = Math.ceil(segments.length / n);
  const out = [];
  for (let i = 0; i < segments.length; i += size) {
    const group = segments.slice(i, i + size);
    const startMs = group[0].startMs || 0;
    out.push({ stamp: msToStamp(startMs), text: group.map((g) => g.text).join(' ') });
  }
  return out;
}

function msToStamp(ms) {
  const total = Math.floor((ms || 0) / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const p = (x) => String(x).padStart(2, '0');
  return `${p(h)}:${p(m)}:${p(s)}`;
}

module.exports = { summarize, extractiveSummary };
