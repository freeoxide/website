/**
 * FreeOxide initiative activity — pure data layer.
 *
 * Config + types + normalizers. No network and no process.env in here, so the
 * normalizers are fully unit-testable and isomorphic. The build-time network
 * glue lives in ./fetch.ts; the route calls both from +page.server.ts.
 *
 * Data model note: we fetch per-repo commits / pulls / releases (NOT the noisy
 * /users/:user/events firehose). The public events endpoint strips commit
 * counts and messages, but the per-repo endpoints return them — so the feed
 * gets real commit data with no token required, scoped exactly to the
 * initiative repos.
 */

/** Repos that constitute the freeoxide initiative. Grow this as the initiative does. */
export const INITIATIVE_REPOS = [
	{ owner: 'hmziqrs', repo: 'gpui-starter' },
	{ owner: 'hmziqrs', repo: 'gpui-query' },
	{ owner: 'freeoxide', repo: 'website' },
	{ owner: 'freeoxide', repo: 'pi-door-security' },
	{ owner: 'freeoxide', repo: 'gpui-form' },
] as const;

export const INITIATIVE_WINDOW_DAYS = 365;

const REF = 'ref=freeoxide.com';

/** Append the site's ref tag to a GitHub URL (matches the rest of freeoxide.com). */
export function withRef(url: string): string {
	if (!url) return url;
	return url.includes('?') ? `${url}&${REF}` : `${url}?${REF}`;
}

/* ----------------------------- raw GitHub shapes ----------------------------- */
/* Only the fields we consume — everything else is dropped at the type boundary. */

export interface RawCommit {
	sha: string;
	commit: {
		message: string;
		author: { name: string; date: string };
		committer?: { name: string; date: string };
	};
	author?: { login: string } | null;
	html_url: string;
}

export interface RawPull {
	number: number;
	title: string;
	state: 'open' | 'closed';
	created_at: string;
	closed_at: string | null;
	merged_at: string | null;
	user?: { login: string } | null;
	html_url: string;
}

export interface RawRelease {
	tag_name: string;
	name: string | null;
	published_at: string | null;
	prerelease: boolean;
	draft: boolean;
	html_url: string;
}

export interface RawIssue {
	number: number;
	title: string;
	state: 'open' | 'closed';
	created_at: string;
	closed_at: string | null;
	user?: { login: string } | null;
	html_url: string;
	/** Present when the "issue" is actually a pull request — filter these out (PRs come from /pulls). */
	pull_request?: unknown | null;
}

export interface RawIssueComment {
	id: number;
	body: string;
	created_at: string;
	user?: { login: string } | null;
	html_url: string;
	/** e.g. https://api.github.com/repos/{owner}/{repo}/issues/42 — the issue/PR number is parsed from here. */
	issue_url: string;
}

export interface RawRepo {
	full_name: string;
	name: string;
	owner: { login: string };
	description: string | null;
	language: string | null;
	stargazers_count: number;
	forks_count: number;
	created_at: string;
	pushed_at: string | null;
	html_url: string;
	fork: boolean;
	default_branch: string;
	archived: boolean;
}

/* ------------------------------ normalized shapes ----------------------------- */

export type EventKind =
	| 'commits'
	| 'pr_opened'
	| 'pr_merged'
	| 'pr_closed'
	| 'release'
	| 'issue_opened'
	| 'issue_closed'
	| 'comment';

export interface DayEvent {
	kind: EventKind;
	ts: string; // ISO UTC — the grouping + sorting anchor
	repo: string; // 'owner/repo'
	repoHref: string;
	// commits (aggregated per repo per day)
	commitCount?: number;
	branch?: string;
	latestMessage?: string;
	author?: string;
	// pull request / release
	number?: number;
	title?: string;
	tag?: string;
	href?: string;
}

export interface Day {
	iso: string; // YYYY-MM-DD (UTC) — stable across dev + CI
	events: DayEvent[];
}

export interface RepoRow {
	fullName: string;
	href: string;
	description: string | null;
	language: string | null;
	stars: number;
	forks: number;
	fork: boolean;
	archived: boolean;
	createdAt: string;
	pushedAt: string | null;
	defaultBranch: string;
}

export interface ActivityStats {
	commits: number; // total commits in window (sum of per-day counts)
	prsMerged: number;
	prsOpened: number;
	issues: number; // issue open/close events within the window
	comments: number; // issue/PR comments within the window
	releases: number; // releases published within the window
	repos: number;
	stars: number; // total ★ across all initiative repos
}

export type ActivityStatus = 'ok' | 'empty' | 'error';

export interface ActivityData {
	status: ActivityStatus;
	days: Day[];
	repos: RepoRow[];
	releases: DayEvent[]; // every fetched release, newest first (for the releases tab)
	stats: ActivityStats;
	windowDays: number;
	renderedAt: string; // ISO build time
	repoErrors: string[]; // repos that failed to load — surfaced in the footer
	truncated: string[]; // repos whose list endpoints hit the page cap — totals are a floor
}

/* --------------------------------- helpers --------------------------------- */

/** Stable UTC day key from an ISO timestamp (no local-TZ drift between dev + CI). */
export function dayKey(isoUtc: string): string {
	return (isoUtc || '').slice(0, 10);
}

/** Prefer committer date (when the commit landed) over author date. */
export function commitDate(c: RawCommit): string {
	return c.commit?.committer?.date ?? c.commit?.author?.date ?? '';
}

