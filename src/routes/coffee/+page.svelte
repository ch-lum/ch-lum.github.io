<script lang="ts">
  import { flip } from 'svelte/animate';
  import coffeeCsv from '../../../content/coffee.csv?raw';

  type ClusterKey = 'roaster' | 'region' | 'country' | 'producer' | 'elevation' | 'process' | 'variety' | 'roastLevel';
  type ArrangeKey = 'roastDate' | ClusterKey;
  type Coffee = {
    roastDate: string;
    name: string;
    roaster: string;
    region: string;
    country: string;
    producer: string;
    elevation: string;
    process: string;
    variety: string;
    roastLevel: string;
    image: string;
  };

  const fields = [
    ['Roasted', 'roastDate'],
    ['Roaster', 'roaster'],
    ['Region', 'region'],
    ['Country', 'country'],
    ['Producer', 'producer'],
    ['Elevation', 'elevation'],
    ['Process', 'process'],
    ['Variety', 'variety'],
    ['Roast level', 'roastLevel']
  ] as const;

  const arrangeOptions: { label: string; value: ArrangeKey }[] = [
    { label: 'Roast Date', value: 'roastDate' },
    { label: 'Roaster', value: 'roaster' },
    { label: 'Producer', value: 'producer' },
    { label: 'Region', value: 'region' },
    { label: 'Country', value: 'country' },
    { label: 'Elevation', value: 'elevation' },
    { label: 'Process', value: 'process' },
    { label: 'Variety', value: 'variety' },
    { label: 'Roast level', value: 'roastLevel' }
  ];

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

  function parseCoffee(raw: string): Coffee[] {
    const [headerLine, ...lines] = raw.trim().split(/\r?\n/);
    const headers = parseLine(headerLine);
    const seenDates = new Set<string>();
    return lines.filter((line) => line.trim()).map((line) => {
      const values = parseLine(line);
      const row = Object.fromEntries(headers.map((header, index) => [header, values[index] ?? '']));
      const optional = (field: string, fallback = 'Not provided') => row[field]?.trim() || fallback;
      if (!row.roast_date?.trim()) throw new Error('Every coffee row needs a roast_date.');
      if (seenDates.has(row.roast_date)) throw new Error(`Duplicate roast date: ${row.roast_date}`);
      seenDates.add(row.roast_date);
      return {
        roastDate: row.roast_date,
        name: optional('name', 'Unnamed coffee'),
        roaster: optional('roaster'),
        region: optional('region'),
        country: optional('country'),
        producer: optional('producer'),
        elevation: optional('elevation'),
        process: optional('process'),
        variety: optional('variety'),
        roastLevel: optional('roast_level'),
        image: `/coffee_bags/${row.image || `${row.roast_date}.PNG`}`
      };
    });
  }

  const coffees = parseCoffee(coffeeCsv);
  let arrangeBy = $state<ArrangeKey>('roastDate');
  let selected = $state<Coffee | null>(null);
  let detailsDialog: HTMLDialogElement;

  const displayedCoffees = $derived(
    [...coffees].sort((a, b) => {
      if (arrangeBy !== 'roastDate') return a[arrangeBy].localeCompare(b[arrangeBy]) || b.roastDate.localeCompare(a.roastDate);
      return b.roastDate.localeCompare(a.roastDate);
    })
  );

  function showDetails(coffee: Coffee) {
    selected = coffee;
    detailsDialog.showModal();
  }

  function formatDate(date: string) {
    return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(new Date(`${date}T00:00:00`));
  }
</script>

<svelte:head>
  <title>Coffee — Ch*!</title>
  <meta name="description" content="A visual archive of coffees I have brewed." />
</svelte:head>

