<script lang="ts" module>
	import { cn, type WithElementRef } from "$lib/utils.js";
	import type { HTMLAttributes } from "svelte/elements";

	export type CardDescriptionProps = WithElementRef<HTMLAttributes<HTMLDivElement>>;
</script>

<script lang="ts">
	let {
		class: className,
		ref = $bindable(null),
		children,
		...restProps
	}: CardDescriptionProps = $props();
</script>

<div
	bind:this={ref}
	data-slot="card-description"
	class={cn("text-muted-foreground text-sm", className)}
	{...restProps}
>
	{@render children?.()}
</div>
