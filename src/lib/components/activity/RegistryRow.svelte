<script lang="ts">
	import { onMount } from 'svelte';
	import { repoParts, type RepoRow } from '$lib/github/initiative';

	let { repo }: { repo: RepoRow } = $props();

	const parts = $derived(repoParts(repo.fullName));

	let age = $state('…');
	let lastPush = $state<string>('…');

	function yearsAgo(iso: string): string {
		const years = (Date.now() - new Date(iso).getTime()) / (365.25 * 86_400_000);
		if (years < 1) return `${Math.floor(years * 12)}mo`;
		return `${years.toFixed(1)}y`;
	}
	function relAgo(iso: string | null): string {
		if (!iso) return 'never';
		const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
		if (days <= 0) return 'today';
		if (days === 1) return '1d ago';
		if (days < 30) return `${days}d ago`;
		if (days < 365) return `${Math.floor(days / 30)}mo ago`;
		return `${(days / 365).toFixed(1)}y ago`;
	}

	// age / last-push are relative to "now" — compute client-side so they don't rot.
	onMount(() => {
		age = yearsAgo(repo.createdAt);
		lastPush = relAgo(repo.pushedAt);
	});
</script>

<div
	class="p-[14px_16px] border border-border rounded-[9px] bg-card transition-colors hover:border-primary"
>
	<div class="flex items-start justify-between gap-3">
		<a class="no-underline hover:underline min-w-0" href={repo.href} target="_blank" rel="noopener">
			<span class="text-crt-faint">{parts.owner}/</span><span class="text-foreground font-bold">{parts.name}</span>
			<span class="text-muted-foreground text-[12px]"> ↗</span>
		</a>
		<div class="flex items-center gap-1.5 shrink-0">
			{#if repo.fork}<span class="text-crt-faint border border-border rounded-full px-1.5 py-[1px] text-[10px]">fork</span>{/if}
			{#if repo.archived}<span class="text-crt-warn border border-crt-warn rounded-full px-1.5 py-[1px] text-[10px]">archived</span>{/if}
		</div>
	</div>

	{#if repo.description}
		<p class="text-muted-foreground text-[13px] m-0 mt-1 text-pretty">{repo.description}</p>
	{/if}

	<div class="text-crt-faint text-[11.5px] flex flex-wrap gap-x-4 gap-y-0.5 mt-2">
		{#if repo.language}<span><span class="text-muted-foreground">lang</span> {repo.language}</span>{/if}
		<span><span class="text-muted-foreground">★</span> {repo.stars}</span>
		<span><span class="text-muted-foreground">forks</span> {repo.forks}</span>
		<span><span class="text-muted-foreground">age</span> {age}</span>
		<span><span class="text-muted-foreground">push</span> {lastPush}</span>
	</div>
</div>
