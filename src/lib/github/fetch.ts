/**
 * Build-time GitHub fetch for the freeoxide initiative activity page.
 *
 * Runs only on the server during prerender (called from +page.server.ts), never
 * in a visitor's browser — so there is one set of requests per deploy, baked
 * into the static HTML, and no per-visitor rate limiting.
 *
 * Hard contract: this NEVER throws. Any failure (rate limit, timeout, network,
 * bad JSON, a 404 on a repo, a 200 with an unexpected body shape) degrades
 * gracefully — status:'error' if nothing loaded, or a partial feed with
 * repoErrors/truncated surfaced — so a GitHub outage at build time can never
 * fail the whole site deploy.
 */
import {
	INITIATIVE_REPOS,
	INITIATIVE_WINDOW_DAYS,
	commitsToDayEvents,
	pullToEvent,
	releaseToEvent,
	issueToEvent,
	commentToEvent,
	repoToRow,
	groupIntoDays,
	type ActivityData,
	type DayEvent,
	type RepoRow,
	type RawCommit,
	type RawPull,
	type RawRelease,
	type RawIssue,
	type RawIssueComment,
	type RawRepo,
} from './initiative';

const API = 'https://api.github.com';
const TIMEOUT_MS = 12_000; // per repo — bounds that repo's calls
const COMMIT_PAGE = 100;
const PULL_PAGE = 100;
const RELEASE_PAGE = 50;
// Page caps per endpoint. Bounded so a hyper-active repo can't blow the
// rate budget — but generous enough that a normal repo's full window is
// captured exactly (gpui-starter's ~180 commits/90d fit in 2 pages).
const COMMIT_MAX_PAGES = 5;
const PULL_MAX_PAGES = 2;
const RELEASE_MAX_PAGES = 2;
const ISSUE_MAX_PAGES = 2;
const COMMENT_MAX_PAGES = 2;

export interface FetchInitiativeOpts {
	/** Optional, build-time only. Raises the unauth 60/hr ceiling to 5000/hr. */
	token?: string;
	windowDays?: number;
}

/** Pull the `rel="next"` URL out of a GitHub Link header, or null. */
function parseNextLink(link: string | null): string | null {
	if (!link) return null;
	for (const part of link.split(',')) {
		const m = part.match(/<([^>]+)>;\s*rel="next"/);
		if (m) return m[1];
	}
	return null;
}

/**
 * One guarded GitHub GET. Returns {body, next} on success, or null on any
 * failure (never throws). `next` is the parsed rel="next" URL for pagination.
 */
async function rawFetch(
	fetchFn: typeof fetch,
	path: string,
	token: string | undefined,
	signal: AbortSignal,
): Promise<{ body: unknown; next: string | null } | null> {
	try {
		const headers: Record<string, string> = {
			// GitHub REQUIRES a User-Agent — a bare request is 403'd.
			'User-Agent': 'freeoxide-activity-build',
			Accept: 'application/vnd.github+json',
		};
		if (token) headers.Authorization = `Bearer ${token}`;
		// `path` is a relative API path on page 1, but GitHub's Link rel="next"
		// returns an ABSOLUTE URL for page 2+ — don't double the origin.
		const url = path.startsWith('http') ? path : `${API}${path}`;
		const res = await fetchFn(url, { headers, signal });
		// Gate before .json(): a 403 rate-limit body is valid JSON with the wrong
		// shape — we must not parse it into an events array.
		if (!res.ok) return null;
		return { body: await res.json(), next: parseNextLink(res.headers.get('link')) };
	} catch {
		// network error, AbortError (timeout), or bad JSON — caller treats as miss
		return null;
	}
}

/** Single-object GET (repo metadata). Returns parsed JSON or null (never throws). */
async function ghFetch<T>(
	fetchFn: typeof fetch,
	path: string,
	token: string | undefined,
	signal: AbortSignal,
): Promise<T | null> {
	const r = await rawFetch(fetchFn, path, token, signal);
	return r ? (r.body as T) : null;
}

/**
 * Paginated list GET. Follows the Link rel="next" chain up to maxPages,
 * accumulating results. Returns {data, truncated}; data is null only if the
 * first page failed. truncated=true means more pages existed than we fetched
 * (hit the cap) — callers should surface that those counts are a floor.
 */
