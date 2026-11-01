// Theme (System / Light / Dark), settings and help panels.

// Theme (System / Light / Dark), stored per browser
const getTheme = () => {
  try {
    return localStorage.getItem('sc-theme') || 'system';
  } catch (e) {
    return 'system';
  }
};
function applyTheme() {
  const t = getTheme(),
    r = document.documentElement;
  if (t === 'system') r.removeAttribute('data-theme');
  else r.setAttribute('data-theme', t);
}
function setTheme(t) {
  try {
    if (t === 'system') localStorage.removeItem('sc-theme');
    else localStorage.setItem('sc-theme', t);
  } catch (e) {}
  applyTheme();
  closePanels();
  toggleSettings();
}
applyTheme();
V.settings = () => {
  const theme = getTheme(),
    user = currentUser();
  const active = activeReps();
  const owned = active.map((u) => ({
    user: u,
    count: S.opps.filter((o) => o.owner === u.ownerCode).length,
  }));
  return `<div class="mb-4"><div class="mut">Workspace</div><h1 class="text-2xl font-bold">Settings</h1><p class="mut mt-1">Manage your workspace preferences, team assignments and data.</p></div>
  <div class="grid lg:grid-cols-3 gap-3 items-start">
   <section class="card p-4 lg:col-span-2"><div class="flex items-center gap-2 mb-1"><span class="ms" style="color:var(--pr)">palette</span><h2 class="font-bold text-lg">Appearance</h2></div><p class="mut mb-3">Choose how Ceph CRM looks on this device.</p><div class="grid sm:grid-cols-3 gap-2">${[
     ['system', 'System', 'brightness_auto'],
     ['light', 'Light', 'light_mode'],
     ['dark', 'Dark', 'dark_mode'],
   ]
     .map(
       ([k, l, ic]) =>
         `<button class="card p-3 flex items-center gap-2 ${theme === k ? '' : 'mut'}" style="border-color:${theme === k ? 'var(--pr)' : 'var(--bd)'};background:${theme === k ? 'var(--hov)' : 'var(--card)'}" onclick="setTheme('${k}')"><span class="ms">${ic}</span><b>${l}</b><span class="flex-1"></span>${theme === k ? '<span class="ms" style="color:var(--pr)">check_circle</span>' : ''}</button>`
     )
     .join('')}</div></section>
   <section class="card p-4"><div class="flex items-center gap-2 mb-1"><span class="ms" style="color:var(--pr)">account_circle</span><h2 class="font-bold text-lg">My account</h2></div><p class="font-semibold mt-3">${E(user.name || roleNow().name)}</p><p class="mut">${E(user.username || '')} · ${(user.role || S.role).toUpperCase()}</p><p class="mut text-xs mt-3">Signed-in profile and portal access.</p><button class="btn mt-3" onclick="toggleUserMenu()">Account options</button></section>
   <section class="card p-4 lg:col-span-2"><div class="flex justify-between items-start gap-3"><div><div class="flex items-center gap-2"><span class="ms" style="color:var(--pr)">groups</span><h2 class="font-bold text-lg">Sales team & assignments</h2></div><p class="mut mt-1">See which representative is handling each opportunity. Assign a rep when creating or editing an opportunity.</p></div><button class="btn" onclick="nav('users')">Manage users</button></div>
    <div class="grid sm:grid-cols-2 gap-2 mt-4">${
      owned
        .map(
          ({ user: u, count }) =>
            `<div class="rounded-lg border p-3 flex items-center gap-3" style="border-color:var(--bd)"><div class="w-9 h-9 rounded-full grid place-items-center font-bold" style="background:var(--hov);color:var(--pr)">${E(
              (u.name || '?')
                .split(/\s+/)
                .map((x) => x[0])
                .slice(0, 2)
                .join('')
                .toUpperCase()
            )}</div><div class="flex-1 min-w-0"><b>${E(u.name)}</b><div class="mut text-xs">${E(u.username)} · ${E(u.ownerCode)}</div></div><div class="text-right"><b>${count}</b><div class="mut text-xs">opportunities</div></div></div>`
        )
        .join('') ||
      '<p class="mut">No active reps found. Create a Rep account to assign opportunities.</p>'
    }</div>
    <div class="mt-4 rounded-lg p-3" style="background:var(--hov)"><b class="text-sm">How assignment works</b><p class="mut text-xs mt-1">The assigned rep appears in the opportunity list, board and record details. Reps see opportunities assigned to their own account; Admins and CEOs can view and reassign all opportunities.</p></div>
   </section>
   <section class="card p-4"><div class="flex items-center gap-2 mb-1"><span class="ms" style="color:var(--pr)">database</span><h2 class="font-bold text-lg">Data management</h2></div><p class="mut mt-1">Restore the original demo records stored in this browser.</p><button class="btn mt-3 w-full justify-center" style="color:var(--err)" onclick="if(confirm('Reset all demo data? This will replace locally saved records.')){localStorage.removeItem(KEY);location.reload()}">Reset demo data</button><p class="mut text-xs mt-2">This action cannot be undone.</p></section>
   <section class="card p-4 lg:col-span-3"><div class="flex items-center gap-2"><span class="ms" style="color:var(--pr)">info</span><h2 class="font-bold">About this workspace</h2></div><div class="grid sm:grid-cols-3 gap-3 mt-3"><div><div class="mut text-xs">Opportunities</div><b>${S.opps.length}</b></div><div><div class="mut text-xs">Active representatives</div><b>${active.length}</b></div><div><div class="mut text-xs">Attachments tracked</div><b>${S.opps.reduce((n, o) => n + (o.attachments || []).length, 0)}</b></div></div></section>
  </div>`;
};
function toggleSettings() {
  closePanels();
  nav('settings');
}

function toggleHelp() {
  const row = (a, b) =>
    `<div class="flex justify-between gap-3 py-1"><span>${a}</span><span class="mut">${b}</span></div>`;
  openPanel(
    'help',
    panelTitle('Help') +
      `<div class="p-3"><div class="mut font-semibold mb-1">Keyboard shortcuts</div>${row('Search', 'Ctrl + K')}${row('Close menus', 'Esc')}</div><div class="p-3" style="border-top:1px solid var(--bd)"><div class="mut font-semibold mb-1">Quote to invoice</div><p>Open an opportunity and choose <b>Generate quote</b>. Submit it for approval; once approved, an invoice is generated that you can submit to the client and mark as paid.</p><p class="mut mt-2">Approval limits: Rep 2% · Admin 5% · CEO unlimited. Prices below a product minimum always need CEO approval.</p></div>`
  );
}
addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && String(e.key).toLowerCase() === 'k' && S.authUser) {
    const g = $('#gs');
    if (g) {
      e.preventDefault();
      g.focus();
      g.select();
    }
  }
});
