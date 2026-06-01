/* freeoxide — boot sequence, hex mark injection, scroll reveal */
(function () {
  "use strict";

  /* ---- hexagon mark (recolors via currentColor; inner dot knocks out to bg) ---- */
  var HEX = [
    '<svg viewBox="0 0 1254 1254" width="100%" height="100%" aria-hidden="true">',
    '<g fill="none" stroke="currentColor">',
    '<line x1="352" y1="404" x2="590" y2="258" stroke-width="14"/>',
    '<line x1="666" y1="258" x2="907" y2="407" stroke-width="14"/>',
    '<line x1="313" y1="460" x2="313" y2="763" stroke-width="14"/>',
    '<line x1="943" y1="460" x2="943" y2="763" stroke-width="14"/>',
    '<line x1="351" y1="814" x2="595" y2="964" stroke-width="14"/>',
    '<line x1="661" y1="964" x2="906" y2="814" stroke-width="14"/>',
    '<polyline points="433,575 394,614 433,653" stroke-width="11" stroke-linecap="round" stroke-linejoin="round"/>',
    '<polyline points="823,575 862,614 823,653" stroke-width="11" stroke-linecap="round" stroke-linejoin="round"/>',
    '</g>',
    '<g fill="currentColor">',
    '<circle cx="627" cy="239" r="18"/><circle cx="315" cy="426" r="18"/><circle cx="941" cy="426" r="18"/>',
    '<circle cx="315" cy="798" r="18"/><circle cx="941" cy="798" r="18"/><circle cx="627" cy="980" r="18"/>',
    '</g>',
    '<g stroke="currentColor">',
    '<line x1="628" y1="565" x2="628" y2="494" stroke-width="16"/><line x1="628" y1="655" x2="628" y2="726" stroke-width="16"/>',
    '<line x1="666.97" y1="587.5" x2="728.46" y2="552" stroke-width="16"/><line x1="589.03" y1="587.5" x2="527.54" y2="552" stroke-width="16"/>',
    '<line x1="666.97" y1="632.5" x2="728.46" y2="668" stroke-width="16"/><line x1="589.03" y1="632.5" x2="527.54" y2="668" stroke-width="16"/>',
    '<circle cx="628" cy="610" r="61" fill="currentColor" stroke="none"/>',
    '<circle cx="628" cy="610" r="30" style="fill:var(--bg)" stroke="none"/>',
    '</g>',
    '</svg>'
  ].join("");

  document.querySelectorAll("[data-hex]").forEach(function (el) { el.innerHTML = HEX; });

  /* ---- scroll reveal (paint-independent: rect + scroll, not IntersectionObserver) ---- */
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function revealVisible() {
    var vh = window.innerHeight || 800;
    document.querySelectorAll(".reveal:not(.in)").forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.top < vh * 0.94 && r.bottom > 0) el.classList.add("in");
    });
  }
  if (reduce) {
    document.querySelectorAll(".reveal").forEach(function (el) { el.classList.add("in"); });
  } else {
    revealVisible();
    window.addEventListener("scroll", revealVisible, { passive: true });
    window.addEventListener("resize", revealVisible);
    setTimeout(revealVisible, 400);
    setTimeout(revealVisible, 1200);
  }

  /* ---- tagline (set by tweak bridge; default here) ---- */
  window.__taglines = {
    standard:   "Open-source Rust, built to a standard.",
    boring:     "Audited until it\u2019s boring.",
    stone:      "No stone left unturned.",
    trust:      "Rust you can read, trust, and ship.",
    deserves:   "Software that deserves to be free."
  };
  if (!window.__tagline) window.__tagline = window.__taglines.standard;

  var tagEl = document.getElementById("tagline");
  function paintTagline(text, animate) {
    if (!tagEl) return;
    if (reduce || !animate) {
      tagEl.innerHTML = "";
      tagEl.append(document.createTextNode(text));
      var c = document.createElement("span"); c.className = "cursor"; tagEl.appendChild(c);
      return;
    }
    typeInto(tagEl, text, 26, true);
  }
  window.__paintTagline = paintTagline;

  /* ---- typewriter helper ---- */
  function typeInto(el, text, speed, withCursor) {
    el.innerHTML = "";
    var cursor = document.createElement("span");
    cursor.className = "cursor";
    el.appendChild(cursor);
    var i = 0;
    (function tick() {
      if (i <= text.length) {
        cursor.before(document.createTextNode(text[i - 1] || ""));
        // rebuild text node cleanly to avoid orphan empties
        i++;
        setTimeout(tick, speed + Math.random() * speed * 0.6);
      } else if (!withCursor) {
        cursor.remove();
      }
    })();
  }

  /* ---- boot sequence ---- */
  var bootEl = document.getElementById("boot");
  var BOOT = [
    { t: '<span class="prompt"></span><span class="cmdline">freeoxide <span class="flag">--init</span></span>', d: 0 },
    { t: '<span class="muted">booting freeoxide v0.1.0 \u2026</span>', d: 360 },
    { t: '<span class="tag-ok">[  ok  ]</span> <span class="muted">mounting /standards</span>', d: 620 },
    { t: '<span class="tag-ok">[  ok  ]</span> <span class="muted">loading manifesto</span>', d: 760 },
    { t: '<span class="tag-ok">[  ok  ]</span> <span class="muted">running audit passes (5/5)</span>', d: 900 },
    { t: '<span class="tag-ok">[  ok  ]</span> <span class="muted">all checks green \u2014 ready.</span>', d: 1040 }
  ];

  function runBoot() {
    if (!bootEl) { paintTagline(window.__tagline, true); return; }
    if (reduce) {
      bootEl.innerHTML = BOOT.map(function (b) { return '<span class="ln">' + b.t + '</span>'; }).join("");
      paintTagline(window.__tagline, false);
      return;
    }
    bootEl.innerHTML = "";
    var idx = 0;
    function next() {
      if (idx >= BOOT.length) {
        setTimeout(function () { paintTagline(window.__tagline, true); }, 220);
        return;
      }
      var span = document.createElement("span");
      span.className = "ln";
      span.innerHTML = BOOT[idx].t;
      bootEl.appendChild(span);
      idx++;
      setTimeout(next, BOOT[idx - 1] ? BOOT[idx - 1].d * 0 + (idx === 1 ? 420 : 240) : 240);
    }
    next();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", runBoot);
  } else {
    runBoot();
  }
})();