export async function ghFetchList<T>(
	fetchFn: typeof fetch,
	firstPath: string,
	token: string | undefined,
	signal: AbortSignal,
	maxPages: number,
): Promise<{ data: T[] | null; truncated: boolean }> {
	const out: T[] = [];
	let path: string | null = firstPath;
	let pages = 0;
	while (path && pages < maxPages) {
		const r = await rawFetch(fetchFn, path, token, signal);
		if (!r) break; // failure → stop; keep what we have so far (or null if page 1)
		if (!Array.isArray(r.body)) break; // unexpected shape → stop
		out.push(...(r.body as T[]));
		pages++;
		path = r.next;
	}
	// If `path` is still set we stopped before consuming the whole list — either
	// we hit the page cap OR a mid-stream page failed (rate limit, timeout). In
	// both cases the totals are a floor, not exact, and must be disclosed.
	const truncated = pages > 0 && path !== null;
	return { data: pages > 0 ? out : null, truncated };
}

interface RepoResult {
	full: string;
	row: RepoRow | null; // null only if metadata failed (repo unrenderable)
	events: DayEvent[]; // commits + prs + issues + comments + in-window releases
	releases: DayEvent[]; // every fetched release (for the releases tab)
	prsOpened: number;
	prsMerged: number;
	issues: number;
	comments: number;
	truncated: boolean; // a list endpoint hit its page cap → counts are a floor
}

/** Fetch + normalize a single repo. Never throws. */
async function loadRepo(
	fetchFn: typeof fetch,
	owner: string,
	repo: string,
	token: string | undefined,
	windowSince: string,
): Promise<RepoResult> {
	const full = `${owner}/${repo}`;
	const empty: RepoResult = { full, row: null, events: [], releases: [], prsOpened: 0, prsMerged: 0, issues: 0, comments: 0, truncated: false };

	const ctrl = new AbortController();
	const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
	let meta: RawRepo | null = null;
	let commitsR: { data: RawCommit[] | null; truncated: boolean } = { data: null, truncated: false };
	let pullsR: { data: RawPull[] | null; truncated: boolean } = { data: null, truncated: false };
	let releasesR: { data: RawRelease[] | null; truncated: boolean } = { data: null, truncated: false };
	let issuesR: { data: RawIssue[] | null; truncated: boolean } = { data: null, truncated: false };
	let commentsR: { data: RawIssueComment[] | null; truncated: boolean } = { data: null, truncated: false };
	try {
		[meta, commitsR, pullsR, releasesR, issuesR, commentsR] = await Promise.all([
			ghFetch<RawRepo | null>(fetchFn, `/repos/${owner}/${repo}`, token, ctrl.signal),
			ghFetchList<RawCommit>(fetchFn, `/repos/${owner}/${repo}/commits?since=${windowSince}&per_page=${COMMIT_PAGE}`, token, ctrl.signal, COMMIT_MAX_PAGES),
			ghFetchList<RawPull>(fetchFn, `/repos/${owner}/${repo}/pulls?state=all&sort=created&direction=desc&per_page=${PULL_PAGE}`, token, ctrl.signal, PULL_MAX_PAGES),
			ghFetchList<RawRelease>(fetchFn, `/repos/${owner}/${repo}/releases?per_page=${RELEASE_PAGE}`, token, ctrl.signal, RELEASE_MAX_PAGES),
			ghFetchList<RawIssue>(fetchFn, `/repos/${owner}/${repo}/issues?state=all&sort=created&direction=desc&per_page=100`, token, ctrl.signal, ISSUE_MAX_PAGES),
			ghFetchList<RawIssueComment>(fetchFn, `/repos/${owner}/${repo}/issues/comments?since=${windowSince}&per_page=100`, token, ctrl.signal, COMMENT_MAX_PAGES),
		]);
	} catch {
		return empty; // belt-and-suspenders (rawFetch already swallows)
	} finally {
		clearTimeout(timer);
	}

	// Validate shape — a 200 with a non-object/non-array body (error envelope,
	// maintenance page) must not reach downstream code.
	if (!meta || typeof meta !== 'object' || typeof meta.full_name !== 'string') return empty;

	const row = repoToRow(meta);
	const branch = meta.default_branch || 'main';
	const events: DayEvent[] = [];
	const allReleases: DayEvent[] = [];
	let prsOpened = 0;
	let prsMerged = 0;
	let issues = 0;
	let comments = 0;

	if (commitsR.data) events.push(...commitsToDayEvents(commitsR.data, full, row.href, branch));

	if (pullsR.data) {
		for (const p of pullsR.data) {
			// Stats are counted off the raw timestamps (a PR opened AND merged
			// in-window counts as both), independent of the single feed event.
			if (p.created_at && p.created_at >= windowSince) prsOpened++;
			if (p.merged_at && p.merged_at >= windowSince) prsMerged++;
			const ev = pullToEvent(p, windowSince, full, row.href);
			if (ev) events.push(ev);
		}
	}

	if (releasesR.data) {
		for (const r of releasesR.data) {
			const ev = releaseToEvent(r, full, row.href);
			if (!ev) continue;
			allReleases.push(ev);
			if (ev.ts >= windowSince) events.push(ev);
		}
	}

	if (issuesR.data) {
		for (const i of issuesR.data) {
			const ev = issueToEvent(i, windowSince, full, row.href);
			if (ev) {
				events.push(ev);
				issues++;
			}
		}
	}

	if (commentsR.data) {
		for (const c of commentsR.data) {
			const ev = commentToEvent(c, windowSince, full, row.href);
			if (ev) {
				events.push(ev);
				comments++;
			}
		}
	}

	const truncated =
		commitsR.truncated || pullsR.truncated || releasesR.truncated || issuesR.truncated || commentsR.truncated;

	return { full, row, events, releases: allReleases, prsOpened, prsMerged, issues, comments, truncated };
}

