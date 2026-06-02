<script lang="ts">
	import { SectionCmd } from '$lib/components/ui/section-cmd';
	import { SectionHeading } from '$lib/components/ui/section-heading';
	import { TerminalPanel } from '$lib/components/ui/terminal-panel';
	import { LadderRung } from '$lib/components/ui/ladder-rung';
</script>

<section id="testing" data-screen-label="testing" class="py-14 border-b border-dashed border-border last:border-b-0">
	<SectionCmd command="freeoxide test" flag=" --explain" output="manual + ai" />
	<SectionHeading
		text="How the testing actually works"
		sub="Two loops running against each other: a human looking for the obvious failures, and AI grinding for the ones a human would never think to write."
	/>

	<div class="grid grid-cols-1 sm:grid-cols-2 gap-[18px] max-[760px]:grid-cols-1">
		<TerminalPanel title="manual review" class="reveal">
			<p class="m-0 mb-3 text-muted-foreground"><span class="text-foreground">Read every line.</span> Run it like a user would. Then run it like an attacker would.</p>
			<p class="m-0 text-muted-foreground">The boring failures get found by hand: bad input, empty state, the unhappy path, the thing that only breaks the third time.</p>
		</TerminalPanel>
		<TerminalPanel title="ai-assisted" class="reveal">
			<p class="m-0 mb-3 text-muted-foreground"><span class="text-foreground">AI writes tests in rounds, 5 of them.</span> Each round is asked for the cases the last one missed.</p>
			<p class="m-0 text-muted-foreground">Different edge cases, different inputs, different ways to break it. It's slower on purpose. That's the point.</p>
		</TerminalPanel>
	</div>

	<div class="grid gap-[7px] mt-6 reveal" aria-label="a typical edge-case run">
		<LadderRung number="01" label="baseline suite" finding="happy paths + the obvious errors" />
		<LadderRung number="02" label="round two" finding="<b class='text-secondary font-semibold'>+</b> boundary values, empty &amp; max inputs" />
		<LadderRung number="03" label="round three" finding="<b class='text-secondary font-semibold'>+</b> unicode, encoding, locale edge cases" />
		<LadderRung number="04" label="round four" finding="<b class='text-secondary font-semibold'>+</b> concurrency, ordering &amp; race conditions" />
		<LadderRung number="05" label="round five" finding="<b class='text-secondary font-semibold'>+</b> the weird ones you'd never write by hand" />
	</div>
	<p class="text-crt-faint before:content-['# '] mt-4 m-0">slower on purpose. every round finds something new.</p>
</section>
