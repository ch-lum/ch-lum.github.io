<!--
  Shell shared by the collection pages (Coffee, Music, Pins): the page width
  and padding plus the page header. Page content (controls, grid) goes in
  children.
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import PageHeader from '$lib/PageHeader.svelte';

  let { eyebrow, title, intro, children }: {
    eyebrow: string;
    title: string;
    intro: Snippet;
    children: Snippet;
  } = $props();
</script>

<main>
  <PageHeader {eyebrow} {title} {intro} />
  {@render children()}
</main>

<style>
  main { width: min(76rem, calc(100% - 3rem)); margin: 0 auto; padding: 4rem 0 7rem; }
  @media (max-width: 650px) {
    main { width: calc(100% - 2rem); padding-top: 2.5rem; }
  }
</style>
