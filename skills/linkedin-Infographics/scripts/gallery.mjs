#!/usr/bin/env node
/**
 * gallery.mjs - build a single HTML page showing every rendered variant side by
 * side, each with a download button, so the pick happens by eye instead of by
 * filename.
 *
 *   node gallery.mjs examples/*.gif -o examples/gallery.html
 *   node gallery.mjs out/*.gif -o out/pick.html --title "Q3 launch post"
 *   node gallery.mjs out/*.gif -o out/pick.html --link      (reference files instead of embedding)
 *
 * By default every GIF is inlined as a data URI, so the page is ONE file that
 * survives being emailed, AirDropped or opened from anywhere. Pass --link when
 * the GIFs will always sit next to the HTML and you want a small page.
 *
 * Variant names and blurbs come from variants.json when it is present, so the
 * gallery labels stay in step with the templates.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));

let out = "gallery.html";
let title = "Pick a variant";
let embed = true;
const files = [];
for (let i = 2; i < process.argv.length; i++) {
  const k = process.argv[i];
  if (k === "-o" || k === "--out") out = process.argv[++i];
  else if (k === "--title") title = process.argv[++i];
  else if (k === "--link") embed = false;
  else if (k.startsWith("-")) { console.error(`unknown option ${k}`); process.exit(2); }
  else files.push(k);
}
if (!files.length) {
  console.error("usage: node gallery.mjs <a.gif> [b.gif ...] -o gallery.html [--title T] [--link]");
  process.exit(2);
}

let meta = {};
/* The skill's own variants.json names the built-in templates. A project that
   renders its own variants (v1-logos, v7-spark, ...) has no entry there and its
   cards fall back to bare filenames, which is the one thing a pick-by-eye page
   must not do. So a variants.json sitting next to the OUTPUT is merged over the
   skill's, letting a project label its own gallery without editing the skill. */
const metaPaths = [
  path.join(here, "..", "variants.json"),
  path.join(path.dirname(path.resolve(out)), "variants.json"),
];
for (const p of metaPaths) {
  if (!fs.existsSync(p)) continue;
  try { Object.assign(meta, JSON.parse(fs.readFileSync(p, "utf8"))); }
  catch { console.warn(`${p} is not valid JSON; ignoring it`); }
}

const esc = (s) => String(s).replace(/[&<>"]/g, (c) =>
  ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

const outDir = path.dirname(path.resolve(out));
const cards = files.map((f) => {
  if (!fs.existsSync(f)) { console.warn(`skipping missing file ${f}`); return null; }
  const key = path.basename(f, path.extname(f));
  const m = meta[key] || {};
  const bytes = fs.statSync(f).size;
  const src = embed
    ? `data:image/gif;base64,${fs.readFileSync(f).toString("base64")}`
    : path.relative(outDir, path.resolve(f));
  const overBudget = bytes / 1e6 > 5;
  return { key, src, mb: (bytes / 1e6).toFixed(2), overBudget,
           name: m.name || key, blurb: m.blurb || "", best: m.best || "" };
}).filter(Boolean);

if (!cards.length) { console.error("no readable GIFs; nothing to build"); process.exit(1); }

const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title>
<style>
  :root { --bg:#0a0620; --panel:#150c33; --ink:#fff; --dim:#b9b4d0; --accent:#ff8a3d; }
  * { box-sizing:border-box; margin:0; padding:0 }
  body { background:var(--bg); color:var(--ink); padding:48px 40px 80px;
         font-family:"Inter","Helvetica Neue",Arial,sans-serif; -webkit-font-smoothing:antialiased }
  header { max-width:1400px; margin:0 auto 40px }
  h1 { font-size:42px; font-weight:800; letter-spacing:-.02em }
  .sub { color:var(--dim); font-size:18px; margin-top:10px; max-width:760px; line-height:1.5 }
  .grid { max-width:1400px; margin:0 auto; display:grid; gap:32px;
          grid-template-columns:repeat(auto-fill,minmax(340px,1fr)) }
  .card { background:var(--panel); border:1px solid rgba(255,255,255,.10);
          border-radius:20px; overflow:hidden; display:flex; flex-direction:column }
  .shot { background:#000; display:block; width:100%; height:auto }
  .body { padding:20px 22px 22px; display:flex; flex-direction:column; flex:1 }
  .name { font-size:25px; font-weight:800; color:var(--accent) }
  .blurb { font-size:15px; color:var(--dim); line-height:1.5; margin-top:8px }
  .best { font-size:14px; color:var(--ink); margin-top:10px; opacity:.85 }
  .best b { color:var(--accent); font-weight:700 }
  .foot { margin-top:auto; padding-top:18px; display:flex; align-items:center; gap:12px }
  .size { font-size:13px; color:var(--dim); font-variant-numeric:tabular-nums }
  .size.over { color:#ff6b6b; font-weight:700 }
  a.dl { flex:1; text-align:center; text-decoration:none; padding:12px 16px;
         border-radius:11px; font-size:15px; font-weight:700;
         background:var(--accent); color:#1a0d02 }
  a.dl:hover { filter:brightness(1.1) }
  .note { max-width:1400px; margin:44px auto 0; font-size:14px; color:var(--dim);
          line-height:1.6; border-top:1px solid rgba(255,255,255,.10); padding-top:20px }
</style></head><body>
<header>
  <h1>${esc(title)}</h1>
  <p class="sub">Each one is the finished, looping GIF, not a preview. Play them, pick a
  name, then say which one to iterate on. Download uploads through LinkedIn's
  <b>photo</b> button, never the video button.</p>
</header>
<div class="grid">
${cards.map((c) => `  <div class="card">
    <img class="shot" src="${c.src}" alt="${esc(c.name)} variant">
    <div class="body">
      <div class="name">${esc(c.name)}</div>
      ${c.blurb ? `<div class="blurb">${esc(c.blurb)}</div>` : ""}
      ${c.best ? `<div class="best"><b>Best for</b> ${esc(c.best)}</div>` : ""}
      <div class="foot">
        <a class="dl" href="#" data-key="${esc(c.key)}">Download</a>
        <span class="size${c.overBudget ? " over" : ""}">${c.mb} MB</span>
      </div>
    </div>
  </div>`).join("\n")}
</div>
<p class="note">A red file size is over LinkedIn's 5 MB ceiling and will freeze on frame
one in the feed. Re-render that variant with fewer colors or a shorter loop before posting.</p>
<script>
/* The image data is embedded once, on the <img>. The download link reads it back
   from there at click time rather than carrying a second copy of the same base64,
   which was doubling the size of this page. */
document.querySelectorAll("a.dl").forEach(function (a) {
  a.addEventListener("click", function (e) {
    e.preventDefault();
    var img = a.closest(".card").querySelector("img.shot");
    var t = document.createElement("a");
    t.href = img.src;
    t.download = a.dataset.key + ".gif";
    document.body.appendChild(t);
    t.click();
    t.remove();
  });
});
</script>
</body></html>
`;

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(out, html);
console.log(`${out}  ${(Buffer.byteLength(html) / 1e6).toFixed(2)} MB  ${cards.length} variants  ${embed ? "self-contained" : "linked"}`);
