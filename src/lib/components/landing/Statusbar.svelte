<script lang="ts">
	import HexMark from './HexMark.svelte';
	import { Button } from '$lib/components/ui/button';
	import { StatusDot } from '$lib/components/ui/status-dot';
</script>

<header
	class="sticky top-0 z-[8000] flex items-center gap-[18px] px-[var(--gutter)] py-2.5 border-b border-border"
	style="background: color-mix(in srgb, var(--background) 86%, transparent); backdrop-filter: blur(8px);"
>
	<a href="#top" class="flex items-center gap-2.5 text-foreground no-underline">
		<span class="w-[22px] h-[22px] text-primary block [&_svg]:w-full [&_svg]:h-full [&_svg]:block"><HexMark size={22} /></span>
		<span class="font-bold tracking-[0.02em] whitespace-nowrap">freeoxide<span class="text-muted-foreground font-normal">:~/initiative</span></span>
	</a>
	<nav class="flex gap-1 ml-2">
		{#each [
			{ href: '#standards', label: 'standards' },
		] as link}
			<a
				href={link.href}
				class="text-muted-foreground px-2.5 py-1 rounded text-[13px] no-underline hover:text-primary hover:bg-card"
			>{link.label}</a>
		{/each}
	</nav>
	<div class="ml-auto flex items-center gap-4">
		<span class="text-muted-foreground text-[12.5px] flex items-center gap-[7px]">
			<StatusDot />
		</span>
		<Button variant="default" size="sm" href="#projects">browse projects</Button>
	</div>
</header>
