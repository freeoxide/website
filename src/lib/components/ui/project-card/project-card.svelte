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

	const hasChildren = $derived(children !== undefined);
</script>

{#if hasChildren}
	<div
		data-slot="project-card"
		class={cn(
			"flex items-center gap-2",
			"p-[18px_20px] border border-border rounded-[9px] bg-card",
			"transition-[border-color,transform,background-color] duration-150",
			"hover:border-primary hover:-translate-y-0.5 hover:bg-muted",
			className
		)}
	>
		<a
			bind:this={ref}
			class={cn(
				"grid grid-cols-1fr_auto gap-y-2 gap-x-4 items-center flex-1 min-w-0",
				"no-underline block",
			)}
			{...restProps}
		>
			<div class="text-[17px] font-bold text-foreground flex items-center gap-2.5">
				{name}
				<span class="text-muted-foreground font-normal text-[13px]">↗</span>
			</div>
			<Badge variant={status} class="row-start-1 col-start-2 self-start">{statusLabel}</Badge>
			<p class="text-muted-foreground text-[13.5px] text-pretty col-span-full m-0">{description}</p>
			{#if meta && meta.length}
				<div class="text-crt-faint text-xs col-span-full flex gap-4 flex-wrap">
					{#each meta as m}
						<span><b class="text-muted-foreground font-semibold">{m.label}</b> {m.value}</span>
					{/each}
				</div>
			{/if}
		</a>
		<div class="shrink-0">
			{@render children?.()}
		</div>
	</div>
{:else}
	<a
		bind:this={ref}
		data-slot="project-card"
		class={cn(
			"grid grid-cols-1fr_auto gap-y-2 gap-x-4 items-center",
			"p-[18px_20px] border border-border rounded-[9px] bg-card",
			"transition-[border-color,transform,background-color] duration-150",
			"hover:border-primary hover:-translate-y-0.5 hover:bg-muted",
			"no-underline block",
			className
		)}
		{...restProps}
	>
		<div class="text-[17px] font-bold text-foreground flex items-center gap-2.5">
			{name}
			<span class="text-muted-foreground font-normal text-[13px]">↗</span>
		</div>
		<Badge variant={status} class="row-start-1 col-start-2 self-start">{statusLabel}</Badge>
		<p class="text-muted-foreground text-[13.5px] text-pretty col-span-full m-0">{description}</p>
		{#if meta && meta.length}
			<div class="text-crt-faint text-xs col-span-full flex gap-4 flex-wrap">
				{#each meta as m}
					<span><b class="text-muted-foreground font-semibold">{m.label}</b> {m.value}</span>
				{/each}
			</div>
		{/if}
	</a>
{/if}
