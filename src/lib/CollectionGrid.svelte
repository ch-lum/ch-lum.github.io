<!--
  Animated grid of clickable cards used by Coffee and Pins. Cards slide into
  place when the order changes. When `group` is given, the first card of each
  group gets an uppercase heading.

  - `art` renders each card's picture.
  - `uniformRows` reserves room for group headings and two-line names on
    every card so rows line up (Pins); otherwise headings sit inline (Coffee).
  - `compactAt`: viewport width (px) below which the grid becomes two columns.
-->
<script lang="ts" generics="T">
  import type { Snippet } from 'svelte';
  import { flip } from 'svelte/animate';

  let {
    items,
    key,
    title,
    subtitle,
    art,
    onselect,
    group = null,
    cardLabel,
    uniformRows = false,
    compactAt = 650,
    label
  }: {
    items: T[];
    key: (item: T) => string;
    title: (item: T) => string;
    subtitle: (item: T) => string;
    art: Snippet<[T]>;
    onselect: (item: T) => void;
    group?: ((item: T) => string) | null;
    cardLabel?: (item: T) => string;
    uniformRows?: boolean;
    compactAt?: 600 | 650;
    label?: string;
  } = $props();

  function startsGroup(index: number) {
    return index === 0 || group!(items[index - 1]) !== group!(items[index]);
  }
</script>

<section class="collection" class:compact-600={compactAt === 600} class:compact-650={compactAt === 650} aria-label={label} aria-live="polite">
  {#each items as item, index (key(item))}
    <article animate:flip={{ duration: 650 }}>
      {#if group && uniformRows}
        <div class="group-heading">{#if startsGroup(index)}<h2>{group(item)}</h2>{/if}</div>
      {:else if group && startsGroup(index)}
        <h2 class="inline-heading">{group(item)}</h2>
      {/if}
      <button class="card" onclick={() => onselect(item)} aria-label={cardLabel?.(item)}>
        {@render art(item)}
        <span class="card-copy" class:uniform={uniformRows}><strong>{title(item)}</strong><small>{subtitle(item)}</small></span>
      </button>
    </article>
  {/each}
</section>

<style>
  .collection { position: relative; display: grid; grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr)); align-items: end; gap: 2rem; }
  article { min-width: 0; }
  h2 { margin: 0; font-size: .85rem; font-weight: 400; letter-spacing: .08em; text-transform: uppercase; }
  .inline-heading { margin-bottom: .75rem; }
  .group-heading { display: flex; height: 1.75rem; align-items: flex-end; }
  .group-heading h2 { line-height: 1; }
  .card { width: 100%; border: 0; background: transparent; color: inherit; font: inherit; cursor: pointer; padding: .5rem; text-align: center; transition: transform .25s ease; }
  .card:hover, .card:focus-visible { transform: translateY(-.4rem); }
  .card:focus-visible { outline: 1px solid #302b24; outline-offset: .25rem; }
  .card-copy { display: grid; gap: .2rem; margin-top: .6rem; }
  .card-copy.uniform { min-height: 3rem; align-content: start; }
  .card-copy strong { font-size: 1rem; font-weight: 400; }
  .card-copy small { font-size: .78rem; opacity: .7; }
  @media (max-width: 650px) { .collection.compact-650 { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1rem; } }
  @media (max-width: 600px) { .collection.compact-600 { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1rem; } }
  @media (prefers-reduced-motion: reduce) { .card { transition: none; } }
</style>
