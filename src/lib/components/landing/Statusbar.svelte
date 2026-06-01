<script lang="ts">
  import HexMark from './HexMark.svelte';
</script>

<header class="statusbar">
  <div class="statusbar-inner">
    <a class="sb-brand" href="#top">
      <span class="sb-mark"><HexMark size={22} /></span>
      <span class="sb-name">freeoxide<span class="tilde">:~/initiative</span></span>
    </a>
    <nav class="sb-nav">
      <a href="#manifesto">manifesto</a>
      <a href="#standards">standards</a>
      <a href="#testing">testing</a>
      <a href="#projects">projects</a>
      <a href="#contribute">contribute</a>
    </nav>
    <div class="sb-right">
      <span class="sb-status"><span class="dot"></span>v0.1.0 · building in public</span>
      <a class="btn" href="#projects">browse projects</a>
    </div>
  </div>
</header>
