import { browser } from "$app/environment";

export const TAGLINES: Record<string, string> = {
  standard: "Open-source Rust, built to a standard.",
  boring: "Every release earns it.",
  stone: "The edge cases don't slip through.",
  trust: "Rust you'd be comfortable debugging at 2am.",
  deserves: "Open tools, closed bugs.",
};

export const FONTS: Record<string, string> = {
  jetbrains: '"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace',
  plex: '"IBM Plex Mono", ui-monospace, SFMono-Regular, Menlo, monospace',
  system: 'ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace',
};

export const FLAVORS: { value: string; label: string }[] = [
  { value: "oxide", label: "Oxide — charcoal + rust" },
  { value: "phosphor", label: "Phosphor — green CRT" },
  { value: "amber", label: "Amber — retro mono" },
  { value: "midnight", label: "Midnight — blue TUI" },
  { value: "dark", label: "Dark — mono" },
  { value: "light", label: "Light — ink on paper" },
  { value: "solarized", label: "Solarized — dark" },
  { value: "charm", label: "Charm — neon pink + purple" },
  { value: "charm-light", label: "Charm Light — magenta on paper" },
];

type FontKey = "jetbrains" | "plex" | "system";

type ThemeState = {
  flavor: string;
  scanlines: boolean;
  flicker: boolean;
  font: FontKey;
};

const STORAGE_KEY = "freeoxide:theme";

const DEFAULTS: ThemeState = {
  flavor: "oxide",
  scanlines: true,
  flicker: false,
  font: "jetbrains",
};

function isFontKey(value: unknown): value is FontKey {
  return value === "jetbrains" || value === "plex" || value === "system";
}

/** Hydrate from localStorage, falling back to defaults on SSR / first visit / corrupt data. */
function loadTheme(): ThemeState {
  if (!browser) return { ...DEFAULTS };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULTS };
    const parsed = JSON.parse(raw) as Partial<ThemeState>;
    return {
      flavor: typeof parsed.flavor === "string" ? parsed.flavor : DEFAULTS.flavor,
      scanlines: typeof parsed.scanlines === "boolean" ? parsed.scanlines : DEFAULTS.scanlines,
      flicker: typeof parsed.flicker === "boolean" ? parsed.flicker : DEFAULTS.flicker,
      font: isFontKey(parsed.font) ? parsed.font : DEFAULTS.font,
    };
  } catch {
    return { ...DEFAULTS };
  }
}

let theme = $state<ThemeState>(loadTheme());

function persist(): void {
  if (!browser) return;
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        flavor: theme.flavor,
        scanlines: theme.scanlines,
        flicker: theme.flicker,
        font: theme.font,
      }),
    );
  } catch {
    // Ignore quota / private-mode write failures — theme still works in-session.
  }
}

export function getState() {
  return theme;
}

export function setFlavor(flavor: string): void {
  theme.flavor = flavor;
  persist();
}

export function toggleScanlines(): void {
  theme.scanlines = !theme.scanlines;
  persist();
}

export function toggleFlicker(): void {
  theme.flicker = !theme.flicker;
  persist();
}

export function setFont(font: string): void {
  if (isFontKey(font)) {
    theme.font = font;
    persist();
  }
}
