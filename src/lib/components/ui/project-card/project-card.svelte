<script lang="ts" module>
	import { cn, type WithElementRef } from "$lib/utils.js";
	import type { HTMLAnchorAttributes } from "svelte/elements";
	import type { BadgeVariant } from "$lib/components/ui/badge/index.js";

	export type ProjectCardMeta = {
		label: string;
		value: string;
	};

	export type ProjectCardProps = WithElementRef<HTMLAnchorAttributes> & {
		/** Project name */
		name: string;
		/** Badge variant: shipped | wip | planned */
		status: BadgeVariant;
		/** Badge text (e.g. "shipped", "in progress") */
		statusLabel: string;
		/** Project description */
		description: string;
		/** Meta items like [{label:"lang", value:"Rust"}] */
		meta?: ProjectCardMeta[];
	};
</script>

<script lang="ts">
	import { Badge } from "$lib/components/ui/badge";

	let {
		class: className,
		ref = $bindable(null),
		name,
		status,
		statusLabel,
		description,
		meta,
		children,
		...restProps
	}: ProjectCardProps = $props();
</script>

<div
	data-slot="project-card"
	class={cn(
		"flex flex-col gap-2",
		"p-[18px_20px] border border-border rounded-[9px] bg-card",
		"transition-[border-color,transform,background-color] duration-150",
		"hover:border-primary hover:-translate-y-0.5 hover:bg-muted",
		className
	)}
>
	<div class="flex items-start justify-between gap-3">
		<div class="text-[17px] font-bold text-foreground flex items-center gap-2.5 min-w-0">
			<!-- Name links to the main href (GitHub) -->
			<a bind:this={ref} class="no-underline text-foreground hover:text-primary" {...restProps}>
				{name}
				<span class="text-muted-foreground font-normal text-[13px]">↗</span>
			</a>
			<!-- Children (e.g. website button) render inline next to the name -->
			{@render children?.()}
		</div>
		<Badge variant={status}>{statusLabel}</Badge>
	</div>
	<p class="text-muted-foreground text-[13.5px] text-pretty m-0">{description}</p>
	{#if meta && meta.length}
		<div class="font-mono text-xs flex flex-wrap items-baseline gap-x-1.5 gap-y-1">
			{#each meta as m, i (m.label)}
				{#if i > 0}<span class="text-crt-faint select-none" aria-hidden="true">·</span>{/if}
				<span class="whitespace-nowrap"><span class="text-primary">{m.label}</span> <span class="text-foreground">{m.value}</span></span>
			{/each}
		</div>
	{/if}
</div>
