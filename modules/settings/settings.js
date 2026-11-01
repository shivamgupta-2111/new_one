// Settings page: sections, profile, password, notifications, team admin.

const quoteDefaultsSetting = () => S.settings.quote || { terms: 'Net 30', validityDays: 14 };

// ---------- settings ----------
const prefsOf = () => {
  const id = S.authUser || 'anon';
  S.prefs[id] = S.prefs[id] || {
    notify: { approvals: true, deals: true, invoices: true, rank: true, weekly: false },
    defaultView: 'list',
  };
  return S.prefs[id];
};
const SETTINGS_SECTIONS = () => {
  const base = [
    ['profile', 'Profile', 'account_circle'],
    ['security', 'Password & security', 'lock'],
    ['appearance', 'Appearance & view', 'palette'],
    ['notifications', 'Notifications', 'notifications'],
  ];
  if (S.role === 'rep') base.push(['myteam', 'My team & target', 'groups']);
  if (S.role !== 'rep')
    base.push(
      ['teams', 'Teams & targets', 'groups'],
      ['quotes', 'Quote defaults', 'request_quote'],
      ['limits', 'Approval limits', 'approval']
    );
  if (S.role === 'ceo') base.push(['workspace', 'Workspace & data', 'tune']);
  return base;
};
function setSettingsTab(t) {
  S.setTab = t;
  render();
}
const settingsField = (label, control) =>
  `<label class="block"><span class="mut text-xs">${label}</span>${control}</label>`;
const secHead = (icon, title, text) =>
  `<div class="flex items-center gap-2 mb-1"><span class="ms" style="color:var(--pr)">${icon}</span><h2 class="font-bold text-lg">${title}</h2></div><p class="mut mb-3">${text}</p>`;

