// Teams, rep stats, leaderboard and targets.

// ===========================================================================
// Teams, leaderboard and role-based settings
// ===========================================================================
const TEAM_SIZE = 5;
const DEFAULT_TARGET = 700000;

// Demo roster: Team Alpha and Team Beta, five reps each (login: first name / rep123).
const TEAM_ROSTER = [
  ['alpha', 'AL', 'Alex Lee', 'rep'],
  ['alpha', 'DM', 'Dan Mills', 'dan'],
  ['alpha', 'RV', 'Ravi Verma', 'ravi'],
  ['alpha', 'NP', 'Nina Patel', 'nina'],
  ['alpha', 'OK', 'Omar Khan', 'omar'],
  ['beta', 'PS', 'Priya Singh', 'priya'],
  ['beta', 'LM', 'Liam Murphy', 'liam'],
  ['beta', 'ZH', 'Zoe Harris', 'zoe'],
  ['beta', 'KA', 'Kabir Ahmed', 'kabir'],
  ['beta', 'EW', 'Emma Wilson', 'emma'],
];
// [owner, name, account, amount, stage, close]
const TEAM_SEED_DEALS = [
  ['DM', 'Orbit analytics renewal', 'Orbit Systems', 320000, 5, '2026-10-12'],
  ['RV', 'Nimbus support plan', 'Nimbus Labs', 410000, 5, '2026-10-18'],
  ['NP', 'Helix platform rollout', 'Helix Pharma', 640000, 5, '2026-10-26'],
  ['NP', 'Helix add-on seats', 'Helix Pharma', 90000, 2, '2026-12-05'],
  ['OK', 'Vertex licences', 'Vertex Retail', 210000, 5, '2026-09-30'],
  ['OK', 'Vertex analytics', 'Vertex Retail', 150000, 1, '2026-12-15'],
  ['PS', 'Zenith enterprise suite', 'Zenith Bank', 820000, 5, '2026-10-22'],
  ['PS', 'Zenith security audit', 'Zenith Bank', 260000, 3, '2026-11-28'],
  ['LM', 'Kestrel data cloud', 'Kestrel Logistics', 560000, 5, '2026-10-09'],
  ['LM', 'Kestrel connectors', 'Kestrel Logistics', 120000, 5, '2026-10-27'],
  ['LM', 'Kestrel renewal', 'Kestrel Logistics', 180000, 2, '2026-12-01'],
  ['ZH', 'Lumen hardware nodes', 'Lumen Energy', 390000, 5, '2026-10-15'],
  ['ZH', 'Lumen support', 'Lumen Energy', 95000, 1, '2026-12-10'],
  ['KA', 'Atlas analytics', 'Atlas Media', 280000, 5, '2026-09-25'],
  ['KA', 'Atlas connectors', 'Atlas Media', 110000, 5, '2026-10-30'],
  ['KA', 'Atlas expansion', 'Atlas Media', 300000, 3, '2026-11-26'],
  ['EW', 'Pioneer platform', 'Pioneer Foods', 690000, 5, '2026-10-29'],
  ['EW', 'Pioneer support', 'Pioneer Foods', 85000, 2, '2026-12-08'],
];

// Runs on every load; only adds what is missing, so saved data is never overwritten.
function ensureTeams() {
  S.teams = S.teams || [
    { id: 'alpha', name: 'Team Alpha' },
    { id: 'beta', name: 'Team Beta' },
  ];
  S.settings = S.settings || {};
  S.settings.quote = S.settings.quote || { terms: 'Net 30', validityDays: 14 };
  S.settings.leaderboardMetric = S.settings.leaderboardMetric || 'won';
  S.prefs = S.prefs || {};
  TEAM_ROSTER.forEach(([teamId, code, name, username]) => {
    let u = S.users.find((x) => x.ownerCode === code && x.role === 'rep');
    if (!u) {
      u = {
        id: 'u-rep-' + code.toLowerCase(),
        name,
        username,
        password: 'rep123',
        role: 'rep',
        ownerCode: code,
        active: true,
      };
      S.users.push(u);
    }
    if (!u.teamId && !u.teamLocked) u.teamId = teamId;
    if (u.target == null) u.target = DEFAULT_TARGET;
    if (!u.email) u.email = `${username === 'rep' ? 'alex' : username}@cephcrm.demo`;
  });
  if (!S.teamDealsSeeded) {
    let id = Math.max(0, ...S.opps.map((o) => o.id));
    TEAM_SEED_DEALS.forEach(([owner, name, account, amount, stage, close]) =>
      S.opps.push({
        id: ++id,
        name,
        account,
        amount,
        stage,
        close,
        owner,
        next: '',
        items: [{ n: 'Platform licence', c: 'GEN-100', p: amount, q: 1, d: 0 }],
        socials: { linkedin: '', instagram: '', facebook: '', x: '' },
        attachments: [],
      })
    );
    S.teamDealsSeeded = true;
  }
  save();
}
ensureTeams();

// ---------- ranking ----------
const teamById = (id) => S.teams.find((t) => t.id === id);
const teamReps = (id) =>
  S.users.filter((u) => u.role === 'rep' && u.active !== false && u.teamId === id);
