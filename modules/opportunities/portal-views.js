// Portal-aware home, opportunity board and quotes views.

V.home = () => {
  const all = visibleOpps(),
    open = all.filter((o) => o.stage < 5 && !o.lost),
    won = all.filter((o) => o.stage === 5 && !o.lost).reduce((a, o) => a + o.amount, 0),
    pipe = open.reduce((a, o) => a + o.amount, 0),
    weighted = open.reduce((a, o) => a + (o.amount * prob(o)) / 100, 0),
    top = [...open].sort((a, b) => b.amount - a.amount).slice(0, 5),
    risk = open
      .filter((o) => /renew|support|sla/i.test(o.name) || o.f?.risk === 'High')
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5),
    riskValue = risk.reduce((a, o) => a + o.amount, 0),
    pending = S.quotes.filter(
      (q) => q.status === 'Pending Admin Approval' || q.status === 'Pending CEO Approval'
    ),
    invCount = S.invoices.filter((i) => all.some((o) => o.id == i.opp)).length;
  const kp = (l, v, s) =>
    `<div class="card p-4"><div class="mut font-semibold">${l}</div><div class="text-2xl font-bold mt-1">${v}</div><div class="mut mt-1">${s}</div></div>`;
  return `<div class="mb-4"><h1 class="text-2xl font-bold">Good ${new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, ${roleNow().name}</h1><p class="mut">${open.length} active deals · ${S.tasks.length} open tasks · ${pending.length} quotations awaiting approval.</p></div><div class="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-3">${kp('Open pipeline', M(pipe), open.length + ' active deals')}${kp('Weighted forecast', M(weighted), 'Stage-weighted expected revenue')}${kp('Closed won revenue', M(won), 'Won opportunities')}${kp('Win rate', Math.round((all.filter((o) => o.stage === 5 && !o.lost).length / Math.max(all.length, 1)) * 100) + '%', 'Across visible opportunities')}${kp('Top deal', top[0] ? M(top[0].amount) : '—', top[0] ? E(top[0].name) : 'No open deals')}${kp('Churn watchlist', risk.length, 'Accounts needing attention')}${kp('Revenue at risk', M(riskValue), 'Risk / renewal exposure')}${kp('Invoices generated', invCount, 'Approved quotations')}</div><div class="grid lg:grid-cols-2 gap-3"><div class="card p-4"><b>Top opportunities</b>${table(['Opportunity', 'Account', 'Amount'], top.map((o) => `<tr class="r" onclick="nav('opp-detail',${o.id})"><td>${E(o.name)}</td><td>${E(o.account)}</td><td><b>${M(o.amount)}</b></td></tr>`).join(''))}</div><div class="card p-4"><b>Churn watchlist</b>${table(['Account', 'Opportunity', 'Revenue at risk'], risk.map((o) => `<tr class="r" onclick="nav('opp-detail',${o.id})"><td>${E(o.account)}</td><td>${E(o.name)}</td><td>${M(o.amount)}</td></tr>`).join(''))}</div><div class="card p-4"><b>Closing soon</b>${table(
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
      .filter((t) => S.role !== 'rep' || all.some((o) => o.id == t.opp))
      .map(
        (t, i) =>
          `<div class="py-2 border-b" style="border-color:var(--bd)">${E(t.t)} <small class="mut">· ${t.due}</small></div>`
      )
      .join('') || '<p class="mut mt-2">No open tasks.</p>'
  }</div></div>`;
};
const prototypeOpportunityBoard = V.opps;
V.opps = () => {
  S.mine = S.role === 'rep';
  return prototypeOpportunityBoard();
};
V.quotes = () => {
  const list = S.quotes.filter((q) => S.role !== 'rep' || visibleOpps().some((o) => o.id == q.opp));
  return (
    `<h1 class="text-xl font-bold mb-3">Quotations</h1><p class="mut mb-3">Rep authority 2% · Admin authority 5% · CEO unlimited. Below-minimum product prices always require CEO approval.</p>` +
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
