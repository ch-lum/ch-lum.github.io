<script lang="ts">
  import { flip } from 'svelte/animate';
  import { slide } from 'svelte/transition';
  import { browser } from '$app/environment';
  import { afterNavigate, pushState, replaceState } from '$app/navigation';
  import PinMap, { type MapPin } from '$lib/PinMap.svelte';
  import { thumbImage, fullImage } from '$lib/media';
  import { buildSearch, searchMatches } from '$lib/url-params';
  import pinsCsv from '../../../content/pins.csv?raw';

  type PinType = 'Aquarium' | 'Zoo' | 'Art' | 'Museum' | 'Theater' | 'National Park' | 'Other';
  type View = 'map' | 'grid';
  type ArrangeKey = 'name' | 'type' | 'location' | 'country' | 'city' | 'firstVisit' | 'visits';
  type Pin = MapPin;

  const types = new Set<PinType>(['Aquarium', 'Zoo', 'Art', 'Museum', 'Theater', 'National Park', 'Other']);
  const filterTypes: PinType[] = ['Aquarium', 'Zoo', 'Art', 'Museum', 'National Park', 'Theater', 'Other'];
  const arrangeOptions: { value: ArrangeKey; label: string }[] = [
    { value: 'name', label: 'Name' }, { value: 'type', label: 'Type' },
    { value: 'city', label: 'City' },
    { value: 'location', label: 'State / Country' }, { value: 'country', label: 'Country' },
    { value: 'firstVisit', label: 'First visit' }, { value: 'visits', label: 'Visit count' }
  ];

  function parseLine(line: string) {
    const values: string[] = [];
    let value = '', quoted = false;
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

  function parsePins(raw: string): Pin[] {
    const [headerLine, ...lines] = raw.trim().split(/\r?\n/);
    const headers = parseLine(headerLine);
    const rows = lines.filter(Boolean).map((line) => {
      const values = parseLine(line);
      return Object.fromEntries(headers.map((header, index) => [header, values[index] ?? '']));
    });
    const nameCounts = new Map<string, number>();
    for (const row of rows) nameCounts.set(row.name.toLowerCase(), (nameCounts.get(row.name.toLowerCase()) ?? 0) + 1);
    const keys = new Set<string>();
    return rows.map((row) => {
      if (!row.name) throw new Error('Every pin needs a name.');
      const key = nameCounts.get(row.name.toLowerCase())! > 1 ? `${row.name}—${row.city}` : row.name;
      if (keys.has(key.toLowerCase())) throw new Error(`Duplicate pin key: ${key}`);
      keys.add(key.toLowerCase());
      const pinType: PinType = types.has(row.type as PinType) ? row.type as PinType : 'Other';
      const placeholderSlug = pinType.toLowerCase().replace(/\s+/g, '-');
      const source = row.image ? (row.image.startsWith('/') ? row.image : `/pins/${row.image}`) : `/pins/placeholders/${placeholderSlug}.svg`;
      return {
        key, name: row.name, city: row.city || 'Unknown', state: row.state,
        country: row.country || 'Unknown', latitude: Number(row.latitude), longitude: Number(row.longitude),
        firstVisit: row.first_visit || 'Unknown', visits: row.visits || 'Many times', type: pinType,
        image: fullImage(source), thumbImage: thumbImage(source), note: row.note
      };
    });
  }

  const pins = parsePins(pinsCsv);
  const MIN_PIN_SIZE = 24;
  const MAX_PIN_SIZE = 72;
  const PIN_SIZE_STEP = 6;

  // Initial state hydrates from the URL (once, at component init) so a
  // deep link like /pins/?view=grid&arrange=city&pin=sf-moma restores
  // exactly that view. Invalid/unknown param values fall back to defaults,
  // same defensive posture as parsing the CSV's own `type` column. Uses
  // `location` (the native, always-accurate browser API) rather than
  // `page.url` from `$app/state` — see the write-out effect below for why.
  // Guarded by `browser`, since this runs during prerendering too, where
  // `location` doesn't exist — the prerendered HTML just reflects defaults,
  // and hydration picks up the real query string an instant later.
  const initialParams = new URLSearchParams(browser ? location.search : '');
  function readView(): View { return initialParams.get('view') === 'grid' ? 'grid' : 'map'; }
  function readArrange(): ArrangeKey {
    const raw = initialParams.get('arrange');
    return (arrangeOptions.some((option) => option.value === raw) ? raw : 'name') as ArrangeKey;
  }
  function readTypes(): Set<PinType> {
    const raw = initialParams.get('types');
    if (!raw) return new Set(filterTypes);
    const requested = raw.split(',').filter((value): value is PinType => types.has(value as PinType));
    return requested.length ? new Set(requested) : new Set(filterTypes);
  }
  function readSelected(): Pin | null {
    const key = initialParams.get('pin');
    return key ? (pins.find((pin) => pin.key === key) ?? null) : null;
  }

  let view = $state<View>(readView());
  let mapVersion = $state(0);
  let pinSize = $state(42);

  function decreasePinSize() { pinSize = Math.max(MIN_PIN_SIZE, pinSize - PIN_SIZE_STEP); }
  function increasePinSize() { pinSize = Math.min(MAX_PIN_SIZE, pinSize + PIN_SIZE_STEP); }
  let arrangeBy = $state<ArrangeKey>(readArrange());
  const initialSelected = readSelected();
  let selected = $state<Pin | null>(initialSelected);
  let detailsDialog: HTMLDialogElement;
  let filtersOpen = $state(false);
  let activeTypes = $state<Set<PinType>>(readTypes());
  // Write-out bookkeeping — deliberately plain variables, not `$state`, since
  // they track what was last synced rather than driving any UI:
  // - `previousSelectedKey` lets the write-out effect tell "a new modal just
  //   opened" (push) apart from any other change (replace). It starts as the
  //   deep-linked pin, if any, so a mount-time URL clean-up never pushes.
  // - `modalEntryPushed` records that the open modal got its own history
  //   entry, so closing it via ×/Escape/backdrop can pop that entry again
  //   instead of leaving a dead duplicate behind that makes Back a no-op.
  let previousSelectedKey: string | null = initialSelected?.key ?? null;
  let modalEntryPushed = false;
  // SvelteKit's pushState/replaceState must not be called before its router
  // has started, and during hydration this component's first effects run
  // before that point (the dev build throws a clear "router is initialized"
  // error; the production build fails deeper inside SvelteKit with a
  // TypeError, and leaves its history bookkeeping half-done). afterNavigate
  // fires once the router is ready — on initial load and on client-side
  // navigation alike — so the write-out effect waits for it.
  let urlReady = $state(false);
  afterNavigate(() => { urlReady = true; });

  function toggleType(type: PinType) {
    const next = new Set(activeTypes);
    if (next.has(type)) next.delete(type); else next.add(type);
    activeTypes = next;
  }

  // Write the current view/arrange/filters/modal state out to the URL.
  // Filter/sort/view changes replace the current history entry (URL stays
  // accurate without spamming Back); opening a pin's modal pushes a new
  // entry, so Back closes it, matching common patterns (Gmail, photo
  // galleries). Uses `location` rather than `page.url` from `$app/state` —
  // after a Back-then-Forward sequence through our own shallow-routed
  // history entries, `page.url` doesn't always resync (a SvelteKit
  // shallow-routing edge case), which previously caused this effect to
  // "correct" the URL using stale data right after Forward navigation,
  // fighting the browser's own navigation. `location` is always accurate,
  // and reading it here creates no Svelte dependency (it isn't reactive),
  // so no `untrack` is needed either — this effect's only real
  // dependencies are the local state vars (plus `urlReady`), as intended.
  $effect(() => {
    if (!urlReady) return;
    const params = {
      view: view === 'map' ? null : view,
      arrange: arrangeBy === 'name' ? null : arrangeBy,
      types: activeTypes.size === filterTypes.length ? null : [...activeTypes].join(','),
      pin: selected?.key ?? null
    };
    const selectedKey = selected?.key ?? null;
    const previousKey = previousSelectedKey;
    previousSelectedKey = selectedKey;
    if (searchMatches(location.search, params)) return;
    if (selectedKey === null && previousKey !== null && modalEntryPushed) {
      // Closing a modal that got its own history entry: pop that entry (the
      // same thing Back does) rather than rewriting it in place.
      modalEntryPushed = false;
      history.back();
      return;
    }
    const search = buildSearch(params);
    const url = `${location.pathname}${search ? `?${search}` : ''}`;
    if (selectedKey !== null && selectedKey !== previousKey) {
      pushState(url, {});
      modalEntryPushed = true;
    } else {
      replaceState(url, {});
    }
  });

  // Read the URL back into state on Back/Forward navigation. A native
  // `popstate` listener (rather than a $effect watching page.url) is used
  // deliberately: `popstate` only ever fires for genuine Back/Forward, never
  // for our own pushState/replaceState calls, so there's no risk of racing
  // the write-out effect above — and `location.search` is the browser's own
  // ground truth, sidestepping a SvelteKit shallow-routing edge case where
  // `page.url` (from $app/state) doesn't always resync on Back-then-Forward
  // sequences through our own history entries.
  function syncFromLocation() {
    const params = new URLSearchParams(location.search);

    const nextView: View = params.get('view') === 'grid' ? 'grid' : 'map';
    if (nextView !== view) view = nextView;

    const rawArrange = params.get('arrange');
    const nextArrange = (arrangeOptions.some((option) => option.value === rawArrange) ? rawArrange : 'name') as ArrangeKey;
    if (nextArrange !== arrangeBy) arrangeBy = nextArrange;

    const rawTypes = params.get('types');
    const requestedTypes = rawTypes ? rawTypes.split(',').filter((value): value is PinType => types.has(value as PinType)) : [];
    const nextTypes = requestedTypes.length ? new Set(requestedTypes) : new Set(filterTypes);
    const typesChanged = nextTypes.size !== activeTypes.size || [...nextTypes].some((value) => !activeTypes.has(value));
    if (typesChanged) activeTypes = nextTypes;

    const rawPin = params.get('pin');
    const nextSelected = rawPin ? (pins.find((pin) => pin.key === rawPin) ?? null) : null;
    if ((nextSelected?.key ?? null) !== (selected?.key ?? null)) selected = nextSelected;
  }

  // Keep the native <dialog> element in sync with `selected`, regardless of
  // whether it changed via a click or a URL-driven update above.
  $effect(() => {
    if (!detailsDialog) return;
    if (selected && !detailsDialog.open) detailsDialog.showModal();
    else if (!selected && detailsDialog.open) detailsDialog.close();
  });

  const visiblePins = $derived(pins.filter((pin) => activeTypes.has(pin.type)));

  function group(pin: Pin) {
    if (arrangeBy === 'location') return pin.state || pin.country;
    if (arrangeBy === 'firstVisit') return pin.firstVisit === 'Unknown' ? 'Unknown' : pin.firstVisit.slice(0, 4);
    return pin[arrangeBy];
  }

  function compareFields(a: Pin, b: Pin, fields: (keyof Pin)[]) {
    for (const field of fields) {
      const comparison = String(a[field]).localeCompare(String(b[field]));
      if (comparison) return comparison;
    }
    return 0;
  }

  function visitRank(pin: Pin) {
    if (pin.visits === 'Many times') return Number.POSITIVE_INFINITY;
    const count = Number(pin.visits);
    return Number.isFinite(count) ? count : 0;
  }

  const arrangedPins = $derived([...visiblePins].sort((a, b) => {
    if (arrangeBy === 'visits') {
      const aVisits = visitRank(a), bVisits = visitRank(b);
      if (aVisits !== bVisits) return aVisits < bVisits ? 1 : -1;
      return a.name.localeCompare(b.name);
    }
    const groupComparison = group(a).localeCompare(group(b));
    if (groupComparison) return groupComparison;
    if (arrangeBy === 'city') return compareFields(a, b, ['state', 'country', 'name']);
    if (arrangeBy === 'location') return compareFields(a, b, ['city', 'state', 'country', 'name']);
    if (arrangeBy === 'country') return compareFields(a, b, ['city', 'state', 'name']);
    if (arrangeBy === 'firstVisit') return a.firstVisit.localeCompare(b.firstVisit) || a.name.localeCompare(b.name);
    return a.name.localeCompare(b.name);
  }));
  function openDetails(pin: Pin) { selected = pin; }
  function closeDetails() { selected = null; }
  function formatDate(date: string) {
    if (/^\d{4}$/.test(date)) return date;
    if (/^\d{4}-\d{2}$/.test(date)) {
      return new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long' }).format(new Date(`${date}-01T00:00:00`));
    }
    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return new Intl.DateTimeFormat('en-US', { dateStyle: 'long' }).format(new Date(`${date}T00:00:00`));
    }
    return date;
  }
