<script lang="ts">
  import { onMount } from 'svelte';

  let {
    onComplete
  }: {
    onComplete?: () => void;
  } = $props();

  interface BootLine {
    html: string;
    delay: number;
  }

  const lines: BootLine[] = [
    {
      html: '<span class="prompt"></span><span class="cmdline">freeoxide <span class="flag">--init</span></span>',
      delay: 420
    },
    {
      html: '<span class="muted">booting freeoxide v0.1.0 …</span>',
      delay: 240
    },
    {
      html: '<span class="tag-ok">[  ok  ]</span> <span class="muted">mounting /standards</span>',
      delay: 240
    },
    {
      html: '<span class="tag-ok">[  ok  ]</span> <span class="muted">loading manifesto</span>',
      delay: 240
    },
    {
      html: '<span class="tag-ok">[  ok  ]</span> <span class="muted">running audit passes (5/5)</span>',
      delay: 240
    },
    {
      html: '<span class="tag-ok">[  ok  ]</span> <span class="muted">all checks green — ready.</span>',
      delay: 240
    }
  ];

  let visibleCount = $state(0);
  let bootEl: HTMLDivElement | undefined = $state();

  onMount(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');

    if (mq.matches) {
      visibleCount = lines.length;
      emitBootComplete();
      return;
    }

    let idx = 0;

    function showNext() {
      if (idx >= lines.length) {
        emitBootComplete();
        return;
      }

      visibleCount = idx + 1;
      idx++;

      const nextDelay = idx < lines.length ? lines[idx].delay : 220;
      setTimeout(showNext, nextDelay);
    }

    setTimeout(showNext, lines[0].delay);
  });

  function emitBootComplete() {
    bootEl?.dispatchEvent(new CustomEvent('boot-complete', { bubbles: true }));
    onComplete?.();
  }
</script>

<div class="boot" bind:this={bootEl} aria-label="boot sequence">
  {#each lines.slice(0, visibleCount) as line}
    <span class="ln">{@html line.html}</span>
  {/each}
</div>
