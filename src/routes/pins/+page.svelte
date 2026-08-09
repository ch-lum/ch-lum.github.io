<script lang="ts">
  import { flip } from 'svelte/animate';
  import pinsCsv from '../../../content/pins.csv?raw';

  type PinType = 'Aquarium' | 'Zoo' | 'Art' | 'Museum' | 'Other';
  type View = 'map' | 'grid';
  type ArrangeKey = 'name' | 'type' | 'location' | 'country' | 'city' | 'firstVisit';
  type RegionId = 'na-west' | 'na-east' | 'europe' | 'asia' | 'oceania';
  type Pin = {
    key: string; name: string; city: string; state: string; country: string;
    latitude: number; longitude: number; firstVisit: string; visits: string;
    type: PinType; width: number; height: number; image: string; note: string;
  };

  const types = new Set<PinType>(['Aquarium', 'Zoo', 'Art', 'Museum', 'Other']);
  const regions: { id: RegionId; label: string }[] = [
    { id: 'na-west', label: 'North America West' },
    { id: 'na-east', label: 'North America East' },
    { id: 'europe', label: 'Europe' },
    { id: 'asia', label: 'East / Southeast Asia' },
    { id: 'oceania', label: 'Oceania' }
  ];
  const arrangeOptions: { value: ArrangeKey; label: string }[] = [
    { value: 'name', label: 'Name' }, { value: 'type', label: 'Type' },
    { value: 'location', label: 'State / Country' }, { value: 'country', label: 'Country' },
    { value: 'city', label: 'City' }, { value: 'firstVisit', label: 'First visit' }
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
      const dimensions = row.dimensions.match(/^(\d+(?:\.\d+)?):(\d+(?:\.\d+)?)$/);
      const image = row.image ? (row.image.startsWith('/') ? row.image : `/pins/${row.image}`) : `/pins/placeholders/${pinType.toLowerCase()}.svg`;
      return {
        key, name: row.name, city: row.city || 'Unknown', state: row.state,
        country: row.country || 'Unknown', latitude: Number(row.latitude), longitude: Number(row.longitude),
        firstVisit: row.first_visit || 'Unknown', visits: row.visits || 'Many times', type: pinType,
        width: Math.min(Number(dimensions?.[1] ?? 1), 2.5), height: Math.min(Number(dimensions?.[2] ?? 1), 2.5),
        image, note: row.note
      };
    });
  }

  const pins = parsePins(pinsCsv);
  let view = $state<View>('map');
  let arrangeBy = $state<ArrangeKey>('name');
  let selected = $state<Pin | null>(null);
  let detailsDialog: HTMLDialogElement;

  function regionFor(pin: Pin): RegionId | null {
    const state = pin.state.toLowerCase(), country = pin.country.toLowerCase();
    if (state === 'hawaii' || state === 'hi' || ['australia', 'new zealand', 'fiji'].includes(country)) return 'oceania';
    if ((pin.longitude >= -25 && pin.longitude <= 45 && pin.latitude >= 34 && pin.latitude <= 72)) return 'europe';
    if (pin.longitude >= 90 && pin.longitude <= 155 && pin.latitude >= -12 && pin.latitude <= 55) return 'asia';
    if (pin.longitude >= -170 && pin.longitude <= -50 && pin.latitude >= 14 && pin.latitude <= 75) return pin.longitude <= -106 ? 'na-west' : 'na-east';
    return null;
  }

  const populatedRegions = regions.map((region) => ({ ...region, pins: pins.filter((pin) => regionFor(pin) === region.id) })).filter((region) => region.pins.length);

  function bounds(regionPins: Pin[]) {
    const lats = regionPins.map((pin) => pin.latitude), lons = regionPins.map((pin) => pin.longitude);
    const centerLat = (Math.min(...lats) + Math.max(...lats)) / 2;
    const centerLon = (Math.min(...lons) + Math.max(...lons)) / 2;
    const latSpan = Math.max(Math.max(...lats) - Math.min(...lats), 5) * 1.35;
    const lonSpan = Math.max(Math.max(...lons) - Math.min(...lons), 8) * 1.35;
    return { minLat: centerLat - latSpan / 2, maxLat: centerLat + latSpan / 2, minLon: centerLon - lonSpan / 2, maxLon: centerLon + lonSpan / 2 };
  }

  function positionPins(regionPins: Pin[]) {
    const box = bounds(regionPins);
    const seen = new Map<string, number>();
    return regionPins.map((pin) => {
      const location = `${pin.latitude.toFixed(2)},${pin.longitude.toFixed(2)}`;
      const duplicate = seen.get(location) ?? 0;
      seen.set(location, duplicate + 1);
      const angle = duplicate * 2.4;
      return {
        pin,
        x: 7 + ((pin.longitude - box.minLon) / (box.maxLon - box.minLon)) * 86,
        y: 7 + (1 - (pin.latitude - box.minLat) / (box.maxLat - box.minLat)) * 86,
        dx: duplicate ? Math.cos(angle) * (12 + duplicate * 4) : 0,
        dy: duplicate ? Math.sin(angle) * (12 + duplicate * 4) : 0
      };
    });
  }

  function mapUrl(regionPins: Pin[]) {
    const box = bounds(regionPins);
    const bbox = [box.minLon, box.minLat, box.maxLon, box.maxLat].join(',');
    return `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(bbox)}&layer=mapnik`;
  }

  function group(pin: Pin) {
    if (arrangeBy === 'location') return pin.state || pin.country;
    if (arrangeBy === 'firstVisit') return pin.firstVisit === 'Unknown' ? 'Unknown' : pin.firstVisit.slice(0, 4);
    return pin[arrangeBy];
  }

  const arrangedPins = $derived([...pins].sort((a, b) => group(a).localeCompare(group(b)) || a.name.localeCompare(b.name)));
  function openDetails(pin: Pin) { selected = pin; detailsDialog.showModal(); }
  function closeDetails() { detailsDialog.close(); selected = null; }
  function formatDate(date: string) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return date;
    return new Intl.DateTimeFormat('en-US', { dateStyle: 'long' }).format(new Date(`${date}T00:00:00`));
  }
