<!--
  Shell shared by the collection pages (Coffee, Music, Pins): the page width
  and padding, plus the oversized serif title with its eyebrow, right-aligned
  intro, and thin divider. Page content (controls, grid) goes in children.

  `compactAt` is the viewport width (px) below which the mobile layout kicks
  in; Coffee switches at 600, the other collections at 650.
-->
<script lang="ts">
  import type { Snippet } from 'svelte';

  let { eyebrow, title, intro, compactAt = 650, children }: {
    eyebrow: string;
    title: string;
    intro: Snippet;
    compactAt?: 600 | 650;
    children: Snippet;
  } = $props();
</script>

<main class:compact-600={compactAt === 600} class:compact-650={compactAt === 650}>
  <header class="page-heading">
    <div><p class="eyebrow">{eyebrow}</p><h1>{title}</h1></div>
    <p class="intro">{@render intro()}</p>
  </header>
  {@render children()}
</main>

<style>
  main { width: min(76rem, calc(100% - 3rem)); margin: 0 auto; padding: 4rem 0 7rem; }
  .page-heading { display: flex; align-items: end; justify-content: space-between; gap: 3rem; border-bottom: 1px solid rgb(48 43 36 / 35%); padding-bottom: 1.5rem; }
  h1 { margin: 0; font-size: clamp(4rem, 10vw, 8rem); font-weight: 400; line-height: .85; }
  .eyebrow { margin: 0 0 .65rem; font-size: .75rem; letter-spacing: .16em; text-transform: uppercase; }
  .intro { max-width: 24rem; margin: 0; font-size: 1.05rem; line-height: 1.5; }
  @media (max-width: 650px) {
    main.compact-650 { width: calc(100% - 2rem); padding-top: 2.5rem; }
    .compact-650 .page-heading { display: block; }
    .compact-650 .intro { margin-top: 1.5rem; }
  }
  @media (max-width: 600px) {
    main.compact-600 { width: calc(100% - 2rem); padding-top: 2.5rem; }
    .compact-600 .page-heading { display: block; }
    .compact-600 .intro { margin-top: 1.5rem; }
  }
</style>
