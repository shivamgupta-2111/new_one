// Rep details page for Admin / CEO: click a rep's name anywhere to open their stats, deals, quotes and activity log.
// Also owns the global Esc behaviour (close dialog, then menus, then step back out of a detail page).

const canViewReps = () => ['admin', 'ceo'].includes(S.role);
const repByCode = (code) => (S.users || []).find((u) => u.role === 'rep' && u.ownerCode === code);

// Rep name as a link for Admin / CEO; plain text for everyone else (or when there is no matching rep account).
function repLink(code) {
  const name = E(ownerLabel(code));
  if (!canViewReps() || !repByCode(code)) return name;
  const open = `event.stopPropagation();openRep(${E(JSON.stringify(code))})`;
  return `<a class="rep-link" role="link" tabindex="0" title="Open rep details" onclick="${open}" onkeydown="if(event.key==='Enter'){${open}}">${name}</a>`;
}

// Small icon button for places where the rep is shown as a dropdown (Admin / CEO reassign controls).
function repOpenBtn(code) {
  if (!canViewReps() || !repByCode(code)) return '';
  return `<button type="button" class="hdr-ic" style="width:28px;height:28px" title="Open rep details" aria-label="Open rep details" onclick="event.stopPropagation();openRep(${E(JSON.stringify(code))})"><span class="ms" style="font-size:18px">open_in_new</span></button>`;
}

let repReturnTo = 'home';
function openRep(code) {
  if (!canViewReps()) return toast('Rep details are available to Admin and CEO only');
  if (!repByCode(code)) return toast('Rep account not found');
  const here = location.hash.slice(1) || 'home';
  if (here !== 'rep-detail') repReturnTo = here;
  S.curRep = code;
  nav('rep-detail');
}
function closeRep() {
  nav(repReturnTo && repReturnTo !== 'rep-detail' ? repReturnTo : 'home');
}

// Every activity entry on the rep's opportunities, plus quotes they submitted, newest first.
function repLogEntries(u) {
  const mine = S.opps.filter((o) => o.owner === u.ownerCode);
  const ids = new Set(mine.map((o) => String(o.id)));
  const out = [];
  mine.forEach((o) =>
    (S.acts[o.id] || []).forEach((a) =>
      out.push({ k: a.k || 'sync', x: a.x, t: a.t, by: a.by, opp: o })
    )
  );
  S.quotes
    .filter((q) => ids.has(String(q.opp)) && q.requestedAt)
    .forEach((q) => {
      const o = mine.find((x) => String(x.id) === String(q.opp));
      out.push({
        k: 'request_quote',
        x: `Quote ${q.no} submitted for approval (${M(quoteTotal(q))})`,
        t: q.requestedAt,
        by: q.createdBy,
        opp: o,
      });
    });
  return out.sort((a, b) => (b.t || 0) - (a.t || 0));
}

function filterRepLog() {
  const q = ($('#rep-log-q')?.value || '').trim().toLowerCase(),
    k = $('#rep-log-k')?.value || '';
  let shown = 0;
  document.querySelectorAll('#rep-log [data-q]').forEach((el) => {
    const ok = (!k || el.dataset.k === k) && (!q || el.dataset.q.includes(q));
    el.style.display = ok ? '' : 'none';
    if (ok) shown++;
  });
  const n = $('#rep-log-empty');
  if (n) n.style.display = shown ? 'none' : '';
}

