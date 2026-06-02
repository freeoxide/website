<script lang="ts" module>
	import { cn, type WithElementRef } from "$lib/utils.js";
	import type { HTMLAttributes } from "svelte/elements";

	export type SectionHeadingProps = WithElementRef<HTMLAttributes<HTMLHeadingElement>> & {
		/** Heading text */
		text: string;
		/** Subheading / description */
		sub?: string;
	};
</script>

<script lang="ts">
	let {
		class: className,
		ref = $bindable(null),
		text,
		sub,
		children,
		...restProps
	}: SectionHeadingProps = $props();
</script>

<h2
	bind:this={ref}
	data-slot="section-heading"
	class={cn("text-[clamp(22px,3.2vw,30px)] font-extrabold text-foreground m-0 mb-2.5 tracking-tight", className)}
	{...restProps}
>
	{text}
</h2>
{#if sub}
	<p class="text-muted-foreground max-w-[64ch] m-0 mb-7.5 text-pretty">{sub}</p>
{/if}
{@render children?.()}
