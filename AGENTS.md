# Agent guide

## Project intent

This is Chrissy Lum's static personal website. It is intentionally built with SvelteKit and `@sveltejs/adapter-static`; do not introduce a backend unless explicitly requested. The site should feel personal, tactile, playful, and slightly whimsical rather than like a flat product portfolio.

Most ongoing updates must be possible through Markdown, CSV, JSON, or dropped-in images. Avoid designs that require editing Svelte code whenever a new post, album, coffee, pin, or project is added.

## Start here

Before changing anything:

1. Read this file and `README.md`.
2. Run `git status --short --branch` and inspect relevant diffs. Personal writing and CSV additions are user-owned work; preserve them.
3. Inspect the relevant route and an adjacent established route before designing a new pattern.
4. Use `rg` and `rg --files` for repository searches.

## Commands

```bash
pnpm dev
pnpm check
pnpm build
```

Run both `pnpm check` and `pnpm build` after meaningful UI or data changes. This repository's dependencies were installed with pnpm 11. If the locally installed pnpm reports an unexpected store version, use the matching version rather than reinstalling everything:

```bash
npx -y pnpm@11 check
npx -y pnpm@11 build
```

The static production output is written to `build/`.

## Structure

- `src/routes/`: SvelteKit pages.
- `src/lib/`: shared UI, including `SiteHeader.svelte`, home navigation, and the Leaflet pin map.
- Shared building blocks for pages (reuse these rather than copying markup/styles between routes):
  - `Page.svelte`: standard page frame (76rem content width, 3rem top / 8rem bottom spacing) with `PageHeader.svelte` on top: eyebrow, large serif title, optional intro or action, divider. Used by Coffee, Music, Pins, Long Form, Short Form, and Projects; About intentionally has its own layout.
  - `CollectionGrid.svelte`: animated, optionally grouped card grid (Coffee, Pins).
  - `DetailsDialog.svelte`: pale-green details modal (picture, eyebrow, title, label/value rows, optional note).
  - `ArrangeSelect.svelte`: the "Arrange by" dropdown.
  - `PageMeta.svelte`: `<title>… — Ch*!</title>` and meta description.
  - `url-sync.svelte.ts` (`syncUrl`): two-way sync between page state and the query string, including Back-closes-modal history handling.
  - `csv.ts` (`parseCsv`) and `dates.ts` (`formatDate`, `formatPartialDate`).
- `src/styles/global.css`: global serif typography and sage background.
- `content/`: user-editable CSV, Markdown, and cached metadata.
- `public/home_imgs/`: landing-page navigation artwork.
- `public/coffee_bags/`, `public/pins/`, and other public content folders: user-provided media.
- `src/routes/+layout.svelte`: installs the shared site header and global CSS.

## Visual conventions

- The default background is sage green (`#CCD4B5`) with a subtle radial highlight.
- The main typeface is Georgia/Times-style serif.
- Coffee, Music, and Pins share a collection-page language: serif title, eyebrow, right-aligned subtitle, thin divider, transparent controls, animated grids, and pale-green dialogs.
- When changing one archive, compare it with the other archive pages and preserve consistency unless the user requests a deliberate difference.
- Mobile layouts kick in below 650px.
- Keep layouts responsive. Two-column collections commonly become two compact columns on mobile; dialogs become one column.
- Respect `prefers-reduced-motion`.
- The shared header contains Home, About, Blog/Long Form, and CV. The autograph links home.

## Landing page

Landing navigation data lives in `src/lib/site.ts` and is rendered through `src/lib/NavImage.svelte`.

Navigation buttons are image-led and reveal their serif label on hover/focus. Supported motion styles include image swapping, kettle tipping, record spinning, and the separating pin/backing animation. Keep the image artwork in `public/home_imgs/`.

## Content workflows

### Long form

Long-form posts are date-prefixed Markdown files stored directly under `content/long-form/`. Preserve the existing `YYYY-MM-DD-name.md` convention. Post images live under `public/long-form/`, grouped by post where appropriate. `/blog/` redirects to `/long-form/`.

### Short form

Short-form entries are dated Markdown files in `content/short-form/`. Text and image entries use frontmatter documented in `README.md`. Navigation uses Newer/Older controls and fixed side arrows.

### Coffee

Coffee data lives in `content/coffee.csv`, keyed by unique `roast_date`. Bag images live in `public/coffee_bags/`. Missing optional metadata should degrade gracefully rather than break parsing.

### Music

Music selections live in `content/music.csv`. Spotify metadata is cached in `content/spotify-albums.json` using `pnpm sync:music`. Spotify credentials belong only in the ignored `.env`; never expose or commit them. Owned albums receive a gold outline.

### Pins

Pin data lives in `content/pins.csv`. Current columns are:

```text
name,city,state,country,latitude,longitude,first_visit,visits,type,image,note
```

- `name` is required. Duplicate names are keyed using name plus city.
- Supported types are Aquarium, Zoo, Art, Museum, Theater, National Park, and Other.
- Blank images use type illustrations from `public/pins/placeholders/`.
- Pin photographs go directly in `public/pins/`, with their filename in the CSV.
- All pins use one fixed square-ish display size; there is no dimensions or ratio field.
- Blank first visits display as “Unknown”; blank visit counts display as “Many times.”
- Latitude, longitude, and implementation metadata stay out of the details modal.
- Notes use the heading “A bit about it” without a differently shaded note box.
- The map uses Leaflet and OpenStreetMap tiles. Tiles and markers must remain in the same Leaflet projection; do not return to an iframe with separately positioned overlays.
- The map displays every pin in one pannable, scroll-zoomable view.
- Initial map focus randomly selects a city, state, or country containing at least three pins. If none qualify, fit the full collection.
- The Shuffle button remounts the map and chooses another eligible starting group when possible.
- Markers must use the exact CSV coordinates; do not jitter their positions.

CSV values containing commas must be quoted. Be especially careful with personal notes, apostrophes, accented names, and user-added categories. After CSV edits, verify parsing with the project checks.

## Editing and git hygiene

- Use `apply_patch` for hand edits. Bulk mechanical data migrations may use an appropriate formatting command.
- Do not overwrite unrelated working-tree changes.
- Commit coherent checkpoints frequently when implementing requested changes, but do not push or publish unless explicitly asked.
- Never use destructive git commands to clean the user's worktree.
- The user may directly edit copy and CSV data between agent turns. Treat those edits as intentional unless there is clear evidence otherwise.
