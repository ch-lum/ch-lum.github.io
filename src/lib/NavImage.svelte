<script lang="ts">
  let { label, href, image, motion }: {
    label: string;
    href: string;
    image: string;
    motion: 'tip' | 'spin';
  } = $props();
</script>

<a class="nav-item {motion}" {href} aria-label={`Go to ${label}`}>
  <span class="picture"><img src={image} alt="" /></span>
  <span class="label">{label}</span>
</a>

<style>
  .nav-item {
    display: grid;
    grid-template-rows: 8rem 1.7rem;
    place-items: center;
    width: 9rem;
    color: #302b24;
    text-decoration: none;
  }
  .picture { display: grid; width: 7rem; height: 7rem; place-items: center; }
  img { width: 100%; max-height: 100%; object-fit: contain; transition: transform .45s cubic-bezier(.2,.8,.2,1); }
  .label {
    font-size: 1.05rem;
    letter-spacing: .08em;
    opacity: 0;
    transform: translateY(-.35rem);
    transition: opacity .25s ease, transform .25s ease;
  }
  .nav-item:hover .label, .nav-item:focus-visible .label { opacity: 1; transform: translateY(0); }
  .nav-item:hover.tip img, .nav-item:focus-visible.tip img { transform: rotate(-18deg) translateY(-.2rem); }
  .nav-item:hover.spin img, .nav-item:focus-visible.spin img { transform: rotate(360deg); }
  .nav-item:focus-visible { outline: 1px solid #6f5b42; outline-offset: .5rem; }
  @media (prefers-reduced-motion: reduce) {
    img, .label { transition-duration: .01ms; }
    .nav-item:hover.spin img, .nav-item:focus-visible.spin img { transform: rotate(12deg); }
  }
</style>
