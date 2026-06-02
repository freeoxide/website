<script>
	import { onMount } from 'svelte';
	import Statusbar from '$lib/components/landing/Statusbar.svelte';
	import BootSequence from '$lib/components/landing/BootSequence.svelte';
	import Typewriter from '$lib/components/landing/Typewriter.svelte';
	import Wordmark from '$lib/components/landing/Wordmark.svelte';
	import OxideLattice from '$lib/components/three/OxideLattice.svelte';
	import Standards from '$lib/components/landing/Standards.svelte';
	import Testing from '$lib/components/landing/Testing.svelte';
	import Projects from '$lib/components/landing/Projects.svelte';
	import Contribute from '$lib/components/landing/Contribute.svelte';
	import Footer from '$lib/components/landing/Footer.svelte';
	import CrtOverlay from '$lib/components/landing/CrtOverlay.svelte';
	import TweaksPanel from '$lib/components/landing/TweaksPanel.svelte';
	import { Button } from '$lib/components/ui/button';
	import { StatsStrip } from '$lib/components/ui/stats-strip';
	import { getState as getTheme, TAGLINES, FONTS } from '$lib/stores/theme.svelte';

	const theme = getTheme();

	let bootComplete = $state(false);

	$effect(() => {
		const mono = FONTS[theme.font] ?? FONTS['jetbrains'];
		document.documentElement.style.setProperty('--mono', mono);
	});

	onMount(() => {
		const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		if (reduce) {
			document.querySelectorAll('.reveal:not(.in)').forEach((el) => el.classList.add('in'));
			return;
		}

		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						entry.target.classList.add('in');
						observer.unobserve(entry.target);
					}
				});
			},
			{ threshold: 0.06 }
		);

		document.querySelectorAll('.reveal:not(.in)').forEach((el) => observer.observe(el));

		const mutObserver = new MutationObserver((mutations) => {
			for (const mutation of mutations) {
				for (const node of mutation.addedNodes) {
					if (node instanceof HTMLElement) {
						if (node.classList.contains('reveal') && !node.classList.contains('in')) {
							observer.observe(node);
						}
						node.querySelectorAll?.('.reveal:not(.in)').forEach((el) => observer.observe(el));
					}
				}
			}
		});
		mutObserver.observe(document.body, { childList: true, subtree: true });

		return () => {
			observer.disconnect();
			mutObserver.disconnect();
		};
	});
</script>

<svelte:head>
	<title>FreeOxide | Open-Source Rust, Held to the Metal</title>
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link
		href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700;800&family=IBM+Plex+Mono:wght@400;500;600;700&display=swap"
		rel="stylesheet"
	/>
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
		<!-- HERO SECTION -->
		<section class="relative pt-[52px] pb-16" data-screen-label="hero">
			<OxideLattice />
			<div class="hero-content">
				<div class="absolute top-1 right-0 text-right pointer-events-none select-none text-[11.5px] leading-[1.7] tracking-[0.02em] text-crt-faint flex flex-col max-[820px]:hidden" aria-hidden="true">
					<div><span class="text-muted-foreground after:content-['_›'] after:text-primary after:mx-px">lattice</span> α‑Fe₂O₃ · hematite</div>
					<div><span class="text-muted-foreground after:content-['_›'] after:text-primary after:mx-px">cell</span><span id="lh-counts">…</span></div>
					<div><span class="text-muted-foreground after:content-['_›'] after:text-primary after:mx-px">probe</span><span id="lh-probe">idle: drag to rotate</span></div>
				</div>

				<BootSequence onComplete={() => (bootComplete = true)} />

				<Wordmark />

				<p class="text-[clamp(18px,2.6vw,26px)] text-foreground m-0 mb-3.5 font-medium min-h-[1.4em]">
					{#if bootComplete}
						<Typewriter text={TAGLINES[theme.tagline]} />
					{/if}
				</p>

				<p class="max-w-[60ch] text-muted-foreground text-[clamp(14px,1.7vw,16px)] m-0 mb-[30px] text-pretty reveal">
					<span class="text-foreground">Open-source Rust, one person at the keyboard.</span>
					I build the tools I wish existed and release them. Every project gets real tests, real audits. What ships is finished.
				</p>

				<div class="flex flex-wrap gap-3 reveal">
					<Button variant="default" size="lg" href="#projects">browse the projects →</Button>
					<Button variant="outline" size="lg" href="#standards">./about.md</Button>
					<Button variant="outline" size="lg" href="https://github.com" target="_blank" rel="noopener">github ↗</Button>
				</div>

				<div class="reveal">
					<StatsStrip stats={[
						{ value: '4-5×', label: 'audit passes / project' },
						{ value: '5-8', label: 'AI edge-case rounds' },
						{ value: '>90%', label: 'coverage floor' },
						{ value: '100%', label: 'open · MIT / Apache-2.0' },
					]} />
				</div>
			</div>
		</section>

		<Standards />
		<Testing />
		<Projects />
		<Contribute />
	</main>

	<Footer />
	<CrtOverlay scanlines={theme.scanlines} flicker={theme.flicker} />
	<TweaksPanel />
</div>
