<script lang="ts">
	import { repoParts, truncate, type DayEvent } from '$lib/github/initiative';

	let { ev }: { ev: DayEvent } = $props();

	const time = $derived(ev.ts.slice(11, 16)); // HH:MM (UTC)
	const parts = $derived(repoParts(ev.repo));
</script>

<div class="bootln text-[13px] leading-[1.75]">
	<span class="text-crt-faint">{time}</span>
	{#if ev.kind === 'commits'}
		<span class="text-primary"> ↑</span>
		<span class="text-muted-foreground"> pushed </span>
		<span class="text-foreground font-bold">{ev.commitCount}</span>
		<span class="text-muted-foreground"> {ev.commitCount === 1 ? 'commit' : 'commits'} to </span>
		<a class="text-crt-link no-underline hover:underline" href={ev.repoHref} target="_blank" rel="noopener"
			><span class="text-crt-faint">{parts.owner}/</span><span class="text-foreground">{parts.name}</span></a
		>{#if ev.branch}<span class="text-crt-faint">:{ev.branch}</span>{/if}
		{#if ev.latestMessage}<span class="text-crt-faint"> … {ev.latestMessage}</span>{/if}
	{:else if ev.kind === 'pr_merged'}
		<span class="text-crt-ok"> ✓</span>
		<span class="text-muted-foreground"> merged </span>
		<a class="text-crt-link no-underline hover:underline" href={ev.href} target="_blank" rel="noopener"
			><span class="text-foreground font-bold">PR #{ev.number}</span></a
		>
		<span class="text-muted-foreground"> in </span>
		<a class="text-crt-link no-underline hover:underline" href={ev.repoHref} target="_blank" rel="noopener"
			><span class="text-crt-faint">{parts.owner}/</span><span class="text-foreground">{parts.name}</span></a
		>{#if ev.title}<span class="text-crt-faint"> — {truncate(ev.title, 60)}</span>{/if}
	{:else if ev.kind === 'pr_opened'}
		<span class="text-crt-warn"> +</span>
		<span class="text-muted-foreground"> opened </span>
		<a class="text-crt-link no-underline hover:underline" href={ev.href} target="_blank" rel="noopener"
			><span class="text-foreground font-bold">PR #{ev.number}</span></a
		>
		<span class="text-muted-foreground"> in </span>
		<a class="text-crt-link no-underline hover:underline" href={ev.repoHref} target="_blank" rel="noopener"
			><span class="text-crt-faint">{parts.owner}/</span><span class="text-foreground">{parts.name}</span></a
		>{#if ev.title}<span class="text-crt-faint"> — {truncate(ev.title, 60)}</span>{/if}
	{:else if ev.kind === 'pr_closed'}
		<span class="text-destructive"> ✕</span>
		<span class="text-muted-foreground"> closed </span>
		<a class="text-crt-link no-underline hover:underline" href={ev.href} target="_blank" rel="noopener"
			><span class="text-foreground font-bold">PR #{ev.number}</span></a
		>
		<span class="text-muted-foreground"> in </span>
		<a class="text-crt-link no-underline hover:underline" href={ev.repoHref} target="_blank" rel="noopener"
			><span class="text-crt-faint">{parts.owner}/</span><span class="text-foreground">{parts.name}</span></a
		>
	{:else if ev.kind === 'release'}
		<span class="text-crt-ok"> ◆</span>
		<span class="text-muted-foreground"> released </span>
		<a class="text-crt-link no-underline hover:underline" href={ev.href} target="_blank" rel="noopener"
			><span class="text-foreground font-bold">{ev.tag}</span></a
		>
		<span class="text-muted-foreground"> of </span>
		<a class="text-crt-link no-underline hover:underline" href={ev.repoHref} target="_blank" rel="noopener"
			><span class="text-crt-faint">{parts.owner}/</span><span class="text-foreground">{parts.name}</span></a
		>{#if ev.title}<span class="text-crt-faint"> — {truncate(ev.title, 50)}</span>{/if}
	{:else if ev.kind === 'issue_opened'}
		<span class="text-crt-warn"> ⚠</span>
		<span class="text-muted-foreground"> opened </span>
		<a class="text-crt-link no-underline hover:underline" href={ev.href} target="_blank" rel="noopener"
			><span class="text-foreground font-bold">issue #{ev.number}</span></a
		>
		<span class="text-muted-foreground"> in </span>
		<a class="text-crt-link no-underline hover:underline" href={ev.repoHref} target="_blank" rel="noopener"
			><span class="text-crt-faint">{parts.owner}/</span><span class="text-foreground">{parts.name}</span></a
		>{#if ev.title}<span class="text-crt-faint"> — {truncate(ev.title, 60)}</span>{/if}
	{:else if ev.kind === 'issue_closed'}
		<span class="text-crt-ok"> ✓</span>
		<span class="text-muted-foreground"> closed </span>
		<a class="text-crt-link no-underline hover:underline" href={ev.href} target="_blank" rel="noopener"
			><span class="text-foreground font-bold">issue #{ev.number}</span></a
		>
		<span class="text-muted-foreground"> in </span>
		<a class="text-crt-link no-underline hover:underline" href={ev.repoHref} target="_blank" rel="noopener"
			><span class="text-crt-faint">{parts.owner}/</span><span class="text-foreground">{parts.name}</span></a
		>{#if ev.title}<span class="text-crt-faint"> — {truncate(ev.title, 60)}</span>{/if}
	{:else if ev.kind === 'comment'}
		<span class="text-crt-link"> ›</span>
		<span class="text-muted-foreground"> commented on </span>
		{#if ev.number}
			<a class="text-crt-link no-underline hover:underline" href={ev.href} target="_blank" rel="noopener"
				><span class="text-foreground font-bold">#{ev.number}</span></a
			>
			<span class="text-muted-foreground"> in </span>
		{/if}
		<a class="text-crt-link no-underline hover:underline" href={ev.repoHref} target="_blank" rel="noopener"
			><span class="text-crt-faint">{parts.owner}/</span><span class="text-foreground">{parts.name}</span></a
		>{#if ev.author}<span class="text-crt-faint"> · {ev.author}</span>{/if}{#if ev.title
			}<span class="text-crt-faint"> — {ev.title}</span>{/if}
	{/if}
</div>
