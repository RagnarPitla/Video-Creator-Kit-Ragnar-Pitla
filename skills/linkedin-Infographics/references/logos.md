# Product logos

`assets/logos/` holds 17 vetted Microsoft product marks as SVG. They are real
official marks from Microsoft's published architecture icon sets, not traced,
not redrawn, not pulled off an image search.

Use them by pointing `<img>` at the folder through the `assets` symlink:

```html
<span class="lg"><img src="assets/logos/copilot-studio.svg" alt="Copilot Studio"></span>
```

## What is in there

| file | product |
|---|---|
| `agent365.svg` | Microsoft Agent 365 |
| `m365-copilot.svg` | Microsoft 365 Copilot |
| `copilot-studio.svg` | Copilot Studio |
| `fabric.svg` | Microsoft Fabric |
| `foundry.svg` | Microsoft Foundry |
| `dynamics365.svg` | Dynamics 365 |
| `d365-fno.svg` `d365-finance.svg` `d365-scm.svg` `d365-sales.svg` `d365-service.svg` | the Dynamics apps |
| `entra.svg` `purview.svg` | identity and data governance |
| `powerbi.svg` `onelake.svg` `warehouse.svg` `kql.svg` | Fabric data surfaces |

`SOURCES.txt` in the same folder records the six set URLs and their sha256. The
zips themselves are not kept - they are 103 MB and re-downloadable.

## Microsoft Defender is missing, deliberately

There is no Defender mark in any of the six public sets. The Azure set contains
`10241-icon-service-Microsoft-Defender-for-Cloud.svg`, which is a **green shield
with a padlock**. Microsoft Defender's mark is a **blue shield**. Different
product, different mark.

Rendering it and looking at it is what caught this. Do not ship it as Defender.
If a poster needs Defender, either pull the mark from Brand Central or give the
row a `.lg.lg-sm.plain` spacer so it aligns with its neighbours and carries no
mark at all - which is what the Agent Ecosystem posters do.

## The substring trap

Filename matching inside these sets is how you get the wrong logo without ever
noticing. Two that bit:

- searching `fabric` matches **Service Fabric**, an unrelated Azure product
- searching `business` matches **BusinessCentral** when you wanted Dynamics 365

Both produce a plausible-looking mark in the right place. **Render every new
mark and look at it before it ships.** A wrong logo is worse than no logo,
because no reader will check it and every reader will believe it.

## Microsoft's own terms, and what they force in the CSS

The icon sets ship with conditions. They are not decorative:

> do not crop, flip, rotate or distort the icons; do not use a Microsoft icon to
> represent your own product; keep the product name near the icon.

That is why the `.lg` block is shaped the way it is:

- `.lg` is a **square** tile and the `img` uses `object-fit: contain`, so a
  non-square mark letterboxes instead of stretching
- the `img` never gets a non-square explicit width/height
- the pulse animates `box-shadow` on the tile, **not** `transform: scale` on the
  mark, because scaling is distortion
- every mark sits beside or above its product wordmark

Keep those properties if you write a new logo treatment.

## The animation that was not animating

`@keyframes lgring` originally read:

```css
0%, 100% { box-shadow: 0 0 0 0    rgba(255,255,255,.8) }
50%      { box-shadow: 0 0 0 4px  rgba(255,255,255,0)  }
```

Zero spread at one end, zero alpha at the other. The ring was never both sized
and visible. A literal no-op - and `motion.mjs` reported **ok** with a plausible
score, because the rest of the poster was still moving.

The only signal was that the logo edition scored *identically* to the logo-free
poster it was cloned from, to three significant figures. Identical numbers from
different inputs is the signature of measuring nothing.

**When you add a feature to a clone, the unmodified parent is a free control.**
Score both. If the numbers match, your feature is inert.

Now written 0% / 30% / 60% with a solid ring at alpha .6, which separated the
editions from their parents: v4-logos 0.53 -> 0.61, v1-logos 1.09 -> 1.16, while
two untouched control files stayed byte-identical.
