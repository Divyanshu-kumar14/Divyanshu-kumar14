// Pulls the numbers for the signal card from the GitHub GraphQL API.
// Only public repositories are read, so a personal token never leaks
// private repository names into the image.

const QUERY = `query($login: String!) {
  user(login: $login) {
    login
    pullRequests { totalCount }
    repositories(ownerAffiliations: OWNER, isFork: false, privacy: PUBLIC, first: 100, orderBy: {field: PUSHED_AT, direction: DESC}) {
      nodes {
        name
        pushedAt
        languages(first: 12, orderBy: {field: SIZE, direction: DESC}) { edges { size node { name } } }
      }
    }
    contributionsCollection {
      totalCommitContributions
      contributionCalendar {
        totalContributions
        weeks { contributionDays { date contributionCount weekday } }
      }
    }
  }
}`;

export async function fetchProfile(login, token, { ignoredLanguages = [] } = {}) {
  if (!token) throw new Error('Set GITHUB_TOKEN (or GH_TOKEN) to query the GitHub API.');
  const res = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: {
      authorization: `bearer ${token}`,
      'content-type': 'application/json',
      'user-agent': `${login}-profile-generator`,
    },
    body: JSON.stringify({ query: QUERY, variables: { login } }),
  });
  if (!res.ok) throw new Error(`GitHub GraphQL returned ${res.status}: ${await res.text()}`);
  const json = await res.json();
  if (json.errors?.length) throw new Error(`GitHub GraphQL errors: ${JSON.stringify(json.errors)}`);
  if (!json.data?.user) throw new Error(`User ${login} not found`);
  return summarize(json.data.user, { ignoredLanguages });
}

export function summarize(user, { ignoredLanguages = [] } = {}) {
  const cc = user.contributionsCollection;
  const weeks = cc.contributionCalendar.weeks.map((w) =>
    w.contributionDays.map((d) => ({ date: d.date, count: d.contributionCount, weekday: d.weekday })),
  );
  const days = weeks.flat().sort((a, b) => a.date.localeCompare(b.date));

  let longest = 0;
  let run = 0;
  for (const d of days) {
    run = d.count > 0 ? run + 1 : 0;
    longest = Math.max(longest, run);
  }

  const byWeekday = Array(7).fill(0);
  for (const d of days) byWeekday[d.weekday] += d.count;
  const busiest = byWeekday.indexOf(Math.max(...byWeekday));
  const best = days.reduce((m, d) => (d.count > m.count ? d : m), days[0]);

  const repos = user.repositories.nodes.filter((r) => r.name.toLowerCase() !== user.login.toLowerCase());
  const ignored = new Set(ignoredLanguages);
  const bytes = new Map();
  for (const r of repos) {
    for (const e of r.languages.edges) {
      if (ignored.has(e.node.name)) continue;
      bytes.set(e.node.name, (bytes.get(e.node.name) || 0) + e.size);
    }
  }
  const languages = [...bytes].map(([name, size]) => ({ name, bytes: size })).sort((a, b) => b.bytes - a.bytes);

  return {
    login: user.login,
    weeks,
    total: cc.contributionCalendar.totalContributions,
    commits: cc.totalCommitContributions,
    prsTotal: user.pullRequests.totalCount,
    longestStreak: longest,
    busiestWeekday: busiest,
    best,
    latest: repos[0] ? { name: repos[0].name, pushedAt: repos[0].pushedAt } : null,
    languages,
    generatedAt: new Date().toISOString(),
  };
}
