<script lang="ts">
	import { onMount } from 'svelte';
	import Statusbar from '$lib/components/landing/Statusbar.svelte';
	import Footer from '$lib/components/landing/Footer.svelte';
	import CrtOverlay from '$lib/components/landing/CrtOverlay.svelte';
	import { SectionCmd } from '$lib/components/ui/section-cmd';
	import { SectionHeading } from '$lib/components/ui/section-heading';
	import { TerminalPanel } from '$lib/components/ui/terminal-panel';
	import { StatsStrip } from '$lib/components/ui/stats-strip';
	import { getState, FONTS } from '$lib/stores/theme.svelte';
	import TabBar, { type TabId } from '$lib/components/activity/TabBar.svelte';
	import DayHeader from '$lib/components/activity/DayHeader.svelte';
	import LogLine from '$lib/components/activity/LogLine.svelte';
	import RegistryRow from '$lib/components/activity/RegistryRow.svelte';
	import type { PageData } from './$types';

	const theme = getState();
	let { data }: { data: PageData } = $props();

	let tab = $state<TabId>('recent');

	// Keep --mono in sync with the shared theme (mirrors the home page).
	$effect(() => {
		const mono = FONTS[theme.font] ?? FONTS['jetbrains'];
		document.documentElement.style.setProperty('--mono', mono);
	});

	// Reveal-on-scroll (mirrors the home page's IntersectionObserver).
	onMount(() => {
		const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		if (reduce) {
			document.querySelectorAll('.reveal:not(.in)').forEach((el) => el.classList.add('in'));
			return;
		}
		const obs = new IntersectionObserver(
			(entries) => {
				for (const e of entries) {
					if (e.isIntersecting) {
						e.target.classList.add('in');
						obs.unobserve(e.target);
					}
				}
			},
			{ threshold: 0.06 },
		);
		document.querySelectorAll('.reveal:not(.in)').forEach((el) => obs.observe(el));
		return () => obs.disconnect();
	});

	const totalEvents = $derived(data.days.reduce((n, d) => n + d.events.length, 0));
	const spanLabel = $derived(data.windowDays >= 365 ? '1y' : `${data.windowDays}d`);
	// Hide zero-count categories so an empty issues/comments list doesn't read as
	// "0 issues · 0 comments" — only surface what actually happened.
	const bootSummary = $derived(
		[
			`${data.stats.commits} commits`,
			`${data.stats.prsMerged} merged`,
			data.stats.issues > 0 && `${data.stats.issues} issues`,
			data.stats.comments > 0 && `${data.stats.comments} comments`,
			`${data.stats.releases} releases`,
		]
			.filter(Boolean)
			.join(' · '),
	);
	// 4th stat card: issues when there are any, else total ★ (avoids a hero "0").
	const statCards = $derived([
		{ value: String(data.stats.commits), label: `commits · ${spanLabel}` },
		{ value: String(data.stats.prsMerged), label: `PRs merged · ${spanLabel}` },
		data.stats.issues > 0
			? { value: String(data.stats.issues), label: `issues · ${spanLabel}` }
			: { value: String(data.stats.stars), label: '★ across repos' },
		{ value: String(data.stats.releases), label: `releases · ${spanLabel}` },
	]);
	const tabs = $derived([
		{ id: 'recent' as const, label: 'recent', count: totalEvents },
		{ id: 'registry' as const, label: 'registry', count: data.repos.length },
		{ id: 'releases' as const, label: 'releases', count: data.releases.length },
	]);
	// Both disclosure conditions can be true at once (one repo failed metadata,
	// another hit a page cap) — render them independently, not mutually exclusive.
	const footerStatus = $derived(
		(
			[
				data.repoErrors.length && `partial: ${data.repoErrors.join(', ')} unavailable`,
				data.truncated.length && `counts capped: ${data.truncated.join(', ')} hit the item limit`,
			]
				.filter(Boolean)
				.join(' · ') || 'source: live github snapshot'
		),
	);
</script>

<svelte:head>
	<title>FreeOxide: initiative activity log</title>
	<meta
		name="description"
		content="A build-time snapshot of every commit, pull request, and release across the FreeOxide initiative repos."
	/>
	<meta property="og:type" content="website" />
	<meta property="og:title" content="FreeOxide: initiative activity log" />
	<meta
		property="og:description"
		content="Commits, PRs, and releases across the FreeOxide initiative repos."
	/>
	<meta property="og:image" content="https://freeoxide.com/og-image.png" />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	<meta property="og:site_name" content="FreeOxide" />
	<meta property="og:locale" content="en_US" />
	<meta property="og:url" content="https://freeoxide.com/activity" />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:site" content="@hmziqrs" />
	<meta name="twitter:creator" content="@hmziqrs" />
	<link rel="canonical" href="https://freeoxide.com/activity" />
