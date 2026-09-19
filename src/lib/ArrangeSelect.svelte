<!-- The "Arrange by" dropdown used on the collection pages. -->
<script lang="ts" generics="T extends string">
  let { value = $bindable(), options }: {
    value: T;
    options: readonly { value: T; label: string }[];
  } = $props();
</script>

<label>Arrange by
  <select bind:value>
    {#each options as option}<option value={option.value}>{option.label}</option>{/each}
  </select>
</label>

<style>
  label { display: flex; align-items: center; gap: .65rem; font-size: .85rem; }
  select { border: 1px solid rgb(48 43 36 / 35%); background: transparent; color: inherit; font: inherit; padding: .55rem .9rem; }
</style>
