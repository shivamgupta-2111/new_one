// Header dropdowns: notifications, user menu and header refresh.

// ---------------------------------------------------------------------------
// Action completion: notifications, user menu, Slack share, leads, contacts,
// user administration and invoice payment. Prototype/localStorage implementation.
// ---------------------------------------------------------------------------
const logOpp = (id, k, x) => {
  (S.acts[id] = S.acts[id] || []).unshift({ k, x, t: Date.now() });
};
const currentUser = () => S.users.find((u) => u.id === S.authUser) || {};
const initials = (n) =>
  String(n || '?')
    .split(' ')
    .filter(Boolean)
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

// Header dropdown panels (notifications and user menu)
function closePanels() {
  document.querySelectorAll('.hdr-panel').forEach((p) => p.remove());
}
function openPanel(anchorId, html, side = 'right') {
  const existing = document.querySelector(`.hdr-panel[data-for="${anchorId}"]`);
  closePanels();
  if (existing) return;
  const anchor = $('#' + anchorId);
  if (!anchor) return;
  const r = anchor.getBoundingClientRect(),
    d = document.createElement('div');
  d.className = 'hdr-panel card';
  d.dataset.for = anchorId;
  d.style.cssText = `position:fixed;top:${Math.round(r.bottom + 8)}px;${side === 'left' ? 'left:' + Math.max(8, Math.round(r.left)) + 'px' : 'right:12px'};width:min(340px,calc(100vw - 24px));z-index:60;max-height:70vh;overflow:auto`;
  d.innerHTML = html;
  document.body.appendChild(d);
}
addEventListener('click', (e) => {
  if (!e.target.closest('.hdr-panel, .hdr-ic, #user-avatar')) closePanels();
});
addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closePanels();
});

function notificationItems() {
  const items = [],
    mine = visibleOpps().filter((o) => o.stage < 5 && !o.lost);
  mine
    .filter((o) => days(o.close) < 0)
    .forEach((o) =>
      items.push({
        icon: 'warning',
        text: `${o.name} is overdue`,
        sub: `Close date was ${fd(o.close)}`,
        go: `nav('opp-detail',${o.id})`,
      })
    );
  mine
    .filter((o) => days(o.close) >= 0 && days(o.close) <= 7)
    .sort((a, b) => (a.close < b.close ? -1 : 1))
    .forEach((o) =>
      items.push({
        icon: 'event',
        text: `${o.name} closes ${days(o.close) === 0 ? 'today' : 'in ' + days(o.close) + ' days'}`,
        sub: `${E(o.account)} · ${M(o.amount)}`,
        go: `nav('opp-detail',${o.id})`,
      })
    );
  if (S.role !== 'rep') {
    const pending = S.quotes.filter((q) =>
      S.role === 'ceo' ? q.status === 'Pending CEO Approval' : q.status === 'Pending Admin Approval'
    );
    if (pending.length)
      items.unshift({
        icon: 'approval',
        text: `${pending.length} quotation${pending.length > 1 ? 's' : ''} awaiting your approval`,
        sub: 'Open the approval queue',
        go: `nav('approvals')`,
      });
  } else {
    S.quotes
      .filter(
        (q) =>
          ['Approved', 'Rejected'].includes(q.status) &&
          visibleOpps().some((o) => o.id == q.opp) &&
          Date.now() - (q.approvedAt || q.rejectedAt || 0) < 7 * 864e5
      )
      .forEach((q) =>
        items.unshift({
          icon: q.status === 'Approved' ? 'check_circle' : 'cancel',
          text: `Quotation ${q.no} was ${q.status.toLowerCase()}`,
          sub: q.status === 'Approved' ? 'Invoice generated' : 'Review and resubmit',
          go: `openQuoteRecord('${q.no}')`,
        })
      );
  }
  if (S.tasks.length)
    items.push({
      icon: 'task_alt',
      text: `${S.tasks.length} open task${S.tasks.length > 1 ? 's' : ''}`,
      sub: 'View tasks on Home',
      go: `nav('home')`,
    });
  return items;
}
function toggleNotifications() {
  const items = notificationItems();
  openPanel(
    'bell',
    `<div class="p-3 font-bold" style="border-bottom:1px solid var(--bd)">Notifications <span class="chip">${items.length}</span></div>` +
      (items
        .map(
          (n) =>
            `<div class="flex gap-3 p-3 cursor-pointer" style="border-bottom:1px solid var(--bd)" onmouseover="this.style.background='var(--hov)'" onmouseout="this.style.background=''" onclick="closePanels();${n.go}"><span class="ms" style="color:var(--pr)">${n.icon}</span><div><div class="font-semibold">${E(n.text)}</div><small class="mut">${n.sub}</small></div></div>`
        )
        .join('') || '<p class="mut p-4">You are all caught up.</p>')
  );
}
function toggleUserMenu() {
  const u = currentUser();
  openPanel(
    'user-avatar',
    `<div class="p-4" style="border-bottom:1px solid var(--bd)"><b>${E(u.name)}</b><div class="mut">${E(u.username || '')} · ${String(u.role || '').toUpperCase()}</div></div><div class="p-2"><button class="btn w-full justify-center" onclick="closePanels();logoutUser()"><span class="ms">logout</span>Sign out</button></div>`
  );
}
function updateHeader() {
  const u = currentUser(),
    avatar = $('#user-avatar'),
    bell = $('#bell');
  if (avatar && u.name) {
    avatar.textContent = initials(u.name);
    avatar.title = u.name;
  }
  if (bell && S.authUser) {
    const n = notificationItems().length;
    bell.dataset.count = n;
    bell.title = n + ' notification' + (n === 1 ? '' : 's');
  }
}
