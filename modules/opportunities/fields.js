// Opportunity field definitions, risk scoring, inline field saves and cloning.

const CHURN_REASONS = [
  'Budget cuts',
  'Going with a competitor',
  'Champion left',
  'Product fit',
  'Pricing',
  'Low usage',
  'Contract terms',
  'Merger / acquisition',
  'Support issues',
  'Other',
];
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
  ['churnWhy', 'Churn reasons', 'ms', CHURN_REASONS],
  ['churnNotes', 'Churn notes', 'ta'],
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
  if (k === 'owner' && !canEditOwner()) t = 'ro';
  const v = gv(o, k),
    ed = S.ed == k && t != 'ro' && t != 'b';
  let b;
  if (t == 'b')
    b = `<input class="sf-cb" type="checkbox" aria-label="${E(l)}" ${v ? 'checked' : ''} onchange="sf('${k}',this.checked)">`;
  else if (t == 'ms') {
    const picked = Array.isArray(v) ? v : [];
    b = ed
      ? `<div class="sf-ms">${op.map((x) => `<label class="flex items-center gap-2 py-0.5"><input type="checkbox" value="${E(x)}" ${picked.includes(x) ? 'checked' : ''}> ${E(x)}</label>`).join('')}<div class="flex gap-2 mt-2"><button type="button" class="btn btn-p" onclick="saveMs('${k}',this)">Save</button><button type="button" class="btn" onclick="S.ed=null;render()">Cancel</button></div></div>`
      : picked.length
        ? `<div class="flex flex-wrap gap-1">${picked.map((x) => `<span class="chip wr">${E(x)}</span>`).join('')}</div>`
        : '–';
  } else if (ed) {
    const a = `data-ed onchange="sf('${k}',this.value)" onblur="S.ed=null;render()"`;
    b =
      t == 's'
        ? `<select class="inp" ${a}>${(k == 'owner' ? assignableReps().map((u) => u.ownerCode) : op).map((x) => `<option value="${x}" ${x == v ? 'selected' : ''}>${k == 'owner' ? E(ownerLabel(x)) : x}</option>`).join('')}</select>`
        : t == 'ta'
          ? `<textarea class="inp" rows="3" ${a}>${E(v)}</textarea>`
          : `<input class="inp" type="${t == 'n' ? 'number' : t == 'd' ? 'date' : 'text'}" value="${E(v)}" ${a}>`;
  } else
    b = `<div style="white-space:pre-wrap">${t == 'n' ? (v === '' || v == null ? '–' : M(v)) : t == 'd' ? (v ? fd(v) : '–') : k == 'amount' ? M(v) : k == 'owner' ? repLink(v) : k == 'account' ? acctSpan(v) + acctEditBtn(v) : E(v) || '–'}</div>`;
  const pen =
    t == 'ro' || t == 'b'
      ? ''
      : `<span class="ms" title="Edit ${E(l)}" onclick="S.ed='${k}';render()">edit</span>`;
  return sfRow(l, b, pen);
};
// One label / value row of the record page.
const sfRow = (label, valueHtml, penHtml = '') =>
  `<div class="sf-row"><div class="sf-l">${label}</div><div class="sf-v">${valueHtml}</div><div class="sf-pen">${penHtml}</div></div>`;
function saveMs(k, btn) {
  const vals = [...btn.closest('.sf-ms').querySelectorAll('input:checked')].map((i) => i.value);
  sf(k, vals);
}
function sf(k, v) {
  const o = cur(),
    before = gv(o, k);
  if (String(before) !== String(v)) recordFieldChange(o, k, before, v);
  if (['owner', 'name', 'close', 'next'].includes(k)) o[k] = v;
  else (o.f = o.f || {})[k] = k == 'orig' || NUM_KEYS.has(k) ? +v : v;
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
