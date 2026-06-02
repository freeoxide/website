<script lang="ts">
	import { SectionCmd } from '$lib/components/ui/section-cmd';
	import { AsciiRule } from '$lib/components/ui/ascii-rule';
</script>

<section id="manifesto" data-screen-label="manifesto" class="py-14 border-b border-dashed border-border last:border-b-0">
	<SectionCmd command="cat" arg="MANIFESTO.md" output="~/initiative" />
	<div class="reveal"><AsciiRule /></div>
	<div class="max-w-[68ch] reveal">
		<p class="text-foreground m-0 mb-[18px] text-pretty">
			The software I depend on should be open.
			<span class="text-muted-foreground">And open software should be built like it's load-bearing.</span>
		</p>
		<p class="text-foreground m-0 mb-[18px] text-pretty">
			I build these projects for myself first. The setup I wanted on day one. The tool I kept reaching for and not finding. Then I open them, because someone else probably needed them too.
		</p>
		<p class="text-foreground m-0 mb-[18px] text-pretty">
			Rust is the floor, not the headline. The language matters less than the habit of writing code that holds up. Test it until the results get boring. Structure it so the next person can follow along. Audit it until the findings stop.
		</p>
		<p class="text-muted-foreground mt-6">
			// <span class="text-primary">maintainer</span>, freeoxide
		</p>
	</div>
</section>
