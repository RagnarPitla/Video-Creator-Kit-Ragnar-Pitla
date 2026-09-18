#!/usr/bin/env node
/**
 * mia-Html QA gate.
 *
 *   node qa.js <file.html>
 *
 * Exits non-zero on any failure, so it can gate a handoff.
 *
 * The check that earns its keep is TEXT OVERLAP. Hand-placed SVG coordinates
 * look right in the markup and collide in the render; two real collisions were
 * shipped and caught this way, not by reading the file. Everything else here is
 * cheap insurance.
 *
 * Requires playwright-core. On this machine:
 *   NODE_PATH=/Users/ragnarpitla/.hermes/node/lib/node_modules/@playwright/mcp/node_modules
 */
const path = require('path');
const fs = require('fs');

const PW = process.env.PLAYWRIGHT_CORE ||
  '/Users/ragnarpitla/.hermes/node/lib/node_modules/@playwright/mcp/node_modules/playwright-core';
const { chromium } = require(PW);

const file = process.argv[2];
if (!file) { console.error('usage: node qa.js <file.html>'); process.exit(2); }
const abs = path.resolve(file);
if (!fs.existsSync(abs)) { console.error('no such file: ' + abs); process.exit(2); }

let failures = 0;
const ok  = (m) => console.log('  PASS  ' + m);
const bad = (m) => { failures++; console.log('  FAIL  ' + m); };

(async () => {
  // --- static: ASCII hygiene -------------------------------------------------
  const raw = fs.readFileSync(abs, 'utf8');
  const nonAscii = raw.split('\n')
    .map((l, i) => [i + 1, [...l].filter(c => c.charCodeAt(0) > 127)])
    .filter(([, c]) => c.length);
  if (nonAscii.length) {
    bad(`non-ASCII on ${nonAscii.length} line(s), first: line ${nonAscii[0][0]} ` +
        `[${nonAscii[0][1].slice(0, 6).join(' ')}]`);
  } else ok('ASCII clean');

  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 1000 } });
  const errs = [];
  page.on('pageerror', e => errs.push('pageerror: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text()); });

  await page.goto('file://' + abs);
  await page.waitForTimeout(500);

  // --- theme -----------------------------------------------------------------
  const theme0 = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
  theme0 === 'light' ? ok('light is the default theme')
                     : bad(`default theme is "${theme0}", expected "light"`);

  if (await page.$('#themeBtn')) {
    await page.click('#themeBtn');
    await page.waitForTimeout(280);
    const theme1 = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
    theme1 === 'dark' ? ok('toggle switches to dark') : bad('toggle did not reach dark');
    await page.click('#themeBtn');
    await page.waitForTimeout(280);
  } else bad('no #themeBtn - the toggle is part of the house style');

  // --- Microsoft mark --------------------------------------------------------
  const marks = await page.$$eval('svg[aria-label="Microsoft"]', n => n.length);
  marks >= 1 ? ok(`Microsoft mark present (${marks})`) : bad('no Microsoft mark');

  // --- SVG text collisions ---------------------------------------------------
  const hits = await page.evaluate(() => {
    const out = [];
    document.querySelectorAll('svg').forEach((svg, si) => {
      const t = [...svg.querySelectorAll('text')]
        .map(e => ({ s: e.textContent.trim().slice(0, 40), b: e.getBBox() }))
        .filter(x => x.s.length);
      for (let i = 0; i < t.length; i++) {
        for (let j = i + 1; j < t.length; j++) {
          const a = t[i].b, c = t[j].b;
          if (a.x < c.x + c.width && c.x < a.x + a.width &&
              a.y < c.y + c.height && c.y < a.y + a.height) {
            out.push(`svg#${si}: "${t[i].s}" overlaps "${t[j].s}"`);
          }
        }
      }
    });
    return out;
  });
  hits.length ? hits.forEach(h => bad(h)) : ok('no SVG text collisions');

  // --- responsive ------------------------------------------------------------
  for (const w of [375, 768, 1280, 1440]) {
    await page.setViewportSize({ width: w, height: 900 });
    await page.waitForTimeout(160);
    const sw = await page.evaluate(() => document.documentElement.scrollWidth);
    sw <= w ? ok(`no horizontal overflow at ${w}`)
            : bad(`horizontal overflow at ${w}: scrollWidth ${sw}`);
  }

  // --- anchors ---------------------------------------------------------------
  const dead = await page.evaluate(() =>
    [...document.querySelectorAll('a[href^="#"]')]
      .map(a => a.getAttribute('href'))
      .filter(h => h.length > 1 && !document.querySelector(h)));
  dead.length ? bad('dead in-page anchors: ' + dead.join(', ')) : ok('all in-page anchors resolve');

  errs.length ? errs.forEach(e => bad(e)) : ok('no console or page errors');

  await browser.close();
  console.log(failures ? `\n${failures} failure(s)` : '\nall checks passed');
  process.exit(failures ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
