<section id="testing" data-screen-label="testing">
  <div class="sec-cmd">
    <span class="prompt"></span>
    <span class="cmdline">freeoxide test <span class="flag">--explain</span></span>
    <span class="out">manual + ai</span>
  </div>
  <h2 class="h2 reveal">How the testing actually works</h2>
  <p class="sub reveal">Two loops running against each other: a human looking for the obvious failures, and AI grinding for the ones a human would never think to write.</p>

  <div class="cols2">
    <div class="panel reveal">
      <div class="panel-hd">
        <span class="tl"><i class="r"></i><i class="y"></i><i class="g"></i></span>
        <span class="ttl">manual review</span>
      </div>
      <div class="panel-bd">
        <p><span class="hi">Read every line.</span> Then run it like a user would — and again like an attacker would.</p>
        <p>The boring failures get found by hand: bad input, empty state, the unhappy path, the thing that only breaks the third time.</p>
      </div>
    </div>
    <div class="panel reveal">
      <div class="panel-hd">
        <span class="tl"><i class="r"></i><i class="y"></i><i class="g"></i></span>
        <span class="ttl">ai-assisted</span>
      </div>
      <div class="panel-bd">
        <p><span class="hi">AI writes tests in rounds — 5 to 8 of them.</span> Each round is asked for the cases the last one missed.</p>
        <p>New edge cases, new inputs, new ways to break it. It's slower on purpose. That's the point.</p>
      </div>
    </div>
  </div>

  <div class="ladder reveal" aria-label="a typical edge-case run">
    <div class="rung"><span class="n">01</span><span class="lbl">baseline suite</span><span class="find">happy paths + the obvious errors</span></div>
    <div class="rung"><span class="n">02</span><span class="lbl">round two</span><span class="find"><b>+</b> boundary values, empty &amp; max inputs</span></div>
    <div class="rung"><span class="n">03</span><span class="lbl">round three</span><span class="find"><b>+</b> unicode, encoding, locale edge cases</span></div>
    <div class="rung"><span class="n">04</span><span class="lbl">round four</span><span class="find"><b>+</b> concurrency, ordering &amp; race conditions</span></div>
    <div class="rung"><span class="n">05</span><span class="lbl">rounds five–eight</span><span class="find"><b>+</b> the weird ones you'd never write by hand</span></div>
  </div>
  <p class="comment reveal" style="margin-top:16px;">slower on purpose. no stone left unturned.</p>
</section>
