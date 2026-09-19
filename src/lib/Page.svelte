<!--
  Standard page frame: the content width, side gutters, and top/bottom
  spacing, with the page header on top and the page content below it.
  Used by Coffee, Music, Pins, Long Form, Short Form, and Projects.
  `intro` and `action` are passed through to PageHeader.
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import PageHeader from '$lib/PageHeader.svelte';

  let { eyebrow, title, intro, action, children }: {
    eyebrow: string;
    title: string;
    intro?: Snippet;
    action?: Snippet;
    children: Snippet;
  } = $props();
</script>

<main>
  <PageHeader {eyebrow} {title} {intro} {action} />
  {@render children()}
</main>

<style>
  main { width: min(76rem, calc(100% - 3rem)); margin: 0 auto; padding: 3rem 0 8rem; }
  @media (max-width: 650px) {
    main { width: calc(100% - 2rem); padding-top: 2rem; }
  }
</style>
