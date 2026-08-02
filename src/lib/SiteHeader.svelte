<header>
  <a class="signature" href="/" aria-label="Chrissy Lum — home">
    <img src="/home_imgs/autograph-start.svg" alt="" />
  </a>

  <nav aria-label="Primary navigation">
    <a href="/">Home</a>
    <a href="/about/">About</a>
    <a href="/long-form/">Blog</a>
    <a href="/Chrissy-Lum-Resume.pdf" target="_blank" rel="noreferrer">CV</a>
  </nav>
</header>

<style>
  header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: min(68rem, calc(100% - 3rem));
    min-height: 5.5rem;
    margin: 0 auto;
    padding: .8rem 0;
  }
  .signature { display: block; width: 7.5rem; }
  .signature img { width: 100%; }
  nav { display: flex; gap: clamp(1.2rem, 4vw, 2.8rem); }
  nav a {
    font-size: .95rem;
    letter-spacing: .04em;
    text-decoration: none;
    text-underline-offset: .28em;
  }
  nav a:hover, nav a:focus-visible { text-decoration: underline; }
  a:focus-visible { outline: 1px solid #6f5b42; outline-offset: .35rem; }
  @media (max-width: 480px) {
    header { width: calc(100% - 2rem); min-height: 4.5rem; }
    .signature { width: 5.5rem; }
    nav { gap: 1rem; }
    nav a { font-size: .85rem; }
  }
</style>