</script>

<svelte:head><title>Pins — Ch*!</title><meta name="description" content="A map and cabinet of pins collected from places I have visited." /></svelte:head>

<main>
  <header class="page-heading">
    <div><p class="eyebrow">A pin archive</p><h1>Pins</h1></div>
    <p class="intro">A small atlas of aquariums, zoos, museums, and other places I wanted to remember.</p>
  </header>
  <div class="controls" aria-label="Collection controls">
    <div class="view-switch"><button class:active={view === 'map'} onclick={() => view = 'map'}>Map</button><button class:active={view === 'grid'} onclick={() => view = 'grid'}>Grid</button></div>
    {#if view === 'grid'}<label>Arrange by <select bind:value={arrangeBy}>{#each arrangeOptions as option}<option value={option.value}>{option.label}</option>{/each}</select></label>{/if}
  </div>

  {#if view === 'map'}
    <section class="atlas" aria-label="Regional pin maps">
      {#each populatedRegions as region}
        {@const positioned = positionPins(region.pins)}
        <article class="region"><div class="region-heading"><h2>{region.label}</h2><span>{region.pins.length} {region.pins.length === 1 ? 'pin' : 'pins'}</span></div>
          <div class="map-box">
            <iframe class="base-map" src={mapUrl(region.pins)} title={`${region.label} map`} loading="lazy"></iframe>
            <span class="north">N</span>
            {#each positioned as point (point.pin.key)}
              <button class="map-pin" style:left={`${point.x}%`} style:top={`${point.y}%`} style:--dx={`${point.dx}px`} style:--dy={`${point.dy}px`} style:--pin-w={point.pin.width} style:--pin-h={point.pin.height} onclick={() => openDetails(point.pin)} aria-label={`View ${point.pin.name}`}>
                <img src={point.pin.image} alt="" /><span>{point.pin.name}</span>
              </button>
            {/each}
          </div>
        </article>
      {/each}
    </section>
  {:else}
    <section class="collection" aria-label="Pin collection" aria-live="polite">
      {#each arrangedPins as pin, index (pin.key)}
        <article animate:flip={{ duration: 650 }}>
          {#if arrangeBy !== 'name' && (index === 0 || group(arrangedPins[index - 1]) !== group(pin))}<h2>{group(pin)}</h2>{/if}
          <button class="pin-card" onclick={() => openDetails(pin)} style:--pin-w={pin.width} style:--pin-h={pin.height}>
            <span class="pin-stage"><img src={pin.image} alt="" /></span><span class="pin-copy"><strong>{pin.name}</strong><small>{pin.city}{pin.state ? `, ${pin.state}` : ''}</small></span>
          </button>
        </article>
      {/each}
    </section>
  {/if}
</main>

<dialog bind:this={detailsDialog} onclose={() => selected = null} onclick={(event) => event.target === detailsDialog && closeDetails()}>
  {#if selected}<button class="close" onclick={closeDetails} aria-label="Close details">×</button><div class="dialog-layout" style:--pin-w={selected.width} style:--pin-h={selected.height}>
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
  .atlas { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 2rem; }
  .region:last-child:nth-child(odd) { grid-column: 1 / -1; width: calc(50% - 1rem); }
  .region-heading { display: flex; align-items: baseline; justify-content: space-between; }
  .region-heading h2 { font-size: .85rem; font-weight: 400; letter-spacing: .08em; text-transform: uppercase; }
  .region-heading span { font-size: .72rem; opacity: .7; }
  .map-box { position: relative; aspect-ratio: 1.48; overflow: hidden; border: 1px solid rgb(48 43 36 / 35%); background: #b9c9bd; }
  .base-map { position: absolute; inset: 0; width: 100%; height: 100%; border: 0; pointer-events: none; filter: sepia(.18) saturate(.72) contrast(.9); }
  .north { position: absolute; right: .65rem; top: .55rem; padding: .2rem .3rem; background: #edf0e4dd; font-size: .7rem; font-weight: bold; }
  .map-pin { position: absolute; transform: translate(calc(-50% + var(--dx)), calc(-50% + var(--dy))); border: 0; background: transparent; padding: 0; cursor: pointer; z-index: 1; }
  .map-pin img { display: block; width: calc(var(--pin-w) * 2.3rem); height: calc(var(--pin-h) * 2.3rem); object-fit: contain; filter: drop-shadow(0 3px 2px #22332b55); transition: transform .2s; }
  .map-pin span { position: absolute; left: 50%; top: 100%; width: max-content; max-width: 9rem; transform: translateX(-50%); padding: .15rem .3rem; background: #edf0e4ed; font-size: .67rem; line-height: 1.1; opacity: 0; pointer-events: none; }
  .map-pin:hover { z-index: 3; }.map-pin:hover img, .map-pin:focus-visible img { transform: scale(1.12); }.map-pin:hover span, .map-pin:focus-visible span { opacity: 1; }
  .collection { position: relative; display: grid; grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr)); align-items: end; gap: 2rem; }
  .collection article { min-width: 0; }
  .collection article h2 { margin: 0 0 .75rem; font-size: .85rem; font-weight: 400; letter-spacing: .08em; text-transform: uppercase; }
  .pin-card { width: 100%; border: 0; background: transparent; cursor: pointer; padding: .5rem; text-align: center; transition: transform .25s ease; }
  .pin-card:hover, .pin-card:focus-visible { transform: translateY(-.4rem); }.pin-card:focus-visible { outline: 1px solid #302b24; outline-offset: .25rem; }
  .pin-stage { height: 16rem; display: grid; place-items: center; }
  .pin-stage img { width: calc(var(--pin-w) * 5.2rem); height: calc(var(--pin-h) * 5.2rem); max-width: 100%; max-height: 15rem; object-fit: contain; filter: drop-shadow(0 .7rem .5rem rgb(48 43 36 / 18%)); }
  .pin-copy { display: grid; gap: .2rem; margin-top: .6rem; }.pin-copy strong { font-size: 1rem; font-weight: 400; }.pin-copy small { font-size: .78rem; opacity: .7; }
  dialog { width: min(62rem, calc(100% - 2rem)); max-height: calc(100vh - 2rem); overflow-y: auto; border: 1px solid rgb(48 43 36 / 40%); background: #edf0e4; color: #302b24; padding: clamp(1.5rem, 5vw, 3rem); }
  dialog::backdrop { background: rgb(30 28 24 / 55%); backdrop-filter: blur(3px); }.close { position: absolute; top: .7rem; right: 1rem; border: 0; background: transparent; cursor: pointer; font-size: 2rem; }
  .dialog-layout { display: grid; grid-template-columns: minmax(15rem, .9fr) 1.1fr; gap: clamp(2rem, 6vw, 5rem); align-items: start; }
  .dialog-pin { min-height: 24rem; display: grid; place-items: center; }.dialog-pin img { width: calc(var(--pin-w) * 8rem); height: calc(var(--pin-h) * 8rem); max-width: 100%; max-height: 26rem; object-fit: contain; filter: drop-shadow(0 .8rem .6rem rgb(48 43 36 / 20%)); }
  .details { padding-top: 1rem; } dialog h2 { margin: 0 0 1.5rem; font-size: clamp(2.3rem, 6vw, 4.5rem); font-weight: 400; line-height: 1; }
  dl { margin: 0; } dl div { display: grid; grid-template-columns: 5rem 1fr; gap: 1rem; border-top: 1px solid rgb(48 43 36 / 22%); padding: .65rem 0; } dt { font-size: .72rem; text-transform: uppercase; letter-spacing: .06em; opacity: .7; } dd { margin: 0; }
  .note { margin-top: 2.5rem; }.note h3 { margin: 0 0 .7rem; font-size: .78rem; font-weight: 400; letter-spacing: .12em; text-transform: uppercase; }.note p { margin: 0; font-size: 1.05rem; line-height: 1.65; }
  @media (max-width: 650px) { main { width: calc(100% - 2rem); padding-top: 2.5rem; }.page-heading { display: block; }.intro { margin-top: 1.5rem; }.controls { align-items: flex-start; }.atlas { grid-template-columns: 1fr; }.region:last-child:nth-child(odd) { grid-column: auto; width: auto; }.map-box { aspect-ratio: .95; }.map-pin img { width: calc(var(--pin-w) * 1.8rem); height: calc(var(--pin-h) * 1.8rem); }.collection { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1rem; }.pin-stage { height: 11rem; }.pin-stage img { width: calc(var(--pin-w) * 4rem); height: calc(var(--pin-h) * 4rem); max-height: 10rem; }.dialog-layout { grid-template-columns: 1fr; }.dialog-pin { min-height: 14rem; } }
  @media (prefers-reduced-motion: reduce) { .map-pin img, .pin-card { transition: none; } }
</style>
