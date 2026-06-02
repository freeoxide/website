<script lang="ts" module>
	import { cn, type WithElementRef } from "$lib/utils.js";
	import type { HTMLAttributes } from "svelte/elements";

	export type LadderRungProps = WithElementRef<HTMLAttributes<HTMLDivElement>> & {
		/** Round number (e.g. "01") */
		number: string;
		/** Label (e.g. "round two") */
		label: string;
		/** Finding description */
		finding: string;
	};
</script>

<script lang="ts">
	let {
		class: className,
		ref = $bindable(null),
		number,
		label,
		finding,
		...restProps
	}: LadderRungProps = $props();
</script>

<div
	bind:this={ref}
	data-slot="ladder-rung"
	class={cn(
		"grid grid-cols-[auto_auto_1fr] gap-3 items-baseline",
		"px-3 py-[9px] rounded-md bg-muted text-[13px]",
		className
	)}
	{...restProps}
>
	<span class="text-primary font-bold whitespace-nowrap">{number}</span>
	<span class="text-foreground whitespace-nowrap">{label}</span>
	<span class="text-muted-foreground">{@html finding}</span>
</div>
