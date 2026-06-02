<script lang="ts" module>
	import { cn, type WithElementRef } from "$lib/utils.js";
	import type { HTMLAttributes } from "svelte/elements";

	export type StepItemProps = WithElementRef<HTMLAttributes<HTMLDivElement>> & {
		/** Step number (e.g. "01") */
		number: string;
		/** Step title */
		title: string;
		/** Step description */
		description?: string;
	};
</script>

<script lang="ts">
	let {
		class: className,
		ref = $bindable(null),
		number,
		title,
		description,
		children,
		...restProps
	}: StepItemProps = $props();
</script>

<div
	bind:this={ref}
	data-slot="step-item"
	class={cn(
		"grid grid-cols-[auto_1fr] gap-4 items-start",
		"p-[15px_18px] border border-border rounded-lg bg-card",
		className
	)}
	{...restProps}
>
	<span class="text-primary font-extrabold tabular-nums">{number}</span>
	<span class="text-foreground font-semibold">
		{title}{children}
		{#if description}
			<span class="text-muted-foreground text-[13.5px] font-normal block mt-0.5 text-pretty">{description}</span>
		{/if}
	</span>
</div>
