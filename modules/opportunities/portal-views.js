// Portal-aware home, opportunity board and quotes views.

// ---------- dashboard chart helpers (plain HTML, no chart library) ----------
// Horizontal bars: rows = [{ label, value, sub, click }]. One series, one colour; the value is printed at the bar end.
function dashBars(rows, tone = '', fmt = M) {
  const mx = Math.max(1, ...rows.map((r) => r.value));
  if (!rows.length) return '<p class="mut mt-3">Nothing to show yet.</p>';
  return `<div class="hb">${rows
    .map(
      (r) =>
        `<div class="hb-row${r.click ? ' r' : ''}" ${r.click ? `onclick="${r.click}"` : ''} title="${E(r.label)}: ${fmt(r.value)}${r.sub ? ' · ' + E(r.sub) : ''}"><div class="hb-label"><div class="hb-name">${E(r.label)}</div>${r.sub ? `<div class="hb-sub">${E(r.sub)}</div>` : ''}</div><div class="hb-track"><div class="hb-bar ${tone}" style="width:${r.value ? Math.max(1.5, (r.value / mx) * 100) : 0}%"></div></div><div class="hb-val">${fmt(r.value)}</div></div>`
    )
    .join('')}</div>`;
}
// Columns over time: cols = [{ label, value }]. Labels only on the latest and the highest column.
function dashColumns(cols, fmt = M) {
  const mx = Math.max(1, ...cols.map((c) => c.value)),
    hi = cols.reduce((b, c, i) => (c.value > cols[b].value ? i : b), 0),
    last = cols.length - 1;
  return `<div class="vc">${cols
    .map(
      (c, i) =>
        `<div class="vc-col" title="${E(c.label)}: ${fmt(c.value)}"><div class="vc-val">${(i === hi || i === last) && c.value ? fmt(c.value) : ''}</div><div class="vc-bar-wrap"><div class="vc-bar" style="height:${c.value ? Math.max(2, (c.value / mx) * 100) : 0}%"></div></div><div class="vc-label">${E(c.label)}</div></div>`
    )
    .join('')}</div>`;
}
const dashCard = (title, sub, body, extra = '') =>
  `<div class="card p-4 dash-card"><div class="flex items-start gap-2"><div class="flex-1"><b>${title}</b>${sub ? `<div class="mut text-xs mt-0.5">${sub}</div>` : ''}</div>${extra}</div>${body}</div>`;

