<script lang="ts">
  import {
    getState,
    setFlavor,
    toggleScanlines,
    toggleFlicker,
    setFont,
    setTagline,
    FLAVORS,
    FONTS,
    TAGLINES,
  } from "$lib/stores/theme.svelte";

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

      const bg = getComputedStyle(crt).getPropertyValue("--bg").trim();
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
    class="panel"
    style="right:{panelX}px; bottom:{panelY}px;"
    role="dialog"
    aria-label="Visual tweaks panel"
  >
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div
      class="title-bar"
      bind:this={titleBarEl}
      onpointerdown={handlePointerDown}
      onpointermove={handlePointerMove}
      onpointerup={handlePointerUp}
    >
      <span class="title-text">tweaks</span>
      <button class="close-btn" onclick={() => (open = false)} aria-label="Close panel">
        &times;
      </button>
    </div>

    <div class="body">
      <!-- Terminal flavor -->
      <label class="field">
        <span class="label">Terminal flavor</span>
        <select
          class="control"
          value={theme.flavor}
          onchange={(e) => setFlavor((e.target as HTMLSelectElement).value)}
        >
          {#each FLAVORS as f}
            <option value={f.value}>{f.label}</option>
          {/each}
        </select>
      </label>

      <!-- CRT effects -->
      <fieldset class="fieldset">
        <legend class="label">CRT effects</legend>
        <label class="toggle-row">
          <span class="toggle-label">Scanlines</span>
          <button
            class="switch"
            role="switch"
            aria-checked={theme.scanlines}
            aria-label="Toggle scanlines"
            onclick={toggleScanlines}
          >
            <span class="knob" class:on={theme.scanlines}></span>
          </button>
        </label>
        <label class="toggle-row">
          <span class="toggle-label">Flicker</span>
          <button
            class="switch"
            role="switch"
            aria-checked={theme.flicker}
            aria-label="Toggle flicker"
            onclick={toggleFlicker}
          >
            <span class="knob" class:on={theme.flicker}></span>
          </button>
        </label>
      </fieldset>

      <!-- Wordmark font -->
      <label class="field">
        <span class="label">Wordmark</span>
        <select
          class="control"
          value={theme.font}
          onchange={(e) => setFont((e.target as HTMLSelectElement).value)}
        >
          {#each Object.keys(FONTS) as key}
            <option value={key}>{key}</option>
          {/each}
        </select>
      </label>

      <!-- Tagline -->
      <label class="field">
        <span class="label">Tagline</span>
        <select
          class="control"
          value={theme.tagline}
          onchange={(e) => setTagline((e.target as HTMLSelectElement).value)}
        >
          {#each Object.entries(TAGLINES) as [key, val]}
            <option value={key}>{val}</option>
          {/each}
        </select>
      </label>
    </div>
  </div>
{/if}

<button
  class="toggle-btn"
  onclick={() => (open = !open)}
  aria-label="Toggle tweaks panel"
>
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
</button>

<style>
  .toggle-btn {
    position: fixed;
    bottom: 16px;
    right: 16px;
    z-index: 2147483647;
    width: 40px;
    height: 40px;
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 10px;
    background: rgba(30, 30, 30, 0.72);
    backdrop-filter: blur(16px) saturate(140%);
    color: #ccc;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.2s, color 0.2s;
    padding: 0;
  }

  .toggle-btn:hover {
    background: rgba(50, 50, 50, 0.88);
    color: #fff;
  }

  .panel {
    position: fixed;
    z-index: 2147483646;
    width: 280px;
    background: rgba(250, 249, 247, 0.78);
    backdrop-filter: blur(24px) saturate(160%);
    border: 1px solid rgba(255, 255, 255, 0.18);
    border-radius: 14px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.18);
    font-family: var(--mono, ui-monospace, SFMono-Regular, Menlo, monospace);
    color: #1a1a1a;
    overflow: hidden;
    user-select: none;
  }

  .title-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 12px;
    background: rgba(0, 0, 0, 0.04);
    cursor: grab;
    border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  }

  .title-bar:active {
    cursor: grabbing;
  }

  .title-text {
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: #555;
  }

  .close-btn {
    background: none;
    border: none;
    font-size: 16px;
    line-height: 1;
    color: #888;
    cursor: pointer;
    padding: 0 2px;
    transition: color 0.15s;
  }

  .close-btn:hover {
    color: #e00;
  }

  .body {
    padding: 12px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .field {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .label {
    font-size: 10px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.07em;
    color: #777;
  }

  .control {
    appearance: none;
    -webkit-appearance: none;
    background: #1e1e1e;
    color: #d4d4d4;
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 6px;
    padding: 6px 10px;
    font-family: var(--mono, ui-monospace, SFMono-Regular, Menlo, monospace);
    font-size: 12px;
    cursor: pointer;
    outline: none;
    transition: border-color 0.15s;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%23888'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 8px center;
    padding-right: 24px;
  }

  .control:focus {
    border-color: rgba(255, 255, 255, 0.25);
  }

  .fieldset {
    border: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .toggle-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .toggle-label {
    font-size: 12px;
    color: #bbb;
  }

  .switch {
    position: relative;
    width: 36px;
    height: 20px;
    border-radius: 10px;
    border: none;
    background: #333;
    cursor: pointer;
    padding: 0;
    transition: background 0.2s;
  }

  .switch[aria-checked="true"] {
    background: #4ade80;
  }

  .knob {
    position: absolute;
    top: 2px;
    left: 2px;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: #fff;
    transition: transform 0.2s;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.25);
  }

  .knob.on {
    transform: translateX(16px);
  }
</style>
