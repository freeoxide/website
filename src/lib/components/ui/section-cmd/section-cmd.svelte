<script lang="ts" module>
	import { cn, type WithElementRef } from "$lib/utils.js";
	import type { HTMLAttributes } from "svelte/elements";

	export type SectionCmdProps = WithElementRef<HTMLAttributes<HTMLDivElement>> & {
		command: string;
		flag?: string;
		arg?: string;
		output?: string;
	};
</script>

<script lang="ts">
	let {
		class: className,
		ref = $bindable(null),
		command,
		flag,
		arg,
		output,
		...restProps
	}: SectionCmdProps = $props();
</script>

<div
	bind:this={ref}
	data-slot="section-cmd"
	class={cn("flex items-baseline gap-0 text-sm text-muted-foreground mb-6.5 font-mono", className)}
	{...restProps}
>
	<span class="text-primary mr-2 before:content-['$']"></span>
	<span class="text-foreground whitespace-nowrap">
		{command}
		{#if arg}
			<span class="text-secondary">{arg}</span>
		{/if}
		{#if flag}
			<span class="text-muted-foreground">{flag}</span>
		{/if}
	</span>
	{#if output}
		<span class="text-crt-faint ml-auto text-[12.5px]">{output}</span>
	{/if}
</div>
