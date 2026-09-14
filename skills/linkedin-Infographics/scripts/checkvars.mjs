#!/usr/bin/env node
/* checkvars - catch CSS custom properties a template references but the
   stylesheet never defines.
   
   Why this exists: `background: var(--f1)` where --f1 does not exist is not an
   error. CSS drops the declaration and the element renders with a transparent
   background. White text on a white card is then invisible, and nothing in the
   render pipeline says a word. This shipped in three templates at once and was
   only caught by looking at a picture.
   
   Usage:  node scripts/checkvars.mjs [--selftest]
   Exit 1 if any template references an undefined property. */

import { readFileSync, readdirSync, writeFileSync, unlinkSync } from 'node:fs';
import { join, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..');
const CSS  = join(ROOT, 'assets', 'poster.css');
const TPL  = join(ROOT, 'templates');

// Properties the browser or the template itself may legitimately supply.
const BUILTIN = new Set(['h', 'b', 'l']);

function definedIn(text) {
  const out = new Set();
  for (const m of text.matchAll(/(--[a-zA-Z0-9_-]+)\s*:/g)) out.add(m[1].slice(2));
  return out;
}

function scan(files) {
  const css = readFileSync(CSS, 'utf8');
  const known = definedIn(css);
  const bad = [];
  for (const f of files) {
    const text = readFileSync(f, 'utf8');
    // a template may define its own tokens in its <style> block
    const local = definedIn(text);
    for (const m of text.matchAll(/var\(\s*--([a-zA-Z0-9_-]+)/g)) {
      const name = m[1];
      if (known.has(name) || local.has(name) || BUILTIN.has(name)) continue;
      const line = text.slice(0, m.index).split('\n').length;
      bad.push({ file: basename(f), line, name });
    }
  }
  return { bad, knownCount: known.size };
}

function templates() {
  return readdirSync(TPL).filter(f => f.startsWith('poster-') && f.endsWith('.html'))
                         .map(f => join(TPL, f));
}

if (process.argv.includes('--selftest')) {
  // The gate must be shown to fire before it is trusted to pass anything.
  const probe = join(TPL, '__checkvars_probe.html');
  const good = templates();
  const clean = scan(good);
  if (clean.bad.length) {
    console.error('selftest FAIL: the real templates are not clean, cannot use them as the negative control');
    for (const b of clean.bad) console.error(`  ${b.file}:${b.line}  --${b.name}`);
    process.exit(1);
  }
  writeFileSync(probe, '<style>.x{background:var(--definitely-not-a-real-token)}</style>');
  const dirty = scan([probe]);
  unlinkSync(probe);
  if (dirty.bad.length !== 1 || dirty.bad[0].name !== 'definitely-not-a-real-token') {
    console.error('selftest FAIL: the gate did not catch a planted undefined token');
    process.exit(1);
  }
  console.log(`selftest ok  ${clean.knownCount} properties defined in poster.css`);
  console.log(`  silent on ${good.length} real templates, fires on a planted token`);
  process.exit(0);
}

const { bad, knownCount } = scan(templates());
if (bad.length) {
  console.error(`FAIL  ${bad.length} undefined custom propert${bad.length === 1 ? 'y' : 'ies'}:`);
  for (const b of bad) console.error(`  ${b.file}:${b.line}  var(--${b.name})  is never defined`);
  console.error('\nfam-N classes define --l (accent), --h (border) and --b (tint).');
  console.error('Inside a .fam-N element use var(--l), not a per-family token.');
  process.exit(1);
}
console.log(`ok  all custom properties resolve  (${knownCount} defined)`);
