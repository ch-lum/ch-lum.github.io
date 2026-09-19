<script lang="ts">
  import ArrangeSelect from '$lib/ArrangeSelect.svelte';
  import CollectionGrid from '$lib/CollectionGrid.svelte';
  import CollectionPage from '$lib/CollectionPage.svelte';
  import DetailsDialog from '$lib/DetailsDialog.svelte';
  import PageMeta from '$lib/PageMeta.svelte';
  import { parseCsv } from '$lib/csv';
  import { formatDate } from '$lib/dates';
  import { thumbImage, fullImage } from '$lib/media';
  import { initialSearchParams, syncUrl } from '$lib/url-sync.svelte';
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
    thumbImage: string;
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

  function parseCoffee(raw: string): Coffee[] {
    const seenDates = new Set<string>();
    return parseCsv(raw).map((row) => {
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
        image: fullImage(`/coffee_bags/${row.image || `${row.roast_date}.PNG`}`),
        thumbImage: thumbImage(`/coffee_bags/${row.image || `${row.roast_date}.PNG`}`)
      };
    });
  }

  const coffees = parseCoffee(coffeeCsv);

  // URL state, e.g. /coffee/?arrange=roaster&coffee=2024-03-15. Invalid or
  // unknown values fall back to defaults.
  function readArrange(params: URLSearchParams): ArrangeKey {
    const raw = params.get('arrange');
    return (arrangeOptions.some((option) => option.value === raw) ? raw : 'roastDate') as ArrangeKey;
  }
  function readSelected(params: URLSearchParams): Coffee | null {
    const roastDate = params.get('coffee');
    return roastDate ? (coffees.find((coffee) => coffee.roastDate === roastDate) ?? null) : null;
  }

  const initialParams = initialSearchParams();
  let arrangeBy = $state<ArrangeKey>(readArrange(initialParams));
  let selected = $state<Coffee | null>(readSelected(initialParams));

  syncUrl({
    params: () => ({
      arrange: arrangeBy === 'roastDate' ? null : arrangeBy,
      coffee: selected?.roastDate ?? null
    }),
    entry: () => selected?.roastDate ?? null,
    restore: (params) => {
      arrangeBy = readArrange(params);
      const nextSelected = readSelected(params);
      if ((nextSelected?.roastDate ?? null) !== (selected?.roastDate ?? null)) selected = nextSelected;
    }
  });

  const displayedCoffees = $derived(
    [...coffees].sort((a, b) => {
      if (arrangeBy !== 'roastDate') return a[arrangeBy].localeCompare(b[arrangeBy]) || b.roastDate.localeCompare(a.roastDate);
      return b.roastDate.localeCompare(a.roastDate);
    })
  );
</script>

<PageMeta title="Coffee" description="A visual archive of coffees I have brewed." />

<CollectionPage eyebrow="A bean archive" title="Coffee">
  {#snippet intro()}At some point I stopped throwing away the bags.{/snippet}

  <div class="controls">
    <ArrangeSelect bind:value={arrangeBy} options={arrangeOptions} />
  </div>

  <CollectionGrid
    items={displayedCoffees}
    key={(coffee) => coffee.roastDate}
    title={(coffee) => coffee.name}
    subtitle={(coffee) => formatDate(coffee.roastDate, 'medium')}
    group={arrangeBy === 'roastDate' ? null : (coffee) => coffee[arrangeBy as ClusterKey]}
    cardLabel={(coffee) => `View ${coffee.name} coffee details`}
    onselect={(coffee) => selected = coffee}
  >
    {#snippet art(coffee)}
      <img class="bag" src={coffee.thumbImage} alt={`${coffee.name} coffee bag from ${coffee.region}`} loading="lazy" decoding="async" />
    {/snippet}
  </CollectionGrid>
</CollectionPage>

<DetailsDialog
  item={selected}
  onclose={() => selected = null}
  size="medium"
  describe={(coffee) => ({
    eyebrow: coffee.roaster,
    title: coffee.name,
    rows: fields.map(([label, field]) => ({ label, value: field === 'roastDate' ? formatDate(coffee[field], 'medium') : coffee[field] }))
  })}
>
  {#snippet media(coffee)}<img class="dialog-bag" src={coffee.image} alt={`${coffee.name} coffee bag`} />{/snippet}
</DetailsDialog>

<style>
  .controls { display: flex; min-height: 5rem; align-items: center; justify-content: flex-end; gap: 1rem; }
  .bag { width: 100%; height: 16rem; object-fit: contain; filter: drop-shadow(0 .7rem .5rem rgb(48 43 36 / 18%)); }
  .dialog-bag { width: 100%; height: 28rem; object-fit: contain; }
  @media (max-width: 650px) {
    .controls { align-items: flex-start; flex-direction: column; justify-content: center; }
    .bag { height: 11rem; }
    .dialog-bag { height: 14rem; }
  }
</style>
