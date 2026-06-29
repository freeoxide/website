import { describe, it, expect } from 'vitest';
import {
	dayKey,
	firstLine,
	truncate,
	repoParts,
	withRef,
	commitsToDayEvents,
	pullToEvent,
	releaseToEvent,
	issueToEvent,
	commentToEvent,
	groupIntoDays,
	type RawCommit,
	type RawPull,
	type RawRelease,
	type RawIssue,
	type RawIssueComment,
} from './initiative';

describe('helpers', () => {
	it('dayKey slices UTC ISO to YYYY-MM-DD', () => {
		expect(dayKey('2026-06-19T14:02:00Z')).toBe('2026-06-19');
		expect(dayKey('')).toBe('');
	});

	it('firstLine takes only the first line, trimmed', () => {
		expect(firstLine('feat: x\n\nbody')).toBe('feat: x');
		expect(firstLine('  chore: tidy  ')).toBe('chore: tidy');
	});

	it('truncate adds an ellipsis past the limit, leaves shorter text alone', () => {
		expect(truncate('a'.repeat(80), 10)).toMatch(/…$/);
		expect(truncate('short', 10)).toBe('short');
	});

	it('repoParts splits owner/name', () => {
		expect(repoParts('hmziqrs/gpui-starter')).toEqual({ owner: 'hmziqrs', name: 'gpui-starter' });
		expect(repoParts('solo')).toEqual({ owner: '', name: 'solo' });
	});

	it('withRef appends the ref tag without clobbering an existing query', () => {
		expect(withRef('https://github.com/a/b')).toBe('https://github.com/a/b?ref=freeoxide.com');
		expect(withRef('https://github.com/a/b?x=1')).toBe('https://github.com/a/b?x=1&ref=freeoxide.com');
	});
});

const mkCommit = (sha: string, msg: string, date: string): RawCommit => ({
	sha,
	commit: { message: msg, author: { name: 'h', date }, committer: { name: 'h', date } },
	author: { login: 'hmziqrs' },
	html_url: `u/${sha}`,
});

describe('commitsToDayEvents', () => {
	const commits = [
		mkCommit('1', 'fix: a', '2026-06-19T10:00:00Z'),
		mkCommit('2', 'feat: b', '2026-06-19T12:00:00Z'),
		mkCommit('3', 'chore: c', '2026-06-18T09:00:00Z'),
	];

	it('groups by UTC day', () => {
		const evs = commitsToDayEvents(commits, 'hmziqrs/x', 'href', 'main');
		expect(evs).toHaveLength(2);
		const byIso = Object.fromEntries(evs.map((e) => [e.ts.slice(0, 10), e]));
		expect(byIso['2026-06-19'].commitCount).toBe(2);
		expect(byIso['2026-06-18'].commitCount).toBe(1);
	});

	it('uses the newest commit message + ts for the day', () => {
		const evs = commitsToDayEvents(commits, 'hmziqrs/x', 'href', 'main');
		const d19 = evs.find((e) => e.ts.startsWith('2026-06-19'));
		expect(d19?.latestMessage).toBe('feat: b');
		expect(d19?.ts).toBe('2026-06-19T12:00:00Z');
	});
});

describe('pullToEvent', () => {
	const since = '2026-05-01T00:00:00Z';
	const repo = 'a/b';
	const href = 'h';

	it('maps a merged PR to pr_merged at merged_at', () => {
		const p: RawPull = {
			number: 1, title: 't', state: 'closed',
			created_at: '2026-06-01T00:00:00Z', closed_at: '2026-06-02T00:00:00Z',
			merged_at: '2026-06-02T00:00:00Z', html_url: 'u',
		};
		const ev = pullToEvent(p, since, repo, href);
		expect(ev?.kind).toBe('pr_merged');
		expect(ev?.ts).toBe('2026-06-02T00:00:00Z');
	});

	it('maps a closed-unmerged PR to pr_closed', () => {
		const p: RawPull = {
			number: 2, title: 't', state: 'closed',
			created_at: '2026-06-01T00:00:00Z', closed_at: '2026-06-03T00:00:00Z',
			merged_at: null, html_url: 'u',
		};
		expect(pullToEvent(p, since, repo, href)?.kind).toBe('pr_closed');
	});

	it('maps an open PR to pr_opened', () => {
		const p: RawPull = {
			number: 3, title: 't', state: 'open',
			created_at: '2026-06-04T00:00:00Z', closed_at: null, merged_at: null, html_url: 'u',
		};
		expect(pullToEvent(p, since, repo, href)?.kind).toBe('pr_opened');
	});

	it('drops a PR entirely outside the window', () => {
		const p: RawPull = {
			number: 4, title: 't', state: 'closed',
			created_at: '2025-01-01T00:00:00Z', closed_at: '2025-01-02T00:00:00Z',
			merged_at: '2025-01-02T00:00:00Z', html_url: 'u',
		};
		expect(pullToEvent(p, since, repo, href)).toBeNull();
	});
});

