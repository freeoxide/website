<script lang="ts" module>
	import { cn, type WithElementRef } from "$lib/utils.js";
	import type { HTMLAttributes } from "svelte/elements";

	export type StatItem = {
		value: string;
		label: string;
	};

	export type StatsStripProps = WithElementRef<HTMLAttributes<HTMLDivElement>> & {
		stats: StatItem[];
	};
</script>

<script lang="ts">
	let {
		class: className,
		ref = $bindable(null),
		stats,
		...restProps
	}: StatsStripProps = $props();
</script>

<div
	bind:this={ref}
	data-slot="stats-strip"
	class={cn(
		"grid grid-cols-4 gap-px bg-border border border-border rounded-lg overflow-hidden mt-10",
		"max-[720px]:grid-cols-2",
		className
	)}
	{...restProps}
>
	{#each stats as stat}
		<div class="bg-card p-[18px_20px]">
			<div class="text-[clamp(22px,3vw,30px)] font-extrabold text-primary tracking-tight">{@html stat.value}</div>
			<div class="text-xs text-muted-foreground mt-0.5">{stat.label}</div>
		</div>
	{/each}
</div>
