<script lang="ts">
  import { fade, fly } from 'svelte/transition';

  type Entry = {
    slug: string;
    title: string;
    date: string;
    tags: string[];
    medium: 'text' | 'image';
    image?: string;
    body: string;
  };

  let { data }: { data: { entries: Entry[] } } = $props();
  // This archive is prerendered from static content, so its page data is immutable.
  // svelte-ignore state_referenced_locally
  const entries = data.entries;
  let currentIndex = $state(entries.length - 1);
  let direction = $state(1);
  let showMenu = $state(false);
  const current = $derived(entries[currentIndex]);

  function navigate(nextIndex: number) {
    if (nextIndex < 0 || nextIndex >= entries.length) return;
    direction = nextIndex > currentIndex ? 1 : -1;
    currentIndex = nextIndex;
  }

  function selectEntry(index: number) {
    navigate(index);
    showMenu = false;
  }

  function handleKeydown(event: KeyboardEvent) {
    if (showMenu || event.metaKey || event.ctrlKey || event.altKey) return;
    const target = event.target as HTMLElement;
    if (['INPUT', 'SELECT', 'TEXTAREA'].includes(target.tagName)) return;
    if (event.key === 'ArrowLeft') navigate(currentIndex - 1);
    if (event.key === 'ArrowRight') navigate(currentIndex + 1);
  }

  function formatDate(date: string) {
    return new Intl.DateTimeFormat('en-US', { dateStyle: 'long' }).format(new Date(`${date}T00:00:00`));
  }

  function escapeHtml(value: string) {
    return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
  }

  function renderBody(body: string) {
    return body.split(/\n\s*\n/).map((paragraph) => {
      const inline = escapeHtml(paragraph)
        .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
        .replace(/\*([^*]+)\*/g, '<em>$1</em>')
        .replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, '<a href="$2" target="_blank" rel="noreferrer">$1</a>')
        .replaceAll('\n', '<br />');
      return `<p>${inline}</p>`;
    }).join('');
  }
</script>

<svelte:window onkeydown={handleKeydown} />

<svelte:head>
  <title>Short Form — Chrissy Lum</title>
  <meta name="description" content="Short thoughts, poems, and doodles by Chrissy Lum." />
</svelte:head>

