<script lang="ts">
  import { onDestroy } from "svelte";
  import Typewriter from "./Typewriter.svelte";
  import { TAGLINES } from "$lib/stores/theme.svelte";

  // Cycle through every tagline automatically. Each line is typed out by a
  // fresh <Typewriter> mount (keyed by index); when it finishes we hold for a
  // beat, then advance to the next, looping forever.
  const lines = Object.values(TAGLINES);
  const HOLD_MS = 2600;

  let index = $state(0);
  let advance: ReturnType<typeof setTimeout> | undefined;

  function handleComplete() {
    advance = setTimeout(() => {
      index = (index + 1) % lines.length;
    }, HOLD_MS);
  }

  onDestroy(() => {
    if (advance) clearTimeout(advance);
  });
</script>

{#key index}
  <Typewriter text={lines[index]} oncomplete={handleComplete} />
{/key}
