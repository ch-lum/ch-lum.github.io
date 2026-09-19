<script lang="ts">
  import { slide } from 'svelte/transition';
  import ArrangeSelect from '$lib/ArrangeSelect.svelte';
  import CollectionGrid from '$lib/CollectionGrid.svelte';
  import CollectionPage from '$lib/CollectionPage.svelte';
  import DetailsDialog from '$lib/DetailsDialog.svelte';
  import PageMeta from '$lib/PageMeta.svelte';
  import PinMap, { type MapPin } from '$lib/PinMap.svelte';
  import { parseCsv } from '$lib/csv';
  import { formatPartialDate } from '$lib/dates';
  import { thumbImage, fullImage } from '$lib/media';
  import { initialSearchParams, syncUrl } from '$lib/url-sync.svelte';
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

  function parsePins(raw: string): Pin[] {
    const rows = parseCsv(raw);
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

  // URL state, e.g. /pins/?view=grid&arrange=city&types=Zoo,Art&pin=sf-moma.
  // Invalid or unknown values fall back to defaults, same defensive posture
  // as parsing the CSV's own `type` column.
  function readView(params: URLSearchParams): View { return params.get('view') === 'grid' ? 'grid' : 'map'; }
  function readArrange(params: URLSearchParams): ArrangeKey {
    const raw = params.get('arrange');
    return (arrangeOptions.some((option) => option.value === raw) ? raw : 'name') as ArrangeKey;
  }
  function readTypes(params: URLSearchParams): Set<PinType> {
    const raw = params.get('types');
    const requested = raw ? raw.split(',').filter((value): value is PinType => types.has(value as PinType)) : [];
    return requested.length ? new Set(requested) : new Set(filterTypes);
  }
  function readSelected(params: URLSearchParams): Pin | null {
    const key = params.get('pin');
    return key ? (pins.find((pin) => pin.key === key) ?? null) : null;
  }

  const initialParams = initialSearchParams();
  let view = $state<View>(readView(initialParams));
  let mapVersion = $state(0);
  let pinSize = $state(42);

  function decreasePinSize() { pinSize = Math.max(MIN_PIN_SIZE, pinSize - PIN_SIZE_STEP); }
  function increasePinSize() { pinSize = Math.min(MAX_PIN_SIZE, pinSize + PIN_SIZE_STEP); }
  let arrangeBy = $state<ArrangeKey>(readArrange(initialParams));
  let selected = $state<Pin | null>(readSelected(initialParams));
  let filtersOpen = $state(false);
  let activeTypes = $state<Set<PinType>>(readTypes(initialParams));

  function toggleType(type: PinType) {
    const next = new Set(activeTypes);
    if (next.has(type)) next.delete(type); else next.add(type);
    activeTypes = next;
  }

  syncUrl({
    params: () => ({
      view: view === 'map' ? null : view,
      arrange: arrangeBy === 'name' ? null : arrangeBy,
      types: activeTypes.size === filterTypes.length ? null : [...activeTypes].join(','),
      pin: selected?.key ?? null
    }),
    entry: () => selected?.key ?? null,
    restore: (params) => {
      view = readView(params);
      arrangeBy = readArrange(params);
      const nextTypes = readTypes(params);
      const typesChanged = nextTypes.size !== activeTypes.size || [...nextTypes].some((value) => !activeTypes.has(value));
      if (typesChanged) activeTypes = nextTypes;
      const nextSelected = readSelected(params);
      if ((nextSelected?.key ?? null) !== (selected?.key ?? null)) selected = nextSelected;
    }
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
</script>

<PageMeta title="Pins" description="A map and cabinet of pins collected from places I have visited." />

<CollectionPage eyebrow="Oh, the places you'll go!" title="Pins & Places">
  {#snippet intro()}So this collection is only <i>most</i> of my pins.{/snippet}

  <div class="controls" aria-label="Collection controls">
    <div class="view-switch"><button class:active={view === 'map'} onclick={() => view = 'map'}>Map</button><button class:active={view === 'grid'} onclick={() => view = 'grid'}>Grid</button></div>
    {#if view === 'grid'}
      <ArrangeSelect bind:value={arrangeBy} options={arrangeOptions} />
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
    <CollectionGrid
      items={arrangedPins}
      key={(pin) => pin.key}
      title={(pin) => pin.name}
      subtitle={(pin) => `${pin.city}${pin.state ? `, ${pin.state}` : ''}`}
      group={arrangeBy === 'name' ? null : group}
      onselect={openDetails}
      uniformRows
      label="Pin collection"
    >
      {#snippet art(pin)}<span class="pin-stage"><img src={pin.thumbImage} alt="" loading="lazy" decoding="async" /></span>{/snippet}
    </CollectionGrid>
  {/if}
</CollectionPage>

<DetailsDialog
  item={selected}
  onclose={() => selected = null}
  describe={(pin) => ({
    eyebrow: pin.type,
    title: pin.name,
    rows: [
      { label: 'Place', value: `${pin.city}${pin.state ? `, ${pin.state}` : ''}, ${pin.country}` },
      { label: 'First visit', value: formatPartialDate(pin.firstVisit) },
      { label: 'Visits', value: pin.visits }
    ],
    note: pin.note
  })}
>
  {#snippet media(pin)}<div class="dialog-pin"><img src={pin.image} alt={`${pin.name} pin`} /></div>{/snippet}
</DetailsDialog>

<style>
  .controls { display: flex; min-height: 5rem; align-items: center; justify-content: space-between; gap: 1rem; }
  button { color: inherit; font: inherit; }
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
  .pin-stage { height: 8rem; display: grid; place-items: center; }
  .pin-stage img { width: 7rem; height: 7rem; max-width: 100%; object-fit: contain; filter: drop-shadow(0 .7rem .5rem rgb(48 43 36 / 18%)); }
  .dialog-pin { min-height: 24rem; display: grid; place-items: center; }
  .dialog-pin img { width: min(18rem, 100%); aspect-ratio: 1; object-fit: contain; filter: drop-shadow(0 .8rem .6rem rgb(48 43 36 / 20%)); }
  @media (max-width: 650px) {
    .map-box { height: 65vh; min-height: 27rem; }
    .pin-stage img { width: 6rem; height: 6rem; }
    .dialog-pin { min-height: 14rem; }
  }
</style>
