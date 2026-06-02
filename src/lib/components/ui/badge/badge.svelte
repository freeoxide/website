<script lang="ts" module>
	import { cn, type WithElementRef } from "$lib/utils.js";
	import type { HTMLAttributes } from "svelte/elements";
	import { type VariantProps, tv } from "tailwind-variants";

	export const badgeVariants = tv({
		base: "inline-flex items-center font-mono text-[11px] font-bold tracking-[0.04em] lowercase px-2 py-[3px] rounded-full border whitespace-nowrap select-none",
		variants: {
			variant: {
				default:
					"border-transparent bg-primary text-primary-foreground",
				secondary:
					"border-transparent bg-secondary text-secondary-foreground",
				destructive:
					"border-transparent bg-destructive text-white",
				outline:
					"text-foreground border-border",
				shipped:
					"text-crt-ok border-crt-ok before:content-['●_']",
				wip:
					"text-crt-warn border-crt-warn before:content-['◐_']",
				planned:
					"text-muted-foreground border-muted-foreground before:content-['○_']",
			},
		},
		defaultVariants: {
			variant: "default",
		},
	});

	export type BadgeVariant = VariantProps<typeof badgeVariants>["variant"];

	export type BadgeProps = WithElementRef<HTMLAttributes<HTMLDivElement>> & {
		variant?: BadgeVariant;
	};
</script>

<script lang="ts">
	let {
		class: className,
		variant = "default",
		ref = $bindable(null),
		children,
		...restProps
	}: BadgeProps = $props();
</script>

<div
	bind:this={ref}
	data-slot="badge"
	class={cn(badgeVariants({ variant }), className)}
	{...restProps}
>
	{@render children?.()}
</div>