<main>
  <header class="page-heading">
    <div><p class="eyebrow">A bean archive</p><h1>Coffee</h1></div>
    <p class="intro">At some point I stopped throwing away the bags.</p>
  </header>

  <div class="controls">
    <label>Arrange by
      <select bind:value={arrangeBy}>
        {#each arrangeOptions as option}<option value={option.value}>{option.label}</option>{/each}
      </select>
    </label>
  </div>

  <section class="collection" class:grid={arrangeBy === 'roastDate'} class:cluster={arrangeBy !== 'roastDate'} aria-live="polite">
    {#each displayedCoffees as coffee, index (coffee.roastDate)}
      <article animate:flip={{ duration: 650 }}>
        {#if arrangeBy !== 'roastDate' && (index === 0 || displayedCoffees[index - 1][arrangeBy] !== coffee[arrangeBy])}
          <h2>{coffee[arrangeBy]}</h2>
        {/if}
        <button class="bag" onclick={() => showDetails(coffee)} aria-label={`View ${coffee.name} coffee details`}>
          <img src={coffee.image} alt={`${coffee.name} coffee bag from ${coffee.region}`} />
          <span class="bag-copy"><strong>{coffee.name}</strong><small>{formatDate(coffee.roastDate)}</small></span>
        </button>
      </article>
    {/each}
  </section>
</main>

<dialog bind:this={detailsDialog} onclick={(event) => event.target === detailsDialog && detailsDialog.close()}>
  {#if selected}
    <button class="close" onclick={() => detailsDialog.close()} aria-label="Close details">×</button>
    <div class="dialog-layout">
      <img src={selected.image} alt={`${selected.name} coffee bag`} />
      <div><p class="eyebrow">{selected.roaster}</p><h2>{selected.name}</h2>
        <dl>{#each fields as field}<div><dt>{field[0]}</dt><dd>{field[1] === 'roastDate' ? formatDate(selected[field[1]]) : selected[field[1]]}</dd></div>{/each}</dl>
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
  .controls { display: flex; min-height: 5rem; align-items: center; justify-content: flex-end; gap: 1rem; }
  button, select { color: inherit; font: inherit; }
  select { border: 1px solid rgb(48 43 36 / 35%); background: transparent; padding: .55rem .9rem; }
  label { display: flex; align-items: center; gap: .65rem; font-size: .85rem; }
  .collection { position: relative; display: grid; gap: 2rem; }
  .collection.grid, .collection.cluster { grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr)); align-items: end; }
  article { min-width: 0; }
  article h2 { margin: 0 0 .75rem; font-size: .85rem; font-weight: 400; letter-spacing: .08em; text-transform: uppercase; }
  .bag { width: 100%; border: 0; background: transparent; cursor: pointer; padding: .5rem; text-align: center; transition: transform .25s ease; }
  .bag:hover, .bag:focus-visible { transform: translateY(-.4rem); }
  .bag:focus-visible { outline: 1px solid #302b24; outline-offset: .25rem; }
  .bag img { width: 100%; height: 16rem; object-fit: contain; filter: drop-shadow(0 .7rem .5rem rgb(48 43 36 / 18%)); }
  .bag-copy { display: grid; gap: .2rem; margin-top: .6rem; }
  .bag-copy strong { font-size: 1rem; font-weight: 400; }
  .bag-copy small { font-size: .78rem; opacity: .7; }
  dialog { width: min(52rem, calc(100% - 2rem)); max-height: calc(100vh - 2rem); border: 1px solid rgb(48 43 36 / 40%); background: #edf0e4; color: #302b24; padding: clamp(1.5rem, 5vw, 3rem); }
  dialog::backdrop { background: rgb(30 28 24 / 55%); backdrop-filter: blur(3px); }
  .close { position: absolute; top: .7rem; right: 1rem; border: 0; background: transparent; cursor: pointer; font-size: 2rem; }
  .dialog-layout { display: grid; grid-template-columns: minmax(12rem, 1fr) 1.2fr; gap: clamp(1.5rem, 5vw, 4rem); align-items: center; }
  .dialog-layout > img { width: 100%; height: 28rem; object-fit: contain; }
  dialog h2 { margin: 0 0 1.5rem; font-size: clamp(2rem, 5vw, 3.5rem); font-weight: 400; }
  dl { margin: 0; }
  dl div { display: grid; grid-template-columns: 6.5rem 1fr; gap: 1rem; border-top: 1px solid rgb(48 43 36 / 22%); padding: .55rem 0; }
  dt { font-size: .75rem; text-transform: uppercase; letter-spacing: .06em; opacity: .7; }
  dd { margin: 0; }
  @media (max-width: 600px) {
    main { width: calc(100% - 2rem); padding-top: 2.5rem; }
    .page-heading { display: block; }
    .intro { margin-top: 1.5rem; }
    .controls { align-items: flex-start; flex-direction: column; justify-content: center; }
    .collection.grid, .collection.cluster { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1rem; }
    .bag img { height: 11rem; }
    .dialog-layout { grid-template-columns: 1fr; }
    .dialog-layout > img { height: 14rem; }
  }
  @media (prefers-reduced-motion: reduce) { .bag { transition: none; } }
</style>
