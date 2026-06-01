<script lang="ts">
  import { localizeHref } from '$lib/paraglide/runtime';
  import { locales } from '$lib/paraglide/runtime';
  let { children } = $props();
</script>

{@render children()}
