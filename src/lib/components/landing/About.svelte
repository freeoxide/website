<script lang="ts">
	import { SectionCmd } from '$lib/components/ui/section-cmd';
	import { SectionHeading } from '$lib/components/ui/section-heading';
</script>

<section id="about" data-screen-label="about" class="py-14 border-b border-dashed border-border last:border-b-0">
	<SectionCmd command="freeoxide" flag=" --who" />
	<SectionHeading
		text="Who's building this"
		sub="One person. All of it."
	/>
	<div class="max-w-[68ch] reveal">
		<p class="text-foreground m-0 mb-4.5 text-pretty">
			<span class="text-foreground font-semibold">hmziq</span>
			<span class="text-muted-foreground"> — writing Rust, shipping tools, and open-sourcing the results. Every project under FreeOxide is built, tested, and audited by me.</span>
		</p>
	</div>
	<div class="flex flex-wrap gap-3 reveal">
		<a href="https://hmziq.rs?ref=freeoxide.com" target="_blank" rel="noopener" class="text-muted-foreground text-[13.5px] no-underline hover:text-primary">hmziq.rs ↗</a>
		<a href="https://hmziq.xyz?ref=freeoxide.com" target="_blank" rel="noopener" class="text-muted-foreground text-[13.5px] no-underline hover:text-primary">hmziq.xyz ↗</a>
		<a href="https://github.com/hmziqrs?ref=freeoxide.com" target="_blank" rel="noopener" class="text-muted-foreground text-[13.5px] no-underline hover:text-primary">github ↗</a>
		<a href="https://x.com/hmziqrs?ref=freeoxide.com" target="_blank" rel="noopener" class="text-muted-foreground text-[13.5px] no-underline hover:text-primary">x ↗</a>
	</div>
</section>
