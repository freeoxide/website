<script lang="ts">
	import { SectionCmd } from '$lib/components/ui/section-cmd';
	import { SectionHeading } from '$lib/components/ui/section-heading';
	import { CheckItem } from '$lib/components/ui/check-item';
</script>

<section id="standards" data-screen-label="standards" class="py-14 border-b border-dashed border-border last:border-b-0">
	<SectionCmd command="freeoxide standards" flag=" --list" output="6 checks" />
	<SectionHeading
		text="What makes a project qualify"
		sub="A project doesn't carry the freeoxide name until every box below is true. No exceptions, no &quot;we'll fix it later.&quot;"
	/>
	<div class="grid gap-0.5 max-w-[76ch]">
		<div class="reveal"><CheckItem title="Real test coverage." description="Not a number to game — paths exercised, edge cases pinned. >90% is the floor, not the goal." /></div>
		<div class="reveal"><CheckItem title="Multi-pass AI audits." description="Every project gets 4–5 independent audit passes. Each pass is told to find something the last one missed — and usually does." /></div>
		<div class="reveal"><CheckItem title="Architecture review." description="Module boundaries and structure reviewed the same way. Pass after pass, until the shape stops changing." /></div>
		<div class="reveal"><CheckItem title="Performance passes." description="Dedicated runs to find hot paths and allocations worth removing. Measured, not guessed." /></div>
		<div class="reveal"><CheckItem title="Idiomatic & documented." description="Clippy-clean, sensible defaults, a public API you can read. If it needs a comment to be safe, it gets one." /></div>
		<div class="reveal"><CheckItem title="Open by default." description="MIT / Apache-2.0, readable git history, no surprise dependencies. Auditable all the way down." /></div>
	</div>
</section>
