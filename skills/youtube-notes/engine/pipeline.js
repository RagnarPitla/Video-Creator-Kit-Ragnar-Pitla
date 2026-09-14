'use strict';

/**
 * pipeline.js — orchestrate a list of links into notes.
 *
 * Flow: parseLinks -> expand playlists/channels -> for each video
 * (with bounded concurrency): fetchTranscript -> summarize -> writeNote.
 * Every step emits events so the Electron UI (or CLI) can show live progress.
 * Per-item failures are isolated: one bad video never sinks the batch.
 */

const { parseLinks, sleep } = require('./util');
const { fetchTranscript, getMetadata, expandPlaylist } = require('./transcript');
const { summarize } = require('./summarize');
const { writeNote, rebuildAllIndexes } = require('./note-writer');

/* ------------------------------------------------------------------ *
 * Expansion
 * ------------------------------------------------------------------ */

const LISTY_RE = /[?&]list=|\/playlist|\/@|\/channel\/|\/c\/|\/user\//i;

async function expandToVideos(items, config, onEvent) {
  const videos = [];
  for (const it of items) {
    if (it.kind === 'video') {
      videos.push({ id: it.id, url: it.url, title: '' });
      continue;
    }
    const isListy = it.kind === 'playlist' || LISTY_RE.test(it.url);
    if (isListy) {
      onEvent({ type: 'expand', message: `Expanding ${it.url} …` });
      try {
        const vids = await expandPlaylist(it.url, { limit: config.playlistLimit || 0 });
        if (vids.length) {
          onEvent({ type: 'expand', message: `Found ${vids.length} video(s) in ${it.url}` });
          videos.push(...vids);
          continue;
        }
      } catch (e) {
        onEvent({ type: 'expand', level: 'warn', message: `Could not expand ${it.url}: ${e.message}` });
      }
    }
    // fallback: treat as a single video URL
    videos.push({ id: it.id, url: it.url, title: '' });
  }
  // de-dupe by id/url, preserve order
  const seen = new Set();
  const out = [];
  for (const v of videos) {
    const key = v.id || v.url;
    if (!seen.has(key)) {
      seen.add(key);
      out.push(v);
    }
  }
  return out;
}

/* ------------------------------------------------------------------ *
 * Per-video processing
 * ------------------------------------------------------------------ */

function stubNote(meta, reason) {
  return [
    '## Transcript unavailable',
    '',
    `> ⚠️ Could not generate notes for this video: ${reason || 'no transcript found'}.`,
    '',
    'This usually means the video has **no captions** and the Whisper fallback was off (or unavailable).',
    '',
    'Options:',
    '- Turn on the Whisper fallback in settings to transcribe the audio directly.',
    '- Check that the video is public and has captions.',
    '',
    `[Watch on YouTube ▶](${meta.webpageUrl})`,
  ].join('\n');
}

