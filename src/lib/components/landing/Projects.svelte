<script lang="ts">
	import { SectionCmd } from '$lib/components/ui/section-cmd';
	import { SectionHeading } from '$lib/components/ui/section-heading';
	import { ProjectCard } from '$lib/components/ui/project-card';
</script>

<section id="projects" data-screen-label="projects" class="py-14 border-b border-dashed border-border last:border-b-0">
	<SectionCmd command="freeoxide projects" output="1 shipped · 2 in progress" />
	<SectionHeading
		text="The projects"
		sub="Small in number, deliberately. Each one ships only once it clears every standard above."
	/>
	<div class="grid gap-3">
		<div class="reveal">
			<ProjectCard
				name="gpui-boilerplate"
				href="https://github.com"
				target="_blank"
				rel="noopener"
				status="shipped"
				statusLabel="shipped"
				description="A batteries-included starting point for native GPUI apps — the scaffold I wanted on day one."
				meta={[
					{ label: 'lang', value: 'Rust' },
					{ label: 'stack', value: 'GPUI' },
					{ label: 'license', value: 'MIT / Apache-2.0' },
				]}
			/>
		</div>
		<div class="reveal">
			<ProjectCard
				name="vps-harden"
				href="#contribute"
				status="wip"
				statusLabel="in&nbsp;progress"
				description="Harden a fresh VPS with one auditable command. Sensible, reversible, opinionated defaults."
				meta={[
					{ label: 'lang', value: 'Rust' },
					{ label: 'type', value: 'CLI' },
					{ label: 'status', value: 'hardening & testing' },
				]}
			/>
		</div>
		<div class="reveal">
			<ProjectCard
				name="agent-config"
				href="#contribute"
				status="planned"
				statusLabel="planned"
				description="A native desktop app to see and manage your AI agents' configuration and usage — built on gpui-boilerplate."
				meta={[
					{ label: 'lang', value: 'Rust' },
					{ label: 'stack', value: 'GPUI · desktop' },
					{ label: 'status', value: 'designing' },
				]}
			/>
		</div>
	</div>
</section>
