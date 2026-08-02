# ch-lum.github.io

A static personal site built with SvelteKit.

## Local development

```bash
pnpm install
pnpm dev
```

## Build

```bash
pnpm build
```

## Adding coffee

1. Add one row to `content/coffee.csv`. Keep `roast_date` unique and use `YYYY-MM-DD`.
2. Add an image of the bag to `public/coffee_bags/`, preferably using the roast date as its filename.
3. Put that filename in the optional `image` column. If `image` is blank, the site looks for a date-named PNG such as `2026-07-03.PNG`.

If a value contains a comma, wrap that CSV value in double quotes. Elevation is stored as text, so ranges such as `1750–1950 masl` work as written.

Only `roast_date` is required, and it must be unique. Empty metadata cells display as “Not provided,” an empty `name` displays as “Unnamed coffee,” and an empty `image` falls back to `ROAST_DATE.PNG`.

## Adding music

1. Create a Spotify developer app and copy `.env.example` to `.env`.
2. Put the app's client ID and client secret in `.env`. Never commit `.env`.
3. Add a unique album ID and your reflection to `content/music.csv`.
4. Run `pnpm sync:music`, then commit both the CSV and updated `content/spotify-albums.json`.

Wrap notes containing commas in double quotes. The sync command uses Spotify's Client Credentials flow, so secrets remain local and the deployed website stays static. Playback uses Spotify's official album embed because Web API preview URLs are deprecated and may be unavailable.
