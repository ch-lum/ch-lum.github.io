<script lang="ts">
  type Project = {
    title: string;
    description: string;
    link: string;
    image: string;
    tags: string[];
  };

  let { data }: { data: { projects: Project[] } } = $props();
</script>

<svelte:head>
  <title>Projects — Chrissy Lum</title>
  <meta name="description" content="Selected research, data, visualization, and education projects by Chrissy Lum." />
</svelte:head>

<main>
  <section class="intro" aria-labelledby="projects-title">
    <p class="eyebrow">Selected work</p>
    <h1 id="projects-title">Projects</h1>
    <p class="career-note">I’m a data analyst with a data science background, interested in turning messy systems into useful tools, explanations, and decisions. My work tends to live somewhere between research, education, visualization, and building the thing myself.</p>
  </section>

  <section class="computer" aria-label="Project desktop">
    <div class="monitor">
      <div class="screen">
        <div class="desktop">
          {#each data.projects as project}
            <a class="app" href={project.link} target={project.link.startsWith('http') ? '_blank' : undefined} rel={project.link.startsWith('http') ? 'noreferrer' : undefined}>
              <span class="icon"><img src={project.image} alt="" /></span>
              <span class="app-name">{project.title}</span>
              <span class="tooltip">
                <strong>{project.title}</strong>
                <span>{project.description}</span>
                <small>{project.tags.join(' · ')}</small>
              </span>
            </a>
          {/each}
        </div>

        <div class="taskbar" aria-hidden="true"><span class="start"><span class="flag">▦</span> start</span><span class="tray">12:04 PM</span></div>
      </div>
    </div>
    <div class="stand" aria-hidden="true"></div>
    <div class="base" aria-hidden="true"></div>
  </section>
</main>

<style>
  main { width: min(76rem, calc(100% - 3rem)); margin: 0 auto; padding: 3rem 0 8rem; }
  .intro { display: grid; grid-template-columns: minmax(0, 1fr) minmax(18rem, 32rem); align-items: end; gap: 2rem 5rem; border-bottom: 1px solid rgb(48 43 36 / 35%); padding-bottom: 1.5rem; }
  .eyebrow { grid-column: 1 / -1; margin: 0 0 -1.25rem; font-size: .72rem; letter-spacing: .14em; text-transform: uppercase; }
  h1 { margin: 0; font-size: clamp(3rem, 8vw, 6.5rem); font-weight: 400; line-height: .9; }
  .career-note { margin: 0; font-size: clamp(.95rem, 1.5vw, 1.08rem); line-height: 1.6; }
  .computer { width: min(66rem, 100%); margin: clamp(4rem, 9vw, 7rem) auto 0; }
  .monitor { position: relative; z-index: 1; padding: clamp(.7rem, 1.6vw, 1.25rem); border: 2px solid #7e817d; border-radius: clamp(1rem, 2vw, 1.8rem); background: linear-gradient(145deg, #dadad2, #aaa9a1); box-shadow: inset 3px 3px 4px rgb(255 255 255 / 75%), inset -4px -4px 6px rgb(59 57 52 / 28%), 0 1.8rem 3rem rgb(48 43 36 / 22%); }
  .monitor::after { position: absolute; right: 2.2rem; bottom: .25rem; width: .45rem; height: .45rem; border-radius: 50%; background: #69a448; box-shadow: 0 0 .35rem #b9e69a; content: ''; }
  .screen { position: relative; aspect-ratio: 4 / 3; overflow: hidden; border: .35rem solid #555954; border-radius: .65rem; background: url('/wallpaper.jpg') center / cover no-repeat #66aee8; box-shadow: inset 0 0 1rem rgb(0 0 0 / 42%); font-family: Arial, sans-serif; }
  .desktop { position: absolute; z-index: 2; inset: 0 0 2.15rem; display: grid; grid-template-columns: repeat(3, minmax(7rem, 1fr)); align-content: start; gap: clamp(1.7rem, 4vw, 3.5rem) clamp(1rem, 5vw, 4rem); overflow-y: auto; padding: clamp(1.5rem, 4vw, 3rem); padding-bottom: 4rem; scrollbar-color: #d4d0c8 #efefef; scrollbar-width: auto; }
  .desktop::-webkit-scrollbar { width: 1rem; }
  .desktop::-webkit-scrollbar-track { border-left: 1px solid #808080; background: #efefef; }
  .desktop::-webkit-scrollbar-thumb { border: 2px outset #f3f3f3; background: #d4d0c8; }
  .app { position: relative; display: flex; min-width: 0; flex-direction: column; align-items: center; color: white; text-align: center; text-decoration: none; text-shadow: 1px 1px 2px #173551, -1px -1px 1px rgb(0 0 0 / 30%); }
  .icon { display: grid; width: clamp(4.4rem, 8vw, 6.2rem); aspect-ratio: 1; place-items: center; overflow: hidden; border: 2px solid rgb(255 255 255 / 78%); border-radius: .55rem; background: #e6e7de; box-shadow: 2px 3px 0 rgb(19 54 89 / 44%); transition: transform 150ms ease, filter 150ms ease; }
  .icon img { width: 100%; height: 100%; object-fit: cover; }
  .app-name { max-width: 11rem; margin-top: .45rem; padding: .12rem .28rem; font-size: clamp(.7rem, 1.25vw, .86rem); line-height: 1.15; }
  .app:hover .icon, .app:focus-visible .icon { transform: translateY(-.25rem) scale(1.06); filter: saturate(1.18); }
  .app:hover .app-name, .app:focus-visible .app-name { background: #174da4; outline: 1px dotted white; }
  .app:focus-visible { outline: none; }
  .tooltip { position: absolute; z-index: 5; top: calc(100% + .6rem); left: 50%; display: grid; visibility: hidden; width: min(19rem, 68vw); gap: .45rem; padding: .8rem .9rem; transform: translate(-50%, -.25rem); border: 1px solid #111; background: #ffffdf; box-shadow: 3px 4px 0 rgb(0 0 0 / 28%); color: #171717; opacity: 0; text-align: left; text-shadow: none; transition: opacity 120ms ease, transform 120ms ease, visibility 120ms; }
  .tooltip strong { font-size: .82rem; }
  .tooltip span { font-size: .75rem; line-height: 1.35; }
  .tooltip small { font-size: .64rem; color: #38516a; }
  .app:hover .tooltip, .app:focus-visible .tooltip { visibility: visible; transform: translate(-50%, 0); opacity: 1; }
  .taskbar { position: absolute; z-index: 4; right: 0; bottom: 0; left: 0; display: flex; height: 2.15rem; align-items: center; justify-content: space-between; border-top: 2px solid #4b7ff1; background: linear-gradient(#2e72df, #1553bd); color: white; font-size: .72rem; font-weight: 700; }
  .start { display: flex; height: 100%; align-items: center; gap: .35rem; padding: 0 .85rem 0 .6rem; border-radius: 0 .7rem .7rem 0; background: linear-gradient(#59b94c, #268623); font-size: .9rem; font-style: italic; }
  .flag { font-style: normal; color: #f4e44f; }
  .tray { display: flex; height: 100%; align-items: center; padding: 0 .65rem; border-left: 1px solid #4ec4e8; background: #1597dc; font-weight: 400; }
  .stand { width: 19%; height: 3.8rem; margin: -.2rem auto 0; background: linear-gradient(90deg, #999991, #d7d7cf 45%, #aaa9a1); clip-path: polygon(20% 0, 80% 0, 100% 100%, 0 100%); }
  .base { width: 35%; height: 1.1rem; margin: 0 auto; border: 1px solid #85857e; border-radius: 50%; background: linear-gradient(#d5d5ce, #999991); box-shadow: 0 .6rem 1rem rgb(48 43 36 / 20%); }
  @media (max-width: 700px) {
    main { width: calc(100% - 2rem); padding-top: 2rem; }
    .intro { grid-template-columns: 1fr; }
    .eyebrow { grid-column: auto; margin-bottom: -1rem; }
    .screen { height: 41rem; aspect-ratio: auto; }
    .desktop { grid-template-columns: repeat(2, minmax(6rem, 1fr)); gap: 2.3rem .75rem; padding: 1.5rem .8rem 5rem; }
    .tooltip { position: fixed; top: auto; right: 1rem; bottom: 1rem; left: 1rem; width: auto; transform: translateY(.25rem); }
    .app:hover .tooltip, .app:focus-visible .tooltip { transform: none; }
  }
  @media (prefers-reduced-motion: reduce) { .icon, .tooltip { transition: none; } }
</style>
