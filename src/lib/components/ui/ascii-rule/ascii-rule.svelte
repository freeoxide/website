<script lang="ts" module>
	import { cn, type WithElementRef } from "$lib/utils.js";
	import type { HTMLAttributes } from "svelte/elements";

	export type AsciiRuleProps = WithElementRef<HTMLAttributes<HTMLDivElement>>;
</script>

<script lang="ts">
	let {
		class: className,
		ref = $bindable(null),
		...restProps
	}: AsciiRuleProps = $props();
</script>

<div
	bind:this={ref}
	data-slot="ascii-rule"
	class={cn(
		"text-crt-faint whitespace-pre overflow-hidden text-[13px] leading-none my-2 mb-6 select-none",
		className
	)}
	{...restProps}
>┌─────────────────────────────────────────────────────────────────────────┐</div>
