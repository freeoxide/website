/* freeoxide — Tweaks panel + theme bridge (React) */

const FO_DEFAULTS = /*EDITMODE-BEGIN*/{
  "flavor": "oxide",
  "tagline": "standard",
  "scanlines": true,
  "flicker": false,
  "font": "jetbrains"
}/*EDITMODE-END*/;

const FO_FONTS = {
  jetbrains: '"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace',
  plex:      '"IBM Plex Mono", ui-monospace, SFMono-Regular, Menlo, monospace',
  system:    'ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace'
};

function FreeOxideTweaks() {
  const [t, setTweak] = useTweaks(FO_DEFAULTS);
  const firstTagline = React.useRef(true);

  // flavor + scanlines + flicker + font
  React.useEffect(() => {
    const crt = document.getElementById("crt");
    if (!crt) return;
    crt.setAttribute("data-theme", t.flavor);
    crt.classList.toggle("no-scanlines", !t.scanlines);
    crt.classList.toggle("flicker", !!t.flicker);
    // --bg is defined on .crt, so body/html (its ancestors) can't read it —
    // mirror the resolved value up so the overscroll/letterbox area matches.
    const bg = getComputedStyle(crt).getPropertyValue("--bg").trim();
    if (bg) {
      document.body.style.background = bg;
      document.documentElement.style.background = bg;
    }
  }, [t.flavor, t.scanlines, t.flicker]);

  React.useEffect(() => {
    document.documentElement.style.setProperty("--mono", FO_FONTS[t.font] || FO_FONTS.jetbrains);
  }, [t.font]);

  // tagline — let the boot animation own the very first paint
  React.useEffect(() => {
    const tx = (window.__taglines && window.__taglines[t.tagline]) || "";
    window.__tagline = tx;
    if (firstTagline.current) {
      firstTagline.current = false;
      // only repaint immediately if a non-default choice was restored
      if (t.tagline !== "standard" && window.__paintTagline) {
        setTimeout(() => window.__paintTagline(tx, false), 50);
      }
      return;
    }
    if (window.__paintTagline) window.__paintTagline(tx, true);
  }, [t.tagline]);

  return (
    <TweaksPanel title="Tweaks">
      <TweakSection label="Terminal flavor" />
      <TweakSelect
        label="Flavor"
        value={t.flavor}
        options={[
          { value: "oxide",     label: "Oxide — charcoal + rust" },
          { value: "charm",       label: "Charm — neon pink + purple" },
          { value: "charm-light",  label: "Charm Light — magenta on paper" },
          { value: "dark",      label: "Mono — dedicated dark" },
          { value: "light",     label: "Paper — dedicated light" },
          { value: "midnight",  label: "Midnight — blue TUI" },
          { value: "solarized", label: "Solarized — dark" },
          { value: "phosphor",  label: "Phosphor — green CRT" },
          { value: "amber",     label: "Amber — retro mono" }
        ]}
        onChange={(v) => setTweak("flavor", v)}
      />
      <TweakToggle label="Scanlines" value={t.scanlines} onChange={(v) => setTweak("scanlines", v)} />
      <TweakToggle label="CRT flicker" value={t.flicker} onChange={(v) => setTweak("flicker", v)} />

      <TweakSection label="Wordmark" />
      <TweakSelect
        label="Font"
        value={t.font}
        options={[
          { value: "jetbrains", label: "JetBrains Mono" },
          { value: "plex",      label: "IBM Plex Mono" },
          { value: "system",    label: "System mono" }
        ]}
        onChange={(v) => setTweak("font", v)}
      />

      <TweakSection label="Tagline" />
      <TweakSelect
        label="Hero line"
        value={t.tagline}
        options={[
          { value: "standard", label: "Built to a standard" },
          { value: "boring",   label: "Audited until it’s boring" },
          { value: "stone",    label: "No stone left unturned" },
          { value: "trust",    label: "Read, trust, and ship" },
          { value: "deserves", label: "Deserves to be free" }
        ]}
        onChange={(v) => setTweak("tagline", v)}
      />
    </TweaksPanel>
  );
}

ReactDOM.createRoot(document.getElementById("tweaks-root")).render(<FreeOxideTweaks />);
