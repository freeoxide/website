import { fetchInitiativeData } from '$lib/github/fetch';

// Explicit even though +layout.ts sets prerender globally — documents intent:
// this route is fully prerendered at build time, no server runtime.
export const prerender = true;

/**
 * Server-only load: runs ONCE at build time (prerender) in Node, with
 * process.env access. It never re-runs in a visitor's browser — client-side
 * navigation loads the prerendered data JSON — so there are no per-visitor
 * GitHub calls. An optional GITHUB_TOKEN (raise the unauth 60/hr ceiling) is
 * read server-side only and never serialized into the output.
 */
export async function load({ fetch }) {
	const token = typeof process !== 'undefined' && process.env ? process.env.GITHUB_TOKEN : undefined;
	return await fetchInitiativeData(fetch, { token });
}
