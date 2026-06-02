<script lang="ts">
  import HexMark from './HexMark.svelte';

  let { class: className = '' }: { class?: string } = $props();
</script>

<div class="wordmark reveal {className}">
  <span class="hex"><HexMark /></span>
  <h1><span class="free">free</span><span class="oxide">oxide</span></h1>
</div>
