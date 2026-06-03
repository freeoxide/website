<script lang="ts">
	import { SectionCmd } from '$lib/components/ui/section-cmd';
	import { SectionHeading } from '$lib/components/ui/section-heading';
	import { StepItem } from '$lib/components/ui/step-item';
	import { Button } from '$lib/components/ui/button';
</script>

<section id="contribute" data-screen-label="contribute" class="py-14 border-b border-dashed border-border last:border-b-0">
	<SectionCmd command="freeoxide contribute" output="prs welcome" />
	<SectionHeading
		text="Get involved"
		sub="It's one person right now, which means a single good PR genuinely moves things. Here's where to start."
	/>
	<div class="grid gap-2.5 max-w-[72ch]">
		<div class="reveal"><StepItem number="01" title="Browse what exists." description="Start in the project list. Read the code and the tests. Open an issue the moment something smells off." /></div>
		<div class="reveal"><StepItem number="02" title="Raise the bar." description="The best PRs fix a bug, add a missing test, or simplify something. More code isn't the goal." /></div>
		<div class="reveal"><StepItem number="03" title="Submit a project." description="Built something to this standard? Propose it. It runs through the same audit passes before it carries the freeoxide name." /></div>
		<div class="reveal"><StepItem number="04" title="Build in public with me." description="Most of this happens in the open. Follow along and push back on decisions. Or suggest the next tool worth building." /></div>
	</div>
	<div class="mt-6 flex gap-3 flex-wrap items-center reveal">
		<Button variant="default" size="lg" href="#projects">browse the projects →</Button>
		<Button variant="outline" size="lg" href="https://github.com/freeoxide?ref=freeoxide.com" target="_blank" rel="noopener">github ↗</Button>
		<span class="text-crt-faint before:content-['# '] m-0">good first issues are tagged.</span>
	</div>
</section>
