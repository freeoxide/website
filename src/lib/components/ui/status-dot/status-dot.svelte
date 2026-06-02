<script lang="ts" module>
	import { cn, type WithElementRef } from "$lib/utils.js";
	import type { HTMLAttributes } from "svelte/elements";

	export type StatusDotProps = WithElementRef<HTMLAttributes<HTMLSpanElement>>;
</script>

<script lang="ts">
	let {
		class: className,
		ref = $bindable(null),
		...restProps
	}: StatusDotProps = $props();
</script>

<span
	bind:this={ref}
	data-slot="status-dot"
	class={cn(
		"inline-block w-[7px] h-[7px] rounded-full bg-crt-ok",
		"shadow-[0_0_8px_var(--crt-ok)]",
		className
	)}
	style="animation: pulse 2.4s ease-in-out infinite;"
	{...restProps}
></span>
