<script>
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
  import { reveal } from '$lib/components/landing/ScrollReveal.svelte';
  import { getState as getTheme, TAGLINES, FONTS } from '$lib/stores/theme.svelte';

  const theme = getTheme();

  import './crt-theme.css';

  let bootComplete = $state(false);

  $effect(() => {
    const mono = FONTS[theme.font] ?? FONTS['jetbrains'];
    document.documentElement.style.setProperty('--mono', mono);
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

      {#if !bootComplete}
        <BootSequence onComplete={() => (bootComplete = true)} />
      {/if}

      <div class="wordmark reveal" use:reveal>
        <Wordmark />
      </div>

      {#if bootComplete}
        <p class="tagline reveal" use:reveal>
          <Typewriter text={TAGLINES[theme.tagline]} />
        </p>
      {/if}

      <p class="lede reveal" use:reveal>
        <span class="hi">A one-person initiative for open-source Rust.</span>
        I build the tools I wish existed — then open them, and hold each one to the
        same bar: tested until it's boring, audited until there's nothing left to find.
      </p>

      <div class="cta-row reveal" use:reveal>
        <a class="btn lg" href="#projects">browse the projects →</a>
        <a class="btn lg ghost" href="#manifesto">./manifesto.md</a>
        <a class="btn lg ghost" href="https://github.com" target="_blank" rel="noopener">github ↗</a>
      </div>

      <div class="stats reveal" use:reveal>
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
