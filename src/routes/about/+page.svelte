<svelte:head>
  <title>About — Chrissy Lum</title>
  <meta name="description" content="About Chrissy Lum and where to find her online." />
</svelte:head>

<main>
  <section class="about" aria-labelledby="about-title">
    <div class="copy">
      <p class="eyebrow">A little more</p>
      <h1 id="about-title">About</h1>
      <div class="paragraphs">
        <p>I’m a data analyst with a background in data science, and I’m most interested in the space where technical work meets real human decisions. I like taking complicated systems apart, understanding what makes them tick, and putting them back together in a form that is genuinely useful.</p>
        <p>My work has moved through research, education, visualization, and product development. Whether I’m studying privacy, building a classroom tool, or explaining an analysis, I care about making the final result thoughtful, legible, and pleasant to use.</p>
        <p>Outside of work, I’m usually collecting records, trying new coffee, writing down stray thoughts, or finding another reason to make something more elaborate than it strictly needs to be. This website is a growing cabinet for those interests and whatever comes next.</p>
      </div>
    </div>

    <figure>
      <img src="/about/profile-placeholder.svg" alt="Placeholder for Chrissy Lum's profile" />
    </figure>
  </section>

  <section class="contact" aria-labelledby="contact-title">
    <p class="eyebrow">Elsewhere</p>
    <h2 id="contact-title">Find me online</h2>
    <ul>
      <li><span>Substack</span><small>Add link</small></li>
      <li><span>Spotify</span><small>Add link</small></li>
      <li><span>GitHub</span><small>Add link</small></li>
      <li><span>LinkedIn</span><small>Add link</small></li>
    </ul>
  </section>
</main>

<style>
  main { width: min(68rem, calc(100% - 3rem)); margin: 0 auto; padding: 3rem 0 8rem; }
  .about { display: grid; grid-template-columns: minmax(0, 1fr) minmax(18rem, 28rem); align-items: center; gap: clamp(3rem, 8vw, 7rem); padding-bottom: clamp(4rem, 9vw, 7rem); }
  .eyebrow { margin: 0 0 .7rem; font-size: .72rem; letter-spacing: .14em; text-transform: uppercase; }
  h1 { margin: 0; font-size: clamp(3rem, 8vw, 6.5rem); font-weight: 400; line-height: .9; }
  .paragraphs { display: grid; gap: 1.15rem; margin-top: clamp(2rem, 5vw, 3.5rem); }
  .paragraphs p { margin: 0; font-size: clamp(.98rem, 1.5vw, 1.08rem); line-height: 1.7; }
  figure { aspect-ratio: 1; margin: 0; overflow: hidden; }
  figure img { width: 100%; height: 100%; object-fit: cover; }
  .contact { border-top: 1px solid rgb(48 43 36 / 35%); padding-top: 2rem; text-align: center; }
  h2 { margin: 0; font-size: clamp(1.8rem, 4vw, 2.7rem); font-weight: 400; }
  ul { display: flex; flex-wrap: wrap; justify-content: center; gap: 1rem clamp(2rem, 6vw, 5rem); margin: 2.5rem 0 0; padding: 0; list-style: none; }
  li { display: grid; gap: .3rem; min-width: 5rem; }
  li span { font-size: 1.05rem; }
  li small { font-size: .68rem; letter-spacing: .08em; text-transform: uppercase; opacity: .55; }
  @media (max-width: 700px) {
    main { width: calc(100% - 2rem); padding-top: 2rem; }
    .about { grid-template-columns: 1fr; }
    figure { grid-row: 1; width: min(100%, 24rem); margin: 0 auto; }
    .copy { grid-row: 2; }
    ul { display: grid; grid-template-columns: 1fr 1fr; }
  }
</style>
