#!/usr/bin/env node
/**
 * skin.mjs - reskin a finished poster without touching its markup.
 *
 * A skin is a CSS override block plus a stage class. The base poster's body is
 * copied byte-for-byte, so every skin of a poster carries identical content and
 * a content fix only has to be made once, in the base, then re-skinned.
 *
 *   node skin.mjs base.html flow -o out.html
 *   node skin.mjs --list
 *
 * Skins live in templates/skins/*.css. The first line of each declares the
 * stage class it needs:  / * stage: t-ink flow * /
 *
 * After skinning, always: checkvars.mjs -> still -> LOOK AT IT -> render_gif.mjs.
 * A skin can only break things the base already had, but it breaks them
 * silently: t-ink flips --paper dark, so any rule doing color:var(--paper) on a
 * coloured fill inverts to dark-on-light and no gate will tell you.
 */
import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const SKINS = resolve(HERE, "..", "templates", "skins");

function list() {
  if (!existsSync(SKINS)) die(`no skins directory at ${SKINS}`);
  const out = [];
  for (const f of readdirSync(SKINS).filter((f) => f.endsWith(".css")).sort()) {
    const first = readFileSync(join(SKINS, f), "utf8").split("\n")[0];
    const m = first.match(/stage:\s*([^*]+?)\s*\*\//);
    out.push([f.replace(/\.css$/, ""), m ? m[1] : "(no stage declared)"]);
  }
  return out;
}

function die(msg) {
  console.error(`skin: ${msg}`);
  process.exit(1);
}

const argv = process.argv.slice(2);
if (argv.length === 0 || argv[0] === "--list" || argv[0] === "-l") {
  const rows = list();
  const w = Math.max(...rows.map((r) => r[0].length));
  console.log("skins:");
  for (const [n, s] of rows) console.log(`  ${n.padEnd(w)}  stage="${s}"`);
  process.exit(0);
}

const base = argv[0];
const skin = argv[1];
let out = null;
for (let i = 2; i < argv.length; i++) {
  if (argv[i] === "-o" || argv[i] === "--out") out = argv[++i];
}
if (!base || !skin) die("usage: skin.mjs <base.html> <skin> -o <out.html>");
if (!out) die("-o <out.html> is required; refusing to overwrite the base");
if (resolve(out) === resolve(base)) die("output would overwrite the base poster");

const skinPath = join(SKINS, `${skin}.css`);
if (!existsSync(skinPath)) {
  die(`no skin "${skin}". available: ${list().map((r) => r[0]).join(", ")}`);
}

let html = readFileSync(base, "utf8");
const css = readFileSync(skinPath, "utf8");

const stageM = css.split("\n")[0].match(/stage:\s*([^*]+?)\s*\*\//);
if (!stageM) die(`${skin}.css has no "/* stage: ... */" declaration on line 1`);
const stage = stageM[1];

// The stage class carries the theme. Swapping it does most of the reskin;
// the override block finishes it.
if (!/class="stage [^"]+"/.test(html)) {
  die(`${base} has no <div class="stage ..."> - is it a poster?`);
}
html = html.replace(/class="stage [^"]+"/, `class="stage ${stage}"`);

/* A skin block that selects `.stage.X` for an X the stage does not carry is
   dead CSS, and nothing downstream notices: the poster still renders, and
   checkvars.mjs still passes because the theme it DID get resolves every
   custom property. The result is a poster in the wrong palette that looks
   deliberate. The msft skin shipped exactly that -- it declared stage
   "t-paper msft" while its variable block selected `.stage.t-msft` -- and it
   cost a full render and a visual review to find. So: every `.stage.*` class
   the skin selects must be one the skin actually puts on the stage. */
const declared = new Set(stage.trim().split(/\s+/));
/* Strip comments first. The scan is a plain regex over the file, so without
   this it reads `.stage.t-msft` out of the very comment that documents the
   bug and rejects a correct skin. Caught by running the guard against all
   five shipped skins as a control before trusting it. */
const code = css.replace(/\/\*[\s\S]*?\*\//g, " ");
const selected = new Set(
  [...code.matchAll(/\.stage((?:\.[A-Za-z0-9_-]+)+)/g)]
    .flatMap((m) => m[1].split(".").filter(Boolean))
);
const dead = [...selected].filter((c) => !declared.has(c));
if (dead.length) {
  die(`${skin}.css selects .stage.${dead.join(", .stage.")} but the stage is ` +
      `"${stage}". That block can never match, so the poster would render in ` +
      `the base theme's palette while every gate passed. Either add the class ` +
      `to the "/* stage: ... */" line or select a class the stage carries.`);
}

const close = html.lastIndexOf("</style>");
if (close === -1) die(`${base} has no </style> to append the skin into`);
const body = "\n" + css.split("\n").slice(1).join("\n").replace(/\s+$/, "");
html = html.slice(0, close) + body + "\n" + html.slice(close);

// The title travels with the base otherwise, so every skin claims to be the
// poster it was cloned from.
const slug = out.replace(/^.*\//, "").replace(/\.html?$/i, "");
html = html.replace(/<title>[^<]*<\/title>/i, `<title>${slug}</title>`);

writeFileSync(out, html);
console.log(`${out}  <- ${base} + ${skin}  stage="${stage}"`);
console.log(`next: checkvars.mjs ${out}, then capture a still and look at it`);
