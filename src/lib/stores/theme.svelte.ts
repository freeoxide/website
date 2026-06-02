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

let theme = $state({
  flavor: "oxide",
  scanlines: true,
  flicker: false,
  font: "jetbrains" as "jetbrains" | "plex" | "system",
  tagline: "standard",
});

export function getState() {
  return theme;
}

export function setFlavor(flavor: string): void {
  theme.flavor = flavor;
}

export function toggleScanlines(): void {
  theme.scanlines = !theme.scanlines;
}

export function toggleFlicker(): void {
  theme.flicker = !theme.flicker;
}

export function setFont(font: string): void {
  if (font === "jetbrains" || font === "plex" || font === "system") {
    theme.font = font;
  }
}

export function setTagline(tagline: string): void {
  theme.tagline = tagline;
}
