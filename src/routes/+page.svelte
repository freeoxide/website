<script>
  import { onMount } from 'svelte';
  import Statusbar from '$lib/components/landing/Statusbar.svelte';
  import BootSequence from '$lib/components/landing/BootSequence.svelte';
  import Typewriter from '$lib/components/landing/Typewriter.svelte';
  import Wordmark from '$lib/components/landing/Wordmark.svelte';
  import OxideLattice from '$lib/components/three/OxideLattice.svelte';
  import Manifesto from '$lib/components/landing/Manifesto.svelte';
  import Standards from '$lib/components/landing/Standards.svelte';
  import Testing from '$lib/components/landing/Testing.svelte';
  import Projects from '$lib/components/landing/Projects.svelte';
  import Contribute from '$lib/components/landing/Contribute.svelte';
  import Footer from '$lib/components/landing/Footer.svelte';
  import CrtOverlay from '$lib/components/landing/CrtOverlay.svelte';
  import TweaksPanel from '$lib/components/landing/TweaksPanel.svelte';
  import { getState as getTheme, TAGLINES, FONTS } from '$lib/stores/theme.svelte';

  const theme = getTheme();

  let bootComplete = $state(false);

  $effect(() => {
    const mono = FONTS[theme.font] ?? FONTS['jetbrains'];
    document.documentElement.style.setProperty('--mono', mono);
  });

  // Global reveal observer — catches ALL .reveal elements including
  // those inside child components that don't use the action directly.
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

    // Catch dynamically added .reveal elements (e.g. from {#if} blocks)
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
  <title>FreeOxide — Open-Source Rust, Held to the Metal</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
  <link
    href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700;800&family=IBM+Plex+Mono:wght@400;500;600;700&display=swap"
    rel="stylesheet"
  />
</svelte:head>

<div
  class="crt glowable"
  id="crt"
  data-theme={theme.flavor}
  class:no-scanlines={!theme.scanlines}
  class:flicker={theme.flicker}
>
  <Statusbar />

  <main class="session" id="top">
    <!-- HERO SECTION -->
    <section class="hero" data-screen-label="hero">
      <OxideLattice />
      <div class="lattice-hud" aria-hidden="true">
        <div class="lh-row"><span class="lh-k">lattice</span> α‑Fe₂O₃ · hematite</div>
        <div class="lh-row"><span class="lh-k">cell</span><span id="lh-counts">…</span></div>
        <div class="lh-row"><span class="lh-k">probe</span><span id="lh-probe">idle — drag to rotate</span></div>
      </div>

      {#if !bootComplete}
        <BootSequence onComplete={() => (bootComplete = true)} />
      {/if}

      <Wordmark />

      {#if bootComplete}
        <p class="tagline reveal">
          <Typewriter text={TAGLINES[theme.tagline]} />
        </p>
      {/if}

      <p class="lede reveal">
        <span class="hi">A one-person initiative for open-source Rust.</span>
        I build the tools I wish existed — then open them, and hold each one to the
        same bar: tested until it's boring, audited until there's nothing left to find.
      </p>

      <div class="cta-row reveal">
        <a class="btn lg" href="#projects">browse the projects →</a>
        <a class="btn lg ghost" href="#manifesto">./manifesto.md</a>
        <a class="btn lg ghost" href="https://github.com" target="_blank" rel="noopener">github ↗</a>
      </div>

      <div class="stats reveal">
        <div class="stat"><div class="v">4–5×</div><div class="k">audit passes / project</div></div>
        <div class="stat"><div class="v">5–8</div><div class="k">AI edge-case rounds</div></div>
        <div class="stat"><div class="v">&gt;90%</div><div class="k">coverage floor</div></div>
        <div class="stat"><div class="v">100%</div><div class="k">open · MIT / Apache-2.0</div></div>
      </div>
    </section>

    <Manifesto />
    <Standards />
    <Testing />
    <Projects />
    <Contribute />
  </main>

  <Footer />
  <CrtOverlay scanlines={theme.scanlines} flicker={theme.flicker} />
  <TweaksPanel />
</div>
