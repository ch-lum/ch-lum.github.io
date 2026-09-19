<!--
  Page title block shared across the site: a small uppercase eyebrow over a
  large serif title, a thin divider underneath, and optionally either an
  `intro` sentence or an `action` (e.g. a button) on the right. Below 650px
  an intro drops beneath the title; an action stays alongside it.
-->
<script lang="ts">
  import type { Snippet } from 'svelte';

  let { eyebrow, title, intro, action }: {
    eyebrow: string;
    title: string;
    intro?: Snippet;
    action?: Snippet;
  } = $props();
</script>

<header class:stacks={!!intro}>
  <div><p class="eyebrow">{eyebrow}</p><h1>{title}</h1></div>
  {#if intro}<p class="intro">{@render intro()}</p>{/if}
  {@render action?.()}
</header>

<style>
  header { display: flex; align-items: end; justify-content: space-between; gap: 2rem 3rem; border-bottom: 1px solid rgb(48 43 36 / 35%); padding-bottom: 1.5rem; }
  .eyebrow { margin: 0 0 .7rem; font-size: .72rem; letter-spacing: .14em; text-transform: uppercase; }
  h1 { margin: 0; font-size: clamp(3rem, 8vw, 6.5rem); font-weight: 400; line-height: .9; }
  .intro { max-width: 24rem; margin: 0; font-size: 1.05rem; line-height: 1.5; }
  @media (max-width: 650px) {
    header.stacks { display: block; }
    .intro { margin-top: 1.5rem; }
  }
</style>
