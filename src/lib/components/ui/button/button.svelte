<script lang="ts" module>
	import { cn, type WithElementRef } from "$lib/utils.js";
	import type { HTMLAnchorAttributes, HTMLButtonAttributes } from "svelte/elements";
	import { type VariantProps, tv } from "tailwind-variants";

	export const buttonVariants = tv({
		base: "inline-flex shrink-0 items-center justify-center gap-2 font-mono font-semibold whitespace-nowrap cursor-pointer select-none rounded-[5px] border transition-[transform,filter,color,background-color,border-color] duration-150 outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 no-underline",
		variants: {
			variant: {
				default:
					"bg-primary text-primary-foreground border-primary hover:brightness-108 hover:-translate-y-px active:translate-y-0",
				destructive:
					"bg-destructive text-white border-destructive hover:brightness-108 hover:-translate-y-px active:translate-y-0",
				outline:
					"bg-transparent text-foreground border-input hover:border-primary hover:text-primary",
				secondary:
					"bg-secondary text-secondary-foreground border-secondary hover:brightness-108",
				ghost:
					"bg-transparent text-foreground border-transparent hover:bg-accent hover:text-accent-foreground",
				link: "text-primary border-transparent underline-offset-4 hover:underline",
			},
			size: {
				default: "text-[13px] px-3.5 py-[7px]",
				sm: "text-[12px] gap-1.5 px-3 py-[5px]",
				lg: "text-[14.5px] px-5 py-[11px]",
				icon: "size-9",
				"icon-sm": "size-8",
				"icon-lg": "size-10",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "default",
		},
	});

	export type ButtonVariant = VariantProps<typeof buttonVariants>["variant"];
	export type ButtonSize = VariantProps<typeof buttonVariants>["size"];

	export type ButtonProps = WithElementRef<HTMLButtonAttributes> &
		WithElementRef<HTMLAnchorAttributes> & {
			variant?: ButtonVariant;
			size?: ButtonSize;
		};
</script>

<script lang="ts">
	let {
		class: className,
		variant = "default",
		size = "default",
		ref = $bindable(null),
		href = undefined,
		type = "button",
		disabled,
		children,
		...restProps
	}: ButtonProps = $props();
</script>

{#if href}
	<a
		bind:this={ref}
		data-slot="button"
		class={cn(buttonVariants({ variant, size }), className)}
		href={disabled ? undefined : href}
		aria-disabled={disabled}
		role={disabled ? "link" : undefined}
		tabindex={disabled ? -1 : undefined}
		{...restProps}
	>
		{@render children?.()}
	</a>
{:else}
	<button
		bind:this={ref}
		data-slot="button"
		class={cn(buttonVariants({ variant, size }), className)}
		{type}
		{disabled}
		{...restProps}
	>
		{@render children?.()}
	</button>
{/if}
