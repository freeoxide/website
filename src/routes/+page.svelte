<script lang="ts">
	import { Button } from "$lib/components/ui/button/index.js";
	import { Separator } from "$lib/components/ui/separator/index.js";
</script>

<svelte:head>
	<title>FreeOxide</title>
</svelte:head>

<div class="flex min-h-screen flex-col">
	<!-- Header -->
	<header class="border-b bg-background">
		<div class="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
			<a href="/" class="text-lg font-bold tracking-tight">FreeOxide</a>
			<nav class="flex items-center gap-2">
				<Button variant="ghost" size="sm">Docs</Button>
				<Button variant="ghost" size="sm">GitHub</Button>
				<Button size="sm">Get Started</Button>
			</nav>
		</div>
	</header>

	<!-- Main -->
	<main class="flex flex-1 flex-col items-center justify-center gap-6 px-4 text-center">
		<h1 class="text-4xl font-bold tracking-tight sm:text-5xl">Welcome to FreeOxide</h1>
		<p class="max-w-lg text-lg text-muted-foreground">
			An open-source, self-hosted platform for deploying your applications with ease.
		</p>
		<div class="flex gap-3">
			<Button size="lg">Deploy Now</Button>
			<Button variant="outline" size="lg">Read the Docs</Button>
		</div>
	</main>

	<!-- Footer -->
	<Separator />
	<footer class="py-6 text-center text-sm text-muted-foreground">
		<p>&copy; 2025 FreeOxide. Open source under MIT License.</p>
	</footer>
</div>
