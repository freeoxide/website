<script lang="ts">
	import { SectionCmd } from '$lib/components/ui/section-cmd';
	import { AsciiRule } from '$lib/components/ui/ascii-rule';
	import { SectionHeading } from '$lib/components/ui/section-heading';
	import { CheckItem } from '$lib/components/ui/check-item';
</script>

<section id="standards" data-screen-label="standards" class="py-14 border-b border-dashed border-border last:border-b-0">
	<SectionCmd command="freeoxide" flag=" --about" />
	<div class="reveal"><AsciiRule /></div>
	<div class="max-w-[68ch] reveal">
		<p class="text-foreground m-0 mb-[18px] text-pretty">
			The software I depend on should be open, and it should hold up under real use.
			<span class="text-muted-foreground">I build Rust tools for myself first, then release them because someone else was probably looking for the same thing.</span>
		</p>
	</div>
	<SectionHeading
		text="Before anything ships"
		sub="Every box below has to be true. No shortcuts."
	/>
	<div class="grid gap-0.5 max-w-[76ch]">
		<div class="reveal"><CheckItem title="Real test coverage." description="Paths exercised, edge cases pinned. The coverage number follows from actually testing, not the other way around. >90% is where it starts." /></div>
		<div class="reveal"><CheckItem title="Multi-pass AI audits." description="Every project gets 4 to 5 independent audit passes. Each pass is told to find something the last one missed. They usually do." /></div>
		<div class="reveal"><CheckItem title="Architecture review." description="Module boundaries and structure get the same treatment. Reviewed repeatedly until the layout stops shifting." /></div>
		<div class="reveal"><CheckItem title="Performance passes." description="Dedicated runs to find hot paths and allocations worth cutting. Measured, not guessed." /></div>
		<div class="reveal"><CheckItem title="Idiomatic & documented." description="Clippy-clean with sensible defaults. The public API should be readable without digging into internals. If something needs a comment to use safely, it gets one." /></div>
		<div class="reveal"><CheckItem title="Open by default." description="Dual-licensed MIT and Apache-2.0 with readable git history. No hidden dependencies. Auditable from top to bottom." /></div>
	</div>
</section>