V.home = () => {
  const rep = !seesAllOpps(),
    scope = rep && S.homeScope === 'team' ? 'team' : 'mine',
    all = rep && scope === 'team' ? teamVisibleOpps() : visibleOpps(),
    open = all.filter((o) => o.stage < 5 && !o.lost),
    wonDeals = all.filter((o) => o.stage === 5 && !o.lost),
    lostDeals = all.filter((o) => o.lost),
    won = wonDeals.reduce((a, o) => a + o.amount, 0),
    pipe = open.reduce((a, o) => a + o.amount, 0),
    weighted = open.reduce((a, o) => a + (o.amount * prob(o)) / 100, 0),
    winRate = Math.round((wonDeals.length / Math.max(wonDeals.length + lostDeals.length, 1)) * 100),
    top = [...open].sort((a, b) => b.amount - a.amount).slice(0, 5),
    riskAll = open.filter((o) => /renew|support|sla/i.test(o.name) || o.f?.risk === 'High'),
    risk = [...riskAll].sort((a, b) => b.amount - a.amount).slice(0, 5),
    riskValue = riskAll.reduce((a, o) => a + o.amount, 0),
    healthy = Math.max(pipe - riskValue, 0),
    pending = S.quotes.filter(
      (q) => q.status === 'Pending Admin Approval' || q.status === 'Pending CEO Approval'
    ),
    invCount = S.invoices.filter((i) => all.some((o) => o.id == i.opp)).length;
  // won revenue by close month, last six months up to this month
  const now = new Date(),
    months = [...Array(6)].map((_, k) => {
      const d = new Date(now.getFullYear(), now.getMonth() - 5 + k, 1);
      const key = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
      return {
        label: d.toLocaleDateString('en-IN', { month: 'short' }),
        value: wonDeals
          .filter((o) => String(o.close).slice(0, 7) === key)
          .reduce((a, o) => a + o.amount, 0),
      };
    });
  const byStage = ST.slice(0, 5).map((st, i) => {
    const d = open.filter((o) => o.stage === i);
    return {
      label: st,
      value: d.reduce((a, o) => a + o.amount, 0),
      sub: d.length + (d.length === 1 ? ' deal' : ' deals'),
      click: "S.view='list';nav('opps')",
    };
  });
  const kp = (l, v, s, bar) =>
    `<div class="card p-4"><div class="mut font-semibold">${l}</div><div class="text-2xl font-bold mt-1">${v}</div>${bar != null ? `<div class="kp-meter" title="${l}: ${v}"><div style="width:${Math.min(100, bar)}%"></div></div>` : ''}<div class="mut mt-1">${s}</div></div>`;
  const scopeToggle = rep
    ? `<div class="seg" role="group" aria-label="Dashboard scope"><button class="${scope === 'mine' ? 'on' : ''}" onclick="S.homeScope='mine';save();render()">My deals</button><button class="${scope === 'team' ? 'on' : ''}" onclick="S.homeScope='team';save();render()">My team</button></div>`
    : '';
  const riskShare = pipe ? Math.round((riskValue / pipe) * 100) : 0;
  const churnBody = `<div class="split-bar" title="At risk ${M(riskValue)} of ${M(pipe)} open pipeline">${healthy ? `<div class="sb-ok" style="flex:${healthy}"></div>` : ''}${riskValue ? `<div class="sb-risk" style="flex:${riskValue}"></div>` : ''}${!pipe ? '<div class="sb-empty"></div>' : ''}</div><div class="legend"><span><i class="sw ok"></i>Healthy ${M(healthy)}</span><span><i class="sw risk"></i>At risk ${M(riskValue)} (${riskShare}%)</span></div>${dashBars(
    risk.map((o) => ({
      label: o.account,
      value: o.amount,
      sub: o.name + (o.f?.risk === 'High' ? ' · High risk' : ' · Renewal / support'),
      click: `nav('opp-detail',${o.id})`,
    })),
    'risk'
  )}`;
  return `<div class="mb-4 flex flex-wrap items-end gap-3"><div class="flex-1"><h1 class="text-2xl font-bold">Good ${now.getHours() < 12 ? 'morning' : now.getHours() < 17 ? 'afternoon' : 'evening'}, ${E(roleNow().name)}</h1><p class="mut">${open.length} active deals · ${S.tasks.length} open tasks · ${pending.length} quotations awaiting approval${canSeeInvoices() ? ` · ${invCount} invoices` : ''}${rep && scope === 'team' ? ` · showing ${E(oppTeamName({ owner: roleNow().owner }) || 'your team')}` : ''}</p></div>${scopeToggle}</div>
<div class="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-3">${kp('Open pipeline', M(pipe), open.length + ' active deals')}${kp('Weighted forecast', M(weighted), 'Stage-weighted expected revenue', pipe ? (weighted / pipe) * 100 : 0)}${kp('Closed won revenue', M(won), wonDeals.length + (wonDeals.length === 1 ? ' won deal' : ' won deals'))}${kp('Win rate', winRate + '%', `${wonDeals.length} won of ${wonDeals.length + lostDeals.length} closed`, winRate)}</div>
<!--dash-activity-->
<div class="grid lg:grid-cols-2 gap-3 mb-3">${dashCard('Pipeline by stage', 'Open deal value at each stage · click to open the list', dashBars(byStage))}${dashCard('Won revenue by month', 'Closed won deals by close month, last 6 months', dashColumns(months))}</div>
<div class="grid lg:grid-cols-2 gap-3 mb-3">${dashCard('Top deals', 'Five largest open opportunities', dashBars(top.map((o) => ({ label: o.name, value: o.amount, sub: o.account + ' · ' + ST[o.stage], click: `nav('opp-detail',${o.id})` }))))}${dashCard('<span class="inline-flex items-center gap-1"><span class="ms" style="color:var(--warn)">warning</span>Churn watchlist</span>', `${riskAll.length} ${riskAll.length === 1 ? 'deal' : 'deals'} at risk · renewals, support and high-risk flags`, churnBody)}</div>
<!--dash-board-->
<div class="grid lg:grid-cols-2 gap-3"><div class="card p-4"><b>Closing soon</b>${table(
    ['Deal', 'Account', 'Amount', 'Close'],
    [...open]
      .sort((a, b) => a.close.localeCompare(b.close))
      .slice(0, 5)
      .map(
        (o) =>
          `<tr class="r" onclick="nav('opp-detail',${o.id})"><td>${E(o.name)}</td><td>${E(o.account)}</td><td>${M(o.amount)}</td><td>${fd(o.close)}</td></tr>`
      )
      .join('')
  )}</div><div class="card p-4"><b>My tasks</b>${
    S.tasks
      .filter((t) => S.role !== 'rep' || visibleOpps().some((o) => o.id == t.opp))
      .map(
        (t) =>
          `<div class="py-2 border-b" style="border-color:var(--bd)">${E(t.t)} <small class="mut">· ${t.due}</small></div>`
      )
      .join('') || '<p class="mut mt-2">No open tasks.</p>'
  }</div></div>`;
};
const prototypeOpportunityBoard = V.opps;
V.opps = () => {
  S.mine = !seesAllOpps();
  return prototypeOpportunityBoard();
};
V.quotes = () => {
  const list = S.quotes.filter((q) => S.role !== 'rep' || visibleOpps().some((o) => o.id == q.opp));
  return (
    `<h1 class="text-xl font-bold mb-3">Quotations</h1><p class="mut mb-3">Rep discounts need approval · Admin authority ${adminDiscountLimit()}% · CEO unlimited. Below-minimum product prices always require CEO approval.</p>` +
    table(
      ['Quotation no.', 'Opportunity', 'Total', 'Discount', 'Status', 'Invoice no.'],
      list
        .map((q) => {
          const o = S.opps.find((x) => x.id == q.opp) || {},
            inv = q.invoiceId && S.invoices.find((x) => x.id === q.invoiceId);
          return `<tr class="r" title="Open quotation ${q.no}" onclick="openQuoteRecord('${q.no}')"><td><b>${q.no}</b></td><td>${E(o.name || '')}</td><td>${M(quoteTotal(q))}</td><td>${quoteDiscount(q).toFixed(2)}%</td><td>${E(q.status)}</td><td>${inv ? `<a style="color:var(--pr)" onclick="event.stopPropagation();openInvoice('${inv.id}')">${inv.invoiceNo}</a>` : '—'}</td></tr>`;
        })
        .join('')
    )
  );
};
