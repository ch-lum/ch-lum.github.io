<!-- Sets the browser-tab title ("<title> — Ch*!") and meta description. -->
<script lang="ts">
  let { title, description }: { title: string; description?: string } = $props();
</script>

<svelte:head>
  <title>{title} — Ch*!</title>
  {#if description}<meta name="description" content={description} />{/if}
</svelte:head>
