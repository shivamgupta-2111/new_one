// Opportunity field definitions, risk scoring, inline field saves and cloning.

const LEFT = [
  ['owner', 'Opportunity owner', 's'],
  ['name', 'Opportunity name', 't'],
  [
    'source',
    'Opportunity source',
    's',
    ['Partner Referral', 'Inbound Web', 'Outbound', 'Trade Show', 'Webinar'],
  ],
  ['account', 'Account name', 'ro'],
  ['type', 'Type', 's', ['New Customer', 'Add-on', 'Renewal']],
  ['channel', 'Revenue channel', 's', ['Direct', 'Partner', 'Distributor']],
  ['refRep', 'Referral rep', 't'],
  ['currency', 'Currency', 's', ['USD', 'EUR', 'GBP', 'INR']],
  ['hold', 'Hold tag', 't'],
  ['chInit', 'Channel initiated', 'b'],
  ['so', 'Sales order number', 't'],
  ['bill', 'Auto bill status', 's', ['Not started', 'Active', 'Paused']],
  ['last', 'Last activity', 'ro'],
  ['state', 'Account state', 't'],
  ['competitor', 'Competitor', 't'],
];
const RIGHT = [
  ['rt', 'Record type', 's', ['Enterprise', 'Renewal', 'Expansion']],
  ['sdr', 'Stage duration risk', 's', ['N/A', 'Low', 'Medium', 'High']],
  ['amount', 'Amount (from products)', 'ro'],
  ['orig', 'Original amount', 'n'],
  ['close', 'Close date', 'd'],
  ['stage', 'Stage', 'ro'],
  ['prob', 'Probability', 'ro'],
  ['fc', 'Forecast status', 's', ['Pipeline', 'Best case', 'Commit', 'Closed', 'Omitted']],
  ['mfo', 'Manager forecast override', 's', ['None', 'Pipeline', 'Commit']],
  ['next', 'Next step', 't'],
  ['won', 'Why we won', 'ta'],
  ['lost', 'Why we lost', 'ta'],
  ['risk', 'Risk classification', 's', ['None', 'Low', 'Medium', 'High']],
  ['churn', 'Risk/churn level', 's', ['Level 1', 'Level 2', 'Level 3']],
  ['notes', 'At-risk notes', 'ta'],
  ['desc', 'Description', 'ta'],
];
const gv = (o, k) => {
  const f = o.f || {},
    a = S.acts[o.id] || [],
    m = {
      owner: o.owner,
      name: o.name,
      account: o.account,
      close: o.close,
      next: o.next,
      amount: o.amount,
      stage: o.lost ? 'Closed Lost' : ST[o.stage],
      prob: prob(o) + '%',
      last: a[0] ? ago(a[0].t) : 'None',
      source: 'Partner Referral',
      type: 'New Customer',
      channel: 'Direct',
      currency: 'USD',
      bill: 'Not started',
      rt: 'Enterprise',
      sdr: 'N/A',
      fc: o.stage == 5 ? 'Closed' : o.stage >= 3 ? 'Commit' : 'Pipeline',
      mfo: 'None',
      risk: 'None',
      churn: 'Level 1',
      orig: o.amount,
    };
  return k in f ? f[k] : (m[k] ?? '');
};
const riskOf = (o) => {
  const r = gv(o, 'risk');
  return r != 'None'
    ? r
    : o.stage == 5
      ? 'None'
      : days(o.close) <= 3
        ? 'High'
        : days(o.close) <= 10 && o.stage >= 3
          ? 'Medium'
          : 'Low';
};
const fld = (o, [k, l, t, op]) => {
  const v = gv(o, k),
    ed = S.ed == k && t != 'ro' && t != 'b';
  let b;
  if (t == 'b')
    b = `<input type="checkbox" ${v ? 'checked' : ''} onchange="sf('${k}',this.checked)">`;
  else if (ed) {
    const a = `data-ed onchange="sf('${k}',this.value)" onblur="S.ed=null;render()"`;
    b =
      t == 's'
        ? `<select class="inp" ${a}>${(k == 'owner' ? assignableReps().map((u) => u.ownerCode) : op).map((x) => `<option value="${x}" ${x == v ? 'selected' : ''}>${k == 'owner' ? E(ownerLabel(x)) : x}</option>`).join('')}</select>`
        : t == 'ta'
          ? `<textarea class="inp" rows="3" ${a}>${E(v)}</textarea>`
          : `<input class="inp" type="${t == 'n' ? 'number' : t == 'd' ? 'date' : 'text'}" value="${E(v)}" ${a}>`;
  } else
    b = `<div class="font-semibold break-words">${t == 'n' ? M(v) : t == 'd' ? fd(v) : k == 'amount' ? M(v) : k == 'owner' ? E(ownerLabel(v)) : E(v) || '–'}</div>`;
  return `<div class="py-2 border-b flex justify-between gap-2" style="border-color:var(--bd)"><div class="min-w-0 flex-1"><div class="mut text-[11px]">${l}</div>${b}</div>${t == 'ro' || t == 'b' ? '' : `<span class="ms mut" style="font-size:16px;cursor:pointer" title="Edit" onclick="S.ed='${k}';render()">edit</span>`}</div>`;
};
function sf(k, v) {
  const o = cur();
  if (['owner', 'name', 'close', 'next'].includes(k)) o[k] = v;
  else (o.f = o.f || {})[k] = k == 'orig' ? +v : v;
  S.ed = null;
  save();
  toast('Saved');
  render();
}
function roles(o) {
  return (o.roles =
    o.roles ||
    S.contacts
      .filter((c) => c[2] == o.account)
      .map((c, i) => ({
        name: c[0],
        role: i ? 'Technical Evaluator' : 'Decision Maker',
        primary: !i,
      })));
}
function cloneOpp(rel) {
  const o = clone(cur());
  o.id = Math.max(...S.opps.map((x) => x.id)) + 1;
  o.name += ' (clone)';
  if (rel) S.acts[o.id] = clone(S.acts[S.cur] || []);
  S.opps.push(o);
  S.cur = o.id;
  save();
  toast(rel ? 'Cloned with related records' : 'Opportunity cloned');
  nav('opp-detail');
}
const tab = (t) => {
  S.tab = t;
  render();
};
