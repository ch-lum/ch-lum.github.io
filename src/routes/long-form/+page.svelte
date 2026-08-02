<script lang="ts">
  type Post = {
    slug: string;
    title: string;
    date: string;
    readingTime: string;
    description: string;
  };

  let { data }: { data: { posts: Post[] } } = $props();

  const offsets = [-2, 8, -5, 3, -8, 6];

  function shortDate(date: string) {
    const [year, month, day] = date.split('-');
    return `${month}/${day}/${year.slice(2)}`;
  }

  function longDate(date: string) {
    return new Intl.DateTimeFormat('en-US', { dateStyle: 'long' }).format(new Date(`${date}T00:00:00`));
  }
</script>

<svelte:head>
  <title>Long Form — Chrissy Lum</title>
  <meta name="description" content="Long-form writing by Chrissy Lum." />
</svelte:head>

<main>
  <header>
    <p>Essays, projects & reflections</p>
    <h1>Long Form</h1>
  </header>

  <ol aria-label="Long-form posts">
    {#each data.posts as post, index}
      <li style:--offset={`${offsets[index % offsets.length]}vw`}>
        <article>
          <h2>{post.title} <span aria-hidden="true">•</span> <time datetime={post.date}>{shortDate(post.date)}</time></h2>
          <div class="details">
            <div>
              <p class="meta"><span>{longDate(post.date)}</span>{#if post.readingTime}<span>{post.readingTime}</span>{/if}</p>
              {#if post.description}<p class="description">{post.description}</p>{/if}
            </div>
          </div>
        </article>
      </li>
    {/each}
  </ol>
</main>

<style>
  main { width: min(72rem, calc(100% - 3rem)); margin: 0 auto; padding: 3rem 0 8rem; overflow: hidden; }
  header { margin-bottom: clamp(4rem, 10vw, 8rem); }
  header p { margin: 0 0 .7rem; font-size: .72rem; letter-spacing: .14em; text-transform: uppercase; }
  h1 { margin: 0; font-size: clamp(3rem, 8vw, 6.5rem); font-weight: 400; line-height: .9; }
  ol { display: grid; gap: clamp(2.5rem, 6vw, 5rem); margin: 0; padding: 0; list-style: none; }
  li { width: min(52rem, 88%); margin-left: auto; margin-right: auto; transform: translateX(var(--offset)); }
  article { width: fit-content; max-width: 100%; }
  h2 { margin: 0; font-size: clamp(1.25rem, 3.5vw, 2.5rem); font-weight: 400; line-height: 1.15; }
  h2 time { white-space: nowrap; font-size: .62em; opacity: .68; }
  .details { display: grid; grid-template-rows: 0fr; opacity: 0; transition: grid-template-rows 220ms ease, opacity 180ms ease; }
  .details > div { overflow: hidden; }
  article:hover .details { grid-template-rows: 1fr; opacity: 1; }
  .meta { display: flex; flex-wrap: wrap; gap: .4rem 1.5rem; margin: .8rem 0 0; font-size: .72rem; letter-spacing: .08em; text-transform: uppercase; }
  .description { max-width: 38rem; margin: .55rem 0 0; font-size: .95rem; line-height: 1.55; }
  @media (max-width: 600px) {
    main { width: calc(100% - 2rem); padding-top: 2rem; }
    li { width: 92%; transform: translateX(calc(var(--offset) * .35)); }
    .details { grid-template-rows: 1fr; opacity: 1; }
  }
  @media (prefers-reduced-motion: reduce) { .details { transition: none; } }
</style>
