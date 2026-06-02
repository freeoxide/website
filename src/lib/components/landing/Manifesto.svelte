<script lang="ts">
	import { SectionCmd } from '$lib/components/ui/section-cmd';
	import { AsciiRule } from '$lib/components/ui/ascii-rule';
</script>

<section id="manifesto" data-screen-label="manifesto" class="py-14 border-b border-dashed border-border last:border-b-0">
	<SectionCmd command="cat" arg="MANIFESTO.md" output="~/initiative" />
	<div class="reveal"><AsciiRule /></div>
	<div class="max-w-[68ch] reveal">
		<p class="text-foreground m-0 mb-[18px] text-pretty">
			freeoxide is a one-person initiative with a simple bias:
			<span class="text-muted-foreground">software I depend on should be open — and open software should be built like it's load-bearing.</span>
		</p>
		<p class="text-foreground m-0 mb-[18px] text-pretty">
			I build these projects for myself first. The boilerplate I wanted on day one, the CLI I actually needed, the tools I couldn't find. Then I open them, because someone else probably needed them too.
		</p>
		<p class="text-foreground m-0 mb-[18px] text-pretty">
			Rust is the floor, not the headline. The point isn't the language — it's the discipline. Code that's tested until it's boring, structured so the next person can read it, and audited pass after pass until there's nothing left to surprise you.
		</p>
		<p class="text-muted-foreground mt-6">
			— <span class="text-primary">maintainer</span>, freeoxide
		</p>
	</div>
</section>
