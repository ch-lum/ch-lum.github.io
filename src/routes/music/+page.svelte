<script lang="ts">
  import { flip } from 'svelte/animate';
  import musicCsv from '../../../content/music.csv?raw';
  import spotifyAlbums from '../../../content/spotify-albums.json';

  type SpotifyAlbum = {
    id: string;
    name: string;
    releaseDate: string;
    artists: string[];
    artwork: string;
    spotifyUrl: string;
  };
  type Album = SpotifyAlbum & { note: string; synced: boolean };
  type SortKey = 'name' | 'artist' | 'releaseDate';

  function parseLine(line: string) {
    const values: string[] = [];
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

  function parseMusicCsv(raw: string) {
    const [headerLine, ...lines] = raw.trim().split(/\r?\n/);
    const headers = parseLine(headerLine);
    return lines.filter((line) => line.trim()).map((line) => {
      const values = parseLine(line);
      return Object.fromEntries(headers.map((header, index) => [header, values[index] ?? '']));
    });
  }

  const cache = new Map((spotifyAlbums as SpotifyAlbum[]).map((album) => [album.id, album]));
  const albums: Album[] = parseMusicCsv(musicCsv).map((entry) => {
    const metadata = cache.get(entry.spotify_id);
    return metadata
      ? { ...metadata, note: entry.note || '', synced: true }
      : {
          id: entry.spotify_id,
          name: 'Album needs syncing',
          releaseDate: 'Not available',
          artists: ['Run pnpm sync:music'],
          artwork: '',
          spotifyUrl: `https://open.spotify.com/album/${entry.spotify_id}`,
          note: entry.note || '',
          synced: false
        };
  });

  let selected = $state<Album | null>(null);
  let sortBy = $state<SortKey>('name');
  let detailsDialog: HTMLDialogElement;

  const sortedAlbums = $derived(
    [...albums].sort((a, b) => {
      if (sortBy === 'releaseDate') return b.releaseDate.localeCompare(a.releaseDate);
      if (sortBy === 'artist') return (a.artists[0] ?? '').localeCompare(b.artists[0] ?? '') || a.name.localeCompare(b.name);
      return a.name.localeCompare(b.name);
    })
  );

  function showDetails(album: Album) {
    selected = album;
    detailsDialog.showModal();
  }

  function closeDetails() {
    detailsDialog.close();
    selected = null;
  }

  function formatReleaseDate(date: string) {
    if (!/^\d{4}(-\d{2})?(-\d{2})?$/.test(date)) return date;
    const [year, month = '01', day = '01'] = date.split('-');
    const options: Intl.DateTimeFormatOptions = date.length === 4
      ? { year: 'numeric' }
      : date.length === 7
        ? { year: 'numeric', month: 'long' }
        : { dateStyle: 'long' };
    return new Intl.DateTimeFormat('en-US', options).format(new Date(`${year}-${month}-${day}T00:00:00`));
  }
</script>

<svelte:head>
  <title>Music — Chrissy Lum</title>
  <meta name="description" content="Albums I keep returning to, with personal notes." />
</svelte:head>

<main>
  <header class="page-heading">
    <div><p class="eyebrow">A listening archive</p><h1>Music</h1></div>
    <p class="intro">Albums that found a place in my life, and a few words about why.</p>
  </header>

  <div class="controls">
    <label>Arrange by
      <select bind:value={sortBy}>
        <option value="name">Name</option>
        <option value="artist">Artist</option>
        <option value="releaseDate">Release Date</option>
      </select>
    </label>
  </div>

  <section class="albums" aria-label="Album archive">
    {#each sortedAlbums as album (album.id)}
      <article animate:flip={{ duration: 550 }}>
        <button class="album" onclick={() => showDetails(album)}>
          {#if album.artwork}
            <img src={album.artwork} alt={`Cover of ${album.name}`} />
          {:else}
            <span class="missing-art" aria-hidden="true">♪</span>
          {/if}
          <span class="album-copy">
            <strong>{album.name}</strong>
            <small>{album.artists.join(', ')}</small>
          </span>
        </button>
        <a class="spotify-link" href={album.spotifyUrl} target="_blank" rel="noreferrer">Open on Spotify ↗</a>
      </article>
    {/each}
  </section>
</main>

<dialog bind:this={detailsDialog} onclose={() => selected = null} onclick={(event) => event.target === detailsDialog && closeDetails()}>
  {#if selected}
    <button class="close" onclick={closeDetails} aria-label="Close details">×</button>
    <div class="dialog-layout">
      <div>
        {#if selected.artwork}<img class="dialog-art" src={selected.artwork} alt={`Cover of ${selected.name}`} />{/if}
        {#if selected.synced}
          <iframe
            title={`Listen to ${selected.name} on Spotify`}
            src={`https://open.spotify.com/embed/album/${selected.id}?utm_source=generator&theme=0`}
            width="100%"
            height="152"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
          ></iframe>
        {/if}
      </div>
      <div class="details">
        <p class="eyebrow">{selected.artists.join(', ')}</p>
        <h2>{selected.name}</h2>
        <dl>
          <div><dt>Artists</dt><dd>{selected.artists.join(', ')}</dd></div>
          <div><dt>Released</dt><dd>{formatReleaseDate(selected.releaseDate)}</dd></div>
        </dl>
        <section class="note"><h3>Why it’s here</h3><p>{selected.note || 'No note yet.'}</p></section>
        <a class="modal-link" href={selected.spotifyUrl} target="_blank" rel="noreferrer">Listen on Spotify ↗</a>
      </div>
    </div>
  {/if}
</dialog>

<style>
  main { width: min(76rem, calc(100% - 3rem)); margin: 0 auto; padding: 4rem 0 7rem; }
  .page-heading { display: flex; align-items: end; justify-content: space-between; gap: 3rem; border-bottom: 1px solid rgb(48 43 36 / 35%); padding-bottom: 1.5rem; }
  h1 { margin: 0; font-size: clamp(4rem, 10vw, 8rem); font-weight: 400; line-height: .85; }
  .eyebrow { margin: 0 0 .65rem; font-size: .75rem; letter-spacing: .16em; text-transform: uppercase; }
  .intro { max-width: 24rem; margin: 0; font-size: 1.05rem; line-height: 1.5; }
  .controls { display: flex; min-height: 5rem; align-items: center; justify-content: flex-end; }
  label { display: flex; align-items: center; gap: .65rem; font-size: .85rem; }
  select { border: 1px solid rgb(48 43 36 / 35%); background: transparent; color: inherit; font: inherit; padding: .55rem .9rem; }
  .albums { display: grid; grid-template-columns: repeat(auto-fit, minmax(13rem, 1fr)); gap: clamp(1.5rem, 4vw, 3rem); }
  article { min-width: 0; }
  button { color: inherit; font: inherit; }
  .album { display: block; width: 100%; border: 0; background: transparent; cursor: pointer; padding: 0; text-align: left; }
  .album img, .missing-art { width: 100%; aspect-ratio: 1; object-fit: cover; box-shadow: 0 .8rem 1.8rem rgb(48 43 36 / 18%); transition: transform .3s ease, box-shadow .3s ease; }
  .missing-art { display: grid; place-items: center; background: rgb(255 255 255 / 30%); font-size: 4rem; }
  .album:hover img, .album:focus-visible img, .album:hover .missing-art, .album:focus-visible .missing-art { transform: translateY(-.35rem) rotate(-1deg); box-shadow: 0 1.2rem 2.2rem rgb(48 43 36 / 24%); }
  .album:focus-visible { outline: 1px solid #302b24; outline-offset: .4rem; }
  .album-copy { display: grid; gap: .25rem; margin-top: 1rem; }
  .album-copy strong { font-size: 1.05rem; font-weight: 400; }
  .album-copy small { opacity: .7; }
  .spotify-link, .modal-link { display: inline-block; margin-top: .6rem; font-size: .72rem; text-underline-offset: .25em; opacity: .7; }
  dialog { width: min(62rem, calc(100% - 2rem)); max-height: calc(100vh - 2rem); overflow-y: auto; border: 1px solid rgb(48 43 36 / 40%); background: #edf0e4; color: #302b24; padding: clamp(1.5rem, 5vw, 3rem); }
  dialog::backdrop { background: rgb(30 28 24 / 55%); backdrop-filter: blur(3px); }
  .close { position: absolute; top: .7rem; right: 1rem; border: 0; background: transparent; cursor: pointer; font-size: 2rem; }
  .dialog-layout { display: grid; grid-template-columns: minmax(15rem, .9fr) 1.1fr; gap: clamp(2rem, 6vw, 5rem); align-items: start; }
  .dialog-art { width: 100%; aspect-ratio: 1; object-fit: cover; margin-bottom: 1rem; }
  iframe { display: block; border: 0; border-radius: 12px; }
  .details { padding-top: 1rem; }
  dialog h2 { margin: 0 0 1.5rem; font-size: clamp(2.3rem, 6vw, 4.5rem); font-weight: 400; line-height: 1; }
  dl { margin: 0; }
  dl div { display: grid; grid-template-columns: 5rem 1fr; gap: 1rem; border-top: 1px solid rgb(48 43 36 / 22%); padding: .65rem 0; }
  dt { font-size: .72rem; text-transform: uppercase; letter-spacing: .06em; opacity: .7; }
  dd { margin: 0; }
  .note { margin-top: 2.5rem; }
  .note h3 { margin: 0 0 .7rem; font-size: .78rem; font-weight: 400; letter-spacing: .12em; text-transform: uppercase; }
  .note p { margin: 0; font-size: 1.05rem; line-height: 1.65; }
  @media (max-width: 650px) {
    main { width: calc(100% - 2rem); padding-top: 2.5rem; }
    .page-heading { display: block; }
    .intro { margin-top: 1.5rem; }
    .albums { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1.5rem 1rem; padding-top: 2.5rem; }
    .dialog-layout { grid-template-columns: 1fr; }
  }
  @media (prefers-reduced-motion: reduce) { .album img, .missing-art { transition: none; } }
</style>
