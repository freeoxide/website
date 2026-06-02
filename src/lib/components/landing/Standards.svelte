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
		<p class="text-foreground m-0 mb-4.5 text-pretty">
			I handle architecture myself. Folder structure, module boundaries, how things connect.
			<span class="text-muted-foreground">For audits and testing I run AI through multiple sessions. Same model, different results each time. Five rounds is the sweet spot. After that you're burning tokens for diminishing returns.</span>
		</p>
	</div>
	<SectionHeading text="How I work" />
	<div class="grid gap-0.5 max-w-[76ch]">
		<div class="reveal"><CheckItem title="Architecture by experience." description="Folder structure, module boundaries, and layout decided upfront from what I know works." /></div>
		<div class="reveal"><CheckItem title="Five AI audit passes." description="Same model, different sessions. Each finds things the last missed. After five, the returns thin out." /></div>
		<div class="reveal"><CheckItem title="Five testing rounds." description="Same approach. AI writes tests, I review, next session catches what the previous one missed." /></div>
		<div class="reveal"><CheckItem title="Idiomatic & documented." description="Clippy-clean with sensible defaults. If something needs a comment to use safely, it gets one." /></div>
		<div class="reveal"><CheckItem title="Open by default." description="MIT / Apache-2.0, readable git history, no hidden dependencies." /></div>
	</div>
</section>
