<script lang="ts">
  import SiteHeader from '$lib/SiteHeader.svelte';
  import '../styles/global.css';
  let { children } = $props();
</script>

<SiteHeader />
{@render children()}
