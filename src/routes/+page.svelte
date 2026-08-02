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
      <img class="autograph" src="/placeholders/autograph.svg" alt="Chrissy Lum" />
      <div class="introduction">
        <h1 id="intro-title">Hello, I’m Chrissy.</h1>
        <p>
          This is a placeholder for a short introduction about who I am, what I care about,
          and the things I’m currently exploring.
        </p>
      </div>
    </div>
    <img class="portrait" src="/placeholders/portrait.svg" alt="Placeholder portrait of Chrissy" />
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
    overflow: hidden;
    border: 1px solid rgb(75 62 46 / 28%);
    background: rgb(248 241 226 / 58%);
    box-shadow: 0 1.4rem 4rem rgb(67 52 33 / 9%);
  }
  .words { display: flex; flex-direction: column; justify-content: space-between; padding: clamp(1.5rem, 4vw, 3rem); }
  .autograph { width: min(12rem, 80%); }
  .introduction { max-width: 19rem; }
  h1 { margin: 0 0 .7rem; font-size: clamp(1.45rem, 3vw, 2rem); font-weight: 400; line-height: 1.1; }
  p { margin: 0; font-size: clamp(.95rem, 1.5vw, 1.08rem); line-height: 1.55; }
  .portrait { width: 100%; height: 100%; object-fit: cover; border-left: 1px solid rgb(75 62 46 / 20%); }
  nav { display: flex; justify-content: center; gap: clamp(1rem, 6vw, 4rem); margin-top: clamp(2.4rem, 7vw, 5rem); }
  @media (max-width: 600px) {
    main { width: min(100% - 2rem, 30rem); padding-top: 2rem; }
    .portrait-card { grid-template-columns: 1fr; aspect-ratio: auto; }
    .words { min-height: 19rem; }
    .portrait { height: min(25rem, 105vw); border-top: 1px solid rgb(75 62 46 / 20%); border-left: 0; }
    nav { gap: 0; }
  }
</style>
