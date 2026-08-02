<script lang="ts">
  import NavImage from '$lib/NavImage.svelte';
  import { navigation } from '$lib/site';
</script>

<svelte:head>
  <title>Ch*!</title>
  <meta name="description" content="The personal website of Chrissy Lum." />
</svelte:head>

<main>
  <section class="portrait-card" aria-labelledby="intro-title">
    <div class="words">
      <img class="autograph" src="/home_imgs/autograph-start.svg" alt="Chrissy Lum" />
      <div class="introduction">
        <h1 id="intro-title"><a class="about-link" href="/about/">Who am I?</a></h1>
        <p>
          Isn't that a great question. Even if I tried this blurb wouldn't give you an answer. 
          I've gone basic, falling in love with physical media once again. This website 
          is then but a poor projection of my world—and myself—made just for you.
        </p>
      </div>
    </div>
    <img class="portrait" src="/home_imgs/portrait.JPG" alt="Chrissy Lum" />
  </section>

  <nav aria-label="Explore the site">
    {#each navigation as item}
      <NavImage {...item} />
    {/each}
  </nav>
</main>

<style>
  main { width: min(78rem, calc(100% - 3rem)); margin: 0 auto; padding: clamp(3rem, 9vh, 7rem) 0 4rem; }
  .portrait-card {
    display: grid;
    grid-template-columns: 1fr 1fr;
    width: min(100%, 40rem);
    aspect-ratio: 1.55;
    margin: 0 auto;
  }
  .words { display: flex; flex-direction: column; justify-content: space-between; padding: clamp(1rem, 2.8vw, 2.1rem); }
  .autograph { width: min(13.5rem, 100%); }
  .introduction { max-width: 13.5rem; }
  h1 { margin: 0 0 .5rem; font-size: clamp(1.1rem, 2.1vw, 1.4rem); font-weight: 400; line-height: 1.1; }
  .about-link { color: inherit; text-decoration: none; text-underline-offset: .2em; }
  .about-link:hover, .about-link:focus-visible { text-decoration: underline; }
  .about-link:focus-visible { outline: none; }
  p { margin: 0; font-size: clamp(.78rem, 1.05vw, .9rem); line-height: 1.55; }
  .portrait { width: 100%; height: 100%; object-fit: cover; }
  nav { display: flex; flex-wrap: wrap; justify-content: center; gap: .75rem; margin-top: clamp(2.4rem, 7vw, 5rem); }
  @media (max-width: 600px) {
    main { width: min(100% - 2rem, 30rem); padding-top: 2rem; }
    .portrait-card { grid-template-columns: 1fr; width: min(100%, 22rem); aspect-ratio: auto; }
    .words { min-height: 14rem; }
    .portrait { height: min(18rem, 74vw); }
    nav { gap: 0; }
  }
</style>
