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

// Everything that could be notified about, before anything is dismissed.
function allNotificationItems() {
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
// Dismissed notifications are remembered per person, keyed by their text.
// A changed text (for example a new count) counts as a new notification.
function dismissedNotes() {
  S.dismissed = S.dismissed || {};
  const id = S.authUser || 'anon';
  return (S.dismissed[id] = S.dismissed[id] || []);
}
function notificationItems() {
  const gone = new Set(dismissedNotes());
  return allNotificationItems().filter((n) => !gone.has(n.text));
}
function refreshNotifications() {
  closePanels();
  toggleNotifications();
  updateHeader();
}
function dismissNotification(index) {
  const item = notificationItems()[index];
  if (!item) return;
  dismissedNotes().push(item.text);
  save();
  refreshNotifications();
}
// Keeps only entries that are still current, so the list never grows forever.
function clearNotifications() {
  S.dismissed = S.dismissed || {};
  S.dismissed[S.authUser || 'anon'] = allNotificationItems().map((n) => n.text);
  save();
  refreshNotifications();
  toast('Notifications cleared');
}
function toggleNotifications() {
  const items = notificationItems();
  const clearAll = items.length
    ? `<button class="btn" style="padding:2px 10px;font-size:12px" onclick="clearNotifications()"><span class="ms" style="font-size:16px">done_all</span>Clear all</button>`
    : '';
  const head = `<div class="p-3 font-bold flex items-center gap-2" style="border-bottom:1px solid var(--bd)">Notifications <span class="chip">${items.length}</span><span class="flex-1"></span>${clearAll}</div>`;
  const rows = items
    .map(
      (n, i) =>
        `<div class="note-row flex gap-3 p-3 cursor-pointer" style="border-bottom:1px solid var(--bd)" onmouseover="this.style.background='var(--hov)'" onmouseout="this.style.background=''" onclick="closePanels();${n.go}"><span class="ms" style="color:var(--pr)">${n.icon}</span><div class="flex-1"><div class="font-semibold">${E(n.text)}</div><small class="mut">${n.sub}</small></div><button class="note-x" title="Dismiss" aria-label="Dismiss notification" onclick="event.stopPropagation();dismissNotification(${i})"><span class="ms" style="font-size:16px">close</span></button></div>`
    )
    .join('');
  openPanel('bell', head + (rows || '<p class="mut p-4">You are all caught up.</p>'));
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
