<script lang="ts">
  import { flip } from 'svelte/animate';
  import ArrangeSelect from '$lib/ArrangeSelect.svelte';
  import CollectionPage from '$lib/CollectionPage.svelte';
  import DetailsDialog from '$lib/DetailsDialog.svelte';
  import PageMeta from '$lib/PageMeta.svelte';
  import { parseCsv } from '$lib/csv';
  import { formatPartialDate } from '$lib/dates';
  import { initialSearchParams, syncUrl } from '$lib/url-sync.svelte';
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
  type Album = SpotifyAlbum & { note: string; owned: boolean; synced: boolean };
  type SortKey = 'name' | 'artist' | 'releaseDate' | 'owned';
  const sortOptions: { value: SortKey; label: string }[] = [
    { value: 'name', label: 'Name' },
    { value: 'artist', label: 'Artist' },
    { value: 'releaseDate', label: 'Release Date' },
    { value: 'owned', label: 'Owned' }
  ];

  const cache = new Map((spotifyAlbums as SpotifyAlbum[]).map((album) => [album.id, album]));
  const albums: Album[] = parseCsv(musicCsv).map((entry) => {
    const metadata = cache.get(entry.spotify_id);
    const owned = ['true', 'yes', '1', 'owned', 'x'].includes(entry.owned?.trim().toLowerCase());
    return metadata
      ? { ...metadata, note: entry.note || '', owned, synced: true }
      : {
          id: entry.spotify_id,
          name: 'Album needs syncing',
          releaseDate: 'Not available',
          artists: ['Run pnpm sync:music'],
          artwork: '',
          spotifyUrl: `https://open.spotify.com/album/${entry.spotify_id}`,
          note: entry.note || '',
          owned,
          synced: false
        };
  });

  // URL state, e.g. /music/?sort=artist&album=<id>. Invalid or unknown
  // values fall back to defaults.
  function readSort(params: URLSearchParams): SortKey {
    const raw = params.get('sort');
    return (sortOptions.some((option) => option.value === raw) ? raw : 'name') as SortKey;
  }
  function readSelected(params: URLSearchParams): Album | null {
    const id = params.get('album');
    return id ? (albums.find((album) => album.id === id) ?? null) : null;
  }

  const initialParams = initialSearchParams();
  let selected = $state<Album | null>(readSelected(initialParams));
  let sortBy = $state<SortKey>(readSort(initialParams));

  syncUrl({
    params: () => ({
      sort: sortBy === 'name' ? null : sortBy,
      album: selected?.id ?? null
    }),
    entry: () => selected?.id ?? null,
    restore: (params) => {
      sortBy = readSort(params);
      const nextSelected = readSelected(params);
      if ((nextSelected?.id ?? null) !== (selected?.id ?? null)) selected = nextSelected;
    }
  });

  const sortedAlbums = $derived(
    [...albums].sort((a, b) => {
      if (sortBy === 'releaseDate') return b.releaseDate.localeCompare(a.releaseDate);
      if (sortBy === 'artist') return (a.artists[0] ?? '').localeCompare(b.artists[0] ?? '') || a.name.localeCompare(b.name);
      if (sortBy === 'owned') return Number(b.owned) - Number(a.owned) || a.name.localeCompare(b.name);
      return a.name.localeCompare(b.name);
    })
  );
</script>

<PageMeta title="Music" description="Albums I keep returning to, with personal notes." />

<CollectionPage eyebrow="A musical wishlist" title="Music">
  {#snippet intro()}Purchasing albums is hard. Wanting to purchase is easy, so here we are.{/snippet}

  <div class="controls">
    <ArrangeSelect bind:value={sortBy} options={sortOptions} />
  </div>

  <section class="albums" aria-label="Album archive">
    {#each sortedAlbums as album (album.id)}
      <article animate:flip={{ duration: 550 }}>
        <button class="album" onclick={() => selected = album}>
          {#if album.artwork}
            <img class:owned={album.owned} src={album.artwork} alt={`Cover of ${album.name}`} />
          {:else}
            <span class="missing-art" class:owned={album.owned} aria-hidden="true">♪</span>
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
</CollectionPage>


<DetailsDialog
  item={selected}
  onclose={() => selected = null}
  describe={(album) => ({
    eyebrow: album.artists.join(', '),
    title: album.name,
    rows: [
      { label: 'Artists', value: album.artists.join(', ') },
      { label: 'Released', value: formatPartialDate(album.releaseDate) },
      { label: 'Owned', value: album.owned ? 'Yes' : 'No' }
    ],
    note: album.note
  })}
>
  {#snippet media(album)}
    <div>
      {#if album.artwork}<img class="dialog-art" class:owned={album.owned} src={album.artwork} alt={`Cover of ${album.name}`} />{/if}
      {#if album.synced}
        <iframe
          title={`Listen to ${album.name} on Spotify`}
          src={`https://open.spotify.com/embed/album/${album.id}?utm_source=generator&theme=0`}
          width="100%"
          height="152"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
        ></iframe>
      {/if}
    </div>
  {/snippet}
  {#snippet footer(album)}
    <a class="modal-link" href={album.spotifyUrl} target="_blank" rel="noreferrer">Listen on Spotify ↗</a>
  {/snippet}
</DetailsDialog>

<style>
  .controls { display: flex; min-height: 5rem; align-items: center; justify-content: flex-end; }
  .albums { display: grid; grid-template-columns: repeat(auto-fit, minmax(13rem, 1fr)); gap: clamp(1.5rem, 4vw, 3rem); }
  article { min-width: 0; }
  .album { display: block; width: 100%; border: 0; background: transparent; color: inherit; font: inherit; cursor: pointer; padding: 0; text-align: left; }
  .album img, .missing-art { width: 100%; aspect-ratio: 1; object-fit: cover; box-shadow: 0 .8rem 1.8rem rgb(48 43 36 / 18%); transition: transform .3s ease, box-shadow .3s ease; }
  .owned { outline: 3px solid #b08d2f; outline-offset: 4px; }
  .missing-art { display: grid; place-items: center; background: rgb(255 255 255 / 30%); font-size: 4rem; }
  .album:hover img, .album:focus-visible img, .album:hover .missing-art, .album:focus-visible .missing-art { transform: translateY(-.35rem) rotate(-1deg); box-shadow: 0 1.2rem 2.2rem rgb(48 43 36 / 24%); }
  .album:focus-visible { outline: 1px solid #302b24; outline-offset: .4rem; }
  .album-copy { display: grid; gap: .25rem; margin-top: 1rem; }
  .album-copy strong { font-size: 1.05rem; font-weight: 400; }
  .album-copy small { opacity: .7; }
  .spotify-link, .modal-link { display: inline-block; margin-top: .6rem; font-size: .72rem; text-underline-offset: .25em; opacity: .7; }
  .dialog-art { width: 100%; aspect-ratio: 1; object-fit: cover; margin-bottom: 1rem; }
  iframe { display: block; border: 0; border-radius: 12px; }
  @media (max-width: 650px) {
    .albums { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1.5rem 1rem; padding-top: 2.5rem; }
  }
  @media (prefers-reduced-motion: reduce) { .album img, .missing-art { transition: none; } }
</style>
