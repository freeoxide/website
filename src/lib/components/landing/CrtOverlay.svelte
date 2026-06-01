<script lang="ts">
	let { scanlines = true, flicker = false }: { scanlines?: boolean; flicker?: boolean } = $props();
</script>

<div class="fx" aria-hidden="true"></div>
<div class="fx-flicker" aria-hidden="true"></div>
