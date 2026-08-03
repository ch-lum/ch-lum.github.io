<script lang="ts">
  let { data } = $props();

  function formatDate(date: string) {
    return new Intl.DateTimeFormat('en-US', { dateStyle: 'long' }).format(new Date(`${date}T00:00:00`));
  }
</script>

<svelte:head>
  <title>{data.post.title} — Ch*!</title>
  <meta name="description" content={data.post.description} />
</svelte:head>

<main>
  <a class="back" href="/long-form/">← Long Form</a>
  <article>
    <header>
      <h1>{data.post.title}</h1>
      <p class="meta"><time datetime={data.post.date}>{formatDate(data.post.date)}</time>{#if data.post.readingTime}<span>{data.post.readingTime}</span>{/if}</p>
      {#if data.post.description}<p class="description">{data.post.description}</p>{/if}
    </header>
    <div class="prose">{@html data.post.html}</div>
  </article>
</main>

<style>
  main { width: min(48rem, calc(100% - 3rem)); margin: 0 auto; padding: 3rem 0 8rem; }
  .back { display: inline-block; margin-bottom: clamp(3rem, 8vw, 6rem); color: inherit; font-size: .85rem; text-underline-offset: .25em; }
  header { padding-bottom: 2rem; border-bottom: 1px solid rgb(48 43 36 / 24%); }
  h1 { margin: 0; font-size: clamp(2.5rem, 7vw, 5rem); font-weight: 400; line-height: 1; }
  .meta { display: flex; flex-wrap: wrap; gap: .5rem 1.5rem; margin: 1.5rem 0 0; font-size: .75rem; letter-spacing: .08em; text-transform: uppercase; }
  .description { max-width: 38rem; margin: 1rem 0 0; font-size: 1.05rem; line-height: 1.55; }
  .prose { margin-top: 3rem; font-size: clamp(1rem, 2vw, 1.12rem); line-height: 1.75; }
  .prose :global(h2), .prose :global(h3), .prose :global(h4) { margin: 2.5em 0 .7em; font-weight: 400; line-height: 1.2; }
  .prose :global(h2) { font-size: 1.8em; }
  .prose :global(h3) { font-size: 1.4em; }
  .prose :global(p), .prose :global(ol), .prose :global(ul) { margin: 0 0 1.4em; }
  .prose :global(a) { color: inherit; text-underline-offset: .2em; }
  .prose :global(img) { display: block; max-width: 100%; height: auto; margin: 2.5rem auto; }
  .prose :global(code) { font-size: .88em; }
  @media (max-width: 600px) { main { width: calc(100% - 2rem); padding-top: 2rem; } }
</style>
