<script lang="ts">
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
  <header class="intro"><p class="eyebrow">Souvenirs from here and there</p><h1>Pin collection</h1><p>A small atlas of aquariums, zoos, museums, and other places I wanted to remember.</p></header>
  <div class="rule"></div>
  <section class="controls" aria-label="Collection controls">
    <div class="view-switch"><button class:active={view === 'map'} onclick={() => view = 'map'}>Map</button><button class:active={view === 'grid'} onclick={() => view = 'grid'}>Grid</button></div>
    {#if view === 'grid'}<label>Arrange by <select bind:value={arrangeBy}>{#each arrangeOptions as option}<option value={option.value}>{option.label}</option>{/each}</select></label>{/if}
  </section>

  {#if view === 'map'}
    <section class="atlas" aria-label="Regional pin maps">
      {#each populatedRegions as region}
        {@const positioned = positionPins(region.pins)}
        <article class="region"><div class="region-heading"><h2>{region.label}</h2><span>{region.pins.length} {region.pins.length === 1 ? 'pin' : 'pins'}</span></div>
          <div class="map-box">
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
    <section class="pin-grid" aria-label="Pin collection">
      {#each arrangedPins as pin, index (pin.key)}
        {#if arrangeBy !== 'name' && (index === 0 || group(arrangedPins[index - 1]) !== group(pin))}<h2 class="group-title">{group(pin)}</h2>{/if}
        <button class="pin-card" onclick={() => openDetails(pin)} style:--pin-w={pin.width} style:--pin-h={pin.height}>
          <span class="pin-stage"><img src={pin.image} alt="" /></span><strong>{pin.name}</strong><small>{pin.city}{pin.state ? `, ${pin.state}` : ''}</small>
        </button>
      {/each}
    </section>
  {/if}
</main>

<dialog bind:this={detailsDialog} onclose={() => selected = null} onclick={(event) => event.target === detailsDialog && closeDetails()}>
  {#if selected}<button class="close" onclick={closeDetails} aria-label="Close details">×</button><div class="modal" style:--pin-w={selected.width} style:--pin-h={selected.height}>
    <div class="modal-image"><img src={selected.image} alt={`${selected.name} pin`} /></div>
    <div><p class="eyebrow">{selected.type}</p><h2>{selected.name}</h2><dl><div><dt>Place</dt><dd>{selected.city}{selected.state ? `, ${selected.state}` : ''}, {selected.country}</dd></div><div><dt>First visit</dt><dd>{formatDate(selected.firstVisit)}</dd></div><div><dt>Visits</dt><dd>{selected.visits}</dd></div></dl>{#if selected.note}<section class="note"><h3>A note about this one</h3><p>{selected.note}</p></section>{/if}</div>
  </div>{/if}
</dialog>

<style>
  main{width:min(1160px,calc(100% - 2rem));margin:3rem auto 7rem;color:#302b24}.intro{max-width:45rem}.eyebrow{text-transform:uppercase;letter-spacing:.13em;font-size:.72rem}.intro h1{font-size:clamp(2.8rem,7vw,5.5rem);margin:.2rem 0}.intro>p:last-child{font-size:1.1rem;line-height:1.7}.rule{height:1px;background:#615b4c;margin:2rem 0 1.2rem}.controls{min-height:2.7rem;display:flex;justify-content:space-between;align-items:center;margin-bottom:2rem}.view-switch{display:flex;border:1px solid #615b4c;border-radius:99px;padding:.2rem}.controls button{border:0;background:transparent;padding:.45rem 1rem;border-radius:99px;font:inherit;color:inherit}.controls button.active{background:#302b24;color:#f4efdf}.controls label{font-size:.88rem}.controls select{margin-left:.4rem;padding:.45rem;border:1px solid #817966;background:#f4efdf;color:inherit;font:inherit}.atlas{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:2rem}.region:last-child:nth-child(odd){grid-column:1/-1;width:calc(50% - 1rem)}.region-heading{display:flex;align-items:baseline;justify-content:space-between}.region-heading h2{font-size:1.25rem}.region-heading span{font-size:.75rem;text-transform:uppercase;letter-spacing:.1em}.map-box{position:relative;aspect-ratio:1.48;overflow:hidden;border:1px solid #6c7567;border-radius:.35rem;background-color:#b9c9bd;background-image:linear-gradient(#faf6e622 1px,transparent 1px),linear-gradient(90deg,#faf6e622 1px,transparent 1px);background-size:12.5% 16.66%;box-shadow:inset 0 0 3rem #4a61582b}.north{position:absolute;right:.65rem;top:.55rem;font-size:.7rem;font-weight:bold}.map-pin{position:absolute;transform:translate(calc(-50% + var(--dx)),calc(-50% + var(--dy)));border:0;background:transparent;padding:0;cursor:pointer;z-index:1}.map-pin img{display:block;width:calc(var(--pin-w) * 2.3rem);height:calc(var(--pin-h) * 2.3rem);object-fit:contain;filter:drop-shadow(0 3px 2px #22332b55);transition:transform .2s}.map-pin span{position:absolute;left:50%;top:100%;width:max-content;max-width:9rem;transform:translateX(-50%);padding:.15rem .3rem;background:#f4efdfed;font-size:.67rem;line-height:1.1;opacity:0;pointer-events:none}.map-pin:hover{z-index:3}.map-pin:hover img,.map-pin:focus-visible img{transform:scale(1.12)}.map-pin:hover span,.map-pin:focus-visible span{opacity:1}.pin-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(190px,1fr));gap:2rem 1.25rem;align-items:end}.group-title{grid-column:1/-1;margin:1.5rem 0 -.6rem;padding-bottom:.4rem;border-bottom:1px solid #817966;font-size:1.15rem}.pin-card{border:0;background:transparent;color:inherit;font:inherit;cursor:pointer;text-align:center}.pin-stage{height:13rem;display:grid;place-items:center}.pin-stage img{width:calc(var(--pin-w) * 5.2rem);height:calc(var(--pin-h) * 5.2rem);max-width:100%;max-height:12rem;object-fit:contain;filter:drop-shadow(0 5px 4px #332b2240);transition:transform .25s}.pin-card:hover img,.pin-card:focus-visible img{transform:translateY(-.35rem) rotate(-2deg)}.pin-card strong,.pin-card small{display:block}.pin-card small{margin-top:.3rem;color:#665f53}dialog{width:min(780px,calc(100% - 2rem));border:1px solid #615b4c;padding:0;background:#f4efdf;color:#302b24;box-shadow:0 22px 70px #24211b66}dialog::backdrop{background:#2e302b99;backdrop-filter:blur(2px)}.close{position:absolute;right:.7rem;top:.5rem;border:0;background:none;font-size:2rem;cursor:pointer}.modal{display:grid;grid-template-columns:minmax(220px,.85fr) 1.15fr;gap:2.5rem;padding:3.5rem}.modal-image{min-height:18rem;display:grid;place-items:center}.modal-image img{width:calc(var(--pin-w) * 7rem);height:calc(var(--pin-h) * 7rem);max-width:100%;max-height:20rem;object-fit:contain;filter:drop-shadow(0 8px 6px #332b2240)}.modal h2{font-size:2rem;margin:.2rem 0 1.5rem}.modal dl{margin:0}.modal dl div{display:grid;grid-template-columns:6rem 1fr;padding:.6rem 0;border-top:1px solid #aaa18d}.modal dt{font-size:.72rem;text-transform:uppercase;letter-spacing:.08em}.modal dd{margin:0}.note{margin-top:1.5rem;padding:1rem 1.2rem;background:#e1e5d3}.note h3{font-size:.8rem;text-transform:uppercase;letter-spacing:.08em;margin:0 0 .5rem}.note p{margin:0;line-height:1.6}
  @media(max-width:700px){main{margin-top:2rem}.atlas{grid-template-columns:1fr}.region:last-child:nth-child(odd){grid-column:auto;width:auto}.map-box{aspect-ratio:.95}.map-pin img{width:calc(var(--pin-w) * 1.8rem);height:calc(var(--pin-h) * 1.8rem)}.modal{grid-template-columns:1fr;padding:2.5rem 1.3rem 1.5rem;gap:.5rem}.modal-image{min-height:13rem}.controls{align-items:flex-start;gap:1rem}.pin-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:1.5rem .5rem}.pin-stage{height:10rem}.pin-stage img{width:calc(var(--pin-w) * 4rem);height:calc(var(--pin-h) * 4rem)}}
  @media(prefers-reduced-motion:reduce){.map-pin img,.pin-stage img{transition:none}}
</style>
