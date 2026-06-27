<script lang="ts">
	import { onMount } from 'svelte';

	let { iso, count }: { iso: string; count: number } = $props();

	let relative = $state<string | null>(null);

	const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
	const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

	// Static, UTC-derived label baked at build — identical in dev and CI.
	const label = (() => {
		const d = new Date(iso + 'T00:00:00Z');
		return `${WEEKDAYS[d.getUTCDay()]} ${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
	})();

	// Relative label is computed client-side only — baking "today" into prerendered
	// HTML would rot it between deploys.
	onMount(() => {
		const now = new Date();
		const day = new Date(iso + 'T00:00:00Z');
		const diff = Math.floor(
			(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()) - day.getTime()) / 86_400_000,
		);
		relative =
			diff <= 0 ? 'today'
			: diff === 1 ? 'yesterday'
			: diff < 7 ? `${diff}d ago`
			: diff < 30 ? `${Math.floor(diff / 7)}w ago`
			: `${Math.floor(diff / 30)}mo ago`;
	});
</script>

<div class="text-crt-faint text-[12.5px] mt-5 mb-1.5 select-none whitespace-pre-wrap break-words">
	── <span class="text-muted-foreground">{label}</span>{#if relative}<span> · {relative}</span>{/if} · {count}
	{count === 1 ? 'event' : 'events'} ──
</div>
