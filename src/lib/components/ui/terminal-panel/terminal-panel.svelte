<script lang="ts" module>
	import { cn, type WithElementRef } from "$lib/utils.js";
	import type { HTMLAttributes } from "svelte/elements";

	export type TerminalPanelProps = WithElementRef<HTMLAttributes<HTMLDivElement>> & {
		/** Title shown in the panel header */
		title: string;
	};
</script>

<script lang="ts">
	let {
		class: className,
		ref = $bindable(null),
		title,
		children,
		...restProps
	}: TerminalPanelProps = $props();
</script>

<div
	bind:this={ref}
	data-slot="terminal-panel"
	class={cn(
		"border border-border rounded-[9px] bg-card overflow-hidden",
		className
	)}
	{...restProps}
>
	<!-- Terminal header with traffic light dots -->
	<div class="flex items-center gap-2.5 px-4 py-[11px] border-b border-border bg-muted text-[13px]">
		<span class="flex gap-1.5">
			<i class="w-2.5 h-2.5 rounded-full bg-destructive opacity-80 block"></i>
			<i class="w-2.5 h-2.5 rounded-full bg-crt-warn opacity-80 block"></i>
			<i class="w-2.5 h-2.5 rounded-full bg-crt-ok opacity-80 block"></i>
		</span>
		<span class="text-muted-foreground ml-1 whitespace-nowrap">{title}</span>
	</div>
	<div class="p-4">
		{@render children?.()}
	</div>
</div>
