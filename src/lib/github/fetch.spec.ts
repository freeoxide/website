import { describe, it, expect } from 'vitest';
import { ghFetchList } from './fetch';

type Page = { body?: unknown; link?: string | null; ok?: boolean };

/**
 * Mock fetch that returns a scripted sequence of pages AND records every URL it
 * was called with — so tests can assert the page-2 URL is well-formed (catches
 * the "doubled origin" regression where an absolute rel="next" URL gets the API
 * origin prepended again).
 */
function mockFetch(pages: Page[]): { fetch: typeof fetch; urls: string[] } {
	let i = 0;
	const urls: string[] = [];
	const fn = async (url: string) => {
		urls.push(url);
		const p = pages[Math.min(i, pages.length - 1)];
		i++;
		return {
			ok: p.ok ?? true,
			async json() {
				return p.body;
			},
			headers: {
				get: (k: string) => (k.toLowerCase() === 'link' ? (p.link ?? null) : null),
			},
		};
	};
	return { fetch: fn as unknown as typeof fetch, urls };
}

// GitHub returns ABSOLUTE URLs in its Link rel="next" header — this is the shape
// that previously broke pagination by getting the API origin prepended again.
const ABS_NEXT = 'https://api.github.com/repositories/123/commits?per_page=100&page=2';

describe('ghFetchList pagination', () => {
	it('follows rel="next" and accumulates all pages', async () => {
		const { fetch: fetchFn } = mockFetch([
			{ body: Array.from({ length: 100 }, (_, k) => ({ sha: `a${k}` })), link: `<${ABS_NEXT}>; rel="next"` },
			{ body: Array.from({ length: 82 }, (_, k) => ({ sha: `b${k}` })), link: null },
		]);
		const r = await ghFetchList<{ sha: string }>(fetchFn, '/repos/x/commits?per_page=100', undefined, new AbortController().signal, 5);
		expect(r.data?.length).toBe(182);
		expect(r.truncated).toBe(false);
	});

	it('REGRESSION: page-2 URL is the absolute Link URL verbatim, not origin-doubled', async () => {
		const { fetch: fetchFn, urls } = mockFetch([
			{ body: [{ sha: '1' }], link: `<${ABS_NEXT}>; rel="next"` },
			{ body: [{ sha: '2' }], link: null },
		]);
		await ghFetchList<{ sha: string }>(fetchFn, '/repos/x/commits?per_page=100', undefined, new AbortController().signal, 5);
		expect(urls).toHaveLength(2);
		expect(urls[0]).toBe('https://api.github.com/repos/x/commits?per_page=100'); // relative → prefixed
		expect(urls[1]).toBe(ABS_NEXT); // absolute → used as-is, NOT doubled
		expect(urls[1].match(/https:\/\/api\.github\.comhttps/g)).toBeNull(); // no doubled origin
	});

	it('returns a single page as-is when there is no next', async () => {
		const { fetch: fetchFn } = mockFetch([{ body: [{ sha: '1' }, { sha: '2' }], link: null }]);
		const r = await ghFetchList<{ sha: string }>(fetchFn, '/first', undefined, new AbortController().signal, 5);
		expect(r.data?.length).toBe(2);
		expect(r.truncated).toBe(false);
	});

	it('flags truncation when the page cap is hit but more pages exist', async () => {
		const { fetch: fetchFn } = mockFetch([{ body: [{ sha: '1' }], link: `<${ABS_NEXT}>; rel="next"` }]);
		const r = await ghFetchList<{ sha: string }>(fetchFn, '/first', undefined, new AbortController().signal, 2);
		expect(r.data?.length).toBe(2); // stopped at the cap
		expect(r.truncated).toBe(true);
	});

	it('flags truncation when a mid-stream page fails (rate limit / timeout)', async () => {
		const { fetch: fetchFn } = mockFetch([
			{ body: Array.from({ length: 100 }, (_, k) => ({ sha: `a${k}` })), link: `<${ABS_NEXT}>; rel="next"` },
			{ ok: false }, // page 2 403s
		]);
		const r = await ghFetchList<{ sha: string }>(fetchFn, '/first', undefined, new AbortController().signal, 5);
		expect(r.data?.length).toBe(100); // only page 1
		expect(r.truncated).toBe(true); // disclosed as incomplete
	});

	it('returns null data when the very first page fails', async () => {
		const { fetch: fetchFn } = mockFetch([{ ok: false }]);
		const r = await ghFetchList<{ sha: string }>(fetchFn, '/first', undefined, new AbortController().signal, 5);
		expect(r.data).toBeNull();
		expect(r.truncated).toBe(false);
	});

	it('stops on an unexpected (non-array) body without crashing', async () => {
		const { fetch: fetchFn } = mockFetch([{ body: { message: 'maintenance' }, link: `<${ABS_NEXT}>; rel="next"` }]);
		const r = await ghFetchList<{ sha: string }>(fetchFn, '/first', undefined, new AbortController().signal, 5);
		expect(r.data).toBeNull();
		expect(r.truncated).toBe(false);
	});
});
