<script lang="ts">
  let { size = 22 }: { size?: number } = $props();
</script>

<svg
  viewBox="0 0 1254 1254"
  width={size}
  height={size}
  aria-hidden="true"
>
  <!-- hexagon edges -->
  <g fill="none" stroke="currentColor">
    <line x1="352" y1="404" x2="590" y2="258" stroke-width="14" />
    <line x1="666" y1="258" x2="907" y2="407" stroke-width="14" />
    <line x1="313" y1="460" x2="313" y2="763" stroke-width="14" />
    <line x1="943" y1="460" x2="943" y2="763" stroke-width="14" />
    <line x1="351" y1="814" x2="595" y2="964" stroke-width="14" />
    <line x1="661" y1="964" x2="906" y2="814" stroke-width="14" />

    <!-- chevrons (< >) -->
    <polyline
      points="433,575 394,614 433,653"
      stroke-width="11"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <polyline
      points="823,575 862,614 823,653"
      stroke-width="11"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </g>

  <!-- vertex nodes -->
  <g fill="currentColor">
    <circle cx="627" cy="239" r="18" />
    <circle cx="315" cy="426" r="18" />
    <circle cx="941" cy="426" r="18" />
    <circle cx="315" cy="798" r="18" />
    <circle cx="941" cy="798" r="18" />
    <circle cx="627" cy="980" r="18" />
  </g>

  <!-- gear spokes + center hub -->
  <g stroke="currentColor">
    <line x1="628" y1="565" x2="628" y2="494" stroke-width="16" />
    <line x1="628" y1="655" x2="628" y2="726" stroke-width="16" />
    <line x1="666.97" y1="587.5" x2="728.46" y2="552" stroke-width="16" />
    <line x1="589.03" y1="587.5" x2="527.54" y2="552" stroke-width="16" />
    <line x1="666.97" y1="632.5" x2="728.46" y2="668" stroke-width="16" />
    <line x1="589.03" y1="632.5" x2="527.54" y2="668" stroke-width="16" />

    <!-- filled center -->
    <circle cx="628" cy="610" r="61" fill="currentColor" stroke="none" />
    <!-- knockout -->
    <circle cx="628" cy="610" r="30" fill="var(--background)" stroke="none" />
  </g>
</svg>
