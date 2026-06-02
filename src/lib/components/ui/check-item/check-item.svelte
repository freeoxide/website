<script lang="ts" module>
	import { cn, type WithElementRef } from "$lib/utils.js";
	import type { HTMLAttributes } from "svelte/elements";

	export type CheckItemProps = WithElementRef<HTMLAttributes<HTMLDivElement>> & {
		/** Bold title text (rendered as <b>) */
		title: string;
		/** Dimmer description text */
		description?: string;
	};
</script>

<script lang="ts">
	let {
		class: className,
		ref = $bindable(null),
		title,
		description,
		children,
		...restProps
	}: CheckItemProps = $props();
</script>

<div
	bind:this={ref}
	data-slot="check-item"
	class={cn(
		"grid grid-cols-[auto_1fr] gap-3.5 items-start p-[13px_16px]",
		"border border-border rounded-[7px] bg-card",
		"transition-[border-color,background-color] duration-150",
		"hover:border-input hover:bg-muted",
		className
	)}
	{...restProps}
>
	<span class="text-crt-ok font-bold [text-shadow:var(--crt-glow)]">[x]</span>
	<span class="text-foreground">
		<b class="text-primary font-bold">{title}</b>{children}
		{#if description}
			<span class="text-muted-foreground text-[13px] block mt-0.5">{description}</span>
		{/if}
	</span>
</div>