</svelte:head>

<div
	class="crt glowable relative min-h-screen overflow-x-clip bg-background"
	id="crt"
	data-theme={theme.flavor}
	class:no-scanlines={!theme.scanlines}
	class:flicker={theme.flicker}
>
	<Statusbar />

	<main class="max-w-[var(--maxw)] mx-auto px-[var(--gutter)] pb-20">
		<section class="pt-[52px] pb-2">
			<SectionCmd
				command="freeoxide"
				arg="activity"
				flag="--initiative"
				output={data.status === 'ok'
					? `${data.stats.repos} repos · ${spanLabel} window`
					: data.status}
			/>
			<SectionHeading
				text="initiative activity"
				sub="A build-time snapshot of every commit, pull request, and release across the FreeOxide repos. It refreshes on every deploy. Not live, but it never rate-limits you either."
			/>
		</section>

		{#if data.status !== 'error'}
			<div class="reveal">
				<StatsStrip stats={statCards} />
			</div>
		{/if}

		<div class="mt-9">
			<TabBar bind:active={tab} {tabs} />
		</div>

		{#if data.status === 'error'}
			<TerminalPanel title="freeoxide@initiative: ~/activity">
				<div class="bootln text-[13px] leading-[1.8]">
					<span class="text-destructive">[ fail ]</span>
					<span class="text-muted-foreground"> github api unreachable: feed offline.</span>
				</div>
				<div class="text-crt-faint text-[13px] leading-[1.8] mt-1">
					this is a build-time snapshot; it'll resync on the next deploy.<br />
					browse the raw feed on
					<a
						class="text-crt-link"
						href="https://github.com/freeoxide?ref=freeoxide.com"
						target="_blank"
						rel="noopener">github ↗</a
					>
				</div>
			</TerminalPanel>
		{:else if tab === 'recent'}
			<div
				id="activity-panel-recent"
				role="tabpanel"
				aria-labelledby="activity-tab-recent"
				tabindex="0"
			>
				<TerminalPanel title="freeoxide@initiative: ~/activity --recent">
					<div class="bootln text-[13px] leading-[1.8] mb-2">
						{#if data.status === 'empty'}
							<span class="text-crt-warn">[ -- ]</span>
							<span class="text-muted-foreground"> no activity in the last {spanLabel}.</span>
						{:else}
							<span class="text-crt-ok">[ ok ]</span>
							<span class="text-muted-foreground">
								streaming {bootSummary} across {data.stats.repos} repos</span
							>
						{/if}
					</div>

					{#if data.status === 'ok'}
						{#each data.days as day (day.iso)}
							<DayHeader iso={day.iso} count={day.events.length} />
							{#each day.events as ev, i (`${day.iso}-${i}`)}
								<LogLine {ev} />
							{/each}
						{/each}
						<div class="text-crt-faint text-[12.5px] mt-5">— end of stream —</div>
					{/if}
				</TerminalPanel>
			</div>
		{:else if tab === 'registry'}
			<div
				id="activity-panel-registry"
				role="tabpanel"
				aria-labelledby="activity-tab-registry"
				tabindex="0"
			>
				<TerminalPanel title="freeoxide@initiative: ~/repos --registry">
					<SectionCmd command="ls" arg="repos/" flag="-la" output={`${data.repos.length} repos`} />
					<div class="grid gap-2.5 mt-2">
						{#each data.repos as r (r.fullName)}
							<RegistryRow repo={r} />
						{/each}
					</div>
				</TerminalPanel>
			</div>
		{:else}
			<div
				id="activity-panel-releases"
				role="tabpanel"
				aria-labelledby="activity-tab-releases"
				tabindex="0"
			>
				<TerminalPanel title="freeoxide@initiative: ~/releases">
					<SectionCmd command="git" arg="tag" flag="--sort=-creatordate" output={`${data.releases.length} releases`} />
					{#if data.releases.length === 0}
						<div class="text-crt-faint text-[13px] mt-3">no published releases yet.</div>
					{:else}
						<div class="mt-3">
							{#each data.releases as ev, i (`rel-${i}`)}
								<LogLine {ev} />
							{/each}
						</div>
					{/if}
				</TerminalPanel>
			</div>
		{/if}

		<p class="text-crt-faint text-[12px] mt-6 text-center">
			rendered at build · times in UTC · {footerStatus}
		</p>
	</main>

	<Footer />
	<CrtOverlay scanlines={theme.scanlines} flicker={theme.flicker} />
</div>