V['rep-detail'] = () => {
  if (!canViewReps())
    return `<div class="card p-4"><b>Not available</b><p class="mut mt-1">Rep details are available to Admin and CEO only.</p></div>`;
  const u = repByCode(S.curRep);
  if (!u)
    return `<div class="card p-4"><b>Rep not found</b><p class="mut mt-1">This rep account no longer exists.</p><button class="btn mt-3" onclick="closeRep()">Back</button></div>`;
  const st = repStats(u),
    team = typeof teamById === 'function' && u.teamId ? teamById(u.teamId) : null,
    opps = S.opps.filter((o) => o.owner === u.ownerCode),
    oppIds = new Set(opps.map((o) => String(o.id))),
    quotes = S.quotes.filter((q) => oppIds.has(String(q.opp))),
    log = repLogEntries(u),
    kinds = [...new Set(log.map((a) => a.k))],
    stat = (label, value, sub) =>
      `<div class="card p-3"><div class="mut text-xs">${label}</div><div class="text-lg font-bold">${value}</div>${sub ? `<div class="mut text-xs">${sub}</div>` : ''}</div>`,
    on = u.active !== false;
  const head = `<div class="flex items-center gap-3 flex-wrap mb-3"><button class="btn" onclick="closeRep()" title="Back (Esc)"><span class="ms">arrow_back</span>Back</button><span class="w-10 h-10 rounded-full grid place-items-center font-bold" style="background:var(--hov);color:var(--pr)">${E(personInitials(u.name))}</span><div class="flex-1"><h1 class="text-xl font-bold">${E(u.name)}</h1><div class="mut">${isSeniorRep(u) ? 'Senior sales rep' : 'Sales rep'} · ${E(u.ownerCode)}${team ? ' · ' + E(team.name) : ''}${u.email ? ' · ' + E(u.email) : ''}</div></div><button class="btn" onclick="toggleSeniorRep('${E(u.id)}')">${isSeniorRep(u) ? 'Remove senior rep' : 'Make senior rep'}</button><span class="chip ${on ? 'ok' : 'wr'}">${on ? 'Active' : 'Inactive'}</span></div>`;
  const stats = `<div class="grid grid-cols-2 md:grid-cols-5 gap-3 mb-3">${stat('Revenue won', M(st.won), st.deals + ' deal' + (st.deals === 1 ? '' : 's'))}${stat('Open pipeline', M(st.pipeline))}${stat('Target', M(st.target), Math.round(st.attain) + '% attained')}${stat('Opportunities', opps.length)}${stat('Quotes', quotes.length)}</div>`;
  const oppRows = opps
    .map(
      (o) =>
        `<tr class="r" onclick="nav('opp-detail',${o.id})"><td><b>${E(o.name)}</b></td><td>${E(o.account)}</td><td>${o.lost ? 'Lost' : ST[o.stage]}</td><td>${M(o.amount)}</td><td>${fd(o.close)}</td></tr>`
    )
    .join('');
  const quoteRows = quotes
    .map((q) => {
      const o = opps.find((x) => String(x.id) === String(q.opp)) || {};
      return `<tr class="r" onclick="openQuoteRecord(${E(JSON.stringify(q.no))})"><td><b>${E(q.no)}</b></td><td>${E(o.name || '')}</td><td>${M(quoteTotal(q))}</td><td>${quoteDiscount(q).toFixed(2)}%</td><td>${E(q.status)}</td></tr>`;
    })
    .join('');
  const logRows = log
    .map(
      (a) =>
        `<div class="flex gap-2 py-2 border-b" style="border-color:var(--bd)" data-k="${E(a.k)}" data-q="${E((a.x + ' ' + (a.opp ? a.opp.name : '') + ' ' + (a.by || '')).toLowerCase())}"><span class="ms mut">${E(a.k)}</span><div class="flex-1"><div>${E(a.x)}</div><small class="mut">${a.opp ? `<a class="rep-link" onclick="nav('opp-detail',${a.opp.id})">${E(a.opp.name)}</a> · ` : ''}${a.by ? E(a.by) + ' · ' : ''}${whenText(a.t)} (${ago(a.t)})</small></div></div>`
    )
    .join('');
  const logCard = `<div class="card p-4 mt-3"><div class="flex items-center gap-2 flex-wrap"><b class="flex-1">Activity log (${log.length})</b><input id="rep-log-q" class="inp" style="width:200px" placeholder="Filter log..." aria-label="Filter log" oninput="filterRepLog()"><select id="rep-log-k" class="inp" style="width:auto" aria-label="Filter by type" onchange="filterRepLog()"><option value="">All types</option>${kinds.map((k) => `<option value="${E(k)}">${E(k.replace(/_/g, ' '))}</option>`).join('')}</select></div><div id="rep-log">${logRows}<p id="rep-log-empty" class="mut mt-2" style="${log.length ? 'display:none' : ''}">No activity recorded for this rep yet.</p></div></div>`;
  return (
    head +
    stats +
    `<div class="grid lg:grid-cols-2 gap-3"><div><b>Opportunities (${opps.length})</b>${table(['Name', 'Account', 'Stage', 'Amount', 'Close'], oppRows)}</div><div><b>Quotes (${quotes.length})</b>${table(['Quote', 'Opportunity', 'Total', 'Discount', 'Status'], quoteRows)}</div></div>` +
    logCard
  );
};

// Esc: close a dialog first, then menus, then leave the search box, then step back out of a detail page.
// Registered in the capture phase so it sees the dialog / menu before the other Esc handlers close them.
addEventListener(
  'keydown',
  (e) => {
    if (e.key !== 'Escape' || e.isComposing || !S.authUser) return;
    const modal = $('#modal');
    if (modal && modal.innerHTML.trim()) {
      modal.innerHTML = '';
      return e.preventDefault();
    }
    if (document.querySelector('.hdr-panel')) return; // header menus close themselves
    const t = e.target,
      typing = t && /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName);
    if (typing) {
      if (t.id === 'gs' || t.id === 'rep-log-q') t.blur(); // other inputs (tab rename, forms) handle Esc themselves
      return;
    }
    if ((location.hash.slice(1) || 'home') === 'rep-detail') {
      e.preventDefault();
      closeRep();
    }
  },
  true
);