const SETTINGS_PANELS = {
  profile() {
    const u = currentUser();
    const team = teamById(u.teamId);
    return `<form onsubmit="saveProfile(event)">${secHead('account_circle', 'Profile', 'Your details as other people in Ceph CRM see them.')}<div class="grid sm:grid-cols-2 gap-3">${settingsField('Full name *', `<input class="inp" name="name" value="${E(u.name || '')}" required>`)}${settingsField('Job title', `<input class="inp" name="title" value="${E(u.title || '')}" placeholder="e.g. Senior Account Executive">`)}${settingsField('Email *', `<input class="inp" name="email" type="email" value="${E(u.email || '')}" required>`)}${settingsField('Phone', `<input class="inp" name="phone" type="tel" value="${E(u.phone || '')}" placeholder="+91 98765 43210">`)}${settingsField('Username', `<input class="inp" value="${E(u.username || '')}" disabled>`)}${settingsField('Role', `<input class="inp" value="${E((u.role || S.role).toUpperCase())}" disabled>`)}${u.role === 'rep' ? settingsField('Team', `<input class="inp" value="${E(team ? team.name : 'Unassigned')}" disabled>`) : ''}${settingsField('Owner code', `<input class="inp" value="${E(u.ownerCode || '')}" disabled>`)}</div><div class="flex justify-end mt-4"><button class="btn btn-p">Save profile</button></div></form>`;
  },
  security() {
    return `<form onsubmit="changePassword(event)" autocomplete="off">${secHead('lock', 'Password & security', 'Use at least 6 characters. You will stay signed in on this device.')}<div class="grid sm:grid-cols-2 gap-3">${settingsField('Current password *', '<input class="inp" name="current" type="password" required>')}<span></span>${settingsField('New password *', '<input class="inp" name="next" type="password" minlength="6" required>')}${settingsField('Confirm new password *', '<input class="inp" name="confirm" type="password" minlength="6" required>')}</div><div class="flex justify-end mt-4"><button class="btn btn-p">Update password</button></div><p class="mut text-xs mt-3">Prototype note: passwords are stored in this browser only. Production needs server-side authentication.</p></form>`;
  },
  appearance() {
    const theme = getTheme();
    const view = prefsOf().defaultView;
    return `${secHead('palette', 'Appearance & view', 'Choose how Ceph CRM looks and opens on this device.')}<div class="grid sm:grid-cols-3 gap-2">${[
      ['system', 'System', 'brightness_auto'],
      ['light', 'Light', 'light_mode'],
      ['dark', 'Dark', 'dark_mode'],
    ]
      .map(
        ([k, l, ic]) =>
          `<button class="card p-3 flex items-center gap-2 ${theme === k ? '' : 'mut'}" style="border-color:${theme === k ? 'var(--pr)' : 'var(--bd)'};background:${theme === k ? 'var(--hov)' : 'var(--card)'}" onclick="setTheme('${k}')"><span class="ms">${ic}</span><b>${l}</b><span class="flex-1"></span>${theme === k ? '<span class="ms" style="color:var(--pr)">check_circle</span>' : ''}</button>`
      )
      .join(
        ''
      )}</div><div class="mt-4 max-w-sm">${settingsField('Opportunities open as', `<select class="inp" onchange="setDefaultView(this.value)"><option value="list" ${view === 'list' ? 'selected' : ''}>List</option><option value="kanban" ${view === 'kanban' ? 'selected' : ''}>Board (Kanban)</option></select>`)}</div>`;
  },
  notifications() {
    const n = prefsOf().notify;
    const rows = [
      [
        'approvals',
        'Approval decisions',
        'When a quotation you submitted is approved or rejected' +
          (S.role !== 'rep' ? ', and when one needs your approval' : ''),
      ],
      [
        'deals',
        'Deal updates',
        'Stage changes, priority changes and new contacts on your opportunities',
      ],
      ['invoices', 'Invoices', 'When an invoice is generated, submitted or paid'],
      ['rank', 'Leaderboard changes', 'When your rank or your team’s rank moves'],
      ['weekly', 'Weekly summary', 'A Monday summary of pipeline and wins'],
    ];
    return `${secHead('notifications', 'Notifications', 'Choose what you want to be told about. Changes save instantly.')}${rows
      .map(
        ([k, t, d]) =>
          `<label class="flex items-start gap-3 py-3" style="border-bottom:1px solid var(--bd)"><input type="checkbox" class="mt-1" ${n[k] ? 'checked' : ''} onchange="setNotify('${k}',this.checked)"><span><b>${t}</b><div class="mut text-xs">${d}</div></span></label>`
      )
      .join('')}`;
  },
  myteam() {
    const me = currentUser();
    const team = teamById(me.teamId);
    if (!team)
      return `${secHead('groups', 'My team & target', 'Your team and sales target.')}<p class="mut">You are not on a team yet. Ask your admin to assign you.</p>`;
    const ranked = rankReps(teamReps(team.id), lbMetric());
    const mine = ranked.find((r) => r.user.id === me.id) || repStats(me);
    return `${secHead('groups', 'My team & target', 'Your team, your sales target and how you are tracking. Only your admin or CEO can change targets.')}<div class="grid sm:grid-cols-3 gap-3 mb-4"><div class="card p-3"><div class="mut text-xs">Team</div><b class="text-lg">${E(team.name)}</b></div><div class="card p-3"><div class="mut text-xs">My target</div><b class="text-lg">${M(mine.target)}</b></div><div class="card p-3"><div class="mut text-xs">Achieved</div><b class="text-lg">${M(mine.won)}</b><div class="mt-1">${progressBar(mine.attain)}</div></div></div><b>Teammates</b>${table(
      ['Rep', 'Designation', 'Email'],
      teamReps(team.id)
        .map(
          (u) =>
            `<tr><td><b>${E(u.name)}</b>${u.id === me.id ? ' <span class="chip">You</span>' : ''}</td><td>${E(u.title || 'Sales Representative')}</td><td>${E(u.email || '—')}</td></tr>`
        )
        .join('')
    )}`;
  },
  teams() {
    const reps = S.users.filter((u) => u.role === 'rep' && u.active !== false);
    const teamOptions = (sel) =>
      `<option value="" ${!sel ? 'selected' : ''}>Unassigned</option>` +
      S.teams
        .map(
          (t) => `<option value="${t.id}" ${t.id === sel ? 'selected' : ''}>${E(t.name)}</option>`
        )
        .join('');
    return `${secHead('groups', 'Teams & targets', `Rename teams, move reps between teams (max ${TEAM_SIZE} per team) and set each rep’s sales target.`)}<div class="grid sm:grid-cols-2 gap-3 mb-4">${S.teams.map((t) => `<div class="card p-3"><div class="mut text-xs">Team name · ${teamReps(t.id).length} of ${TEAM_SIZE} reps</div><input class="inp mt-1" value="${E(t.name)}" onchange="renameTeam('${t.id}',this.value)"></div>`).join('')}</div>${table(['Rep', 'Team', 'Target (₹)', 'Won so far'], reps.map((u) => `<tr><td><b>${E(u.name)}</b><div class="mut text-xs">${E(u.ownerCode)}</div></td><td><select class="inp" style="width:auto" onchange="setRepTeam('${u.id}',this.value)">${teamOptions(u.teamId)}</select></td><td><input class="inp" type="number" min="0" step="10000" style="width:140px" value="${u.target || 0}" onchange="setRepTarget('${u.id}',this.value)"></td><td>${M(repStats(u).won)}</td></tr>`).join(''))}`;
  },
  quotes() {
    const d = quoteDefaultsSetting();
    return `<form onsubmit="saveQuoteDefaults(event)">${secHead('request_quote', 'Quote defaults', 'Applied to every new quotation. Reps can still change them on a quote.')}<div class="grid sm:grid-cols-2 gap-3 max-w-xl">${settingsField('Default payment terms', `<select class="inp" name="terms">${PAYMENT_TERMS.map((t) => `<option ${t === d.terms ? 'selected' : ''}>${t}</option>`).join('')}</select>`)}${settingsField('Quote valid for (days)', `<input class="inp" name="days" type="number" min="1" max="180" value="${d.validityDays}" required>`)}</div><div class="flex justify-end mt-4 max-w-xl"><button class="btn btn-p">Save defaults</button></div></form>`;
  },
  limits() {
    const rows = [
      ['Rep', 'Up to 2% blended discount', 'Admin approval'],
      ['Admin', 'Up to 5% blended discount', 'CEO approval above 5%'],
      ['CEO', 'Any discount', 'Final authority'],
    ];
    return `${secHead('approval', 'Approval limits', 'Approval authority is set by company policy and is shown here for reference.')}${table(['Role', 'Discount authority', 'Escalation'], rows.map((r) => `<tr><td><b>${r[0]}</b></td><td>${r[1]}</td><td>${r[2]}</td></tr>`).join(''))}<p class="mut text-xs mt-3">Any line priced below its product minimum always needs CEO approval. Every submission needs notes for the approver.</p>`;
  },
  workspace() {
    const m = S.settings.leaderboardMetric;
    return `${secHead('tune', 'Workspace & data', 'Company-wide defaults. CEO only.')}<div class="max-w-sm">${settingsField(
      'Leaderboard ranks reps by (default)',
      `<select class="inp" onchange="setLeaderboardDefault(this.value)">${Object.entries(LB_METRICS)
        .map(([k, l]) => `<option value="${k}" ${k === m ? 'selected' : ''}>${l}</option>`)
        .join('')}</select>`
    )}</div><div class="mt-6 p-3 rounded-lg" style="background:var(--hov)"><b>Data management</b><p class="mut text-xs mt-1">Restore the original demo records stored in this browser. This cannot be undone.</p><button class="btn mt-3" style="color:var(--err)" onclick="if(confirm('Reset all demo data? This will replace locally saved records.')){localStorage.removeItem(KEY);location.reload()}">Reset demo data</button></div>`;
  },
};