/**
 * Fetch every initiative repo's activity concurrently and normalize it.
 * Never throws. status is 'error' if no repos loaded, 'empty' if repos loaded
 * but nothing happened in the window, else 'ok'.
 */
export async function fetchInitiativeData(
	fetchFn: typeof fetch,
	opts: FetchInitiativeOpts = {},
): Promise<ActivityData> {
	const token = opts.token;
	const windowDays = opts.windowDays ?? INITIATIVE_WINDOW_DAYS;
	// Whole-second resolution (drop ms) so the `>=` string comparisons against
	// GitHub's second-resolution timestamps are chronologically exact — otherwise
	// the boundary's '.mmm' sorts before the event's 'Z' and a sub-second-old
	// event squeaks in.
	const windowSince = new Date(Date.now() - windowDays * 86_400_000).toISOString().slice(0, 19) + 'Z';
	const renderedAt = new Date().toISOString();

	// Fetch all repos concurrently — one slow/hung repo can only ever cost its
	// own 12s timeout, never N × 12s.
	const results = await Promise.all(
		INITIATIVE_REPOS.map(({ owner, repo }) => loadRepo(fetchFn, owner, repo, token, windowSince)),
	);

	const allEvents: DayEvent[] = [];
	const repos: RepoRow[] = [];
	const allReleases: DayEvent[] = [];
	const repoErrors: string[] = [];
	const truncated: string[] = [];
	let prsOpened = 0;
	let prsMerged = 0;
	let issues = 0;
	let comments = 0;

	for (const r of results) {
		if (!r.row) {
			repoErrors.push(r.full); // metadata missing → can't render the repo
			continue;
		}
		repos.push(r.row);
		allEvents.push(...r.events);
		allReleases.push(...r.releases);
		prsOpened += r.prsOpened;
		prsMerged += r.prsMerged;
		issues += r.issues;
		comments += r.comments;
		if (r.truncated) truncated.push(r.full);
	}

	allReleases.sort((a, b) => b.ts.localeCompare(a.ts));
	const days = groupIntoDays(allEvents);

	const commits = days.reduce(
		(n, d) => n + d.events.reduce((m, e) => m + (e.kind === 'commits' ? e.commitCount ?? 0 : 0), 0),
		0,
	);
	const stars = repos.reduce((n, r) => n + r.stars, 0);
	const releasesInWindow = allReleases.filter((r) => r.ts >= windowSince).length;

	const status: ActivityData['status'] =
		repos.length === 0 ? 'error' : days.length === 0 ? 'empty' : 'ok';

	return {
		status,
		days,
		// registry: most recently pushed first
		repos: repos.sort((a, b) => (b.pushedAt ?? '').localeCompare(a.pushedAt ?? '')),
		releases: allReleases,
		stats: {
			commits,
			prsMerged,
			prsOpened,
			issues,
			comments,
			releases: releasesInWindow,
			repos: repos.length,
			stars,
		},
		windowDays,
		renderedAt,
		repoErrors,
		truncated,
	};
}
