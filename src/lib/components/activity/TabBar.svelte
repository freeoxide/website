<script lang="ts" module>
	export type TabId = 'recent' | 'registry' | 'releases';
</script>

<script lang="ts">
	import { cn } from '$lib/utils.js';

	let {
		tabs,
		active = $bindable<TabId>('recent'),
	}: {
		tabs: { id: TabId; label: string; count?: number }[];
		active: TabId;
	} = $props();

	// WAI-ARIA tabs keyboard pattern: Arrow/Home/End move between tabs and
	// focus follows (roving tabindex).
	function onKeydown(e: KeyboardEvent) {
		const ids = tabs.map((t) => t.id);
		const i = ids.indexOf(active);
		let next: number | null = null;
		switch (e.key) {
			case 'ArrowRight': next = (i + 1) % ids.length; break;
			case 'ArrowLeft': next = (i - 1 + ids.length) % ids.length; break;
			case 'Home': next = 0; break;
			case 'End': next = ids.length - 1; break;
		}
		if (next === null) return;
		e.preventDefault();
		active = ids[next];
		queueMicrotask(() => document.getElementById(`activity-tab-${active}`)?.focus());
	}
</script>

<!-- svelte-ignore a11y_interactive_supports_focus -->
<!-- tablist is not focusable by design — focus roves between the tab buttons -->
<div
	class="flex flex-wrap items-center gap-1.5"
	role="tablist"
	aria-label="Activity views"
	onkeydown={onKeydown}
>
	{#each tabs as t (t.id)}
		<button
			id={`activity-tab-${t.id}`}
			role="tab"
			aria-selected={active === t.id}
			aria-controls={`activity-panel-${t.id}`}
			tabindex={active === t.id ? 0 : -1}
			onclick={() => (active = t.id)}
			class={cn(
				'px-3 py-1 rounded-md text-[13px] font-mono border transition-colors',
				active === t.id
					? 'bg-card text-primary border-primary'
					: 'text-muted-foreground border-border hover:text-primary hover:border-primary',
			)}
		>
			{t.label}{#if t.count != null}<span class="text-crt-faint ml-1.5">{t.count}</span>{/if}
		</button>
	{/each}
</div>
