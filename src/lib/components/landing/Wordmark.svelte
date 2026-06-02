<script lang="ts">
	import HexMark from './HexMark.svelte';

	let { class: className = '' }: { class?: string } = $props();
</script>

<div class="flex items-center gap-[22px] my-[8px_0_18px] reveal {className}">
	<span class="w-[clamp(58px,9vw,92px)] h-[clamp(58px,9vw,92px)] text-primary flex-none [&_svg]:w-full [&_svg]:h-full [&_svg]:block" style="filter: drop-shadow(var(--crt-glow));">
		<HexMark />
	</span>
	<h1 class="m-0 text-[clamp(38px,8.2vw,88px)] leading-[0.92] font-extrabold tracking-[-0.02em] text-foreground whitespace-nowrap">
		<span class="text-foreground">free</span><span class="text-primary">oxide</span>
	</h1>
</div>