</script>

<svelte:window onpopstate={syncFromLocation} />

<svelte:head><title>Pins — Ch*!</title><meta name="description" content="A map and cabinet of pins collected from places I have visited." /></svelte:head>

<main>
  <header class="page-heading">
    <div><p class="eyebrow">Oh, the places you'll go!</p><h1>Pins & Places</h1></div>
    <p class="intro">So this collection is only <i>most</i> of my pins.</p>
  </header>
  <div class="controls" aria-label="Collection controls">
    <div class="view-switch"><button class:active={view === 'map'} onclick={() => view = 'map'}>Map</button><button class:active={view === 'grid'} onclick={() => view = 'grid'}>Grid</button></div>
    {#if view === 'grid'}
      <label>Arrange by <select bind:value={arrangeBy}>{#each arrangeOptions as option}<option value={option.value}>{option.label}</option>{/each}</select></label>
    {:else}
      <div class="map-actions">
        <div class="pin-size" role="group" aria-label="Pin size">
          <button onclick={decreasePinSize} disabled={pinSize <= MIN_PIN_SIZE} aria-label="Decrease pin size">−</button>
          <button onclick={increasePinSize} disabled={pinSize >= MAX_PIN_SIZE} aria-label="Increase pin size">+</button>
        </div>
        <button class="shuffle" onclick={() => mapVersion += 1} aria-label="Shuffle map starting location">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M3 7h3.5c5 0 6 10 11 10H21M18 14l3 3-3 3" />
            <path d="M3 17h3.5c5 0 6-10 11-10H21M18 4l3 3-3 3" />
          </svg>
          Shuffle
        </button>
      </div>
    {/if}
  </div>

  <div class="filters">
    <button class="filters-toggle" onclick={() => filtersOpen = !filtersOpen} aria-expanded={filtersOpen}>
      Filters
      <svg class="chevron" class:open={filtersOpen} viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6" /></svg>
    </button>
    {#if filtersOpen}
      <div class="filter-options" transition:slide={{ duration: 200 }}>
        {#each filterTypes as type}
          <button class="filter-chip" class:active={activeTypes.has(type)} onclick={() => toggleType(type)} aria-pressed={activeTypes.has(type)}>{type}</button>
        {/each}
      </div>
    {/if}
  </div>

  {#if view === 'map'}
    <section class="map-box" aria-label="Map of pin collection">
      {#key mapVersion}<PinMap pins={visiblePins} onselect={openDetails} {pinSize} />{/key}
    </section>
  {:else}
    <section class="collection" aria-label="Pin collection" aria-live="polite">
      {#each arrangedPins as pin, index (pin.key)}
        <article animate:flip={{ duration: 650 }}>
          {#if arrangeBy !== 'name'}
            <div class="group-heading">{#if index === 0 || group(arrangedPins[index - 1]) !== group(pin)}<h2>{group(pin)}</h2>{/if}</div>
          {/if}
          <button class="pin-card" onclick={() => openDetails(pin)}>
            <span class="pin-stage"><img src={pin.thumbImage} alt="" loading="lazy" decoding="async" /></span><span class="pin-copy"><strong>{pin.name}</strong><small>{pin.city}{pin.state ? `, ${pin.state}` : ''}</small></span>
          </button>
        </article>
      {/each}
    </section>
  {/if}
</main>

<dialog bind:this={detailsDialog} onclose={() => selected = null} onclick={(event) => event.target === detailsDialog && closeDetails()}>
  {#if selected}<button class="close" onclick={closeDetails} aria-label="Close details">×</button><div class="dialog-layout">
    <div class="dialog-pin"><img src={selected.image} alt={`${selected.name} pin`} /></div>
    <div class="details"><p class="eyebrow">{selected.type}</p><h2>{selected.name}</h2><dl><div><dt>Place</dt><dd>{selected.city}{selected.state ? `, ${selected.state}` : ''}, {selected.country}</dd></div><div><dt>First visit</dt><dd>{formatDate(selected.firstVisit)}</dd></div><div><dt>Visits</dt><dd>{selected.visits}</dd></div></dl><section class="note"><h3>A bit about it</h3><p>{selected.note || 'No note yet.'}</p></section></div>
  </div>{/if}
</dialog>

<style>
  main { width: min(76rem, calc(100% - 3rem)); margin: 0 auto; padding: 4rem 0 7rem; color: #302b24; }
  .page-heading { display: flex; align-items: end; justify-content: space-between; gap: 3rem; border-bottom: 1px solid rgb(48 43 36 / 35%); padding-bottom: 1.5rem; }
  h1 { margin: 0; font-size: clamp(4rem, 10vw, 8rem); font-weight: 400; line-height: .85; }
  .eyebrow { margin: 0 0 .65rem; font-size: .75rem; letter-spacing: .16em; text-transform: uppercase; }
  .intro { max-width: 24rem; margin: 0; font-size: 1.05rem; line-height: 1.5; }
  .controls { display: flex; min-height: 5rem; align-items: center; justify-content: space-between; gap: 1rem; }
  button, select { color: inherit; font: inherit; }
  label { display: flex; align-items: center; gap: .65rem; font-size: .85rem; }
  select { border: 1px solid rgb(48 43 36 / 35%); background: transparent; padding: .55rem .9rem; }
  .view-switch { display: flex; gap: .35rem; }
  .view-switch button { border: 1px solid rgb(48 43 36 / 35%); background: transparent; padding: .55rem .9rem; cursor: pointer; }
  .view-switch button.active { background: #302b24; color: #edf0e4; }
  .map-actions { display: flex; align-items: center; gap: 1rem; }
  .pin-size { display: flex; gap: .35rem; }
  .pin-size button { border: 1px solid rgb(48 43 36 / 35%); background: transparent; padding: .55rem .9rem; cursor: pointer; line-height: 1; }
  .pin-size button:disabled { opacity: .35; cursor: not-allowed; }
  .shuffle { display: flex; align-items: center; gap: .45rem; border: 1px solid rgb(48 43 36 / 35%); background: transparent; padding: .55rem .9rem; cursor: pointer; }
  .shuffle svg { width: 1rem; height: 1rem; fill: none; stroke: currentColor; stroke-width: 1.7; stroke-linecap: round; stroke-linejoin: round; }
  .filters { margin: -.5rem 0 1.5rem; }
  .filters-toggle { display: flex; align-items: center; gap: .4rem; border: 0; background: transparent; padding: .3rem 0; font-size: .8rem; letter-spacing: .04em; cursor: pointer; opacity: .85; }
  .filters-toggle:hover { opacity: 1; }
  .chevron { width: .7rem; height: .7rem; fill: none; stroke: currentColor; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; transition: transform .2s ease; }
  .chevron.open { transform: rotate(180deg); }
  .filter-options { display: flex; flex-wrap: wrap; gap: .5rem; padding-top: .85rem; }
  .filter-chip { border: 1px solid rgb(48 43 36 / 35%); background: transparent; padding: .4rem .8rem; font-size: .78rem; cursor: pointer; opacity: .5; }
  .filter-chip.active { background: #302b24; color: #edf0e4; opacity: 1; }
  .map-box { height: min(68vh, 45rem); min-height: 32rem; overflow: hidden; border: 1px solid rgb(48 43 36 / 35%); background: #e8e6df; }
  .collection { position: relative; display: grid; grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr)); align-items: end; gap: 2rem; }
  .collection article { min-width: 0; }
  .group-heading { display: flex; height: 1.75rem; align-items: flex-end; }
  .collection article h2 { margin: 0; font-size: .85rem; font-weight: 400; line-height: 1; letter-spacing: .08em; text-transform: uppercase; }
  .pin-card { width: 100%; border: 0; background: transparent; cursor: pointer; padding: .5rem; text-align: center; transition: transform .25s ease; }
  .pin-card:hover, .pin-card:focus-visible { transform: translateY(-.4rem); }.pin-card:focus-visible { outline: 1px solid #302b24; outline-offset: .25rem; }
  .pin-stage { height: 8rem; display: grid; place-items: center; }
  .pin-stage img { width: 7rem; height: 7rem; max-width: 100%; object-fit: contain; filter: drop-shadow(0 .7rem .5rem rgb(48 43 36 / 18%)); }
  .pin-copy { display: grid; min-height: 3rem; align-content: start; gap: .2rem; margin-top: .6rem; }.pin-copy strong { font-size: 1rem; font-weight: 400; }.pin-copy small { font-size: .78rem; opacity: .7; }
  dialog { width: min(62rem, calc(100% - 2rem)); max-height: calc(100vh - 2rem); overflow-y: auto; border: 1px solid rgb(48 43 36 / 40%); background: #edf0e4; color: #302b24; padding: clamp(1.5rem, 5vw, 3rem); }
  dialog::backdrop { background: rgb(30 28 24 / 55%); backdrop-filter: blur(3px); }.close { position: absolute; top: .7rem; right: 1rem; border: 0; background: transparent; cursor: pointer; font-size: 2rem; }
  .dialog-layout { display: grid; grid-template-columns: minmax(15rem, .9fr) 1.1fr; gap: clamp(2rem, 6vw, 5rem); align-items: start; }
  .dialog-pin { min-height: 24rem; display: grid; place-items: center; }.dialog-pin img { width: min(18rem, 100%); aspect-ratio: 1; object-fit: contain; filter: drop-shadow(0 .8rem .6rem rgb(48 43 36 / 20%)); }
  .details { padding-top: 1rem; } dialog h2 { margin: 0 0 1.5rem; font-size: clamp(2.3rem, 6vw, 4.5rem); font-weight: 400; line-height: 1; }
  dl { margin: 0; } dl div { display: grid; grid-template-columns: 5rem 1fr; gap: 1rem; border-top: 1px solid rgb(48 43 36 / 22%); padding: .65rem 0; } dt { font-size: .72rem; text-transform: uppercase; letter-spacing: .06em; opacity: .7; } dd { margin: 0; }
  .note { margin-top: 2.5rem; }.note h3 { margin: 0 0 .7rem; font-size: .78rem; font-weight: 400; letter-spacing: .12em; text-transform: uppercase; }.note p { margin: 0; font-size: 1.05rem; line-height: 1.65; }
  @media (max-width: 650px) { main { width: calc(100% - 2rem); padding-top: 2.5rem; }.page-heading { display: block; }.intro { margin-top: 1.5rem; }.map-box { height: 65vh; min-height: 27rem; }.collection { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1rem; }.pin-stage { height: 8rem; }.pin-stage img { width: 6rem; height: 6rem; }.dialog-layout { grid-template-columns: 1fr; }.dialog-pin { min-height: 14rem; } }
  @media (prefers-reduced-motion: reduce) { .pin-card { transition: none; } }
</style>
