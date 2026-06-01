<script lang="ts">
  import HexMark from './HexMark.svelte';

  let { class: className = '' }: { class?: string } = $props();
</script>

<div class="wordmark reveal {className}">
  <span class="hex"><HexMark /></span>
  <h1><span class="free">free</span><span class="oxide">oxide</span></h1>
</div>

<style>
  .wordmark {
    display: flex;
    align-items: center;
    gap: 0.18em;
  }

  .hex {
    display: inline-flex;
    width: clamp(58px, 9vw, 92px);
    height: clamp(58px, 9vw, 92px);
  }

  h1 {
    font-size: clamp(38px, 8.2vw, 88px);
    font-weight: 800;
    line-height: 0.92;
    letter-spacing: -0.02em;
    margin: 0;
  }

  .free {
    color: var(--fg);
  }

  .oxide {
    color: var(--accent);
  }

  /* scroll reveal */
  .reveal {
    opacity: 0;
    transform: translateY(24px);
    transition: opacity 0.6s ease, transform 0.6s ease;
  }

  :global(.in-view) .reveal,
  .reveal.in-view {
    opacity: 1;
    transform: translateY(0);
  }
</style>
