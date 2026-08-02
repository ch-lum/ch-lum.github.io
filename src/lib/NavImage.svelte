<script lang="ts">
  let { label, href, image, hoverImage, motion }: {
    label: string;
    href: string;
    image: string;
    hoverImage?: string;
    motion: 'swap' | 'tip' | 'spin';
  } = $props();
</script>

<a class="nav-item {motion}" {href} aria-label={`Go to ${label}`}>
  <span class="picture">
    <img class="base" src={image} alt="" />
    {#if hoverImage}<img class="open" src={hoverImage} alt="" />{/if}
  </span>
  <span class="label">{label}</span>
</a>

<style>
  .nav-item {
    display: grid;
    grid-template-rows: 10.5rem 1.7rem;
    place-items: center;
    width: 12.25rem;
    color: #302b24;
    text-decoration: none;
  }
  .picture {
    display: grid;
    width: 13rem;
    height: 9.5rem;
    place-items: center;
    transition: transform .3s cubic-bezier(.2,.8,.2,1);
  }
  img {
    grid-area: 1 / 1;
    width: auto;
    height: 8.5rem;
    max-width: 13rem;
    object-fit: contain;
    transition: opacity .2s ease, transform .45s cubic-bezier(.2,.8,.2,1);
  }
  .open { opacity: 0; }
  .label {
    font-size: 1.05rem;
    letter-spacing: .08em;
    opacity: 0;
    transform: translateY(-.35rem);
    transition: opacity .25s ease, transform .25s ease;
  }
  .nav-item:hover .picture, .nav-item:focus-visible .picture { transform: scale(1.06); }
  .nav-item:hover .label, .nav-item:focus-visible .label { opacity: 1; transform: translateY(0); }
  .nav-item:hover.swap .base, .nav-item:focus-visible.swap .base { opacity: 0; }
  .nav-item:hover.swap .open, .nav-item:focus-visible.swap .open { opacity: 1; }
  .nav-item:hover.tip .base, .nav-item:focus-visible.tip .base { transform: rotate(18deg) translateY(-.2rem); }
  .nav-item:hover.spin .base, .nav-item:focus-visible.spin .base { animation: record-spin 6s linear infinite; }
  .nav-item:focus-visible { outline: 1px solid #6f5b42; outline-offset: .5rem; }
  @keyframes record-spin { to { transform: rotate(360deg); } }
  @media (prefers-reduced-motion: reduce) {
    img, .picture, .label { transition-duration: .01ms; }
    .nav-item:hover.spin .base, .nav-item:focus-visible.spin .base { animation: none; }
  }
</style>