<main>
  <header class="archive-header">
    <div><p class="eyebrow">Thoughts, poems & doodles</p><h1>Short Form</h1></div>
    <button class="menu-toggle" onclick={() => showMenu = !showMenu}>{showMenu ? 'Close menu' : 'Menu'}</button>
  </header>

  {#if showMenu}
    <section class="menu" in:fade={{ duration: 180 }} aria-label="Short-form archive">
      <p class="menu-heading">Archive</p>
      <ol>
        {#each [...entries].reverse() as entry}
          {@const index = entries.findIndex((candidate) => candidate.slug === entry.slug)}
          <li>
            <button class:current={index === currentIndex} onclick={() => selectEntry(index)}>
              <span>{entry.title}</span><time datetime={entry.date}>{formatDate(entry.date)}</time>
            </button>
          </li>
        {/each}
      </ol>
    </section>
  {:else if current}
    <section class="reader" aria-live="polite">
      <div class="reader-top">
        <div class="metadata">
          <time datetime={current.date}>{formatDate(current.date)}</time>
          <span class="tags">{current.tags.join(' · ')}</span>
        </div>
        <nav aria-label="Short-form navigation">
          <button disabled={currentIndex === 0} onclick={() => navigate(currentIndex - 1)}>← Previous</button>
          <button disabled={currentIndex === entries.length - 1} onclick={() => navigate(currentIndex + 1)}>Next →</button>
        </nav>
      </div>

      <div class="stage">
        {#key current.slug}
          <article class:text={current.medium === 'text'} class:image={current.medium === 'image'} in:fly={{ x: direction * 90, duration: 350 }} out:fade={{ duration: 150 }}>
            <h2>{current.title}</h2>
            {#if current.medium === 'image'}
              <img src={current.image} alt={current.title} />
            {:else}
              <div class="body">{@html renderBody(current.body)}</div>
            {/if}
          </article>
        {/key}
      </div>

      <p class="position">{currentIndex + 1} / {entries.length}</p>
    </section>
  {:else}
    <p class="empty">No short-form entries found.</p>
  {/if}
</main>

<style>
  main { width: min(68rem, calc(100% - 3rem)); margin: 0 auto; padding: 3rem 0 7rem; overflow: hidden; }
  .archive-header { display: flex; align-items: end; justify-content: space-between; gap: 2rem; border-bottom: 1px solid rgb(48 43 36 / 28%); padding-bottom: 1.25rem; }
  .eyebrow, .menu-heading { margin: 0 0 .5rem; font-size: .72rem; letter-spacing: .14em; text-transform: uppercase; }
  h1 { margin: 0; font-size: clamp(3rem, 7vw, 5.5rem); font-weight: 400; line-height: .9; }
  button { color: inherit; font: inherit; }
  .menu-toggle { border: 0; border-bottom: 1px solid currentColor; background: transparent; cursor: pointer; padding: .25rem 0; }
  .reader { padding-top: 2.25rem; }
  .reader-top { display: flex; align-items: start; justify-content: space-between; gap: 2rem; min-height: 4rem; }
  .metadata { display: grid; gap: .4rem; }
  .metadata time { font-size: .9rem; }
  .tags { font-size: .72rem; letter-spacing: .1em; text-transform: uppercase; opacity: .7; }
  nav { display: flex; gap: .5rem; }
  nav button { border: 1px solid rgb(48 43 36 / 35%); background: transparent; cursor: pointer; padding: .5rem .75rem; }
  nav button:disabled { cursor: default; opacity: .3; }
  .stage { display: grid; min-height: 34rem; align-items: start; justify-items: center; padding: 2rem 0; }
  article { grid-area: 1 / 1; width: min(100%, 42rem); }
  article h2 { margin: 0 0 1.5rem; font-size: clamp(1.8rem, 4vw, 3rem); font-weight: 400; text-align: center; }
  article.text { min-height: 28rem; background: #f2efe5; box-shadow: 0 1.4rem 3rem rgb(48 43 36 / 12%); padding: clamp(2rem, 7vw, 5rem); }
  article.text h2 { text-align: left; }
  .body { font-size: clamp(1rem, 2vw, 1.15rem); line-height: 1.75; }
  .body :global(p) { margin: 0 0 1.25em; }
  .body :global(p:last-child) { margin-bottom: 0; }
  .body :global(a) { text-underline-offset: .25em; }
  article.image { width: min(100%, 48rem); }
  article.image img { width: 100%; max-height: 34rem; object-fit: contain; }
  .position { margin: 0; text-align: center; font-size: .75rem; opacity: .55; }
  .menu { width: min(48rem, 100%); margin: 3rem auto 0; }
  .empty { margin: 5rem 0; text-align: center; opacity: .7; }
  .menu-heading { border-bottom: 1px solid rgb(48 43 36 / 25%); padding-bottom: .8rem; }
  ol { margin: 0; padding: 0; list-style: none; }
  li { border-bottom: 1px solid rgb(48 43 36 / 18%); }
  li button { display: flex; width: 100%; align-items: baseline; justify-content: space-between; gap: 2rem; border: 0; background: transparent; cursor: pointer; padding: 1rem 0; text-align: left; }
  li button:hover span, li button:focus-visible span, li button.current span { text-decoration: underline; text-underline-offset: .25em; }
  li time { flex: none; font-size: .78rem; opacity: .65; }
  @media (max-width: 600px) {
    main { width: calc(100% - 2rem); padding-top: 2rem; }
    .reader-top { display: block; }
    nav { justify-content: flex-end; margin-top: 1.25rem; }
    .stage { min-height: 29rem; padding-top: 1.25rem; }
    article.text { min-height: 24rem; }
    li button { gap: 1rem; }
  }
  @media (prefers-reduced-motion: reduce) { article { animation-duration: .01ms !important; } }
</style>
