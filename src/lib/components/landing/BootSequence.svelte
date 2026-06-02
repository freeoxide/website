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
			html: '<span class="text-primary mr-2">$</span><span class="text-foreground">freeoxide <span class="text-muted-foreground">--init</span></span>',
			delay: 420
		},
		{
			html: '<span class="text-muted-foreground">booting freeoxide v0.1.0 …</span>',
			delay: 240
		},
		{
			html: '<span class="text-crt-ok">[  ok  ]</span> <span class="text-muted-foreground">mounting /standards</span>',
			delay: 240
		},
		{
			html: '<span class="text-crt-ok">[  ok  ]</span> <span class="text-muted-foreground">loading config</span>',
			delay: 240
		},
		{
			html: '<span class="text-crt-ok">[  ok  ]</span> <span class="text-muted-foreground">running audit passes (5/5)</span>',
			delay: 240
		},
		{
			html: '<span class="text-crt-ok">[  ok  ]</span> <span class="text-muted-foreground">all checks green: ready.</span>',
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

<div bind:this={bootEl} aria-label="boot sequence" class="mb-[30px] text-[13.5px] min-h-[132px]">
	{#each lines.slice(0, visibleCount) as line}
		<span class="bootln block whitespace-pre-wrap">{@html line.html}</span>
	{/each}
</div>