async function processVideo(video, index, total, config, outputDir, onEvent, signal) {
  const ev = (e) => onEvent({ index, total, id: video.id, ...e });
  ev({ type: 'item:start', title: video.title || '', url: video.url });

  const maxRetries = Math.max(1, config.maxRetries || 1);
  let lastErr = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    if (signal && signal.aborted) {
      ev({ type: 'item:error', status: 'cancelled', error: 'cancelled' });
      return { id: video.id, status: 'cancelled' };
    }
    try {
      const transcript = await fetchTranscript(video, {
        ...config,
        signal,
        onEvent: (p) => ev({ type: 'item:progress', ...p }),
      });

      const summary = await summarize({
        meta: transcript.meta,
        transcript,
        config,
        signal,
        onEvent: (p) => ev({ type: 'item:progress', ...p }),
      });

      const written = writeNote({
        meta: transcript.meta,
        summary,
        transcript,
        config,
        outputDir,
      });

      ev({
        type: 'item:done',
        status: 'ok',
        title: transcript.meta.title,
        channel: written.channel,
        path: written.path,
        provider: summary.providerUsed,
        transcriptSource: transcript.source,
      });
      return {
        id: video.id,
        status: 'ok',
        title: transcript.meta.title,
        channel: written.channel,
        path: written.path,
        provider: summary.providerUsed,
      };
    } catch (err) {
      lastErr = err;

      // No captions: write a stub note so the library has a record, then stop.
      if (err.code === 'NO_TRANSCRIPT' && err.meta) {
        if (config.writeStubOnFailure !== false) {
          const written = writeNote({
            meta: err.meta,
            summary: { body: stubNote(err.meta, err.message), providerUsed: 'none', model: '', truncated: false },
            transcript: { source: 'none', text: '', segments: [], lang: '' },
            config: { ...config, includeTranscript: false },
            outputDir,
          });
          ev({ type: 'item:done', status: 'no_transcript', title: err.meta.title, channel: written.channel, path: written.path });
          return { id: video.id, status: 'no_transcript', title: err.meta.title, channel: written.channel, path: written.path };
        }
        ev({ type: 'item:error', status: 'no_transcript', error: err.message });
        return { id: video.id, status: 'no_transcript', error: err.message };
      }

      if (signal && signal.aborted) {
        ev({ type: 'item:error', status: 'cancelled', error: 'cancelled' });
        return { id: video.id, status: 'cancelled' };
      }

      if (attempt < maxRetries) {
        ev({ type: 'item:progress', stage: 'retry', level: 'warn', message: `Attempt ${attempt} failed: ${err.message}. Retrying…` });
        await sleep(1500 * attempt);
        continue;
      }
    }
  }

  ev({ type: 'item:error', status: 'error', error: lastErr ? lastErr.message : 'unknown error' });
  return { id: video.id, status: 'error', error: lastErr ? lastErr.message : 'unknown error' };
}

/* ------------------------------------------------------------------ *
 * Bounded-concurrency pool
 * ------------------------------------------------------------------ */

async function runPool(videos, concurrency, worker) {
  const results = new Array(videos.length);
  let next = 0;
  const runners = [];
  const n = Math.max(1, Math.min(concurrency || 1, videos.length || 1));
  for (let k = 0; k < n; k++) {
    runners.push(
      (async () => {
        while (true) {
          const i = next++;
          if (i >= videos.length) break;
          results[i] = await worker(videos[i], i);
        }
      })()
    );
  }
  await Promise.all(runners);
  return results;
}

/* ------------------------------------------------------------------ *
 * Public entry
 * ------------------------------------------------------------------ */

/**
 * @param {object} args { links: string|string[], config, onEvent, signal }
 * @returns {Promise<manifest>}
 */
async function generateNotes({ links, config, onEvent = () => {}, signal = null }) {
  const text = Array.isArray(links) ? links.join('\n') : String(links || '');
  const items = parseLinks(text);
  const outputDir = config.outputDir;

  onEvent({ type: 'job:parse', message: `Parsed ${items.length} link item(s).` });

  const videos = await expandToVideos(items, config, onEvent);
  if (!videos.length) {
    onEvent({ type: 'job:done', message: 'No valid YouTube videos found in input.', results: [], counts: {} });
    return { outputDir, total: 0, results: [], counts: { ok: 0, no_transcript: 0, error: 0, cancelled: 0 }, startedAt: Date.now(), finishedAt: Date.now() };
  }

  const startedAt = Date.now();
  onEvent({ type: 'job:start', total: videos.length, outputDir });

  const results = await runPool(videos, config.concurrency || 2, (video, i) =>
    processVideo(video, i, videos.length, config, outputDir, onEvent, signal)
  );

  // Rebuild all channel indexes + the library index once, race-free.
  try { rebuildAllIndexes(outputDir); } catch {}

  const counts = { ok: 0, no_transcript: 0, error: 0, cancelled: 0 };
  for (const r of results) counts[r.status] = (counts[r.status] || 0) + 1;

  const manifest = { outputDir, total: videos.length, results, counts, startedAt, finishedAt: Date.now() };
  onEvent({ type: 'job:done', ...manifest });
  return manifest;
}

module.exports = { generateNotes, expandToVideos };