describe('releaseToEvent', () => {
	it('maps a published release', () => {
		const r: RawRelease = { tag_name: 'v1.0.0', name: 'first', published_at: '2026-06-01T00:00:00Z', prerelease: false, draft: false, html_url: 'u' };
		expect(releaseToEvent(r, 'a/b', 'h')?.tag).toBe('v1.0.0');
	});
	it('drops drafts and unpublished', () => {
		const draft: RawRelease = { tag_name: 'v2', name: null, published_at: '2026-06-01T00:00:00Z', prerelease: false, draft: true, html_url: 'u' };
		const unpub: RawRelease = { tag_name: 'v3', name: null, published_at: null, prerelease: false, draft: false, html_url: 'u' };
		expect(releaseToEvent(draft, 'a/b', 'h')).toBeNull();
		expect(releaseToEvent(unpub, 'a/b', 'h')).toBeNull();
	});
});

describe('groupIntoDays', () => {
	it('sorts days newest-first and events within a day by ts desc', () => {
		const evs = [
			{ kind: 'commits' as const, ts: '2026-06-18T09:00:00Z', repo: 'a/b', repoHref: 'h' },
			{ kind: 'commits' as const, ts: '2026-06-19T12:00:00Z', repo: 'a/b', repoHref: 'h' },
			{ kind: 'commits' as const, ts: '2026-06-19T08:00:00Z', repo: 'a/b', repoHref: 'h' },
		];
		const days = groupIntoDays(evs);
		expect(days[0].iso).toBe('2026-06-19');
		expect(days[0].events[0].ts).toBe('2026-06-19T12:00:00Z');
		expect(days[0].events[1].ts).toBe('2026-06-19T08:00:00Z');
		expect(days[1].iso).toBe('2026-06-18');
	});
});

describe('issueToEvent', () => {
	const since = '2025-06-01T00:00:00Z';
	const repo = 'a/b';
	const href = 'h';

	it('maps a closed issue to issue_closed at closed_at', () => {
		const i: RawIssue = {
			number: 7, title: 'bug', state: 'closed', created_at: '2026-05-01T00:00:00Z',
			closed_at: '2026-06-01T00:00:00Z', html_url: 'u',
		};
		const ev = issueToEvent(i, since, repo, href);
		expect(ev?.kind).toBe('issue_closed');
		expect(ev?.ts).toBe('2026-06-01T00:00:00Z');
	});

	it('maps an open issue to issue_opened', () => {
		const i: RawIssue = {
			number: 8, title: 'feature', state: 'open', created_at: '2026-06-04T00:00:00Z',
			closed_at: null, html_url: 'u',
		};
		expect(issueToEvent(i, since, repo, href)?.kind).toBe('issue_opened');
	});

	it('skips pull-request "issues" (PRs come from /pulls)', () => {
		const i: RawIssue = {
			number: 9, title: 'pr', state: 'open', created_at: '2026-06-04T00:00:00Z',
			closed_at: null, html_url: 'u', pull_request: {},
		};
		expect(issueToEvent(i, since, repo, href)).toBeNull();
	});

	it('drops an issue entirely outside the window', () => {
		const i: RawIssue = {
			number: 10, title: 'old', state: 'closed', created_at: '2024-01-01T00:00:00Z',
			closed_at: '2024-02-01T00:00:00Z', html_url: 'u',
		};
		expect(issueToEvent(i, since, repo, href)).toBeNull();
	});
});

describe('commentToEvent', () => {
	const since = '2025-06-01T00:00:00Z';
	const repo = 'a/b';
	const href = 'h';

	it('maps an in-window comment and parses the issue number from issue_url', () => {
		const c: RawIssueComment = {
			id: 1, body: 'looks good\nship it', created_at: '2026-06-04T00:00:00Z',
			user: { login: 'hmziqrs' }, html_url: 'cu', issue_url: 'https://api.github.com/repos/a/b/issues/42',
		};
		const ev = commentToEvent(c, since, repo, href);
		expect(ev?.kind).toBe('comment');
		expect(ev?.number).toBe(42);
		expect(ev?.author).toBe('hmziqrs');
		expect(ev?.title).toBe('looks good'); // first line only
	});

	it('drops comments outside the window', () => {
		const c: RawIssueComment = {
			id: 2, body: 'x', created_at: '2024-01-01T00:00:00Z',
			user: null, html_url: 'cu', issue_url: 'https://api.github.com/repos/a/b/issues/1',
		};
		expect(commentToEvent(c, since, repo, href)).toBeNull();
	});
});