V.settings = () => {
  const sections = SETTINGS_SECTIONS();
  const tab = sections.some((s) => s[0] === S.setTab) ? S.setTab : 'profile';
  const u = currentUser();
  const menu = sections
    .map(
      ([k, l, ic]) =>
        `<button class="hdr-item w-full" style="${k === tab ? 'background:var(--hov);color:var(--pr);font-weight:600' : ''}" onclick="setSettingsTab('${k}')"><span class="ms">${ic}</span><span>${l}</span></button>`
    )
    .join('');
  return `<div class="mb-4"><div class="mut">${S.role === 'ceo' ? 'CEO' : S.role === 'admin' ? 'Admin' : 'Rep'} settings</div><h1 class="text-2xl font-bold">Settings</h1><p class="mut mt-1">${E(u.name || '')} · ${(u.role || S.role).toUpperCase()}</p></div><div class="grid lg:grid-cols-4 gap-3 items-start"><nav class="card p-2 grid gap-1">${menu}</nav><section class="card p-5 lg:col-span-3">${SETTINGS_PANELS[tab]()}</section></div>`;
};

// ---------- settings actions ----------
function saveProfile(e) {
  e.preventDefault();
  const v = Object.fromEntries(new FormData(e.target));
  const u = currentUser();
  if (!u || !u.id) return;
  if (!v.name.trim()) return toast('Name is required');
  Object.assign(u, {
    name: v.name.trim(),
    title: v.title.trim(),
    email: v.email.trim(),
    phone: v.phone.trim(),
  });
  save();
  toast('Profile saved');
  render();
}
function changePassword(e) {
  e.preventDefault();
  const v = Object.fromEntries(new FormData(e.target));
  const u = currentUser();
  if (v.current !== u.password) return toast('Current password is incorrect');
  if (v.next.length < 6) return toast('New password must be at least 6 characters');
  if (v.next !== v.confirm) return toast('New passwords do not match');
  u.password = v.next;
  save();
  e.target.reset();
  toast('Password updated');
}
function setNotify(key, on) {
  prefsOf().notify[key] = !!on;
  save();
  toast('Notification preference saved');
}
function setDefaultView(view) {
  prefsOf().defaultView = view;
  S.view = view;
  save();
  toast('Default view saved');
}
function renameTeam(id, name) {
  const t = teamById(id);
  if (!t || !['admin', 'ceo'].includes(S.role)) return;
  if (!name.trim()) return render();
  t.name = name.trim();
  save();
  toast('Team renamed');
  render();
}
function setRepTeam(userId, teamId) {
  const u = S.users.find((x) => x.id === userId);
  if (!u || !['admin', 'ceo'].includes(S.role)) return;
  if (teamId && u.teamId !== teamId && teamReps(teamId).length >= TEAM_SIZE) {
    toast(`${teamById(teamId).name} already has ${TEAM_SIZE} reps`);
    return render();
  }
  u.teamId = teamId || null;
  u.teamLocked = true;
  save();
  toast(`${u.name} moved to ${teamId ? teamById(teamId).name : 'Unassigned'}`);
  render();
}
function setRepTarget(userId, value) {
  const u = S.users.find((x) => x.id === userId);
  if (!u || !['admin', 'ceo'].includes(S.role)) return;
  u.target = Math.max(0, Math.round(+value || 0));
  save();
  toast(`Target saved for ${u.name}`);
  render();
}
function saveQuoteDefaults(e) {
  e.preventDefault();
  const v = Object.fromEntries(new FormData(e.target));
  S.settings.quote = {
    terms: v.terms,
    validityDays: Math.min(180, Math.max(1, Math.round(+v.days || 14))),
  };
  save();
  toast('Quote defaults saved');
}
function setLeaderboardDefault(metric) {
  if (S.role !== 'ceo' || !LB_METRICS[metric]) return;
  S.settings.leaderboardMetric = metric;
  S.lbMetric = null;
  save();
  toast('Leaderboard default saved');
}

// ---------------------------------------------------------------------------
// Opportunity tabs: every opportunity you open stays in a tab bar under the menu,
// so you can switch between several records without losing your place.
// ---------------------------------------------------------------------------
