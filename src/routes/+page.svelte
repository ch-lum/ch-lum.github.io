<script lang="ts">
  import NavImage from '$lib/NavImage.svelte';
  import { navigation } from '$lib/site';
</script>

<svelte:head>
  <title>Chrissy Lum</title>
  <meta name="description" content="The personal website of Chrissy Lum." />
</svelte:head>

<main>
  <section class="portrait-card" aria-labelledby="intro-title">
    <div class="words">
      <img class="autograph" src="/placeholders/autograph-start.svg" alt="Chrissy Lum" />
      <div class="introduction">
        <h1 id="intro-title">Hello, I’m Chrissy.</h1>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor
          incididunt ut labore et dolore magna aliqua.
        </p>
      </div>
    </div>
    <img class="portrait" src="/placeholders/portrait.JPG" alt="Chrissy Lum" />
  </section>

  <nav aria-label="Explore the site">
    {#each navigation as item}
      <NavImage {...item} />
    {/each}
  </nav>
</main>

<style>
  main { width: min(58rem, calc(100% - 3rem)); margin: 0 auto; padding: clamp(3rem, 9vh, 7rem) 0 4rem; }
  .portrait-card {
    display: grid;
    grid-template-columns: 1fr 1fr;
    width: min(100%, 48rem);
    aspect-ratio: 1.55;
    margin: 0 auto;
  }
  .words { display: flex; flex-direction: column; justify-content: space-between; padding: clamp(1.5rem, 4vw, 3rem); }
  .autograph { width: min(19rem, 100%); }
  .introduction { max-width: 19rem; }
  h1 { margin: 0 0 .7rem; font-size: clamp(1.45rem, 3vw, 2rem); font-weight: 400; line-height: 1.1; }
  p { margin: 0; font-size: clamp(.95rem, 1.5vw, 1.08rem); line-height: 1.55; }
  .portrait { width: 100%; height: 100%; object-fit: cover; }
  nav { display: flex; justify-content: center; gap: clamp(1rem, 6vw, 4rem); margin-top: clamp(2.4rem, 7vw, 5rem); }
  @media (max-width: 600px) {
    main { width: min(100% - 2rem, 30rem); padding-top: 2rem; }
    .portrait-card { grid-template-columns: 1fr; aspect-ratio: auto; }
    .words { min-height: 19rem; }
    .portrait { height: min(25rem, 105vw); }
    nav { gap: 0; }
  }
</style>