/** First line of a commit message, trimmed. */
export function firstLine(msg: string): string {
	return (msg || '').split(/\r?\n/)[0].trim();
}

export function truncate(s: string, n: number): string {
	return s.length > n ? `${s.slice(0, n - 1).trimEnd()}…` : s;
}

/** Owner/repo split for two-tone rendering: `hmziqrs/` faint + `gpui-starter` bold. */
export function repoParts(fullName: string): { owner: string; name: string } {
	const i = fullName.indexOf('/');
	return i === -1 ? { owner: '', name: fullName } : { owner: fullName.slice(0, i), name: fullName.slice(i + 1) };
}

/* ------------------------------ normalizers (pure) ------------------------------ */

/** Collapse a repo's commits into one `commits` event per UTC day (newest commit wins). */
export function commitsToDayEvents(
	commits: RawCommit[],
	repo: string,
	repoHref: string,
	branch: string,
): DayEvent[] {
	const byDay = new Map<string, RawCommit[]>();
	for (const c of commits) {
		const d = commitDate(c);
		if (!d) continue;
		const k = dayKey(d);
		const bucket = byDay.get(k);
		if (bucket) bucket.push(c);
		else byDay.set(k, [c]);
	}

	const events: DayEvent[] = [];
	for (const [iso, list] of byDay) {
		// newest first within the day
		list.sort((a, b) => commitDate(b).localeCompare(commitDate(a)));
		const latest = list[0];
		events.push({
			kind: 'commits',
			ts: commitDate(latest),
			repo,
			repoHref,
			commitCount: list.length,
			branch,
			latestMessage: truncate(firstLine(latest.commit.message), 68),
			author: latest.author?.login,
			href: withRef(latest.html_url),
		});
	}
	return events;
}

/**
 * One PR event per pull, representing its most relevant action within the window.
 * A PR entirely outside the window returns null (we don't show stale state).
 */
export function pullToEvent(
	p: RawPull,
	windowSince: string,
	repo: string,
	repoHref: string,
): DayEvent | null {
	if (p.merged_at && p.merged_at >= windowSince) {
		return { kind: 'pr_merged', ts: p.merged_at, repo, repoHref, number: p.number, title: p.title, href: withRef(p.html_url), author: p.user?.login };
	}
	if (p.closed_at && !p.merged_at && p.closed_at >= windowSince) {
		return { kind: 'pr_closed', ts: p.closed_at, repo, repoHref, number: p.number, title: p.title, href: withRef(p.html_url) };
	}
	if (p.created_at >= windowSince) {
		return { kind: 'pr_opened', ts: p.created_at, repo, repoHref, number: p.number, title: p.title, href: withRef(p.html_url), author: p.user?.login };
	}
	return null;
}

export function releaseToEvent(r: RawRelease, repo: string, repoHref: string): DayEvent | null {
	if (!r.published_at || r.draft) return null;
	return { kind: 'release', ts: r.published_at, repo, repoHref, tag: r.tag_name, title: r.name ?? undefined, href: withRef(r.html_url) };
}

/** One issue event per issue, representing its most relevant action within the window.
 * Pull-request "issues" (pull_request field present) are skipped — PRs come from /pulls. */
export function issueToEvent(
	i: RawIssue,
	windowSince: string,
	repo: string,
	repoHref: string,
): DayEvent | null {
	if (i.pull_request) return null;
	if (i.state === 'closed' && i.closed_at && i.closed_at >= windowSince) {
		return { kind: 'issue_closed', ts: i.closed_at, repo, repoHref, number: i.number, title: i.title, href: withRef(i.html_url) };
	}
	if (i.created_at >= windowSince) {
		return { kind: 'issue_opened', ts: i.created_at, repo, repoHref, number: i.number, title: i.title, href: withRef(i.html_url), author: i.user?.login };
	}
	return null;
}

/** A comment on an issue or PR within the window. The issue/PR number is parsed from issue_url. */
export function commentToEvent(
	c: RawIssueComment,
	windowSince: string,
	repo: string,
	repoHref: string,
): DayEvent | null {
	if (!c.created_at || c.created_at < windowSince) return null;
	const m = c.issue_url?.match(/(?:issues|pull)\/(\d+)/);
	const number = m ? Number(m[1]) : undefined;
	return {
		kind: 'comment',
		ts: c.created_at,
		repo,
		repoHref,
		number,
		title: truncate(firstLine(c.body || ''), 60),
		href: withRef(c.html_url),
		author: c.user?.login,
	};
}

export function repoToRow(r: RawRepo): RepoRow {
	return {
		fullName: r.full_name,
		href: withRef(r.html_url),
		description: r.description,
		language: r.language,
		stars: r.stargazers_count,
		forks: r.forks_count,
		fork: r.fork,
		archived: r.archived,
		createdAt: r.created_at,
		pushedAt: r.pushed_at,
		defaultBranch: r.default_branch,
	};
}

/** Merge commit/pr/release events into UTC day buckets, newest day + newest event first. */
export function groupIntoDays(events: DayEvent[]): Day[] {
	const byDay = new Map<string, DayEvent[]>();
	for (const e of events) {
		const k = dayKey(e.ts);
		const bucket = byDay.get(k);
		if (bucket) bucket.push(e);
		else byDay.set(k, [e]);
	}

	const days: Day[] = [];
	for (const [iso, list] of byDay) {
		list.sort((a, b) => b.ts.localeCompare(a.ts));
		days.push({ iso, events: list });
	}
	days.sort((a, b) => b.iso.localeCompare(a.iso));
	return days;
}
