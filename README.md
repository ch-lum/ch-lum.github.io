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
3. Put that filename in the optional `image` column. If `image` is blank, the site looks for a date-named PNG such as `2026-07-03.png`.

If a value contains a comma, wrap that CSV value in double quotes. Elevation is stored as text, so ranges such as `1750–1950 masl` work as written.
