<script lang="ts">
  import { onMount, onDestroy } from 'svelte';

  let {
    text,
    speed = 26,
    startDelay = 0,
    withCursor = true,
    oncomplete
  }: {
    text: string;
    speed?: number;
    startDelay?: number;
    withCursor?: boolean;
    oncomplete?: () => void;
  } = $props();

  let displayed = $state('');
  let typing = $state(false);
  let complete = $state(false);
  let timers: ReturnType<typeof setTimeout>[] = [];

  function clearTimeouts() {
    for (const t of timers) clearTimeout(t);
    timers = [];
  }

  function typeNext(chars: string[], index: number) {
    if (index >= chars.length) {
      typing = false;
      complete = true;
      oncomplete?.();
      return;
    }

    displayed += chars[index];
    const jitter = speed * Math.random() * 0.6;
    const delay = speed + jitter;
    const id = setTimeout(() => typeNext(chars, index + 1), delay);
    timers.push(id);
  }

  onMount(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');

    if (mq.matches) {
      displayed = text;
      complete = true;
      oncomplete?.();
      return;
    }

    const id = setTimeout(() => {
      typing = true;
      typeNext(text.split(''), 0);
    }, startDelay);
    timers.push(id);
  });

  onDestroy(() => {
    clearTimeouts();
  });
</script>

<span class="typewriter"
  ><span class="text">{displayed}</span>{#if withCursor}
    <span class="cursor" class:typing class:complete></span>{/if}</span
>

<style>
  .typewriter {
    display: inline;
  }

  .cursor {
    display: inline-block;
    width: 0.6em;
    height: 1.1em;
    margin-left: 1px;
    background: currentColor;
    vertical-align: text-bottom;
    animation: blink 1s steps(1) infinite;
  }

  .cursor.complete {
    animation: blink 1s steps(1) infinite;
  }

  @keyframes blink {
    0%,
    50% {
      opacity: 1;
    }
    51%,
    100% {
      opacity: 0;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .cursor {
      animation: none;
      opacity: 1;
    }
  }
</style>
