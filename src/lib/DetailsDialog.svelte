<!--
  Pale-green details modal shared by the collection pages. It's open whenever
  `item` is non-null; closing it any way (×, Escape, backdrop click) calls
  `onclose`, which should clear `item`.

  Layout: `media` (the picture) on the left; on the right an eyebrow, title,
  and label/value rows from `describe(item)`, then — if `note` is given —
  an "A bit about it" section, then the optional `footer`.

  `size` 'large' (Music, Pins) is wider with a bigger title; 'medium' (Coffee)
  is narrower and vertically centred. Both go single-column below 650px.
-->
<script lang="ts" generics="T">
  import type { Snippet } from 'svelte';

  type Details = {
    eyebrow: string;
    title: string;
    rows: { label: string; value: string }[];
    note?: string;
  };

  let { item, onclose, describe, media, footer, size = 'large' }: {
    item: T | null;
    onclose: () => void;
    describe: (item: T) => Details;
    media: Snippet<[T]>;
    footer?: Snippet<[T]>;
    size?: 'medium' | 'large';
  } = $props();

  let dialog: HTMLDialogElement;
  const details = $derived(item ? describe(item) : null);

  // Keep the native <dialog> element in sync with `item`, whether it changed
  // via a click or a URL-driven update.
  $effect(() => {
    if (item && !dialog.open) dialog.showModal();
    else if (!item && dialog.open) dialog.close();
  });
</script>

<dialog class={size} bind:this={dialog} onclose={onclose} onclick={(event) => event.target === dialog && onclose()}>
  {#if item && details}
    <button class="close" onclick={onclose} aria-label="Close details">×</button>
    <div class="dialog-layout">
      {@render media(item)}
      <div class="details">
        <p class="eyebrow">{details.eyebrow}</p>
        <h2>{details.title}</h2>
        <dl>{#each details.rows as row}<div><dt>{row.label}</dt><dd>{row.value}</dd></div>{/each}</dl>
        {#if details.note !== undefined}
          <section class="note"><h3>A bit about it</h3><p>{details.note || 'No note yet.'}</p></section>
        {/if}
        {@render footer?.(item)}
      </div>
    </div>
  {/if}
</dialog>

<style>
  dialog { width: min(62rem, calc(100% - 2rem)); max-height: calc(100vh - 2rem); overflow-y: auto; border: 1px solid rgb(48 43 36 / 40%); background: #edf0e4; color: #302b24; padding: clamp(1.5rem, 5vw, 3rem); }
  dialog::backdrop { background: rgb(30 28 24 / 55%); backdrop-filter: blur(3px); }
  .close { position: absolute; top: .7rem; right: 1rem; border: 0; background: transparent; color: inherit; font: inherit; cursor: pointer; font-size: 2rem; }
  .dialog-layout { display: grid; grid-template-columns: minmax(15rem, .9fr) 1.1fr; gap: clamp(2rem, 6vw, 5rem); align-items: start; }
  .details { padding-top: 1rem; }
  .eyebrow { margin: 0 0 .65rem; font-size: .75rem; letter-spacing: .16em; text-transform: uppercase; }
  h2 { margin: 0 0 1.5rem; font-size: clamp(2.3rem, 6vw, 4.5rem); font-weight: 400; line-height: 1; }
  dl { margin: 0; }
  dl div { display: grid; grid-template-columns: 5rem 1fr; gap: 1rem; border-top: 1px solid rgb(48 43 36 / 22%); padding: .65rem 0; }
  dt { font-size: .72rem; text-transform: uppercase; letter-spacing: .06em; opacity: .7; }
  dd { margin: 0; }
  .note { margin-top: 2.5rem; }
  .note h3 { margin: 0 0 .7rem; font-size: .78rem; font-weight: 400; letter-spacing: .12em; text-transform: uppercase; }
  .note p { margin: 0; font-size: 1.05rem; line-height: 1.65; }

  dialog.medium { width: min(52rem, calc(100% - 2rem)); }
  .medium .dialog-layout { grid-template-columns: minmax(12rem, 1fr) 1.2fr; gap: clamp(1.5rem, 5vw, 4rem); align-items: center; }
  .medium .details { padding-top: 0; }
  .medium h2 { font-size: clamp(2rem, 5vw, 3.5rem); line-height: normal; }
  .medium dl div { grid-template-columns: 6.5rem 1fr; padding: .55rem 0; }
  .medium dt { font-size: .75rem; }

  @media (max-width: 650px) { .large .dialog-layout, .medium .dialog-layout { grid-template-columns: 1fr; } }
</style>
