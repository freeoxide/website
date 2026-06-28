<script lang="ts">
  import {
    getState,
    setFlavor,
    toggleScanlines,
    toggleFlicker,
    setFont,
    FLAVORS,
    FONTS,
  } from "$lib/stores/theme.svelte";
  import { Switch } from '$lib/components/ui/switch';
  import { Select } from '$lib/components/ui/select';
  import SelectTrigger from '$lib/components/ui/select/select-trigger.svelte';
  import SelectContent from '$lib/components/ui/select/select-content.svelte';
  import SelectItem from '$lib/components/ui/select/select-item.svelte';

  let open = $state(false);
  let dragging = $state(false);
  let panelX = $state(16);
  let panelY = $state(16);
  let dragOffsetX = $state(0);
  let dragOffsetY = $state(0);

  const theme = getState();

  let titleBarEl: HTMLElement | null = $state(null);

  function handlePointerDown(e: PointerEvent) {
    if ((e.target as HTMLElement).closest(".close-btn")) return;
    dragging = true;
    dragOffsetX = e.clientX - panelX;
    dragOffsetY = e.clientY - panelY;
    titleBarEl?.setPointerCapture(e.pointerId);
  }

  function handlePointerMove(e: PointerEvent) {
    if (!dragging) return;
    e.preventDefault();
    panelX = e.clientX - dragOffsetX;
    panelY = e.clientY - dragOffsetY;
  }

  function handlePointerUp() {
    dragging = false;
  }

  $effect(() => {
    const crt = document.querySelector(".crt") as HTMLElement | null;
    if (crt) {
      crt.setAttribute("data-theme", theme.flavor);
      crt.classList.toggle("no-scanlines", !theme.scanlines);
      crt.classList.toggle("flicker", theme.flicker);

      const bg = getComputedStyle(crt).getPropertyValue("--background").trim();
      if (bg) {
        document.body.style.backgroundColor = bg;
        document.documentElement.style.backgroundColor = bg;
      }
    }

    const mono = FONTS[theme.font] ?? FONTS["jetbrains"];
    document.documentElement.style.setProperty("--mono", mono);
  });
</script>

{#if open}
  <div
    class="fixed z-[2147483646] w-[280px] bg-card/90 backdrop-blur-2xl backdrop-saturate-[160%] border border-border rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.18)] font-mono text-foreground select-none"
    style="right:{panelX}px; bottom:{panelY}px;"
    role="dialog"
    aria-label="Visual tweaks panel"
  >
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div
      class="flex items-center justify-between px-3 py-2 bg-background/40 cursor-grab border-b border-border rounded-t-xl active:cursor-grabbing"
      bind:this={titleBarEl}
      onpointerdown={handlePointerDown}
      onpointermove={handlePointerMove}
      onpointerup={handlePointerUp}
    >
      <span class="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">tweaks</span>
      <button class="close-btn bg-none border-none text-base leading-none text-muted-foreground cursor-pointer px-0.5 transition-colors duration-150 hover:text-red-500" onclick={() => (open = false)} aria-label="Close panel">
        &times;
      </button>
    </div>

    <div class="p-3 flex flex-col gap-3">
      <!-- Terminal flavor -->
      <label class="flex flex-col gap-1">
        <span class="text-[10px] font-semibold uppercase tracking-[0.07em] text-muted-foreground">Terminal flavor</span>
        <Select
          type="single"
          value={theme.flavor}
          onValueChange={(v) => { if (v) setFlavor(v); }}
        >
          <SelectTrigger class="h-8 text-xs font-mono bg-popover text-popover-foreground border-border">
            {FLAVORS.find(f => f.value === theme.flavor)?.label ?? theme.flavor}
          </SelectTrigger>
          <SelectContent class="font-mono z-[2147483647]">
            {#each FLAVORS as f}
              <SelectItem value={f.value}>{f.label}</SelectItem>
            {/each}
          </SelectContent>
        </Select>
      </label>

      <!-- CRT effects -->
      <fieldset class="border-none p-0 m-0 flex flex-col gap-2">
        <legend class="text-[10px] font-semibold uppercase tracking-[0.07em] text-muted-foreground">CRT effects</legend>
        <label class="flex items-center justify-between">
          <span class="text-xs text-muted-foreground">Scanlines</span>
          <Switch checked={theme.scanlines} onCheckedChange={toggleScanlines} />
        </label>
        <label class="flex items-center justify-between">
          <span class="text-xs text-muted-foreground">Flicker</span>
          <Switch checked={theme.flicker} onCheckedChange={toggleFlicker} />
        </label>
      </fieldset>

      <!-- Wordmark font -->
      <label class="flex flex-col gap-1">
        <span class="text-[10px] font-semibold uppercase tracking-[0.07em] text-muted-foreground">Wordmark</span>
        <Select
          type="single"
          value={theme.font}
          onValueChange={(v) => { if (v) setFont(v); }}
        >
          <SelectTrigger class="h-8 text-xs font-mono bg-popover text-popover-foreground border-border">
            {theme.font}
          </SelectTrigger>
          <SelectContent class="font-mono z-[2147483647]">
            {#each Object.keys(FONTS) as key}
              <SelectItem value={key}>{key}</SelectItem>
            {/each}
          </SelectContent>
        </Select>
      </label>

    </div>
  </div>
{/if}

<button
  class="fixed bottom-4 right-4 z-[2147483647] w-10 h-10 border border-border rounded-[10px] bg-card/80 backdrop-blur-2xl backdrop-saturate-[140%] text-muted-foreground cursor-pointer flex items-center justify-center transition-colors duration-200 p-0 hover:bg-card hover:text-foreground"
  onclick={() => (open = !open)}
  aria-label="Toggle tweaks panel"
>
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
</button>
