<section id="standards" data-screen-label="standards">
  <div class="sec-cmd">
    <span class="prompt"></span>
    <span class="cmdline">freeoxide standards <span class="flag">--list</span></span>
    <span class="out">6 checks</span>
  </div>
  <h2 class="h2 reveal">What makes a project qualify</h2>
  <p class="sub reveal"
    >A project doesn't carry the freeoxide name until every box below is true. No
    exceptions, no "we'll fix it later."</p
  >
  <div class="checklist">
    <div class="check reveal">
      <span class="box">[x]</span>
      <span class="ct"
        ><b>Real test coverage.</b> Not a number to game — paths exercised, edge cases
        pinned. <span class="cd">&gt;90% is the floor, not the goal.</span></span
      >
    </div>
    <div class="check reveal">
      <span class="box">[x]</span>
      <span class="ct"
        ><b>Multi-pass AI audits.</b> Every project gets 4–5 independent audit passes.
        <span class="cd">Each pass is told to find something the last one missed — and usually does.</span></span
      >
    </div>
    <div class="check reveal">
      <span class="box">[x]</span>
      <span class="ct"
        ><b>Architecture review.</b> Module boundaries and structure reviewed the same
        way. <span class="cd">Pass after pass, until the shape stops changing.</span></span
      >
    </div>
    <div class="check reveal">
      <span class="box">[x]</span>
      <span class="ct"
        ><b>Performance passes.</b> Dedicated runs to find hot paths and allocations
        worth removing. <span class="cd">Measured, not guessed.</span></span
      >
    </div>
    <div class="check reveal">
      <span class="box">[x]</span>
      <span class="ct"
        ><b>Idiomatic &amp; documented.</b> Clippy-clean, sensible defaults, a public API
        you can read. <span class="cd">If it needs a comment to be safe, it gets one.</span></span
      >
    </div>
    <div class="check reveal">
      <span class="box">[x]</span>
      <span class="ct"
        ><b>Open by default.</b> MIT / Apache-2.0, readable git history, no surprise
        dependencies. <span class="cd">Auditable all the way down.</span></span
      >
    </div>
  </div>
</section>
