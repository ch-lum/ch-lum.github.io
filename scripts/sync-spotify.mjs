import { readFile, writeFile } from 'node:fs/promises';

try { process.loadEnvFile?.('.env'); } catch {}

const optional = process.argv.includes('--if-configured');
const clientId = process.env.SPOTIFY_CLIENT_ID;
const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

if (!clientId || !clientSecret) {
  const message = 'Set SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET in .env before syncing music.';
  if (optional) { console.warn(`${message} Using the existing cache.`); process.exit(0); }
  throw new Error(message);
}

function parseLine(line) {
  const values = [];
  let value = '';
  let quoted = false;
  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];
    if (character === '"' && line[index + 1] === '"') { value += '"'; index += 1; }
    else if (character === '"') quoted = !quoted;
    else if (character === ',' && !quoted) { values.push(value.trim()); value = ''; }
    else value += character;
  }
  values.push(value.trim());
  return values;
}

const csv = await readFile('content/music.csv', 'utf8');
const [headerLine, ...lines] = csv.trim().split(/\r?\n/);
const headers = parseLine(headerLine);
const ids = lines.filter(Boolean).map((line) => {
  const values = parseLine(line);
  return Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ''])).spotify_id;
});

if (new Set(ids).size !== ids.length) throw new Error('Every spotify_id in content/music.csv must be unique.');

const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
  method: 'POST',
  headers: {
    Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
    'Content-Type': 'application/x-www-form-urlencoded'
  },
  body: new URLSearchParams({ grant_type: 'client_credentials' })
});
if (!tokenResponse.ok) throw new Error(`Spotify authorization failed (${tokenResponse.status}).`);
const { access_token: accessToken } = await tokenResponse.json();

const albums = [];
for (const id of ids) {
  const response = await fetch(`https://api.spotify.com/v1/albums/${encodeURIComponent(id)}?market=US`, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  if (!response.ok) throw new Error(`Spotify album ${id} failed (${response.status}).`);
  const album = await response.json();
  albums.push({
    id: album.id,
    name: album.name,
    releaseDate: album.release_date,
    artists: album.artists.map((artist) => artist.name),
    artwork: album.images[0]?.url ?? '',
    spotifyUrl: album.external_urls.spotify
  });
}

await writeFile('content/spotify-albums.json', `${JSON.stringify(albums, null, 2)}\n`);
console.log(`Synced ${albums.length} Spotify album${albums.length === 1 ? '' : 's'}.`);
