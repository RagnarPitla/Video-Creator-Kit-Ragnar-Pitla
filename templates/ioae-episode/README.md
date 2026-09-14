# IOAE weekly episode template

The project renders at 1920x1080, 30 fps. `episode.json` controls the title,
chrome, hosts, scene order, scene content, and scene duration.

## Start a week

Run these commands from this template directory:

```bash
rsync -a --exclude node_modules --exclude out ./ ../ioae-YYYY-MM-DD/
cd ../ioae-YYYY-MM-DD
npm ci
```

Edit `episode.json`. Keep `episodeLabel` as `"EPISODE"` until the release number
is fixed, or set it to a value such as `"EP.13"`.

Preview both compositions:

```bash
npm run dev
```

Render the selected theme:

```bash
npm run render
npm run render:color
```

## Scene types

Each scene needs `id`, `type`, `durationInFrames`, and `props`. Set the optional
`transition` to `fade`, `wipe`, or `none`. Fade and wipe use the episode 12
12-frame timing without changing the summed composition duration.

| Type              | Use                                                       |
| ----------------- | --------------------------------------------------------- |
| `boot`            | BIOS log, memory counter, detected items, final prompt    |
| `title`           | Brand, episode title, subtitle, hosts, pixel sprite       |
| `bullets`         | Heading, lead, bullet list, footer, optional sprite       |
| `steps`           | Numbered or labeled process steps                         |
| `comparison`      | Two bordered columns with separate accent colors          |
| `quote`           | Pull quote, highlighted line, attribution, optional gloss |
| `terminal`        | Typed command lines, wiring line, badges, footer          |
| `stats`           | Labeled values with animated meters                       |
| `takeaways-outro` | Checklist, closing line, next item, links, hosts, prompt  |

The six-scene `episode.json` is a demo. Copy or remove scene objects to change
the timeline. `Root.tsx` sums `durationInFrames`, so scene insertion needs no
code edit.

## Check before a full render

Run the code checks and list the calculated duration:

```bash
npm run lint
npx remotion compositions
```

Render a frame near the end of each edited scene:

```bash
npx remotion still InOurAiEraColor out/check.png --frame=300
```

Open each PNG. Check the top label, F-key strip, progress meter, and every text
edge. Shorten copy or split it into another scene if it enters the 148 px side
safe area.