function repStats(u) {
  const mine = S.opps.filter((o) => o.owner === u.ownerCode && !o.lost);
  const won = mine.filter((o) => o.stage === 5);
  const target = u.target || 0;
  const wonValue = won.reduce((a, o) => a + o.amount, 0);
  return {
    user: u,
    won: wonValue,
    deals: won.length,
    pipeline: mine.filter((o) => o.stage < 5).reduce((a, o) => a + o.amount, 0),
    target,
    attain: target ? (wonValue / target) * 100 : 0,
  };
}
const LB_METRICS = { won: 'Revenue won', deals: 'Deals won', attain: 'Target %' };
function rankReps(users, metric) {
  const key = LB_METRICS[metric] ? metric : 'won';
  return users
    .map(repStats)
    .sort((a, b) => b[key] - a[key] || b.won - a.won || a.user.name.localeCompare(b.user.name))
    .map((s, i) => ({ ...s, rank: i + 1 }));
}
const lbMetric = () => S.lbMetric || S.settings.leaderboardMetric || 'won';
function setLbMetric(m) {
  S.lbMetric = m;
  render();
}
const personInitials = (name) =>
  (name || '?')
    .split(/\s+/)
    .map((x) => x[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
const RANK_COLORS = ['#d4a017', '#9aa4b2', '#b8733a'];
const rankBadge = (n) =>
  `<span style="display:inline-grid;place-items:center;width:26px;height:26px;border-radius:50%;font-weight:700;font-size:12px;${n <= 3 ? `background:${RANK_COLORS[n - 1]};color:#fff` : 'background:var(--hov);color:var(--mut)'}">${n}</span>`;
const progressBar = (pct) =>
  `<div style="height:6px;width:110px;background:var(--hov);border-radius:3px;overflow:hidden"><div style="height:100%;width:${Math.min(100, Math.round(pct))}%;background:${pct >= 100 ? 'var(--ok)' : 'var(--pr)'}"></div></div>`;

function teamBoardCard(team, metric, meCode) {
  const ranked = rankReps(teamReps(team.id), metric);
  const totalWon = ranked.reduce((a, r) => a + r.won, 0);
  const totalTarget = ranked.reduce((a, r) => a + r.target, 0);
  const rows = ranked
    .map((r) => {
      const me = r.user.ownerCode === meCode;
      return `<tr style="${me ? 'background:var(--hov)' : ''}"><td>${rankBadge(r.rank)}</td><td><div class="flex items-center gap-2"><span class="w-7 h-7 rounded-full grid place-items-center text-xs font-bold" style="background:var(--hov);color:var(--pr)">${E(personInitials(r.user.name))}</span><b>${E(r.user.name)}</b>${me ? '<span class="chip">You</span>' : ''}</div></td><td class="text-right"><b>${M(r.won)}</b></td><td class="text-right">${r.deals}</td><td class="text-right">${M(r.pipeline)}</td><td><div class="flex items-center gap-2">${progressBar(r.attain)}<span class="text-xs">${Math.round(r.attain)}%</span></div></td></tr>`;
    })
    .join('');
  return `<div class="card p-4"><div class="flex justify-between items-start gap-2 flex-wrap"><div><b class="text-lg">${E(team.name)}</b><div class="mut text-xs">${ranked.length} of ${TEAM_SIZE} reps · ranked by ${LB_METRICS[metric].toLowerCase()}</div></div><div class="text-right"><b>${M(totalWon)}</b><div class="mut text-xs">of ${M(totalTarget)} team target (${totalTarget ? Math.round((totalWon / totalTarget) * 100) : 0}%)</div></div></div>${table(['#', 'Rep', 'Won', 'Deals', 'Open pipeline', 'Target'], rows || '<tr><td colspan="6" class="mut">No reps in this team yet.</td></tr>')}</div>`;
}

function leaderboardSection() {
  const metric = lbMetric();
  const toggles = Object.entries(LB_METRICS)
    .map(
      ([k, l]) =>
        `<button class="btn" style="${k === metric ? 'border-color:var(--pr);color:var(--pr);background:var(--hov)' : ''}" onclick="setLbMetric('${k}')">${l}</button>`
    )
    .join('');
  const meCode = roleNow().owner;
  let body, intro;
  if (S.role === 'rep') {
    const me = S.users.find((u) => u.role === 'rep' && u.ownerCode === meCode);
    const team = me && teamById(me.teamId);
    if (!team)
      return `<div class="card p-4 mb-3"><b>Team leaderboard</b><p class="mut mt-1">You have not been assigned to a team yet. Ask your admin to add you to Team Alpha or Team Beta.</p></div>`;
    const inTeam = rankReps(teamReps(team.id), metric);
    const company = rankReps(
      S.users.filter((u) => u.role === 'rep' && u.active !== false && u.teamId),
      metric
    );
    const myTeamRank = inTeam.find((r) => r.user.ownerCode === meCode);
    const myCompanyRank = company.find((r) => r.user.ownerCode === meCode);
    intro = myTeamRank
      ? `You are <b>#${myTeamRank.rank}</b> of ${inTeam.length} in ${E(team.name)} and <b>#${myCompanyRank.rank}</b> of ${company.length} company-wide.`
      : '';
    body = teamBoardCard(team, metric, meCode);
  } else {
    intro = 'How every team and rep is performing against their targets.';
    body = `<div class="grid xl:grid-cols-2 gap-3">${S.teams.map((t) => teamBoardCard(t, metric, meCode)).join('')}</div>`;
  }
  return `<div class="mb-3"><div class="flex items-center gap-2 flex-wrap mb-2"><span class="ms" style="color:var(--pr)">emoji_events</span><h2 class="text-lg font-bold">Team leaderboard</h2><span class="flex-1"></span>${toggles}</div><p class="mut mb-2">${intro}</p>${body}</div>`;
}
