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
        <p>What more is there to share about myself? Reflecting in this manner, one as public and forthright, yet peacocky and brash as this website. I like to think there's a lot to me. I have hobbies and interests and there are some things I am good at. Others not so much.</p>
        <p>What am I good at? A lot of things, I think. I spent a whole bunch of time teaching myself how to communicate well. Worked at aquariums and as a tour guide all in the name of public speaking. Also math and problem solving. I actually really enjoy the work I do in my career. Data science is so awesome. And I don't think my poems are half bad.</p>
        <p>What am I bad at? For one, expressing myself earnestly is difficult. I disdain resumes and Instagram pages. It is hard for me to think about how others will perceive me. Also, cooking. I think I lack the drive to cook.</p>
        <p>I hope this website has treated you well, and that you have been able to paint some new color into your life about mine.</p>
      </div>
    </div>

    <figure>
      <img src="/about/profile.PNG" alt="Chrissy Lum" />
    </figure>
  </section>

  <section class="contact" aria-labelledby="contact-title">
    <p class="eyebrow">Contact Me</p>
    <h2 id="contact-title">My Digital Footprint</h2>
    <ul>
      <li><a href="mailto:chrlum03@gmail.com"><span>Email</span><small>chrlum03@gmail.com</small></a></li>
      <li><a href="https://substack.com/@ch0rcoal" target="_blank" rel="noreferrer"><span>Substack</span><small>Visit profile ↗</small></a></li>
      <li><a href="https://open.spotify.com/user/thegreatgecko" target="_blank" rel="noreferrer"><span>Spotify</span><small>Visit profile ↗</small></a></li>
      <li><a href="https://github.com/ch-lum" target="_blank" rel="noreferrer"><span>GitHub</span><small>Visit profile ↗</small></a></li>
      <li><a href="https://www.linkedin.com/in/ch-lum/" target="_blank" rel="noreferrer"><span>LinkedIn</span><small>Visit profile ↗</small></a></li>
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
  li { min-width: 5rem; }
  li a { display: grid; gap: .3rem; color: inherit; text-decoration: none; text-underline-offset: .25em; }
  li a:hover span, li a:focus-visible span { text-decoration: underline; }
  li a:focus-visible { outline: 1px solid #6f5b42; outline-offset: .4rem; }
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
