// Shared constants and small helpers: storage key, date/currency/escape formatters, owner and rep lookups.

const KEY = 'sc-proto-v2',
  $ = (s) => document.querySelector(s);
const D = (n) => new Date(Date.now() + n * 864e5).toISOString().slice(0, 10);
const fd = (s) =>
  new Date(s + 'T00:00').toLocaleDateString('en-IN', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
const M = (n) => '₹' + Math.round(Number(n) || 0).toLocaleString('en-IN');
const E = (s) =>
  String(s ?? '').replace(
    /[&<>"]/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]
  );
const ST = [
    'Prospecting',
    'Qualification',
    'Needs Analysis',
    'Proposal',
    'Negotiation',
    'Closed Won',
  ],
  PR = [10, 20, 40, 75, 90, 100];
const OWN = {
  AL: 'Alex Lee',
  SC: 'Sara Chen',
  DM: 'Dan Mills',
  RV: 'Ravi Verma',
  TS: 'Tony Stark',
};
const activeReps = () => (S.users || []).filter((u) => u.role === 'rep' && u.active !== false);
function ownerLabel(code) {
  const user = (S.users || []).find((u) => u.ownerCode === code);
  return user ? user.name : OWN[code] || code || 'Unassigned';
}
function assignableReps() {
  return S.role === 'rep' && !canAddOpportunity()
    ? activeReps().filter((u) => u.ownerCode === roleNow().owner)
    : activeReps();
}
function repOptions(selected) {
  return assignableReps()
    .map(
      (u) =>
        `<option value="${E(u.ownerCode)}" ${u.ownerCode === selected ? 'selected' : ''}>${E(u.name)}</option>`
    )
    .join('');
}
function defaultRepCode() {
  return S.role === 'rep' ? roleNow().owner : activeReps()[0]?.ownerCode || roleNow().owner;
}
const CAT = [
  ['Security Platform Enterprise', 'SEC-800', 800],
  ['24/7 Platinum Global Support', 'SVC-902', 120000],
  ['Zero Trust Threat Intelligence Hub', 'SEC-880', 250000],
  ['Hardware Security Appliance Node', 'HW-410', 45000],
  ['Data Cloud Connector', 'DC-210', 65000],
  ['Analytics Suite License', 'AN-300', 160000],
];
const ago = (t) => {
  const h = (Date.now() - t) / 36e5;
  return h < 1
    ? 'Just now'
    : h < 24
      ? Math.round(h) + ' hours ago'
      : Math.round(h / 24) + ' days ago';
};
const days = (s) => Math.round((new Date(s + 'T00:00') - new Date(D(0) + 'T00:00')) / 864e5);
const clone = (x) => JSON.parse(JSON.stringify(x));

// Demo seed data used the first time the app loads (or after "Reset demo").

function seed() {
  const R = [
    ['Acme Corp - 500 Enterprise Licenses', 'Acme Corporation', 120000, 0, 16, 'AL', ''],
    [
      'Pinnacle Financial - Data Cloud',
      'Pinnacle Financial Ltd',
      65000,
      0,
      29,
      'SC',
      'Schedule discovery call',
    ],
    ['Globex - Global Cloud Migration', 'Globex International', 280000, 1, 33, 'DM', ''],
    [
      'Wayne Ent - Hardware Renewal',
      'Wayne Enterprises',
      140000,
      1,
      41,
      'AL',
      'Technical scope review',
    ],
    [
      'Initech - Analytics Suite',
      'Initech Software',
      160000,
      2,
      21,
      'RV',
      'Deliver architecture blueprint',
    ],
    ['Hooli - Enterprise Support Add-on', 'Hooli Corporation', 150000, 2, 46, 'SC', ''],
    [
      'Stark Ind - Q3 Security Platform',
      'Stark Industries',
      520000,
      3,
      2,
      'TS',
      'Send revised MSA & discount auth',
    ],
    ['Cyberdyne - AI Inference Cluster', 'Cyberdyne Systems', 375000, 3, 9, 'AL', ''],
    [
      'Umbrella Corp - Global Multi-tenant',
      'Umbrella Pharmaceuticals',
      450000,
      4,
      1,
      'SC',
      'Legal sign-off on redlines',
    ],
    ['Massive Dynamic - Platform SLA', 'Massive Dynamic LLC', 190000, 4, 6, 'DM', ''],
    ['Soylent Corp - 3-Year Enterprise Agreement', 'Soylent Corporation', 750000, 5, -12, 'SC', ''],
    ['Tyrell Corp - Bio-Cloud Integration', 'Tyrell Corporation', 500000, 5, -8, 'AL', ''],
  ];
  const opps = R.map((r, i) => ({
    id: i + 1,
    name: r[0],
    account: r[1],
    amount: r[2],
    stage: r[3],
    close: D(r[4]),
    owner: r[5],
    next: r[6],
    items: [{ n: 'Platform licence', c: 'GEN-100', p: r[2], q: 1, d: 0 }],
  }));
  opps[6].items = [
    { n: '24/7 Platinum Global Support', c: 'SVC-902', p: 120000, q: 1, d: 0 },
    { n: 'Zero Trust Threat Intelligence Hub', c: 'SEC-880', p: 250000, q: 1, d: 5 },
    { n: 'Hardware Security Appliance Node', c: 'HW-410', p: 45000, q: 4, d: 10 },
  ];
  const h = 36e5,
    now = Date.now();
  return {
    opps,
    cur: 7,
    view: 'kanban',
    quotes: [],
    contacts: [
      ['Pepper Potts', 'Chief Operating Officer', 'Stark Industries', 'ppotts@starkindustries.com'],
      ['James Rhodes', 'Liaison Officer', 'Stark Industries', 'jrhodes@af.mil'],
      ['Bruce Wayne', 'CEO', 'Wayne Enterprises', 'bruce@wayne-ent.com'],
      ['Hank Scorpio', 'VP Procurement', 'Globex International', 'hank@globex.com'],
      ['Peter Gibbons', 'Director of IT', 'Initech Software', 'peter@initech.com'],
      ['Gavin Belson', 'Head of Platform', 'Hooli Corporation', 'gavin@hooli.com'],
      ['Albert Wesker', 'CTO', 'Umbrella Pharmaceuticals', 'awesker@umbrella.com'],
      ['Nellie Bertram', 'Procurement Lead', 'Acme Corporation', 'nellie@acme.com'],
    ],
    leads: [
      ['Maya Patel', 'Northwind Traders', 'Webinar', 'New'],
      ['Jordan Reyes', 'Vandelay Industries', 'Partner Referral', 'Working'],
      ['Priya Nair', 'Wonka Labs', 'Trade Show', 'New'],
      ['Chris Okafor', 'Oscorp', 'Inbound Web', 'Working'],
      ['Elena Rossi', 'Gringotts Capital', 'Outbound', 'New'],
    ],
    tasks: [
      { t: 'Follow up on revised SLA contract', due: 'Today', opp: 7 },
      { t: 'Send MSA redlines to legal', due: 'Tomorrow', opp: 9 },
      { t: 'Prep demo for Cyberdyne', due: 'In 3 days', opp: 8 },
      { t: 'Schedule discovery call with Pinnacle', due: 'In 4 days', opp: 2 },
    ],
    acts: {
      7: [
        {
          k: 'mail',
          x: 'Email sent: Stark Industries - Q3 Platform Proposal v2.pdf',
          t: now - 26 * h,
        },
        {
          k: 'call',
          x: 'Discovery call with VP of Infrastructure (42 min). Budget authority confirmed.',
          t: now - 75 * h,
        },
        { k: 'sync', x: 'Stage changed to Proposal', t: now - 120 * h },
      ],
    },
  };
}

// App state S: load/save, current record, toast, hash navigation and table helper.

function load() {
  try {
    return JSON.parse(localStorage.getItem(KEY));
  } catch (e) {
    return null;
  }
}
function save() {
  try {
    const data = { ...S };
    delete data.authUser;
    localStorage.setItem(KEY, JSON.stringify(data));
    if (S.authUser) sessionStorage.setItem('sc-auth-user', S.authUser);
    else sessionStorage.removeItem('sc-auth-user');
  } catch (e) {}
}
let S = load() || seed();
try {
  S.authUser = sessionStorage.getItem('sc-auth-user') || null;
} catch (e) {
  S.authUser = null;
}
const cur = () => S.opps.find((o) => o.id == S.cur),
  prob = (o) => (o.lost ? 0 : PR[o.stage]);
function toast(m) {
  const t = $('#toast');
  t.innerHTML = `<div class="card px-4 py-2 shadow-lg font-semibold" style="background:var(--tx);color:var(--bg)">${m}</div>`;
  clearTimeout(toast.t);
  toast.t = setTimeout(() => (t.innerHTML = ''), 2600);
}
function nav(v, id) {
  if (id) S.cur = id;
  save();
  if (location.hash === '#' + v) render();
  else location.hash = v;
}
const chipC = (o) => (o.stage == 5 ? 'ok' : days(o.close) <= 3 ? 'wr' : '');
function table(h, rows) {
  return `<div class="card overflow-x-auto"><table><thead><tr>${h.map((x) => `<th>${x}</th>`).join('')}</tr></thead><tbody>${rows || `<tr><td colspan="9" class="mut">Nothing here yet. Use New to add the first record.</td></tr>`}</tbody></table></div>`;
}

// Home dashboard, pipeline board and stage drag/drop.

const V = {};
V.home = () => {
  const op = S.opps.filter((o) => o.stage < 5),
    won = S.opps.filter((o) => o.stage == 5 && !o.lost).reduce((a, o) => a + o.amount, 0),
    pipe = op.reduce((a, o) => a + o.amount, 0),
    w = op.reduce((a, o) => a + (o.amount * prob(o)) / 100, 0),
    Q = 2000000;
  const by = ST.slice(0, 5).map((s, i) => [
      s,
      S.opps.filter((o) => o.stage == i).reduce((a, o) => a + o.amount, 0),
    ]),
    mx = Math.max(...by.map((b) => b[1]), 1);
  const soon = [...op].sort((a, b) => (a.close < b.close ? -1 : 1)).slice(0, 5);
  const hr = new Date().getHours(),
    g = hr < 12 ? 'Good morning' : hr < 17 ? 'Good afternoon' : 'Good evening';
  const kp = (l, v, s) =>
    `<div class="card p-4"><div class="mut font-semibold">${l}</div><div class="text-2xl font-bold mt-1">${v}</div><div class="mut mt-1">${s}</div></div>`;
  const hot = S.opps.find((o) => o.id == 7 && o.stage < 5);
  return `<div class="mb-4"><h1 class="text-2xl font-bold">${g}, Alex</h1><p class="mut">You have ${op.filter((o) => days(o.close) <= 7).length} deals closing within a week and ${S.tasks.length} open tasks.</p></div>
 <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-3">${kp('Open pipeline', M(pipe), op.length + ' active deals')}${kp('Weighted forecast', M(w), 'Based on stage probability')}${kp('Closed won this quarter', M(won), Math.round((won / Q) * 100) + '% of ' + M(Q) + ' quota')}${kp('Win rate', Math.round((S.opps.filter((o) => o.stage == 5).length / S.opps.length) * 100) + '%', 'Across ' + S.opps.length + ' opportunities')}</div>
 <div class="grid lg:grid-cols-3 gap-3">
 <div class="card p-4 lg:col-span-2"><b>Pipeline by stage</b><div class="mt-3 space-y-2">${by.map(([s, v], i) => `<div class="flex items-center gap-3 cursor-pointer" onclick="S.view='kanban';nav('opps')"><span class="w-32 shrink-0">${s}</span><div class="flex-1 h-6 rounded" style="background:var(--hov)"><div class="h-6 rounded" style="width:${(v / mx) * 100}%;background:var(--pr);opacity:${0.45 + i * 0.12}"></div></div><b class="w-24 text-right">${M(v)}</b></div>`).join('')}</div>
 <div class="mt-4"><div class="flex justify-between mb-1"><b>Quota attainment</b><span>${M(won)} of ${M(Q)}</span></div><div class="h-3 rounded" style="background:var(--hov)"><div class="h-3 rounded" style="width:${Math.min(100, (won / Q) * 100)}%;background:var(--ok)"></div></div></div></div>
 <div class="card p-4"><b class="flex items-center gap-1"><span class="ms" style="color:var(--pr)">auto_awesome</span>Einstein suggests</b>
  ${hot ? `<p class="mt-2">${E(hot.account)} is standardising procurement for next quarter. Offer a Platinum Support voucher if they sign before ${fd(hot.close)}.</p><button class="btn btn-p mt-3" onclick="nav('opp-detail',7)">Review deal</button>` : '<p class="mt-2 mut">No urgent recommendations right now.</p>'}</div>
 <div class="card lg:col-span-2"><div class="p-4 pb-2"><b>Closing soon</b></div>${table(['Deal', 'Account', 'Amount', 'Close date'], soon.map((o) => `<tr class="r" onclick="nav('opp-detail',${o.id})"><td><b>${E(o.name)}</b></td><td>${E(o.account)}</td><td>${M(o.amount)}</td><td><span class="chip ${chipC(o)}">${days(o.close) < 0 ? 'Overdue' : days(o.close) == 0 ? 'Today' : 'In ' + days(o.close) + ' days'}</span></td></tr>`).join(''))}</div>
 <div class="card p-4"><b>My tasks</b><div class="mt-2">${S.tasks.map((t, i) => `<label class="flex gap-2 py-2 border-b" style="border-color:var(--bd)"><input type="checkbox" onchange="S.tasks.splice(${i},1);save();toast('Task completed');render()"><span class="flex-1">${E(t.t)}<br><small class="mut">${t.due}</small></span></label>`).join('') || '<p class="mut mt-2">All caught up. Nice work.</p>'}</div></div></div>`;
};
V.opps = () => {
  const q = (S.q || '').toLowerCase(),
    L = S.opps.filter(
      (o) => (!S.mine || o.owner == 'AL') && (o.name + o.account).toLowerCase().includes(q)
    ),
    tot = L.reduce((a, o) => a + o.amount, 0);
  const bar = `<div class="flex flex-wrap items-center gap-2 mb-3"><div><div class="mut">Opportunities</div><h1 class="text-xl font-bold">${S.mine ? 'My opportunities' : 'All opportunities'}</h1></div><span class="mut ml-2">${L.length} items · Total ${M(tot)}</span><span class="flex-1"></span>
 <input class="inp" style="width:200px" placeholder="Filter this list" value="${E(S.q || '')}" oninput="S.q=this.value;clearTimeout(window.ft);window.ft=setTimeout(()=>{render();const i=document.querySelector('[placeholder=\\'Filter this list\\']');i.focus();i.setSelectionRange(99,99)},250)">
 <button class="btn" onclick="S.mine=!S.mine;render()">${S.mine ? 'Show everyone' : 'Only mine'}</button>
 <button class="btn" onclick="S.view='${S.view == 'kanban' ? 'list' : 'kanban'}';render()"><span class="ms">${S.view == 'kanban' ? 'table_rows' : 'view_kanban'}</span>${S.view == 'kanban' ? 'List' : 'Board'}</button>${canAddOpportunity() ? `<button class="btn btn-p" onclick="modal('opp')"><span class="ms">add</span>New</button>` : ''}</div>`;
  if (S.view == 'list')
    return (
      bar +
      table(
        ['Name', 'Account', 'Stage', 'Amount', 'Close date', 'Assigned rep'],
        L.map(
          (o) =>
            `<tr class="r" onclick="nav('opp-detail',${o.id})"><td><b>${E(o.name)}</b></td><td>${E(o.account)}</td><td>${ST[o.stage]}</td><td>${M(o.amount)}</td><td>${fd(o.close)}</td><td>${repLink(o.owner)}</td></tr>`
        ).join('')
      )
    );
  return (
    bar +
    `<p class="mut mb-2 flex items-center gap-1"><span class="ms">info</span>Drag a deal to another stage to update it.</p><div class="flex gap-3 overflow-x-auto pb-3">${ST.map(
      (s, i) => {
        const c = L.filter((o) => o.stage == i && !o.lost);
        return `<div class="kcol card shrink-0 w-72 p-2" style="background:var(--hov)" ondragover="event.preventDefault();this.classList.add('over')" ondragleave="this.classList.remove('over')" ondrop="drop(event,${i})"><div class="px-1 pb-2"><b>${s}</b><div class="mut">${c.length} deals · ${M(c.reduce((a, o) => a + o.amount, 0))}</div></div><div class="space-y-2">${c.map((o) => `<div class="kc card p-3" draggable="true" ondragstart="event.dataTransfer.setData('t',${o.id})" onclick="nav('opp-detail',${o.id})"><b style="color:var(--pr)">${E(o.name)}</b><div class="mut">${E(o.account)}</div><div class="flex justify-between mt-2"><b>${M(o.amount)}</b><span class="mut">${PR[i]}%</span></div>${o.next ? `<div class="mut mt-1">Next: ${E(o.next)}</div>` : ''}<div class="flex justify-between items-center mt-2"><span class="chip ${chipC(o)}">${fd(o.close)}</span><span class="text-xs mut" title="Assigned rep">${E(ownerLabel(o.owner))}</span></div></div>`).join('')}</div></div>`;
      }
    ).join('')}</div>`
  );
};
function drop(e, i) {
  e.preventDefault();
  const o = S.opps.find((x) => x.id == e.dataTransfer.getData('t'));
  if (!o || o.stage == i) return render();
  setStage(o, i);
}
function setStage(o, i) {
  o.stage = i;
  (o.sh = o.sh || []).unshift({
    stage: ST[i],
    amount: o.amount,
    close: o.close,
    by: roleNow().name,
    t: Date.now(),
  });
  (S.acts[o.id] = S.acts[o.id] || []).unshift({
    k: 'sync',
    x: 'Stage changed to ' + ST[i],
    t: Date.now(),
  });
  save();
  toast(i == 5 ? 'Deal closed won. Congratulations!' : E(o.name) + ' moved to ' + ST[i]);
  render();
}

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
  ['churn1', 'Churn 1', 's', ['', ...CHURN_REASONS]],
  ['churn2', 'Churn 2', 's', ['', ...CHURN_REASONS]],
  ['churn3', 'Churn 3', 's', ['', ...CHURN_REASONS]],
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
  // churn reasons saved earlier as one list now fill Churn 1, 2 and 3
  if (/^churn[123]$/.test(k) && !(k in f) && Array.isArray(f.churnWhy)) return f.churnWhy[+k.slice(5) - 1] || '';
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

// Opportunity file attachments (IndexedDB): upload, download, remove.

// Opportunity attachments are stored in IndexedDB so file contents do not
// consume localStorage space. Metadata remains attached to the opportunity.
const ATTACHMENT_DB = 'sales-cloud-attachments';
function attachmentStore() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(ATTACHMENT_DB, 1);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains('files')) {
        request.result.createObjectStore('files', { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('Could not open file storage'));
  });
}
function attachmentIcon(name) {
  const ext = String(name || '')
    .split('.')
    .pop()
    .toLowerCase();
  if (['pdf'].includes(ext)) return 'picture_as_pdf';
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext)) return 'image';
  if (['doc', 'docx', 'txt', 'rtf'].includes(ext)) return 'description';
  if (['xls', 'xlsx', 'csv'].includes(ext)) return 'table_chart';
  if (['zip', 'rar', '7z'].includes(ext)) return 'folder_zip';
  return 'attach_file';
}
function formatFileSize(bytes) {
  const n = Number(bytes) || 0;
  if (n < 1024) return n + ' B';
  if (n < 1024 * 1024) return (n / 1024).toFixed(1) + ' KB';
  if (n < 1024 * 1024 * 1024) return (n / (1024 * 1024)).toFixed(1) + ' MB';
  return (n / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
}
async function uploadOppFiles(fileList) {
  const files = Array.from(fileList || []);
  if (!files.length) return;
  const opportunity = cur();
  if (!opportunity) return;
  opportunity.attachments = opportunity.attachments || [];
  try {
    const db = await attachmentStore();
    for (const file of files) {
      const id =
        globalThis.crypto?.randomUUID?.() ||
        'file-' + Date.now() + '-' + Math.random().toString(36).slice(2);
      await new Promise((resolve, reject) => {
        const tx = db.transaction('files', 'readwrite');
        tx.objectStore('files').put({ id, blob: file });
        tx.oncomplete = resolve;
        tx.onerror = () => reject(tx.error || new Error('File upload failed'));
        tx.onabort = () => reject(tx.error || new Error('File upload was cancelled'));
      });
      opportunity.attachments.push({
        id,
        name: file.name,
        size: file.size,
        type: file.type,
        addedAt: Date.now(),
      });
    }
    db.close();
    save();
    toast(files.length + (files.length === 1 ? ' file uploaded' : ' files uploaded'));
    render();
  } catch (error) {
    console.error(error);
    toast('Could not upload files. Check available browser storage and try again.');
  }
}
async function downloadOppFile(id) {
  try {
    const db = await attachmentStore();
    const record = await new Promise((resolve, reject) => {
      const tx = db.transaction('files', 'readonly');
      const request = tx.objectStore('files').get(id);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    db.close();
    const metadata = (cur()?.attachments || []).find((file) => file.id === id);
    if (!record?.blob || !metadata) throw new Error('File not found');
    const url = URL.createObjectURL(record.blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = metadata.name;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  } catch (error) {
    console.error(error);
    toast('Could not download this file.');
  }
}
async function removeOppFile(id) {
  const opportunity = cur();
  if (!opportunity || !confirm('Remove this attachment?')) return;
  try {
    const db = await attachmentStore();
    await new Promise((resolve, reject) => {
      const tx = db.transaction('files', 'readwrite');
      tx.objectStore('files').delete(id);
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error);
    });
    db.close();
    opportunity.attachments = (opportunity.attachments || []).filter((file) => file.id !== id);
    save();
    toast('Attachment removed');
    render();
  } catch (error) {
    console.error(error);
    toast('Could not remove this file.');
  }
}

// Opportunity detail page, follow toggle, stage change and activity log.

V['opp-detail'] = () => {
  const o = cur();
  if (!o) return V.opps();
  const T = S.tab || 'details',
    R = roles(o),
    P = (o.partners = o.partners || []),
    Q = S.quotes.filter((q) => q.opp == o.id),
    tl = S.acts[o.id] || [],
    tk = S.tasks.filter((t) => t.opp == o.id),
    ch = (S.chat = S.chat || {})[o.id] || [],
    rk = riskOf(o),
    mi = 'w-full text-left px-3 py-2 rounded hover:bg-[var(--hov)]',
    socials = `<div class="card p-4"><div class="flex justify-between items-center"><b>Social media accounts</b><span class="mut text-xs">Opportunity</span></div><p class="mut text-xs mt-1">Profiles associated with this opportunity or customer.</p><div class="grid sm:grid-cols-2 gap-2 mt-2">${['linkedin', 'instagram', 'facebook', 'x'].map((k) => `<label class="mut capitalize">${k}<input class="inp" value="${E(o.socials?.[k] || '')}" placeholder="Profile URL or handle" onchange="cur().socials.${k}=this.value;save()"></label>`).join('')}</div></div>
    <div class="card p-4"><div class="flex justify-between items-center gap-2"><b>File attachments</b><span class="mut text-xs">${(o.attachments || []).length} files</span></div><p class="mut text-xs mt-1">Upload and manage documents related to this opportunity.</p><label class="mt-3 block rounded-lg border-2 border-dashed p-4 text-center cursor-pointer" style="border-color:var(--bd);background:var(--hov)" ondragover="event.preventDefault();this.style.borderColor='var(--pr)'" ondragleave="this.style.borderColor='var(--bd)'" ondrop="event.preventDefault();this.style.borderColor='var(--bd)';uploadOppFiles(event.dataTransfer.files)"><span class="ms block mb-2" style="font-size:26px;color:var(--pr)">cloud_upload</span><span class="font-semibold">Click to upload or drag and drop</span><span class="mut block text-xs mt-1">Select multiple files at once · No fixed file-count limit</span><input type="file" multiple class="hidden" onchange="uploadOppFiles(this.files);this.value=''"></label><div id="opp-attachments" class="mt-3 space-y-2">${(o.attachments || []).map((f) => `<div class="flex items-center gap-2 rounded border p-2" style="border-color:var(--bd)"><span class="ms" style="color:var(--pr)">${attachmentIcon(f.name)}</span><div class="min-w-0 flex-1"><div class="font-semibold truncate" title="${E(f.name)}">${E(f.name)}</div><div class="mut text-xs">${formatFileSize(f.size)} · ${E(f.type || 'File')}</div></div><button class="btn" title="Download file" onclick="downloadOppFile('${E(f.id)}')"><span class="ms">download</span></button><button class="btn" title="Remove file" onclick="removeOppFile('${E(f.id)}')"><span class="ms">delete</span></button></div>`).join('') || '<p class="mut text-xs text-center py-3">No files uploaded yet.</p>'}</div></div>`,
    hd = (l, v) => `<div><div class="mut text-[11px]">${l}</div><b>${v}</b></div>`,
    sec = (t, a, b) =>
      `<div class="card p-4"><div class="flex justify-between items-center"><b>${t}</b>${a ? `<button class="btn" onclick="${a}">${b}</button>` : ''}</div>`;
  const pv = {
    details: recordPage(o),
    related: `<div class="space-y-3"><div class="card"><div class="p-4 pb-2 flex justify-between"><b>Products (${o.items.length})</b><button class="btn" onclick="openQuote(${o.id})">Edit products in quote</button></div>${table(['Product', 'Qty', 'List price', 'Discount', 'Total'], o.items.map((i) => `<tr><td>${E(i.n)}</td><td>${i.q}</td><td>${M(i.p)}</td><td>${i.d}%</td><td><b>${M(i.p * i.q * (1 - i.d / 100))}</b></td></tr>`).join(''))}</div><div class="card"><div class="p-4 pb-2 flex justify-between"><b>Quotes (${Q.length})</b><button class="btn btn-p" onclick="openQuote(${o.id})">New quote</button></div>${table(
      ['Quote', 'Invoice', 'Total', 'Status', 'Expires'],
      Q.map((q) => {
        const inv = q.invoiceId && S.invoices && S.invoices.find((i) => i.id === q.invoiceId);
        return `<tr class="r" onclick="openQuoteRecord('${q.no}')"><td><b>${q.no}</b></td><td>${inv ? inv.invoiceNo : '—'}</td><td>${M(qcalc(q).tot)}</td><td>${quoteStatusChip(q)}</td><td>${fd(q.exp)}</td></tr>`;
      }).join('')
    )}</div></div>`,
    activity: `<div class="space-y-3">${sec('Log activity')}<form onsubmit="logAct(event)" class="mt-2 grid sm:grid-cols-4 gap-2"><select name="k" class="inp"><option value="note_alt">Note</option><option value="call">Call</option><option value="mail">Email</option><option value="task_alt">Task</option></select><input name="x" required class="inp sm:col-span-2" placeholder="What happened or what needs doing?"><button class="btn btn-p justify-center">Log</button></form></div>
 ${sec('Upcoming tasks (' + tk.length + ')')}${tk.map((t) => `<label class="flex gap-2 py-2"><input type="checkbox" onchange="S.tasks.splice(S.tasks.indexOf(S.tasks.find(x=>x.t=='${E(t.t).replace(/'/g, '')}')),1);save();toast('Task completed');render()">${E(t.t)} <span class="mut">· ${t.due}</span></label>`).join('') || '<p class="mut mt-2">No open tasks for this deal.</p>'}</div>
 ${sec('Timeline')}${tl.map((a) => `<div class="flex gap-2 py-2 border-b" style="border-color:var(--bd)"><span class="ms mut">${a.k}</span><div><div>${E(hideInvoiceRefs(a.x))}</div><small class="mut">${ago(a.t)}</small></div></div>`).join('') || '<p class="mut mt-2">No activity yet. Log your first call or note.</p>'}</div></div>`,
    chatter: `<div class="card p-4"><b>Chatter</b><form class="flex gap-2 my-3" onsubmit="event.preventDefault();const v=this.x.value.trim();if(v){(S.chat[S.cur]=S.chat[S.cur]||[]).unshift({x:v,t:Date.now()});save();render()}"><input name="x" class="inp" placeholder="Share an update with the team"><button class="btn btn-p">Share</button></form>${ch.map((c) => `<div class="flex gap-2 py-2 border-b" style="border-color:var(--bd)"><span class="w-8 h-8 rounded-full grid place-items-center text-white font-bold shrink-0" style="background:var(--pr)">AL</span><div><b>Alex Lee</b> <small class="mut">${ago(c.t)}</small><div>${E(c.x)}</div></div></div>`).join('') || '<p class="mut">Nobody has posted yet. Start the conversation.</p>'}</div>`,
  }[T];
  return `<div class="card p-4 mb-3"><div class="flex flex-wrap items-start gap-2"><span class="ms" style="color:var(--warn);font-size:32px">handshake</span><div class="flex-1 min-w-[220px]"><div class="mut cursor-pointer" onclick="nav('opps')">Opportunity ›</div><h1 class="text-xl font-bold">${E(o.name)}</h1></div>
 <button class="btn" onclick="o_f()">${cur().fol ? '✓ Following' : '+ Follow'}</button><button class="btn" onclick="shareToSlack()">Send to Slack</button><button class="btn" onclick="window.print()">Printable view</button><button class="btn" onclick="cloneOpp(0)">Clone</button><button class="btn" onclick="modal('edit')">Edit</button><button class="btn btn-p" onclick="openQuote(${o.id})">Generate quote</button>
 <details class="relative"><summary class="btn list-none">▾</summary><div class="card absolute right-0 mt-1 w-52 z-20 p-1 shadow-lg"><button class="${mi}" onclick="cloneOpp(1)">Clone with related</button><button class="${mi}" onclick="S.tab='details';S.ed='refRep';render()">Add referral</button>${canEditOwner() ? `<button class="${mi}" onclick="S.ed='owner';S.tab='details';render()">Change owner</button>` : ''}<button class="${mi}" onclick="o_s()">${cur().slack ? 'Turn off Slack alerts' : 'Turn on Slack alerts'}</button><button class="${mi}" style="color:var(--err)" onclick="if(confirm('Delete this opportunity?')){S.opps=S.opps.filter(x=>x.id!=${o.id});save();toast('Opportunity deleted');nav('opps')}">Delete</button></div></details></div>
 <div class="grid grid-cols-2 md:grid-cols-7 gap-4 mt-4">${hd('Account name', `<a class="cursor-pointer" style="color:var(--pr)" ${acctAttr(o.account)} onclick="S.q='${E(o.account).replace(/'/g, '')}';nav('opps')">${E(o.account)}</a>${acctEditBtn(o.account)}`)}${hd('Close date', fd(o.close))}${hd('Amount', M(o.amount))}${hd('Assigned rep', repLink(o.owner))}${hd('Quotation', quoteHeaderStatus(o))}${hd('Priority', `<select class="inp" style="width:auto;padding:2px 6px" aria-label="Priority" onchange="setPriority(${o.id},this.value)">${prioOptions(o.priority)}</select>`)}${hd('Risk flag', `<span class="chip ${rk == 'High' ? 'wr' : rk == 'Low' || rk == 'None' ? 'ok' : ''}">${rk}</span>`)}</div></div>
 <div class="card p-3 mb-3 flex items-center gap-3"><div class="flex flex-1 overflow-x-auto gap-1">${ST.map((s, i) => `<div class="step ${i < o.stage || o.stage == 5 ? 'done' : i == o.stage ? 'cur' : ''}" ${i == 5 && o.lost ? 'style="background:var(--err)"' : ''} onclick="setStage(cur(),${i})">${i < o.stage || o.stage == 5 ? '✓ ' : ''}${i == 5 && o.lost ? 'Closed Lost' : s}</div>`).join('')}</div>${o.stage < 5 ? (o.stage + 1 === 5 && !['admin', 'ceo'].includes(S.role) ? '<span class="mut text-xs">Closed Won is set by Admin / CEO after payment</span>' : `<button class="btn btn-p" onclick="setStage(cur(),${o.stage + 1})">${o.stage + 1 === 5 ? 'Mark Closed Won' : 'Mark stage as complete'}</button>`) : ['admin', 'ceo'].includes(S.role) ? `<button class="btn btn-p" onclick="toggleClosedStage()">Change closed stage</button>` : ''}</div>
 <div class="flex gap-4 border-b mb-3" style="border-color:var(--bd)">${[
   ['details', 'Details'],
   ['related', 'Related'],
   ['activity', 'Activity'],
   ['chatter', 'Chatter'],
 ]
   .map(
     (t) =>
       `<a class="py-2 font-semibold cursor-pointer" style="${T == t[0] ? 'border-bottom:3px solid var(--pr);color:var(--pr)' : 'color:var(--mut)'}" onclick="tab('${t[0]}')">${t[1]}</a>`
   )
   .join('')}</div>
 <div class="grid lg:grid-cols-[minmax(0,1fr)_360px] gap-3 items-start"><div class="min-w-0">${pv}</div><div class="space-y-3">${sidebarHtml(o)}</div><div class="hidden">
 ${sec('Quick links')}<div class="mt-2 grid gap-1">${[
   ['Contact roles (' + R.length + ')', 'details'],
   ['Products (' + o.items.length + ')', 'related'],
   ['Quotes (' + Q.length + ')', 'related'],
   ['Activities (' + tl.length + ')', 'activity'],
 ]
   .map(
     (l) => `<a class="cursor-pointer" style="color:var(--pr)" onclick="tab('${l[1]}')">${l[0]}</a>`
   )
   .join('')}</div></div>
 ${quoteStatusCard(o)}${sec('Contact roles (' + R.length + ')', "modal('role')", 'Add')}${
   R.map((r, i) => {
     const c = S.contacts.find((x) => x[0] == r.name) || [];
     return `<div class="py-2 border-b" style="border-color:var(--bd)"><div class="flex justify-between"><b>${E(r.name)} ${r.primary ? '<span class="chip">Primary</span>' : `<a class="cursor-pointer mut font-normal" onclick="roles(cur()).forEach((x,j)=>x.primary=j==${i});save();render()">Make primary</a>`}</b><span class="ms mut" style="font-size:16px;cursor:pointer" title="Remove" onclick="roles(cur()).splice(${i},1);save();render()">close</span></div><div class="mut">${r.role} · ${E(c[1] || '')}<br>${E(c[3] || '')}<br>${c[4] ? `<a style="color:var(--pr)" href="tel:${E(c[4])}">${E(c[4])}</a>` : `<a class="cursor-pointer" style="color:var(--pr)" onclick="editContactMobile('${E(r.name)}')">+ Add mobile number</a>`}</div></div>`;
   }).join('') || '<p class="mut mt-2">No contact roles yet.</p>'
 }</div>
 ${sec('Opportunity partners (' + P.length + ')', "modal('partner')", 'Add')}${P.map((p, i) => `<div class="flex justify-between py-2"><span><b>${E(p.name)}</b><br><span class="mut">${p.type}</span></span><span class="ms mut" style="font-size:16px;cursor:pointer" onclick="cur().partners.splice(${i},1);save();render()">close</span></div>`).join('') || '<p class="mut mt-2">No partners on this deal.</p>'}</div>${socials}</div></div></div>`;
};
function o_f() {
  const o = cur();
  o.fol = !o.fol;
  save();
  toast(o.fol ? 'You are following this deal' : 'Unfollowed');
  render();
}
function o_s() {
  const o = cur();
  o.slack = !o.slack;
  save();
  toast(o.slack ? 'Slack alerts on' : 'Slack alerts off');
  render();
}
function logAct(e) {
  e.preventDefault();
  const v = Object.fromEntries(new FormData(e.target));
  if (v.k == 'task_alt') {
    S.tasks.unshift({ t: v.x, due: 'This week', opp: S.cur });
    toast('Task added');
  } else toast('Activity logged');
  (S.acts[S.cur] = S.acts[S.cur] || []).unshift({ k: v.k, x: v.x, t: Date.now() });
  save();
  render();
}

// Leads list and lead-to-opportunity conversion.

V.leads = () =>
  `<div class="flex items-center mb-3"><h1 class="text-xl font-bold flex-1">Leads</h1><button class="btn btn-p" onclick="modal('lead')"><span class="ms">add</span>New lead</button></div>` +
  table(
    ['Name', 'Company', 'Source', 'Status', ''],
    S.leads
      .map(
        (l, i) =>
          `<tr><td><b>${E(l[0])}</b></td><td>${E(l[1])}</td><td>${E(l[2])}</td><td><span class="chip ${l[3] == 'New' ? '' : 'wr'}">${l[3]}</span></td><td class="text-right">${canAddOpportunity() ? `<button class="btn" onclick="convert(${i})">Convert to deal</button>` : ''}</td></tr>`
      )
      .join('')
  );
function convert(i) {
  const l = S.leads.splice(i, 1)[0],
    id = Math.max(0, ...S.opps.map((o) => o.id)) + 1;
  if (!S.opps.some((o) => o.account == l[1]))
    S.contacts.push([
      l[0],
      'Primary contact',
      l[1],
      l[0].split(' ')[0].toLowerCase() + '@' + l[1].toLowerCase().replace(/\W/g, '') + '.com',
    ]);
  S.opps.push({
    id,
    name: l[1] + ' - New opportunity',
    account: l[1],
    amount: 50000,
    stage: 0,
    close: D(45),
    owner: 'AL',
    next: 'Schedule discovery call',
    items: [{ n: 'Platform licence', c: 'GEN-100', p: 50000, q: 1, d: 0 }],
  });
  S.cur = id;
  save();
  toast(E(l[0]) + ' converted to an opportunity');
  nav('opp-detail');
}

// Accounts list.

V.accounts = () => {
  const A = [...new Set(S.opps.map((o) => o.account))];
  return (
    `<h1 class="text-xl font-bold mb-3">Accounts</h1>` +
    table(
      ['Account', 'Open deals', 'Open pipeline', 'Won'],
      A.map((a) => {
        const x = S.opps.filter((o) => o.account == a);
        return `<tr class="r" onclick="S.q='${E(a).replace(/'/g, '')}';nav('opps')"><td><b>${E(a)}</b></td><td>${x.filter((o) => o.stage < 5).length}</td><td>${M(x.filter((o) => o.stage < 5).reduce((s, o) => s + o.amount, 0))}</td><td>${M(x.filter((o) => o.stage == 5).reduce((s, o) => s + o.amount, 0))}</td></tr>`;
      }).join('')
    )
  );
};

// Base contacts list.

V.contacts = () =>
  `<h1 class="text-xl font-bold mb-3">Contacts</h1>` +
  table(
    ['Name', 'Title', 'Account', 'Email'],
    S.contacts
      .map(
        (c) =>
          `<tr><td><b>${E(c[0])}</b></td><td>${E(c[1])}</td><td>${E(c[2])}</td><td><a style="color:var(--pr)" href="mailto:${E(c[3])}">${E(c[3])}</a></td></tr>`
      )
      .join('')
  );

// Base quotation list, totals and the first quote editor.

V.quotes = () =>
  `<h1 class="text-xl font-bold mb-3">Quotes</h1>` +
  table(
    ['Quote', 'Opportunity', 'Total', 'Status', 'Expires'],
    S.quotes
      .map((q) => {
        const o = S.opps.find((x) => x.id == q.opp) || { name: '(deleted)' };
        return `<tr class="r" onclick="openQuote(${q.opp})"><td><b>${q.no}</b></td><td>${E(o.name)}</td><td>${M(qcalc(q).tot)}</td><td><span class="chip ${q.status == 'Approved' ? 'ok' : q.status == 'In Review' ? 'wr' : ''}">${q.status}</span></td><td>${fd(q.exp)}</td></tr>`;
      })
      .join('')
  );
function qcalc(q = S.qd) {
  const sub = q.items.reduce((a, i) => a + i.p * i.q, 0),
    dis = q.items.reduce((a, i) => a + (i.p * i.q * i.d) / 100, 0);
  return { sub, dis, tot: sub - dis, pct: sub ? (dis / sub) * 100 : 0 };
}
function openQuote(id) {
  const o = S.opps.find((x) => x.id == id),
    ex = S.quotes.find((q) => q.opp == id);
  S.cur = id;
  S.qd = ex
    ? clone(ex)
    : {
        opp: id,
        no: 'Q-' + (1001 + S.quotes.length),
        exp: D(quoteDefaultsSetting().validityDays),
        status: 'Draft',
        terms: quoteDefaultsSetting().terms,
        items: clone(o.items),
      };
  nav('quote');
}
function qsum() {
  const c = qcalc(),
    ok = c.pct <= 10;
  return `<div class="flex justify-between py-1"><span class="mut">Subtotal (list)</span>${M(c.sub)}</div><div class="flex justify-between py-1"><span class="mut">Discounts</span>-${M(c.dis)}</div><div class="flex justify-between py-2 border-t text-lg font-bold" style="border-color:var(--bd)"><span>Grand total</span>${M(c.tot)}</div>
<div class="p-3 rounded mt-2 ${ok ? 'ok' : 'wr'}"><b>${ok ? 'Fast-track approval' : 'Approval required'}</b><br>Blended discount ${c.pct.toFixed(1)}% against your 10% limit. ${ok ? 'You can send this quote right away.' : 'A manager must approve before it goes out.'}</div>`;
}
V.quote = () => {
  const q = S.qd,
    o = cur();
  if (!q || !o) return V.opps();
  return `<div class="mut cursor-pointer mb-1" onclick="nav('opp-detail')">‹ Back to ${E(o.name)}</div><h1 class="text-xl font-bold mb-3">Quote ${q.no}</h1>
 <div class="grid lg:grid-cols-3 gap-3"><div class="lg:col-span-2 space-y-3"><div class="card p-4 grid sm:grid-cols-3 gap-3"><label>Quote status<select class="inp" disabled><option>${q.status}</option></select></label><label>Expires<input type="date" class="inp" value="${q.exp}" onchange="S.qd.exp=this.value"></label><label>Payment terms<select class="inp" onchange="S.qd.terms=this.value">${['Net 30', 'Net 45', 'Net 60', 'Due on receipt'].map((t) => `<option ${t == q.terms ? 'selected' : ''}>${t}</option>`).join('')}</select></label></div>
 <div class="card"><div class="p-4 pb-2 flex flex-wrap gap-2 items-center"><b class="flex-1">Line items</b><select class="inp" style="width:auto" onchange="qadd(this.value);this.value=''"><option value="">Add product…</option>${CAT.map((c, i) => `<option value="${i}">${c[0]}</option>`).join('')}</select></div>
 ${table(['Product', 'List price', 'Qty', 'Discount %', 'Total', ''], q.items.map((i, k) => `<tr><td>${E(i.n)}<br><small class="mut">${i.c}</small></td><td>${M(i.p)}</td><td><input type="number" min="1" class="inp" style="width:70px" value="${i.q}" oninput="qset(${k},'q',this.value)"></td><td><input type="number" min="0" max="100" class="inp" style="width:70px" value="${i.d}" oninput="qset(${k},'d',this.value)"></td><td id="qr${k}"><b>${M(i.p * i.q * (1 - i.d / 100))}</b></td><td><span class="ms mut" style="cursor:pointer" title="Remove" onclick="S.qd.items.splice(${k},1);render()">delete</span></td></tr>`).join(''))}</div></div>
 <div class="card p-4 h-fit"><div id="qsum">${qsum()}</div><div class="flex flex-col gap-2 mt-4"><button class="btn btn-p justify-center" onclick="saveQ(1)">Save &amp; generate quote</button><button class="btn justify-center" onclick="saveQ(0)">Save as draft</button><button class="btn justify-center" onclick="nav('opp-detail')">Cancel</button></div></div></div>`;
};
function qset(k, f, v) {
  const i = S.qd.items[k];
  i[f] = Math.max(0, +v || 0);
  $('#qr' + k).innerHTML = '<b>' + M(i.p * i.q * (1 - i.d / 100)) + '</b>';
  $('#qsum').innerHTML = qsum();
}
function qadd(i) {
  if (i === '') return;
  const c = CAT[i],
    x = S.qd.items.find((t) => t.c == c[1]);
  x ? x.q++ : S.qd.items.push({ n: c[0], c: c[1], p: c[2], q: 1, d: 0 });
  render();
}
function saveQ(gen) {
  const q = S.qd,
    o = cur(),
    c = qcalc();
  if (!q.items.length) return toast('Add at least one product first');
  q.status = gen ? (c.pct > 10 ? 'In Review' : 'Approved') : 'Draft';
  const n = S.quotes.findIndex((x) => x.opp == q.opp);
  n < 0 ? S.quotes.push(clone(q)) : (S.quotes[n] = clone(q));
  o.items = clone(q.items);
  if (gen) o.amount = Math.round(c.tot);
  save();
  if (!gen) {
    toast('Draft saved');
    return nav('opp-detail');
  }
  $('#modal').innerHTML =
    `<div class="fixed inset-0 z-40 grid place-items-center p-4" style="background:rgba(0,0,0,.5)"><div class="card p-6 w-full max-w-2xl max-h-full overflow-auto"><div class="flex justify-between"><div><h2 class="text-xl font-bold">Quote ${q.no}</h2><div class="mut">Prepared for ${E(o.account)} · Valid until ${fd(q.exp)} · ${q.terms}</div></div><span class="chip ${c.pct > 10 ? 'wr' : 'ok'}">${q.status}</span></div>
 <div class="my-4">${table(['Item', 'Qty', 'Total'], q.items.map((i) => `<tr><td>${E(i.n)}</td><td>${i.q}</td><td>${M(i.p * i.q * (1 - i.d / 100))}</td></tr>`).join(''))}</div><div class="text-right text-lg font-bold">Total ${M(c.tot)}</div>
 <div class="flex gap-2 justify-end mt-4"><button class="btn" onclick="window.print()">Print or save PDF</button><button class="btn btn-p" onclick="$('#modal').innerHTML='';toast('Quote ${q.no} sent to ${E(o.account)}');nav('opp-detail')">Send to customer</button></div></div></div>`;
}

// Base modal forms and their submit handler.

function modal(k) {
  const o = cur(),
    F = {
      opp: [
        'New opportunity',
        [
          ['name', 'Opportunity name', 'text', ''],
          ['account', 'Account', 'text', ''],
          ['amount', 'Amount (₹)', 'number', ''],
          ['close', 'Close date', 'date', D(30)],
          ['stage', 'Stage', 'select', 0, ST],
        ],
      ],
      lead: [
        'New lead',
        [
          ['name', 'Full name', 'text', ''],
          ['company', 'Company', 'text', ''],
          [
            'source',
            'Lead source',
            'select',
            'Webinar',
            ['Webinar', 'Partner Referral', 'Trade Show', 'Inbound Web', 'Outbound'],
          ],
        ],
      ],
      role: [
        'Add contact role',
        [
          ['name', 'Contact', 'select', S.contacts[0][0], S.contacts.map((c) => c[0])],
          [
            'role',
            'Role',
            'select',
            'Decision Maker',
            ['Decision Maker', 'Business User', 'Technical Evaluator', 'Buyer', 'Influencer'],
          ],
        ],
      ],
      partner: [
        'Add partner',
        [
          ['name', 'Partner name', 'text', ''],
          [
            'type',
            'Partner type',
            'select',
            'Distributor',
            ['Distributor', 'Reseller', 'Referral'],
          ],
        ],
      ],
      edit: [
        'Edit opportunity',
        [
          ['name', 'Name', 'text', o && o.name],
          ['amount', 'Amount (₹)', 'number', o && o.amount],
          ['close', 'Close date', 'date', o && o.close],
          ['next', 'Next step', 'text', o && o.next],
        ],
      ],
    }[k];
  $('#modal').innerHTML =
    `<div class="fixed inset-0 z-40 grid place-items-center p-4" style="background:rgba(0,0,0,.5)" onclick="if(event.target==this)this.parentNode.innerHTML=''"><form class="card p-5 w-full max-w-md space-y-3" onsubmit="sub(event,'${k}')"><h2 class="text-lg font-bold">${F[0]}</h2>${F[1]
      .map(
        (f) =>
          `<label class="block">${f[1]}${
            f[2] == 'select'
              ? `<select name="${f[0]}" class="inp">${f[4]
                  .map((x, i) => {
                    const v = f[0] == 'stage' ? i : x;
                    return `<option value="${v}" ${v == f[3] ? 'selected' : ''}>${x}</option>`;
                  })
                  .join('')}</select>`
              : `<input name="${f[0]}" type="${f[2]}" value="${E(f[3])}" class="inp" ${f[0] == 'next' ? '' : 'required'}>`
          }</label>`
      )
      .join(
        ''
      )}<div class="flex justify-end gap-2"><button type="button" class="btn" onclick="$('#modal').innerHTML=''">Cancel</button><button class="btn btn-p">Save</button></div></form></div>`;
  $('#modal input').focus();
}
function sub(e, k) {
  e.preventDefault();
  const v = Object.fromEntries(new FormData(e.target));
  $('#modal').innerHTML = '';
  if (k == 'opp') {
    const id = Math.max(0, ...S.opps.map((o) => o.id)) + 1,
      a = +v.amount;
    S.opps.push({
      id,
      name: v.name,
      account: v.account,
      amount: a,
      stage: +v.stage,
      close: v.close,
      owner: 'AL',
      next: '',
      items: [{ n: 'Platform licence', c: 'GEN-100', p: a, q: 1, d: 0 }],
    });
    S.cur = id;
    save();
    toast('Opportunity created');
    nav('opp-detail');
  }
  if (k == 'lead') {
    S.leads.unshift([v.name, v.company, v.source, 'New']);
    save();
    toast('Lead added');
    nav('leads');
  }
  if (k == 'role') {
    const r = roles(cur());
    r.push({ name: v.name, role: v.role, primary: !r.length });
    save();
    toast('Contact role added');
    render();
  }
  if (k == 'partner') {
    (cur().partners = cur().partners || []).push(v);
    save();
    toast('Partner added');
    render();
  }
  if (k == 'edit') {
    Object.assign(cur(), { name: v.name, amount: +v.amount, close: v.close, next: v.next });
    save();
    toast('Changes saved');
    render();
  }
}

// Router: renders the view for the current hash.

function render() {
  let v = location.hash.slice(1) || 'home';
  if (!V[v]) v = 'home';
  const act = v == 'opp-detail' || v == 'quote' ? 'opps' : v;
  $('#nav').innerHTML =
    [
      ['home', 'Home'],
      ['leads', 'Leads'],
      ['accounts', 'Accounts'],
      ['contacts', 'Contacts'],
      ['opps', 'Opportunities'],
      ['quotes', 'Quotes'],
      ['settings', 'Settings'],
    ]
      .map(
        (n) =>
          `<a href="#${n[0]}" class="px-3 py-2 font-semibold whitespace-nowrap" style="${act == n[0] ? 'border-bottom:3px solid var(--pr);color:var(--pr)' : 'color:var(--mut)'}">${n[1]}</a>`
      )
      .join('') +
    `<span class="flex-1"></span><a href="#home" class="px-3 py-2 mut" onclick="if(confirm('Reset all demo data?')){localStorage.removeItem(KEY);location.reload()}">Reset demo</a>`;
  $('#app').innerHTML = V[v]();
  const ed = $('[data-ed]');
  ed ? ed.focus() : scrollTo(0, 0);
}
addEventListener('hashchange', render);
// Later sections define more helpers; the final render() at the end of the file draws the page.
try {
  render();
} catch (e) {}

// Role config, visibility rules and portal switching.

// Ceph CRM extensions: portals, price controls, approvals, invoice history.
const ROLE_CFG = {
  rep: { label: 'Rep portal', owner: 'AL', limit: 0, name: 'Alex Lee' },
  admin: { label: 'Admin portal', owner: 'SC', limit: 5, name: 'Sara Chen' },
  ceo: { label: 'CEO portal', owner: 'TS', limit: 100, name: 'Tony Stark' },
};
S.role = ['rep', 'admin', 'ceo'].includes(S.role) ? S.role : 'rep';
S.invoices = S.invoices || [];
S.quotes = S.quotes || [];
S.chat = S.chat || {};
S.contacts = (S.contacts || []).map((c) => {
  while (c.length < 5) c.push('');
  return c;
});
S.opps = (S.opps || []).map((o) => ({
  ...o,
  socials: o.socials || { linkedin: '', instagram: '', facebook: '', x: '' },
  attachments: o.attachments || [],
}));
S.products =
  S.products ||
  CAT.map(([name, code, price]) => ({
    id: code,
    name,
    code,
    listPrice: price,
    minPrice: Math.round(price * 0.85),
    maxPrice: Math.round(price * 1.25),
    active: true,
  }));
const roleNow = () => {
  const u = S.users?.find((x) => x.id === S.authUser);
  return u
    ? {
        ...ROLE_CFG[u.role],
        owner: u.ownerCode || ROLE_CFG[u.role].owner,
        name: u.name,
        label: ROLE_CFG[u.role].label,
      }
    : ROLE_CFG[S.role] || ROLE_CFG.rep;
};
// Reps see their own deals. Senior Reps, Admin and CEO see every opportunity.
const seesAllOpps = () =>
  S.role !== 'rep' || isSeniorRep((S.users || []).find((u) => u.id === S.authUser));
const visibleOpps = () =>
  seesAllOpps() ? S.opps : S.opps.filter((o) => o.owner === roleNow().owner);
const quoteTotal = (q) => q.items.reduce((a, i) => a + i.p * i.q * (1 - i.d / 100), 0);
const quoteDiscount = (q) => {
  const sub = q.items.reduce((a, i) => a + i.p * i.q, 0);
  return sub ? (100 * (sub - quoteTotal(q))) / sub : 0;
};
const prodFor = (i) =>
  S.products.find((p) => p.code === i.c) || { minPrice: 0, maxPrice: Infinity };
const belowProductFloor = (q) =>
  q.items.filter((i) => i.p * (1 - i.d / 100) < Number(prodFor(i).minPrice || 0));
function setRole(r) {
  if (!ROLE_CFG[r]) return;
  S.role = r;
  S.mine = r === 'rep';
  save();
  location.hash = '#home';
  render();
  toast(roleNow().label + ' active');
}

// Invoice creation from an approved quotation.

function newInvoice(q) {
  if (q.invoiceId && S.invoices.some((i) => i.id === q.invoiceId))
    return S.invoices.find((i) => i.id === q.invoiceId);
  const o = S.opps.find((x) => x.id == q.opp) || {},
    sub = q.items.reduce((a, i) => a + i.p * i.q, 0),
    total = quoteTotal(q),
    inv = {
      id: 'INV-' + (1001 + S.invoices.length),
      invoiceNo: 'INV-' + (1001 + S.invoices.length),
      quoteNo: q.no,
      opp: q.opp,
      account: o.account || '',
      opportunity: o.name || '',
      items: clone(q.items),
      subtotal: sub,
      discount: sub - total,
      total,
      terms: q.terms || 'Net 30',
      tnc: effectiveTnc(q),
      showDiscount: !!q.showDiscount,
      generatedAt: Date.now(),
      status: 'Ready to submit',
      currency: 'INR',
    };
  S.invoices.push(inv);
  q.invoiceId = inv.id;
  return inv;
}

// Approval routing for a quote, storing and opening quote records.

function quoteRoute(q) {
  const pct = quoteDiscount(q),
    floor = belowProductFloor(q).length > 0;
  if (floor && S.role !== 'ceo')
    return {
      status: 'Pending CEO Approval',
      approver: ROLE_CFG.ceo.name,
      reason: 'Product minimum price breached',
    };
  if (S.role === 'ceo') return { status: 'Approved', approver: roleNow().name };
  if (S.role === 'admin')
    return pct <= adminDiscountLimit()
      ? { status: 'Approved', approver: roleNow().name }
      : { status: 'Pending CEO Approval', approver: ROLE_CFG.ceo.name };
  if (pct > adminDiscountLimit())
    return { status: 'Pending CEO Approval', approver: ROLE_CFG.ceo.name };
  return { status: 'Pending Admin Approval', approver: ROLE_CFG.admin.name };
}
function storeQuote(q) {
  const ix = S.quotes.findIndex((x) => x.no === q.no);
  if (ix < 0) S.quotes.push(clone(q));
  else S.quotes[ix] = clone(q);
}
function openQuote(id) {
  const o = S.opps.find((x) => x.id == id);
  if (!o) return toast('Opportunity not found');
  const draft = S.quotes
    .filter((q) => q.opp == id)
    .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
    .find((q) => ['Draft', 'Rejected'].includes(q.status));
  S.cur = id;
  S.qstep = 1;
  S.qd = draft
    ? clone(draft)
    : {
        opp: id,
        no: 'Q-' + (1001 + S.quotes.length),
        exp: D(quoteDefaultsSetting().validityDays),
        status: 'Draft',
        terms: quoteDefaultsSetting().terms,
        items: clone(o.items),
      };
  nav('quote');
}
function openQuoteRecord(no) {
  const q = S.quotes.find((x) => x.no === no);
  if (!q) return toast('Quotation not found');
  S.cur = q.opp;
  S.qstep = 1;
  S.qd = clone(q);
  nav('quote');
}

// Open an invoice, submit a quote for approval, send invoice to client.

function openInvoice(id) {
  const inv = S.invoices.find((x) => x.id === id);
  if (!inv) return toast('Invoice not found');
  if (S.role === 'rep' && !visibleOpps().some((o) => o.id == inv.opp))
    return toast('This invoice is outside your portal access');
  S.currentInvoice = id;
  nav('invoice-detail');
}
function submitQuote() {
  const q = S.qd,
    o = cur();
  if (!q || !o || !q.items.length) return toast('Add at least one product');
  if (q.items.some((i) => i.q < 1 || i.d < 0 || i.d > 100))
    return toast('Check quantities and discounts');
  if (!(q.notes || '').trim()) {
    S.qstep = 3;
    render();
    return toast('Add notes for approval before submitting');
  }
  const route = quoteRoute(q);
  q.status = route.status;
  q.createdBy = q.createdBy || roleNow().name;
  q.createdAt = q.createdAt || Date.now();
  q.requestedAt = Date.now();
  q.nextApprover = route.approver;
  q.floorApprovalRequired = belowProductFloor(q).length > 0;
  q.floorApprovalItems = belowProductFloor(q).map((i) => i.c);
  q.approvedBy = null;
  q.approvedAt = null;
  q.rejectedBy = null;
  q.rejectedAt = null;
  q.rejectedNotes = null;
  addQuoteHistory(q, 'Submitted', q.notes.trim());
  storeQuote(q);
  o.items = clone(q.items);
  if (q.status === 'Approved') {
    q.approvedBy = route.approver;
    q.approvedAt = Date.now();
    q.approvedNotes = q.notes.trim();
    addQuoteHistory(q, 'Approved', q.notes.trim() + (q.tnc ? ` — Terms: ${q.tnc}` : ''));
    newInvoice(q);
    o.amount = Math.round(quoteTotal(q));
    storeQuote(q);
  }
  save();
  S.qd = clone(q);
  render();
  toast(q.status === 'Approved' ? 'Approved · invoice generated' : 'Quotation sent for approval');
}
function sendInvoice(id) {
  const inv = S.invoices.find((x) => x.id === id);
  if (!inv) return;
  inv.status = 'Submitted to client';
  inv.sentAt = Date.now();
  const q = S.quotes.find((x) => x.no === inv.quoteNo);
  if (q) q.status = 'Sent to client';
  save();
  toast('Invoice submitted to client');
  render();
}

// Product form and save (min <= list <= max price rule).

function openProductForm(code = '') {
  if (S.role === 'rep') return toast('Only Admin and CEO can manage products');
  const p = S.products.find((x) => x.code === code) || {};
  $('#modal').innerHTML =
    `<div class="fixed inset-0 z-40 grid place-items-center p-4" style="background:rgba(0,0,0,.5)"><form class="card p-5 w-full max-w-md space-y-3" onsubmit="saveProduct(event,'${code}')"><h2 class="text-lg font-bold">${code ? 'Edit product' : 'New product'}</h2><label class="block">Product name<input name="name" class="inp" required value="${E(p.name || '')}"></label><label class="block">Product code<input name="code" class="inp" required value="${E(p.code || '')}"></label><label class="block">List price (₹)<input name="listPrice" type="number" min="0.01" step="0.01" class="inp" required value="${p.listPrice ?? ''}"></label><label class="block">Minimum selling price (₹)<input name="minPrice" type="number" min="0.01" step="0.01" class="inp" required value="${p.minPrice ?? ''}"></label><label class="block">Maximum selling price (₹)<input name="maxPrice" type="number" min="0.01" step="0.01" class="inp" required value="${p.maxPrice ?? ''}"></label><div class="grid grid-cols-2 gap-3"><label class="block">HSN / SAC code<input name="hsn" class="inp" maxlength="8" value="${E(p.hsn || '')}"></label><label class="block">GST %<input name="gst" type="number" min="0" max="40" step="0.01" class="inp" placeholder="default" value="${p.gst ?? ''}"></label></div><label class="block">Status<select name="active" class="inp"><option value="yes" ${p.active !== false ? 'selected' : ''}>Active</option><option value="no" ${p.active === false ? 'selected' : ''}>Inactive</option></select></label><div class="flex justify-end gap-2"><button type="button" class="btn" onclick="$('#modal').innerHTML=''">Cancel</button><button class="btn btn-p">Save product</button></div></form></div>`;
}
function saveProduct(e, oldCode) {
  e.preventDefault();
  const v = Object.fromEntries(new FormData(e.target)),
    p = {
      id: v.code,
      code: v.code,
      name: v.name,
      listPrice: +v.listPrice,
      minPrice: +v.minPrice,
      maxPrice: +v.maxPrice,
      active: v.active === 'yes',
      hsn: (v.hsn || '').trim(),
      gst: v.gst === '' ? undefined : +v.gst,
    };
  const prev = S.products.find((x) => x.code === oldCode);
  if (prev && prev.tiers) p.tiers = prev.tiers;
  if (!(p.minPrice > 0 && p.minPrice <= p.listPrice && p.listPrice <= p.maxPrice))
    return toast('Prices must satisfy minimum ≤ list ≤ maximum');
  const dup = S.products.find((x) => x.code === p.code && x.code !== oldCode);
  if (dup) return toast('Product code already exists');
  const ix = S.products.findIndex((x) => x.code === oldCode);
  if (ix >= 0) S.products[ix] = p;
  else S.products.push(p);
  $('#modal').innerHTML = '';
  save();
  toast('Product saved');
  render();
}

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
  return `<div class="mb-4"><h1 class="text-2xl font-bold">Good ${new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, ${roleNow().name}</h1><p class="mut">${open.length} active deals · ${S.tasks.length} open tasks · ${pending.length} quotations awaiting approval.</p></div><div class="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-3">${kp('Open pipeline', M(pipe), open.length + ' active deals')}${kp('Weighted forecast', M(weighted), 'Stage-weighted expected revenue')}${kp('Closed won revenue', M(won), 'Won opportunities')}${kp('Win rate', Math.round((all.filter((o) => o.stage === 5 && !o.lost).length / Math.max(all.length, 1)) * 100) + '%', 'Across visible opportunities')}${kp('Top deal', top[0] ? M(top[0].amount) : '—', top[0] ? E(top[0].name) : 'No open deals')}${kp('Churn watchlist', risk.length, 'Accounts needing attention')}${kp('Revenue at risk', M(riskValue), 'Risk / renewal exposure')}${canSeeInvoices() ? kp('Invoices generated', invCount, 'Approved quotations') : ''}</div><div class="grid lg:grid-cols-2 gap-3"><div class="card p-4"><b>Top opportunities</b>${table(['Opportunity', 'Account', 'Amount'], top.map((o) => `<tr class="r" onclick="nav('opp-detail',${o.id})"><td>${E(o.name)}</td><td>${E(o.account)}</td><td><b>${M(o.amount)}</b></td></tr>`).join(''))}</div><div class="card p-4"><b>Churn watchlist</b>${table(['Account', 'Opportunity', 'Revenue at risk'], risk.map((o) => `<tr class="r" onclick="nav('opp-detail',${o.id})"><td>${E(o.account)}</td><td>${E(o.name)}</td><td>${M(o.amount)}</td></tr>`).join(''))}</div><div class="card p-4"><b>Closing soon</b>${table(
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

// 4-step quote builder: pricing, line items, terms and preview.

// ---------------------------------------------------------------------------
// Quote builder (4-step layout: details & pricing → line items → terms → preview)
// ---------------------------------------------------------------------------
const QUOTE_STEPS = [
  'Quote Details & Pricing',
  'Line Items & Discounts',
  'Terms & Approvals',
  'Preview & Send',
];
const PAYMENT_TERMS = ['Net 30', 'Net 45', 'Net 60', 'Due on receipt'];
// Highest blended discount each role can approve on their own (CEO is unlimited).
const ROLE_DISCOUNT_LIMIT = {
  rep: 0,
  get admin() {
    return adminDiscountLimit();
  },
  ceo: null,
};

// Defaults shown in the form until the user edits a field.
function quoteDefaults(q, o) {
  const contact = S.contacts.find((c) => c[2] === o.account);
  return {
    name: q.name ?? `${q.no} - ${o.name}`,
    preparedFor: q.preparedFor ?? (contact ? `${contact[0]} (${contact[1]})` : ''),
    // Billing and shipping addresses fill in from the account until the user edits them.
    address: q.address ?? ((S.accountInfo || {})[o.account] || {}).address ?? '',
    shipping: q.shipping ?? ((S.accountInfo || {})[o.account] || {}).shipping ?? '',
    primary: q.primary !== false,
  };
}

function quoteLineRows(q, locked, withActions) {
  return q.items
    .map((i, k) => {
      const net = i.p * (1 - i.d / 100);
      const saved = (i.p * i.q * i.d) / 100;
      const discountCell = withActions
        ? `<input class="inp qt-num" type="number" min="0" max="100" step="0.1" value="${i.d}" ${locked ? 'disabled' : ''} title="${canGiveDiscount() ? '' : 'Your discount goes to Admin / CEO for approval'}" aria-label="Discount percent" onchange="changeQuoteItem(${k},'d',this.value)"><span class="qt-sub">${i.d ? `−${M(saved)}` : ''}</span>`
        : `${i.d}%`;
      const qtyCell = withActions
        ? `<input class="inp qt-num" type="number" min="1" value="${i.q}" ${locked ? 'disabled' : ''} aria-label="Quantity" onchange="changeQuoteItem(${k},'q',this.value)">`
        : i.q;
      const removeCell = withActions
        ? `<td class="qt-r">${locked ? '' : `<button class="qt-del" title="Remove" aria-label="Remove line" onclick="removeQuoteItem(${k})"><span class="ms">delete</span></button>`}</td>`
        : '';
      return `<tr><td><b class="qt-link">${E(i.n)}</b></td><td class="qt-code">${E(i.c)}</td><td class="qt-r">${M(withActions || q.showDiscount ? i.p : net)}</td><td class="qt-r">${qtyCell}</td>${withActions || q.showDiscount ? `<td class="qt-r">${discountCell}</td>` : ''}<td class="qt-r"><b>${M(net * i.q)}</b></td>${removeCell}</tr>`;
    })
    .join('');
}

function quoteLinesCard(q, locked, withActions) {
  const head = (
    withActions || q.showDiscount
      ? ['Product Name', 'Code', 'List Price', 'Qty', 'Discount %', 'Total Price']
      : ['Product Name', 'Code', 'Unit Price', 'Qty', 'Total Price']
  )
    .map((h, n) => `<th class="${n > 1 ? 'qt-r' : ''}">${h}</th>`)
    .concat(withActions ? ['<th class="qt-r">Actions</th>'] : [])
    .join('');
  const products = S.products
    .filter((p) => p.active !== false)
    .map((p) => `<option value="${E(p.code)}">${E(p.name)} · ${M(p.listPrice)}</option>`)
    .join('');
  const tools =
    withActions && !locked
      ? `<select class="btn qt-tool" aria-label="Add products" onchange="addQuoteProduct(this.value);this.value=''"><option value="">+ Add Products</option>${products}</select>${canGiveDiscount() ? '<button class="btn qt-tool" onclick="applyTieredDiscount()"><span class="ms">percent</span>Apply Tiered Discount</button>' : ''}<button class="btn qt-tool" onclick="calculateQuotePricing()"><span class="ms">sync</span>Calculate Pricing</button>`
      : '';
  return `<section class="qt-section"><div class="qt-section-head"><span class="ms">inventory_2</span><b>Line Items &amp; Product Bundling</b><span class="chip ok">${q.items.length} ${q.items.length === 1 ? 'Item' : 'Items'}</span><span class="flex-1"></span>${tools}</div><div class="overflow-x-auto"><table class="qt-table"><thead><tr>${head}</tr></thead><tbody>${quoteLineRows(q, locked, withActions)}</tbody></table></div></section>`;
}

function quoteSummaryRow(q) {
  return `<div class="qt-bottom"><div class="qt-totals"><div class="qt-total-row qt-grand"><b>Grand Total</b><b>${M(quoteTotal(q))}</b></div><small class="mut qt-r" style="display:block">All figures formatted in INR (₹)</small></div></div>`;
}

V.quote = () => {
  const q = S.qd,
    o = cur();
  if (!q || !o) return V.opps();
  const step = S.qstep || 1;
  const inv = q.invoiceId && S.invoices.find((i) => i.id === q.invoiceId);
  const locked = !['Draft', 'Rejected'].includes(q.status);
  const floor = belowProductFloor(q);
  const route = quoteRoute(q);
  const d = quoteDefaults(q, o);
  if (!locked) {
    // keep the autofilled addresses on the quote so they are saved with it
    if (q.address === undefined) q.address = d.address;
    if (q.shipping === undefined) q.shipping = d.shipping;
    if (q.toEmail === undefined) q.toEmail = d.toEmail;
    if (q.toPhone === undefined) q.toPhone = d.toPhone;
  }
  const dis = locked ? 'disabled' : '';

  const field = (label, control, required) =>
    `<label class="qt-field"><span>${label}${required ? ' <i class="qt-req">*</i>' : ''}</span>${control}</label>`;

  const infoCard = `<section class="qt-section"><div class="qt-section-head"><span class="ms">badge</span><b>Quote Information</b></div><div class="qt-grid">${field('Quote Name', `<input class="inp" value="${E(d.name)}" ${dis} onchange="S.qd.name=this.value">`, true)}${field('Expiration Date', `<input type="date" class="inp" value="${q.exp}" ${dis} onchange="S.qd.exp=this.value">`)}${field('Status', q.status === 'Draft' ? quoteOtherSelect('label', QUOTE_STATUS_CHOICES, q.label || 'Draft', false) : `<select class="inp" disabled><option>${E(q.status)}</option></select>`)}${contactsOfAccount(o.account).length ? field('Customer Contact', `<select class="inp" ${dis} onchange="pickQuoteContact(this.value)"><option value="">Choose a contact…</option>${contactOptions(o.account, String(d.preparedFor).replace(/\s*\(.*\)\s*$/, ''))}</select>`) : ''}${field('Prepared For', `<input class="inp" value="${E(d.preparedFor)}" ${dis} onchange="S.qd.preparedFor=this.value">`)}${field('Send To (Email)', `<input class="inp" type="email" value="${E(d.toEmail)}" placeholder="customer@company.com" ${dis} onchange="S.qd.toEmail=this.value">`)}${field('WhatsApp Number', `<input class="inp" type="tel" value="${E(d.toPhone)}" placeholder="+91 98765 43210" ${dis} onchange="S.qd.toPhone=this.value">`)}${field('Sales Rep / Owner', `<input class="inp" value="${E(ownerLabel(o.owner))}" disabled>`)}${field('Billing Address', `<input class="inp" value="${E(d.address)}" placeholder="Street, city, state, PIN" ${dis} onchange="S.qd.address=this.value">`)}${field('Shipping Address', `<input class="inp" value="${E(d.shipping)}" placeholder="Street, city, state, PIN" ${dis} onchange="S.qd.shipping=this.value">`)}</div></section>`;

  const approvalCard = approvalSection(q, floor, locked);

  const previewCard = `<section class="qt-section"><div class="qt-section-head"><span class="ms">visibility</span><b>Preview</b></div><div class="qt-body"><p><b>${E(d.name)}</b></p><p class="mut">Prepared for ${E(d.preparedFor || '—')} · Expires ${fd(q.exp)}</p>${d.address ? `<p class="mut">Billing: ${E(d.address)}</p>` : ''}${d.shipping ? `<p class="mut">Shipping: ${E(d.shipping)}</p>` : ''}<p style="margin-top:8px"><b>Terms &amp; conditions</b></p><p style="white-space:pre-wrap">${E(effectiveTnc(q))}</p></div></section>`;

  const body =
    step === 1
      ? infoCard + quoteLinesCard(q, locked, true) + quoteSummaryRow(q, o, floor, route)
      : step === 2
        ? quoteLinesCard(q, locked, true) + quoteSummaryRow(q, o, floor, route)
        : step === 3
          ? approvalCard + quoteSummaryRow(q, o, floor, route)
          : previewCard + quoteLinesCard(q, locked, false) + quoteSummaryRow(q, o, floor, route);

  const stepper = QUOTE_STEPS.map(
    (label, n) =>
      `<button class="qt-step ${n + 1 === step ? 'on' : ''} ${n + 1 < step ? 'done' : ''}" onclick="S.qstep=${n + 1};render()">${n + 1}. ${label}</button>`
  ).join('');

  const footer = `<div class="qt-foot">${locked ? '<span></span>' : `<button class="btn" onclick="saveQuoteDraft()">Save as Draft</button>`}<span class="flex-1"></span><button class="btn" onclick="nav('opp-detail')">Cancel</button><button class="btn" ${step === 1 ? 'disabled' : ''} onclick="S.qstep=${step - 1};render()">Back</button>${step < 4 ? `<button class="btn" onclick="S.qstep=${step + 1};render()">Next</button>` : ''}${canReview(q) ? `<button class="btn" style="color:var(--err)" onclick="rejectQuote('${E(q.no)}')">Reject</button><button class="btn btn-p" onclick="approveQuote('${E(q.no)}')">Approve</button>` : ''}${inv && canSeeInvoices() ? `<button class="btn btn-p" onclick="openInvoice('${inv.id}')">Open ${E(inv.invoiceNo)}</button>` : ''}${locked ? '' : `<button class="btn btn-p" onclick="submitQuote()">Save &amp; Generate PDF Quote<span class="ms">chevron_right</span></button>`}</div>`;

  return `<div class="qt-wrap card"><header class="qt-head"><span class="qt-head-icon"><span class="ms">description</span></span><div><h1>Generate Quote — ${E(o.name)}</h1><p>Primary Opportunity: <b>${E(o.name)}</b> &nbsp;|&nbsp; Account: <b>${acctSpan(o.account)}</b> &nbsp;|&nbsp; Stage: <b>${E(ST[o.stage] || '—')}</b></p></div></header><nav class="qt-steps">${stepper}</nav><div class="qt-content">${approvalBanner(q, inv)}${body}</div>${footer}</div>`;
};
function removeQuoteItem(k) {
  S.qd.items.splice(k, 1);
  render();
}
// Quantity tiers: 1 unit = 0%, 2–3 units = 5%, 4+ units = 10%.
function applyTieredDiscount() {
  S.qd.items.forEach((i) => {
    i.d = i.q >= 4 ? 10 : i.q >= 2 ? 5 : 0;
  });
  toast('Tiered discount applied');
  render();
}
function calculateQuotePricing() {
  toast('Pricing recalculated');
  render();
}
function addQuoteProduct(code) {
  const p = S.products.find((x) => x.code === code);
  if (!p) return;
  const x = S.qd.items.find((i) => i.c === code);
  if (x) x.q++;
  else S.qd.items.push({ n: p.name, c: p.code, p: p.listPrice, q: 1, d: 0 });
  render();
}
function changeQuoteItem(k, f, v) {
  const i = S.qd.items[k];
  i[f] = f === 'q' ? Math.max(1, Math.floor(+v || 1)) : Math.max(0, Math.min(100, +v || 0));
  render();
}
function saveQuoteDraft() {
  storeQuote(S.qd);
  save();
  toast('Draft saved');
  nav('opp-detail');
}

// Approvals queue view.

V.approvals = () => {
  if (S.role === 'rep') return '<p class="mut">Approvals are managed by Admin and CEO.</p>';
  const list = S.quotes.filter((q) =>
    S.role === 'ceo' ? q.status === 'Pending CEO Approval' : q.status === 'Pending Admin Approval'
  );
  return (
    `<h1 class="text-xl font-bold mb-2">Quotation approvals</h1><p class="mut mb-3">Review discounts and product minimum-price exceptions. Any price below product minimum requires CEO approval.</p>` +
    table(
      [
        'Quote',
        'Opportunity',
        'Requested by',
        'Discount',
        'Total',
        'Approval reason',
        'Notes',
        'Action',
      ],
      list
        .map((q) => {
          const o = S.opps.find((x) => x.id == q.opp) || {};
          return `<tr><td><b>${q.no}</b></td><td>${E(o.name || '')}</td><td>${E(q.createdBy || 'Rep')}</td><td>${quoteDiscount(q).toFixed(2)}%</td><td>${M(quoteTotal(q))}</td><td>${belowProductFloor(q).length ? 'Below minimum price' : 'Discount approval'}</td><td style="max-width:260px">${E(q.notes || '—')}</td><td class="whitespace-nowrap"><button class="btn btn-p" onclick="approveQuote('${q.no}')">Approve</button> <button class="btn" onclick="rejectQuote('${q.no}')">Reject</button></td></tr>`;
        })
        .join('')
    )
  );
};

// Product catalogue view.

V.products = () =>
  S.role === 'rep'
    ? '<p class="mut">Product catalogue is managed by Admin and CEO.</p>'
    : `<div class="flex items-center mb-3"><h1 class="text-xl font-bold flex-1">Products</h1><button class="btn btn-p" onclick="openProductForm()">New product</button></div><p class="mut mb-3">Set list, minimum and maximum selling prices. A discounted unit price below minimum always requires CEO approval.</p>` +
      table(
        [
          'Product',
          'Code',
          'HSN/SAC',
          'GST',
          'List price',
          'Minimum price',
          'Maximum price',
          'Status',
          '',
        ],
        S.products
          .map(
            (p) =>
              `<tr><td><b>${E(p.name)}</b></td><td>${E(p.code)}</td><td>${E(p.hsn || '–')}</td><td>${p.gst === undefined ? 'Default' : p.gst + '%'}</td><td>${M(p.listPrice)}</td><td>${M(p.minPrice)}</td><td>${M(p.maxPrice)}</td><td>${p.active ? 'Active' : 'Inactive'}</td><td><button class="btn" onclick="openProductForm('${p.code}')">Edit</button></td></tr>`
          )
          .join('')
      );

// Invoice list and invoice detail views.

V.invoices = () => {
  const list = S.invoices.filter(
    (i) => S.role !== 'rep' || visibleOpps().some((o) => o.id == i.opp)
  );
  return (
    `<h1 class="text-xl font-bold mb-3">Invoices</h1>` +
    table(
      ['Invoice no.', 'Quotation no.', 'Opportunity', 'Customer', 'Total', 'Status'],
      list
        .map(
          (i) =>
            `<tr class="r" onclick="openInvoice('${i.id}')"><td><b>${i.invoiceNo}</b></td><td>${i.quoteNo}</td><td>${E(i.opportunity)}</td><td>${E(i.account)}</td><td>${M(i.total)}</td><td>${E(i.status)}</td></tr>`
        )
        .join('')
    )
  );
};
V['invoice-detail'] = () => {
  const i = S.invoices.find((x) => x.id === S.currentInvoice);
  if (!i) return V.invoices();
  return `<div class="mut cursor-pointer mb-2" onclick="nav('invoices')">‹ Back to invoices</div><div class="card p-5"><h1 class="text-xl font-bold">Invoice ${i.invoiceNo}</h1><p class="mut">Generated from quotation ${i.quoteNo}</p><div class="mt-4"><b>${E(i.account)}</b><div class="mut">${E(i.opportunity)}</div></div>${billLinesTable(i.items, !!i.showDiscount)}<div class="text-right text-lg font-bold mt-3">Grand total: ${M(i.total)}</div><div class="flex justify-end gap-2 mt-4"><button class="btn" onclick="window.print()">Print / Save PDF</button>${i.status !== 'Submitted to client' ? `<button class="btn btn-p" onclick="sendInvoice('${i.id}')">Submit to client</button>` : '<span class="chip ok">Submitted to client</span>'}</div></div>`;
};

// Portal picker added to the header.

// Preserve the prototype's opportunity detail UI and add clickable quote/invoice history.
// Add portal picker without changing the existing header layout.
const rolePicker = document.createElement('select');
rolePicker.id = 'role-switch';
rolePicker.className = 'inp';
rolePicker.style.width = 'auto';
rolePicker.style.maxWidth = '145px';
rolePicker.innerHTML =
  '<option value="rep">Rep portal</option><option value="admin">Admin portal</option><option value="ceo">CEO portal</option>';
rolePicker.value = S.role;
rolePicker.onchange = () => setRole(rolePicker.value);
const headerActions = document.querySelector('header .flex.items-center');
if (headerActions) {
  const avatar = headerActions.querySelector('span[title="Alex Lee"]');
  if (avatar) avatar.parentNode.insertBefore(rolePicker, avatar);
}

// Contacts with mobile number: list, form and edit.

// Extend contact creation and display with mobile number.
V.contacts = () =>
  `<div class="flex items-center mb-3"><h1 class="text-xl font-bold flex-1">Contacts</h1><button class="btn btn-p" onclick="openContactForm()">New contact</button></div>` +
  table(
    ['Name', 'Title', 'Account', 'Email', 'Mobile'],
    S.contacts
      .map(
        (c) =>
          `<tr><td><b>${E(c[0])}</b></td><td>${E(c[1])}</td><td>${E(c[2])}</td><td><a style="color:var(--pr)" href="mailto:${E(c[3])}">${E(c[3])}</a></td><td><a style="color:var(--pr)" href="tel:${E(c[4])}">${E(c[4] || '—')}</a></td></tr>`
      )
      .join('')
  );
function openContactForm() {
  $('#modal').innerHTML =
    `<div class="fixed inset-0 z-40 grid place-items-center p-4" style="background:rgba(0,0,0,.5)"><form class="card p-5 w-full max-w-md space-y-3" onsubmit="saveContact(event)"><h2 class="text-lg font-bold">New contact</h2>${[
      ['name', 'Full name'],
      ['title', 'Job title'],
      ['account', 'Account'],
      ['email', 'Email'],
      ['mobile', 'Mobile number'],
    ]
      .map(
        ([n, l]) =>
          `<label class="block">${l}<input class="inp" name="${n}" ${n === 'email' ? 'type="email"' : ''} ${n === 'mobile' ? 'type="tel"' : ''} required></label>`
      )
      .join(
        ''
      )}<div class="flex justify-end gap-2"><button type="button" class="btn" onclick="$('#modal').innerHTML=''">Cancel</button><button class="btn btn-p">Save</button></div></form></div>`;
}
function saveContact(e) {
  e.preventDefault();
  const v = Object.fromEntries(new FormData(e.target));
  S.contacts.push([v.name, v.title, v.account, v.email, v.mobile]);
  $('#modal').innerHTML = '';
  save();
  toast('Contact added');
  render();
}
function editContactMobile(name) {
  const c = S.contacts.find((x) => x[0] === name);
  if (!c) return;
  $('#modal').innerHTML =
    `<div class="fixed inset-0 z-40 grid place-items-center p-4" style="background:rgba(0,0,0,.5)"><form class="card p-5 w-full max-w-md space-y-3" onsubmit="saveContactMobile(event,'${E(name)}')"><h2 class="text-lg font-bold">Contact mobile number</h2><label class="block">Mobile number<input class="inp" name="mobile" type="tel" value="${E(c[4] || '')}" placeholder="+91 98765 43210" required></label><div class="flex justify-end gap-2"><button type="button" class="btn" onclick="$('#modal').innerHTML=''">Cancel</button><button class="btn btn-p">Save</button></div></form></div>`;
}
function saveContactMobile(e, name) {
  e.preventDefault();
  const c = S.contacts.find((x) => x[0] === name);
  if (c) {
    c[4] = new FormData(e.target).get('mobile');
    save();
    $('#modal').innerHTML = '';
    toast('Mobile number saved');
    render();
  }
}

// New opportunity and contact-role popups, priorities and extended save.

// New-opportunity and add-contact-role popups (replaces the base `modal` for these two keys).
const PRIORITIES = ['Low', 'Medium', 'High', 'Critical'];
const OPP_TYPES = ['New Business', 'Existing Business – Upsell', 'Renewal'];
const CONTACT_ROLES = [
  'Decision Maker',
  'Business User',
  'Technical Evaluator',
  'Buyer',
  'Influencer',
];
const LEAD_SOURCES = [
  'Webinar',
  'Partner Referral',
  'Trade Show',
  'Inbound Web',
  'Outbound',
  'Referral',
];
const prioChip = (o) => {
  const p = o.priority || 'Medium';
  const tone = p === 'Critical' || p === 'High' ? 'wr' : p === 'Low' ? 'ok' : '';
  return `<span class="chip ${tone}" title="Priority">${p}</span>`;
};
const prioOptions = (selected) =>
  PRIORITIES.map(
    (p) => `<option ${p === (selected || 'Medium') ? 'selected' : ''}>${p}</option>`
  ).join('');
const knownAccounts = () =>
  [...new Set([...S.opps.map((o) => o.account), ...S.contacts.map((c) => c[2])])].filter(Boolean);

// Priority can be changed at any time, from the opportunity page, the list or the board.
function setPriority(id, value) {
  const o = S.opps.find((x) => x.id == id);
  if (!o || !PRIORITIES.includes(value)) return;
  const before = o.priority || 'Medium';
  if (before === value) return;
  o.priority = value;
  (S.acts[id] = S.acts[id] || []).unshift({
    k: 'sync',
    x: `Priority changed from ${before} to ${value} by ${roleNow().name}`,
    t: Date.now(),
  });
  save();
  toast(`Priority set to ${value}`);
  render();
}

// Team + Assigned rep: picking a team narrows the rep list to that team's reps.
function newOppTeamAndRep() {
  const reps = assignableReps(),
    def = defaultRepCode(),
    defTeam = (reps.find((u) => u.ownerCode === def) || {}).teamId || '',
    teams = (S.teams || []).filter((t) => reps.some((u) => u.teamId === t.id)),
    teamSel = `<select class="inp" name="teamId" onchange="newOppTeamChanged(this)"><option value="">All teams</option>${teams
      .map(
        (t) =>
          `<option value="${E(t.id)}" ${t.id === defTeam ? 'selected' : ''}>${E(t.name)}</option>`
      )
      .join('')}</select>`,
    repSel = `<select class="inp" name="owner" required>${reps
      .map(
        (u) =>
          `<option value="${E(u.ownerCode)}" data-team="${E(u.teamId || '')}" ${u.ownerCode === def ? 'selected' : ''}>${E(u.name)}</option>`
      )
      .join('')}</select>`;
  setTimeout(() => {
    const t = document.querySelector('#modal [name=teamId]');
    if (t) newOppTeamChanged(t);
  }, 0);
  return `<label class="block">Team${teamSel}</label><label class="block">Assigned rep${repSel}</label>`;
}
function newOppTeamChanged(sel) {
  const rep = sel.form.elements.owner;
  let first = null;
  [...rep.options].forEach((o) => {
    const show = !sel.value || o.dataset.team === sel.value;
    o.hidden = !show;
    o.disabled = !show;
    if (show && !first) first = o;
  });
  if (rep.selectedOptions[0] && rep.selectedOptions[0].disabled && first) rep.value = first.value;
}

// Products: tick one or more, set a quantity for each. The amount is then worked out from them.
function newOppProducts() {
  const rows = S.products
    .filter((p) => p.active !== false)
    .map(
      (p) =>
        `<label class="flex items-center gap-2 py-1"><input type="checkbox" name="prod" value="${E(p.code)}" onchange="newOppProductsChanged(this.form)"><span class="flex-1 min-w-0"><b>${E(p.name)}</b> <span class="mut text-xs">${E(p.code)} · ${M(p.listPrice)}</span></span><input class="inp" style="width:72px" type="number" min="1" step="1" value="1" name="qty_${E(p.code)}" aria-label="Quantity for ${E(p.name)}" disabled onchange="newOppProductsChanged(this.form)"></label>`
    )
    .join('');
  return `<div class="sm:col-span-2"><div class="font-semibold">Products <span class="mut text-xs font-normal">(optional — choose one or more)</span></div><div class="card p-2 mt-1 overflow-auto" style="max-height:180px">${rows || '<span class="mut">No active products.</span>'}</div></div>`;
}
function newOppProductsChanged(form) {
  let total = 0,
    n = 0;
  S.products.forEach((p) => {
    const box = [...form.querySelectorAll('[name=prod]')].find((b) => b.value === p.code);
    const qty = form.elements['qty_' + p.code];
    if (!box || !qty) return;
    qty.disabled = !box.checked;
    if (box.checked) {
      n++;
      total += p.listPrice * Math.max(1, Math.floor(+qty.value || 1));
    }
  });
  const amt = form.elements.amount,
    note = form.querySelector('#amt-note');
  amt.readOnly = n > 0;
  if (n > 0) amt.value = total;
  if (note) note.textContent = n > 0 ? `Calculated from ${n} product${n > 1 ? 's' : ''}` : '';
}

const originalModal = modal;
modal = function (k) {
  if (k === 'role') return openOppContactForm();
  if (k !== 'opp') return originalModal(k);
  const field = (label, control, wide) =>
    `<label class="block ${wide ? 'sm:col-span-2' : ''}">${label}${control}</label>`;
  $('#modal').innerHTML =
    `<div class="fixed inset-0 z-40 grid place-items-center p-4" style="background:rgba(0,0,0,.5)"><form class="card p-5 w-full max-w-2xl max-h-full overflow-auto" onsubmit="saveOpportunityExtended(event)"><h2 class="text-lg font-bold mb-3">New opportunity</h2><div class="grid sm:grid-cols-2 gap-3">` +
    field('Opportunity name *', '<input class="inp" name="name" required>', true) +
    field(
      'Account *',
      `<input class="inp" name="account" list="acct-list" required><datalist id="acct-list">${knownAccounts()
        .map((a) => `<option value="${E(a)}">`)
        .join('')}</datalist>`
    ) +
    field(
      'Amount (₹) *',
      '<input class="inp" name="amount" type="number" min="0" required><span class="mut text-xs" id="amt-note"></span>'
    ) +
    field(
      'Close date *',
      `<input class="inp" name="close" type="date" value="${D(30)}" required>`
    ) +
    field(
      'Stage',
      `<select class="inp" name="stage">${ST.map((x, i) => `<option value="${i}">${x}</option>`).join('')}</select>`
    ) +
    field(
      'Priority level',
      `<select class="inp" name="priority">${prioOptions('Medium')}</select>`
    ) +
    newOppTeamAndRep() +
    newOppProducts() +
    field('Opportunity type', formOtherSelect('type', OPP_TYPES, OPP_TYPES[0])) +
    field('Lead source', formOtherSelect('source', LEAD_SOURCES, LEAD_SOURCES[0])) +
    field(
      'Next step',
      '<input class="inp" name="next" placeholder="e.g. Schedule discovery call">'
    ) +
    field(
      'Description',
      '<textarea class="inp" name="description" rows="3" placeholder="Notes about this deal (optional)"></textarea>',
      true
    ) +
    `</div><div class="flex justify-end gap-2 mt-4"><button type="button" class="btn" onclick="$('#modal').innerHTML=''">Cancel</button><button class="btn btn-p">Save</button></div></form></div>`;
  $('#modal input').focus();
};
function saveOpportunityExtended(e) {
  e.preventDefault();
  const fd0 = new FormData(e.target),
    v = Object.fromEntries(fd0),
    id = Math.max(0, ...S.opps.map((o) => o.id)) + 1,
    picked = fd0
      .getAll('prod')
      .map((code) => {
        const p = S.products.find((x) => x.code === code);
        const q = Math.max(1, Math.floor(+v['qty_' + code] || 1));
        return p && { n: p.name, c: p.code, p: p.listPrice, q, d: 0 };
      })
      .filter(Boolean),
    a = picked.length ? picked.reduce((s, i) => s + i.p * i.q, 0) : +v.amount,
    ownerCode = v.owner || defaultRepCode(),
    ownerRep = activeReps().find((u) => u.ownerCode === ownerCode);
  S.opps.push({
    id,
    name: v.name.trim(),
    account: v.account.trim(),
    amount: a,
    stage: +v.stage,
    close: v.close,
    owner: ownerCode,
    teamId: (ownerRep && ownerRep.teamId) || '',
    priority: PRIORITIES.includes(v.priority) ? v.priority : 'Medium',
    type: pickOther(v, 'type'),
    source: pickOther(v, 'source'),
    description: (v.description || '').trim(),
    next: (v.next || '').trim(),
    socials: { linkedin: '', instagram: '', facebook: '', x: '' },
    items: picked.length ? picked : [{ n: 'Platform licence', c: 'GEN-100', p: a, q: 1, d: 0 }],
  });
  S.cur = id;
  $('#modal').innerHTML = '';
  save();
  toast('Opportunity created');
  nav('opp-detail');
}

// "Add" on an opportunity's Contact roles: pick an existing contact or create a new one.
function openOppContactForm() {
  const o = cur();
  if (!o) return;
  const hasRoles = roles(o).length > 0;
  const existing = S.contacts
    .map((c) => `<option value="${E(c[0])}">${E(c[0])}${c[2] ? ' – ' + E(c[2]) : ''}</option>`)
    .join('');
  const toggle = `const n=this.value==='__new';document.getElementById('nc-fields').style.display=n?'':'none';document.querySelectorAll('#nc-fields [data-req]').forEach(i=>i.required=n)`;
  $('#modal').innerHTML =
    `<div class="fixed inset-0 z-40 grid place-items-center p-4" style="background:rgba(0,0,0,.5)"><form class="card p-5 w-full max-w-lg max-h-full overflow-auto space-y-3" onsubmit="saveOppContact(event)"><h2 class="text-lg font-bold">Add contact to ${E(o.name)}</h2>` +
    `<label class="block">Contact<select class="inp" name="contact" onchange="${toggle}"><option value="__new">+ Create new contact</option>${existing}</select></label>` +
    `<div id="nc-fields" class="grid sm:grid-cols-2 gap-3"><label class="block sm:col-span-2">Full name *<input class="inp" name="name" data-req required></label><label class="block">Designation *<input class="inp" name="title" data-req required placeholder="e.g. VP Procurement"></label><label class="block">Contact number *<input class="inp" name="phone" type="tel" data-req required placeholder="+91 98765 43210"></label><label class="block sm:col-span-2">Email *<input class="inp" name="email" type="email" data-req required></label></div>` +
    `<label class="block">Role on this opportunity${formOtherSelect('role', CONTACT_ROLES, CONTACT_ROLES[0])}</label>` +
    `<label class="flex items-center gap-2"><input type="checkbox" name="primary" ${hasRoles ? '' : 'checked'}> Primary contact for this opportunity <span class="mut text-xs">(you can change this any time)</span></label>` +
    `<div class="flex justify-end gap-2"><button type="button" class="btn" onclick="$('#modal').innerHTML=''">Cancel</button><button class="btn btn-p">Save</button></div></form></div>`;
  $('#modal input').focus();
}
function saveOppContact(e) {
  e.preventDefault();
  const v = Object.fromEntries(new FormData(e.target));
  const o = cur();
  let name = v.contact;
  if (name === '__new') {
    name = v.name.trim();
    if (!S.contacts.some((c) => c[0] === name))
      S.contacts.push([name, v.title.trim(), o.account, v.email.trim(), v.phone.trim(), false]);
  }
  const r = roles(o);
  if (r.some((x) => x.name === name)) return toast(`${name} is already on this opportunity`);
  const makePrimary = !!v.primary || !r.length;
  if (makePrimary) r.forEach((x) => (x.primary = false));
  r.push({ name, role: pickOther(v, 'role'), primary: makePrimary });
  $('#modal').innerHTML = '';
  save();
  toast('Contact added');
  render();
}

// Portal-specific navigation and record access.

// Portal-specific navigation and record access.
const originalNav = nav;
nav = function (v, id) {
  if (id) S.cur = id;
  if (!seesAllOpps() && v === 'opp-detail' && cur() && cur().owner !== roleNow().owner) {
    toast('This opportunity is outside your portal access');
    return;
  }
  if (S.role === 'rep' && ['approvals', 'products'].includes(v))
    return toast('This section is not available in the Rep portal');
  originalNav(v, id);
};
const originalRender = render;
render = function () {
  let v = location.hash.slice(1) || 'home';
  if (S.role === 'rep' && ['approvals', 'products'].includes(v)) location.hash = '#home';
  if (!seesAllOpps() && v === 'opp-detail' && cur() && cur().owner !== roleNow().owner)
    location.hash = '#home';
  originalRender();
  v = location.hash.slice(1) || 'home';
  const n = document.querySelector('#nav');
  if (n) {
    const links =
      S.role === 'rep'
        ? [
            ['home', 'Home'],
            ['leads', 'Leads'],
            ['accounts', 'Accounts'],
            ['contacts', 'Contacts'],
            ['opps', 'Opportunities'],
            ['quotes', 'Quotes'],
            ['invoices', 'Invoices'],
          ]
        : [
            ['home', 'Home'],
            ['leads', 'Leads'],
            ['accounts', 'Accounts'],
            ['contacts', 'Contacts'],
            ['opps', 'Opportunities'],
            ['quotes', 'Quotes'],
            ['products', 'Products'],
            ['approvals', 'Approvals'],
            ['invoices', 'Invoices'],
          ];
    n.innerHTML =
      links
        .map(
          ([k, l]) =>
            `<a href="#${k}" class="px-3 py-2 font-semibold whitespace-nowrap" style="${v === k || (v === 'quote' && k === 'quotes') || (v === 'invoice-detail' && k === 'invoices') || (v === 'opp-detail' && k === 'opps') ? 'border-bottom:3px solid var(--pr);color:var(--pr)' : 'color:var(--mut)'}">${l}${k === 'approvals' && S.quotes.filter((q) => q.status.startsWith('Pending')).length ? ` <span class="chip wr">${S.quotes.filter((q) => q.status.startsWith('Pending')).length}</span>` : ''}</a>`
        )
        .join('') +
      '<span class="flex-1"></span><a href="#home" class="px-3 py-2 mut" onclick="if(confirm(\'Reset all demo data?\')){localStorage.removeItem(KEY);location.reload()}">Reset demo</a>';
  }
  const sw = document.querySelector('#role-switch');
  if (sw) sw.value = S.role;
};
// Upgrade existing approved quotes and register the enhanced route renderer.
S.quotes.forEach((q) => {
  if (q.status === 'In Review') q.status = 'Pending Admin Approval';
  if (q.status === 'Approved' && !q.invoiceId) newInvoice(q);
});
addEventListener('hashchange', render);

// Users seed, login screen, sign in and sign out.

// Authentication and role-based account administration (prototype/localStorage implementation).
S.users = S.users || [
  {
    id: 'u-ceo',
    name: 'Tony Stark',
    username: 'ceo',
    password: 'ceo123',
    role: 'ceo',
    ownerCode: 'TS',
    active: true,
  },
  {
    id: 'u-admin',
    name: 'Sara Chen',
    username: 'admin',
    password: 'admin123',
    role: 'admin',
    ownerCode: 'SC',
    active: true,
  },
  {
    id: 'u-rep',
    name: 'Alex Lee',
    username: 'rep',
    password: 'rep123',
    role: 'rep',
    ownerCode: 'AL',
    active: true,
  },
];
if (!S.users.some((u) => u.id === S.authUser)) S.authUser = null;
function showLogin() {
  const h = document.querySelector('header');
  if (h) h.style.display = 'none';
  const app = $('#app');
  if (!app) return;
  app.className = 'min-h-screen grid place-items-center p-4';
  app.innerHTML = `<div class="card w-full max-w-md p-6">
 <div class="flex items-center gap-2 mb-5"><span class="ms" style="color:var(--pr);font-size:34px">cloud</span><div><b class="text-xl">Ceph CRM</b><div class="mut text-xs">Sign in to your workspace</div></div></div>
 <h1 class="text-xl font-bold mb-1">Welcome back</h1><p class="mut mb-4">Enter your account details to continue.</p>
 <form class="space-y-3" onsubmit="loginUser(event)">
 <label class="block">Username<input class="inp mt-1" name="username" autocomplete="username" required></label>
 <label class="block">Password<input class="inp mt-1" name="password" type="password" autocomplete="current-password" required></label>
 <div id="login-error" class="text-sm" style="color:var(--err)"></div>
 <button class="btn btn-p w-full justify-center">Sign in</button></form>
 <div class="mt-4 p-3 rounded text-xs" style="background:var(--hov)"><b>Demo accounts</b><br>CEO: ceo / ceo123<br>Admin: admin / admin123<br>Rep: rep / rep123</div>
 <p class="mut text-xs mt-3">Prototype login only. Production requires secure server-side authentication.</p>
 </div>`;
}
function loginUser(e) {
  e.preventDefault();
  const v = Object.fromEntries(new FormData(e.target)),
    u = S.users.find(
      (x) =>
        x.username.toLowerCase() === v.username.trim().toLowerCase() &&
        x.password === v.password &&
        x.active !== false
    );
  if (!u) {
    $('#login-error').textContent = 'Invalid username or password.';
    return;
  }
  S.authUser = u.id;
  S.role = u.role;
  S.mine = u.role === 'rep';
  save();
  const h = document.querySelector('header');
  if (h) h.style.display = '';
  $('#app').className = 'p-3 md:p-4 max-w-[1500px] mx-auto';
  location.hash = '#home';
  render();
}
function logoutUser() {
  S.authUser = null;
  save();
  location.hash = '';
  render();
}

// User list and create-user form.

V.users = () => {
  const u = S.users.filter((x) => x.active !== false);
  return (
    `<div class="flex items-center mb-3"><div class="flex-1"><h1 class="text-xl font-bold">User accounts</h1><p class="mut">Manage portal access and team accounts</p></div><button class="btn btn-p" onclick="openUserForm()">Create account</button></div>` +
    table(
      ['Name', 'Username', 'Role', 'Owner code', 'Status'],
      u
        .map(
          (x) =>
            `<tr><td><b>${E(x.name)}</b></td><td>${E(x.username)}</td><td>${roleTitle(x)}</td><td>${E(x.ownerCode || '—')}</td><td><span class="chip ok">Active</span></td></tr>`
        )
        .join('')
    ) +
    `<p class="mut mt-3">Admins can create Rep accounts. CEOs can create Admin and Rep accounts.</p>`
  );
};
// teamId is optional: pass it to open the form already set to "Rep" on that team.
function openUserForm(teamId = '') {
  const role = S.role,
    allowed =
      role === 'ceo'
        ? ['admin', 'rep', 'senior_rep']
        : role === 'admin'
          ? ['rep', 'senior_rep']
          : [];
  if (!allowed.length) return toast('You do not have permission to create accounts');
  $('#modal').innerHTML =
    `<div class="fixed inset-0 z-40 grid place-items-center p-4" style="background:rgba(0,0,0,.5)"><form class="card p-5 w-full max-w-md space-y-3" onsubmit="createUser(event)"><h2 class="text-lg font-bold">Create user account</h2>
 <label class="block">Full name<input class="inp mt-1" name="name" required></label>
 <label class="block">Username<input class="inp mt-1" name="username" required></label>
 <label class="block">Temporary password<input class="inp mt-1" name="password" type="password" minlength="8" required></label>
 <label class="block">Portal role<select class="inp mt-1" name="role">${(teamId ? ['rep', 'senior_rep'] : allowed).map((r) => `<option value="${r}">${r === 'admin' ? 'Admin' : r === 'senior_rep' ? 'Senior Rep' : 'Rep'}</option>`).join('')}</select></label>
 <label class="block">Team (reps only)<select class="inp mt-1" name="teamId"><option value="">Unassigned</option>${S.teams.map((t) => `<option value="${t.id}" ${t.id === teamId ? 'selected' : ''}>${E(t.name)}</option>`).join('')}</select></label>
 <div class="mut text-xs">${role === 'ceo' ? 'CEO can create Admin and Rep accounts.' : 'Admin can create Rep accounts only.'}</div>
 <div class="flex justify-end gap-2"><button type="button" class="btn" onclick="$('#modal').innerHTML=''">Cancel</button><button class="btn btn-p">Create account</button></div></form></div>`;
}
function createUser(e) {
  e.preventDefault();
  const v = Object.fromEntries(new FormData(e.target)),
    allowed =
      S.role === 'ceo'
        ? ['admin', 'rep', 'senior_rep']
        : S.role === 'admin'
          ? ['rep', 'senior_rep']
          : [];
  if (!allowed.includes(v.role)) return toast('Not authorised to create this role');
  const senior = v.role === 'senior_rep';
  if (senior) v.role = 'rep';
  if (S.users.some((u) => u.username.toLowerCase() === v.username.trim().toLowerCase()))
    return toast('Username already exists');
  const id = 'u-' + Date.now();
  let ownerCode = 'U' + (S.users.length + 1);
  while (S.users.some((u) => u.ownerCode === ownerCode)) ownerCode += 'x';
  const user = {
    id,
    name: v.name.trim(),
    username: v.username.trim(),
    password: v.password,
    role: v.role,
    ownerCode,
    active: true,
  };
  if (v.role === 'rep') {
    user.teamId = v.teamId || null;
    user.teamLocked = true;
    user.senior = senior;
    user.target = DEFAULT_TARGET;
  }
  S.users.push(user);
  OWN[ownerCode] = v.name.trim();
  $('#modal').innerHTML = '';
  save();
  toast(v.role.toUpperCase() + ' account created');
  render();
}

// Render wrapper that gates pages behind login and portal.

const priorRenderWithPortals = render;
render = function () {
  if (!S.authUser) {
    showLogin();
    return;
  }
  const user = S.users.find((u) => u.id === S.authUser);
  if (!user || user.active === false) {
    S.authUser = null;
    showLogin();
    return;
  }
  S.role = user.role;
  S.mine = user.role === 'rep';
  const h = document.querySelector('header');
  if (h) h.style.display = '';
  $('#app').className = 'p-3 md:p-4 max-w-[1500px] mx-auto';
  priorRenderWithPortals();
  const navEl = $('#nav');
  if (navEl) {
    const isRep = user.role === 'rep',
      links = isRep
        ? [
            ['home', 'Home'],
            ['leads', 'Leads'],
            ['accounts', 'Accounts'],
            ['contacts', 'Contacts'],
            ['opps', 'Opportunities'],
            ['quotes', 'Quotes'],
            ['invoices', 'Invoices'],
          ]
        : [
            ['home', 'Home'],
            ['leads', 'Leads'],
            ['accounts', 'Accounts'],
            ['contacts', 'Contacts'],
            ['opps', 'Opportunities'],
            ['quotes', 'Quotes'],
            ['products', 'Products'],
            ['approvals', 'Approvals'],
            ['invoices', 'Invoices'],
            ['users', 'User accounts'],
          ];
    let v = location.hash.slice(1) || 'home';
    navEl.innerHTML =
      links
        .map(
          ([k, l]) =>
            `<a href="#${k}" class="px-3 py-2 font-semibold whitespace-nowrap" style="${v === k || (v === 'quote' && k === 'quotes') || (v === 'invoice-detail' && k === 'invoices') || (v === 'opp-detail' && k === 'opps') ? 'border-bottom:3px solid var(--pr);color:var(--pr)' : 'color:var(--mut)'}">${l}</a>`
        )
        .join('') +
      `<span class="flex-1"></span><span class="mut self-center px-2">${E(user.name)} · ${roleTitle(user)}</span><a href="#" class="px-3 py-2 mut" onclick="logoutUser();return false">Sign out</a>`;
  }
  const sw = $('#role-switch');
  if (sw) sw.style.display = 'none';
};

// Cross-tab sync through the storage event.

// Cross-tab sync: quotations, approvals, invoices and CRM records are shared; login stays tab-specific.
addEventListener('storage', (e) => {
  if (e.key !== KEY || !e.newValue) return;
  try {
    const incoming = JSON.parse(e.newValue),
      auth = S.authUser;
    Object.assign(S, incoming);
    S.authUser = auth;
    if (auth) {
      const user = S.users.find((u) => u.id === auth && u.active !== false);
      if (user) {
        S.role = user.role;
        S.mine = user.role === 'rep';
      }
    }
    if (
      ['approvals', 'quotes', 'invoices', 'opp-detail', 'quote', 'invoice-detail'].includes(
        location.hash.slice(1)
      )
    )
      render();
  } catch (err) {
    console.warn('Could not sync Ceph CRM tab', err);
  }
});

// Header dropdowns: notifications, user menu and header refresh.

// ---------------------------------------------------------------------------
// Action completion: notifications, user menu, Slack share, leads, contacts,
// user administration and invoice payment. Prototype/localStorage implementation.
// ---------------------------------------------------------------------------
const logOpp = (id, k, x) => {
  (S.acts[id] = S.acts[id] || []).unshift({ k, x, t: Date.now(), by: roleNow().name });
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
          sub:
            q.status === 'Approved'
              ? canSeeInvoices()
                ? 'Invoice generated'
                : 'Approved'
              : 'Review and resubmit',
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
    `<div class="p-4" style="border-bottom:1px solid var(--bd)"><b>${E(u.name)}</b><div class="mut">${E(u.username || '')} · ${roleTitle(u)}</div></div><div class="p-2"><button class="btn w-full justify-center" onclick="closePanels();logoutUser()"><span class="ms">logout</span>Sign out</button></div>`
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

// Slack share (logged on the opportunity timeline).

// Slack share (records the share on the timeline)
function shareToSlack() {
  const o = cur();
  if (!o) return;
  logOpp(o.id, 'sync', `Deal shared to #deals in Slack by ${currentUser().name || 'user'}`);
  save();
  toast('Shared to #deals in Slack');
  render();
}

// Lead status change and delete.

// Leads
const LEAD_STATUS = ['New', 'Working', 'Qualified', 'Unqualified'];
V.leads = () =>
  `<div class="flex items-center mb-3"><h1 class="text-xl font-bold flex-1">Leads</h1><button class="btn btn-p" onclick="modal('lead')"><span class="ms">add</span>New lead</button></div>` +
  table(
    ['Name', 'Company', 'Source', 'Status', ''],
    S.leads
      .map(
        (l, i) =>
          `<tr><td><b>${E(l[0])}</b></td><td>${E(l[1])}</td><td>${E(l[2])}</td><td><select class="inp" style="width:auto" aria-label="Lead status" onchange="setLeadStatus(${i},this.value)">${LEAD_STATUS.map((s) => `<option ${s === l[3] ? 'selected' : ''}>${s}</option>`).join('')}</select></td><td class="text-right whitespace-nowrap">${canAddOpportunity() ? `<button class="btn" onclick="convert(${i})">Convert to deal</button>` : ''} <button class="btn" style="color:var(--err)" onclick="deleteLead(${i})">Delete</button></td></tr>`
      )
      .join('')
  );
function setLeadStatus(i, status) {
  if (!S.leads[i]) return;
  S.leads[i][3] = status;
  save();
  toast('Lead marked ' + status.toLowerCase());
}
function deleteLead(i) {
  const l = S.leads[i];
  if (!l || !confirm('Delete lead ' + l[0] + '?')) return;
  S.leads.splice(i, 1);
  save();
  toast('Lead deleted');
  render();
}

// Contact edit and delete.

// Contacts: edit and delete
V.contacts = () =>
  `<div class="flex items-center mb-3"><h1 class="text-xl font-bold flex-1">Contacts</h1><button class="btn btn-p" onclick="openContactForm()">New contact</button></div>` +
  table(
    ['Name', 'Title', 'Account', 'Email', 'Mobile', ''],
    S.contacts
      .map(
        (c, i) =>
          `<tr><td><b>${E(c[0])}</b></td><td>${E(c[1])}</td><td>${E(c[2])}</td><td><a style="color:var(--pr)" href="mailto:${E(c[3])}">${E(c[3])}</a></td><td><a style="color:var(--pr)" href="tel:${E(c[4])}">${E(c[4] || '—')}</a></td><td class="text-right whitespace-nowrap"><button class="btn" onclick="openContactEditor(${i})">Edit</button> <button class="btn" style="color:var(--err)" onclick="deleteContact(${i})">Delete</button></td></tr>`
      )
      .join('')
  );
function openContactEditor(i) {
  const c = S.contacts[i];
  if (!c) return;
  $('#modal').innerHTML =
    `<div class="fixed inset-0 z-40 grid place-items-center p-4" style="background:rgba(0,0,0,.5)"><form class="card p-5 w-full max-w-md space-y-3" onsubmit="saveContactEdit(event,${i})"><h2 class="text-lg font-bold">Edit contact</h2>${[
      ['name', 'Full name', 0],
      ['title', 'Job title', 1],
      ['account', 'Account', 2],
      ['email', 'Email', 3],
      ['mobile', 'Mobile number', 4],
    ]
      .map(
        ([n, l, k]) =>
          `<label class="block">${l}<input class="inp" name="${n}" value="${E(c[k] || '')}" ${n === 'email' ? 'type="email"' : n === 'mobile' ? 'type="tel"' : ''} ${n === 'mobile' ? '' : 'required'}></label>`
      )
      .join(
        ''
      )}<div class="flex justify-end gap-2"><button type="button" class="btn" onclick="$('#modal').innerHTML=''">Cancel</button><button class="btn btn-p">Save changes</button></div></form></div>`;
}
function saveContactEdit(e, i) {
  e.preventDefault();
  const v = Object.fromEntries(new FormData(e.target));
  if (!S.contacts[i]) return;
  S.contacts[i] = [
    v.name.trim(),
    v.title.trim(),
    v.account.trim(),
    v.email.trim(),
    v.mobile.trim(),
  ];
  $('#modal').innerHTML = '';
  save();
  toast('Contact updated');
  render();
}
function deleteContact(i) {
  const c = S.contacts[i];
  if (!c || !confirm('Delete contact ' + c[0] + '?')) return;
  S.contacts.splice(i, 1);
  save();
  toast('Contact deleted');
  render();
}

// Activate / deactivate users and reset passwords.

// User administration: activate / deactivate and reset password
const manageableRoles = () =>
  S.role === 'ceo' ? ['admin', 'rep'] : S.role === 'admin' ? ['rep'] : [];
V.users = () =>
  `<div class="flex items-center mb-3"><div class="flex-1"><h1 class="text-xl font-bold">User accounts</h1><p class="mut">Manage portal access and team accounts</p></div><button class="btn btn-p" onclick="openUserForm()">Create account</button></div>` +
  table(
    ['Name', 'Username', 'Role', 'Owner code', 'Status', ''],
    S.users
      .map((x) => {
        const can = manageableRoles().includes(x.role) && x.id !== S.authUser,
          on = x.active !== false;
        return `<tr><td><b>${E(x.name)}</b></td><td>${E(x.username)}</td><td>${roleTitle(x)}</td><td>${E(x.ownerCode || '—')}</td><td><span class="chip ${on ? 'ok' : 'wr'}">${on ? 'Active' : 'Inactive'}</span></td><td class="text-right whitespace-nowrap">${can ? `${x.role === 'rep' ? `<button class="btn" onclick="toggleSeniorRep('${x.id}')">${isSeniorRep(x) ? 'Remove senior' : 'Make senior'}</button> ` : ''}<button class="btn" onclick="openResetPassword('${x.id}')">Reset password</button> <button class="btn" onclick="toggleUserActive('${x.id}')">${on ? 'Deactivate' : 'Activate'}</button>` : ''}</td></tr>`;
      })
      .join('')
  ) +
  `<p class="mut mt-3">Admins can manage Rep accounts. CEOs can manage Admin and Rep accounts.</p>`;
function toggleUserActive(id) {
  const u = S.users.find((x) => x.id === id);
  if (!u || !manageableRoles().includes(u.role) || u.id === S.authUser)
    return toast('You do not have permission to change this account');
  u.active = u.active === false;
  save();
  toast(u.name + (u.active ? ' activated' : ' deactivated'));
  render();
}
function openResetPassword(id) {
  const u = S.users.find((x) => x.id === id);
  if (!u || !manageableRoles().includes(u.role))
    return toast('You do not have permission to reset this password');
  $('#modal').innerHTML =
    `<div class="fixed inset-0 z-40 grid place-items-center p-4" style="background:rgba(0,0,0,.5)"><form class="card p-5 w-full max-w-md space-y-3" onsubmit="saveResetPassword(event,'${id}')"><h2 class="text-lg font-bold">Reset password</h2><p class="mut">Set a new temporary password for ${E(u.name)}.</p><label class="block">New password<input class="inp mt-1" name="password" type="password" minlength="8" required></label><div class="flex justify-end gap-2"><button type="button" class="btn" onclick="$('#modal').innerHTML=''">Cancel</button><button class="btn btn-p">Reset password</button></div></form></div>`;
}
function saveResetPassword(e, id) {
  e.preventDefault();
  const u = S.users.find((x) => x.id === id);
  if (!u || !manageableRoles().includes(u.role)) return toast('Not authorised');
  u.password = new FormData(e.target).get('password');
  $('#modal').innerHTML = '';
  save();
  toast('Password reset for ' + u.name);
}

// Invoice terms block and mark-as-paid.

// Invoices: record payment after the invoice has been submitted
const baseInvoiceDetail = V['invoice-detail'];
function invoiceTermsBlock(i) {
  const tnc = i.tnc || effectiveTnc(S.quotes.find((q) => q.no === i.quoteNo));
  return `<div class="mt-3"><b>Terms &amp; conditions</b><div style="white-space:pre-wrap">${tnc ? E(tnc) : '<span class="mut">None</span>'}</div></div>`;
}
V['invoice-detail'] = () => {
  const i = S.invoices.find((x) => x.id === S.currentInvoice);
  const html = i
    ? baseInvoiceDetail().replace(
        '<div class="text-right text-lg font-bold mt-3">Grand total:',
        invoiceTermsBlock(i) + '<div class="text-right text-lg font-bold mt-3">Grand total:'
      )
    : baseInvoiceDetail();
  if (!i) return html;
  if (i.status === 'Paid')
    return html.replace(
      /<button class="btn btn-p" onclick="sendInvoice\('[^']*'\)">Submit to client<\/button>/,
      '<span class="chip ok">Paid</span>'
    );
  return html.replace(
    '<span class="chip ok">Submitted to client</span>',
    `<span class="chip ok">Submitted to client</span><button class="btn btn-p" onclick="markInvoicePaid('${i.id}')">Mark as paid</button>`
  );
};
function markInvoicePaid(id) {
  const inv = S.invoices.find((x) => x.id === id);
  if (!inv || inv.status !== 'Submitted to client')
    return toast('Submit the invoice to the client first');
  inv.status = 'Paid';
  inv.paidAt = Date.now();
  const q = S.quotes.find((x) => x.no === inv.quoteNo);
  if (q) q.status = 'Paid';
  logOpp(inv.opp, 'sync', `Invoice ${inv.invoiceNo} marked as paid`);
  save();
  toast('Invoice marked as paid');
  render();
}

// App launcher and favourites.

// Header: app launcher, favourites, settings, help, theme and keyboard shortcut
const APP_ICONS = {
  home: 'home',
  leads: 'person_search',
  accounts: 'domain',
  contacts: 'contacts',
  opps: 'handshake',
  quotes: 'request_quote',
  products: 'inventory_2',
  approvals: 'approval',
  invoices: 'receipt_long',
  users: 'group',
  settings: 'settings',
};
const APP_LABELS = {
  home: 'Home',
  leads: 'Leads',
  accounts: 'Accounts',
  contacts: 'Contacts',
  opps: 'Opportunities',
  quotes: 'Quotes',
  products: 'Products',
  approvals: 'Approvals',
  invoices: 'Invoices',
  users: 'User accounts',
  settings: 'Settings',
};
const appsForRole = () => appsForRoleAll().filter((k) => k !== 'invoices' || canSeeInvoices());
const appsForRoleAll = () =>
  S.role === 'rep'
    ? ['home', 'leads', 'accounts', 'contacts', 'opps', 'quotes', 'invoices', 'settings']
    : [
        'home',
        'leads',
        'accounts',
        'contacts',
        'opps',
        'quotes',
        'products',
        'approvals',
        'invoices',
        'users',
        'settings',
      ];
const panelTitle = (t) =>
  `<div class="p-3 font-bold" style="border-bottom:1px solid var(--bd)">${t}</div>`;

function toggleAppLauncher() {
  openPanel(
    'app-launcher',
    panelTitle('App Launcher') +
      `<div class="p-2" style="display:grid;grid-template-columns:repeat(3,1fr);gap:4px">${appsForRole()
        .map(
          (k) =>
            `<button class="hdr-item" onclick="closePanels();nav('${k}')"><span class="ms">${APP_ICONS[k]}</span><span>${APP_LABELS[k]}</span></button>`
        )
        .join('')}</div>`,
    'left'
  );
}
function toggleFavorites() {
  const fav = visibleOpps().filter((o) => o.fol);
  openPanel(
    'favorites',
    panelTitle('Favorites') +
      (fav
        .map(
          (o) =>
            `<div class="flex gap-3 p-3 cursor-pointer hdr-row" style="border-bottom:1px solid var(--bd)" onclick="closePanels();nav('opp-detail',${o.id})"><span class="ms" style="color:var(--warn)">star</span><div><div class="font-semibold">${E(o.name)}</div><small class="mut">${E(o.account)} · ${M(o.amount)}</small></div></div>`
        )
        .join('') ||
        '<p class="mut p-4">No favorites yet. Choose <b>Follow</b> on an opportunity to add it here.</p>')
  );
}

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
      `<div class="p-3"><div class="mut font-semibold mb-1">Keyboard shortcuts</div>${row('Search', 'Ctrl + K')}${row('Close dialogs and menus, go back', 'Esc')}${row('Switch opportunity tab', 'Alt + 1-9')}${row('Rename opportunity tab', 'F2')}</div><div class="p-3" style="border-top:1px solid var(--bd)"><div class="mut font-semibold mb-1">Quote to invoice</div><p>Open an opportunity and choose <b>Generate quote</b>. Submit it for approval; once approved, an invoice is generated that you can submit to the client and mark as paid.</p><p class="mut mt-2">Approval limits: Reps cannot discount · Admin ${adminDiscountLimit()}% · CEO unlimited. Prices below a product minimum always need CEO approval.</p></div>`
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

// Render wrapper that refreshes the header after each render.

const renderBeforeActions = render;
render = function () {
  renderBeforeActions();
  updateHeader();
};

// Ensure the first visible render uses the active portal and new navigation.
save();
// Later sections define more helpers; the final render() at the end of the file draws the page.
try {
  render();
} catch (e) {}

// Opportunity owner assignment and linked documents.

// Opportunity ownership and document references shown consistently in every portal.
function opportunityDocuments(o) {
  const quotes = (S.quotes || []).filter((q) => q.opp == o.id);
  return quotes.map((q) => {
    const inv = q.invoiceId && (S.invoices || []).find((i) => i.id === q.invoiceId);
    return { quoteNo: q.no, invoiceNo: inv ? inv.invoiceNo : '' };
  });
}
function reassignOpportunity(id, ownerCode) {
  if (!canEditOwner()) {
    toast('Only Senior Reps, Admin and CEO can change the assigned rep');
    render();
    return;
  }
  const o = S.opps.find((x) => x.id == id);
  const rep = activeReps().find((u) => u.ownerCode === ownerCode);
  if (!o || !rep) return toast('Please choose an active representative');
  const previous = ownerLabel(o.owner);
  o.owner = rep.ownerCode;
  (S.acts[o.id] = S.acts[o.id] || []).unshift({
    k: 'sync',
    x: `Assigned representative changed from ${previous} to ${rep.name} by ${roleNow().name}`,
    t: Date.now(),
  });
  save();
  toast(`Assigned to ${rep.name}`);
  render();
}
const previousOpportunityFieldSave = sf;
sf = function (k, v) {
  if (k === 'owner' && !canEditOwner()) {
    toast('Only Senior Reps, Admin and CEO can change the assigned rep');
    S.ed = null;
    return render();
  }
  return previousOpportunityFieldSave(k, v);
};
V.opps = () => {
  const query = (S.q || '').toLowerCase();
  const all = visibleOpps().filter((o) => (o.name + ' ' + o.account).toLowerCase().includes(query));
  const total = all.reduce((sum, o) => sum + (+o.amount || 0), 0);
  const canReassign = canEditOwner();
  const docMeta = (o) => {
    const docs = opportunityDocuments(o);
    if (!docs.length)
      return `<span class="mut text-xs">Quote: —${canSeeInvoices() ? ' · Invoice: —' : ''}</span>`;
    return docs
      .map(
        (d) =>
          `<span class="text-xs inline-flex flex-wrap gap-1 items-center"><b>Quote:</b> ${E(d.quoteNo)} ${canSeeInvoices() ? `<span class="mut">·</span> <b>Invoice:</b> ${d.invoiceNo ? E(d.invoiceNo) : '—'}` : ''}</span>`
      )
      .join('<br>');
  };
  const repCell = (o) =>
    canReassign
      ? `<select class="inp text-xs" style="width:auto;max-width:150px;padding:4px 24px 4px 8px" aria-label="Assigned representative" onclick="event.stopPropagation()" onchange="reassignOpportunity(${o.id},this.value)">${activeReps()
          .map(
            (u) =>
              `<option value="${E(u.ownerCode)}" ${u.ownerCode === o.owner ? 'selected' : ''}>${E(u.name)}</option>`
          )
          .join('')}</select>${repOpenBtn(o.owner)}`
      : `<span>${repLink(o.owner)}</span>`;
  const top = `<div class="flex flex-wrap items-center gap-2 mb-3"><div><div class="mut">Opportunities</div><h1 class="text-xl font-bold">${S.role === 'rep' ? 'My opportunities' : 'All opportunities'}</h1></div><span class="mut ml-2">${all.length} items · Total ${M(total)}</span><span class="flex-1"></span><input class="inp" style="width:200px" placeholder="Filter this list" value="${E(S.q || '')}" oninput="S.q=this.value;clearTimeout(window.ft);window.ft=setTimeout(()=>{render();const i=document.querySelector('[placeholder=\\'Filter this list\\']');if(i){i.focus();i.setSelectionRange(99,99)}},250)"><button class="btn" onclick="S.view='${S.view === 'kanban' ? 'list' : 'kanban'}';render()"><span class="ms">${S.view === 'kanban' ? 'table_rows' : 'view_kanban'}</span>${S.view === 'kanban' ? 'List' : 'Board'}</button>${canAddOpportunity() ? `<button class="btn btn-p" onclick="modal('opp')"><span class="ms">add</span>New</button>` : ''}</div>`;
  if (S.view === 'list') {
    return (
      top +
      table(
        [
          'Opportunity',
          'Account',
          'Stage',
          'Priority',
          'Amount',
          'Close date',
          'Assigned rep',
          'Quotation no.',
          'Invoice no.',
        ],
        all
          .map((o) => {
            const docs = opportunityDocuments(o);
            const quoteNumbers = docs.map((d) => E(d.quoteNo)).join('<br>') || '—';
            const invoiceNumbers = docs.map((d) => E(d.invoiceNo || '—')).join('<br>') || '—';
            return `<tr class="r" onclick="nav('opp-detail',${o.id})"><td><b>${E(o.name)}</b></td><td>${acctSpan(o.account)}</td><td>${E(ST[o.stage] || '—')}</td><td onclick="event.stopPropagation()"><select class="inp text-xs" style="width:auto;padding:4px 24px 4px 8px" aria-label="Priority" onchange="setPriority(${o.id},this.value)">${prioOptions(o.priority)}</select></td><td>${M(o.amount)}</td><td>${fd(o.close)}</td><td onclick="event.stopPropagation()">${repCell(o)}</td><td>${quoteNumbers}</td><td>${invoiceNumbers}</td></tr>`;
          })
          .join('')
      )
    );
  }
  return (
    top +
    `<p class="mut mb-2 flex items-center gap-1"><span class="ms">info</span>Drag a deal to another stage to update it. Assigned rep, quotation and invoice references are visible on every opportunity.</p><div class="flex gap-3 overflow-x-auto pb-3">${ST.map(
      (stage, index) => {
        const deals = all.filter((o) => o.stage === index && !o.lost);
        return `<div class="kcol card shrink-0 w-80 p-2" style="background:var(--hov)" ondragover="event.preventDefault();this.classList.add('over')" ondragleave="this.classList.remove('over')" ondrop="drop(event,${index})"><div class="px-1 pb-2"><b>${stage}</b><div class="mut">${deals.length} deals · ${M(deals.reduce((sum, o) => sum + (+o.amount || 0), 0))}</div></div><div class="space-y-2">${deals
          .map(
            (o) =>
              `<div class="kc card p-3" draggable="true" ondragstart="event.dataTransfer.setData('t',${o.id})" onclick="nav('opp-detail',${o.id})"><b style="color:var(--pr)">${E(o.name)}</b><div class="mut">${acctSpan(o.account)}</div><div class="mt-1" onclick="event.stopPropagation()"><select class="inp text-xs" style="width:auto;padding:2px 22px 2px 6px" aria-label="Priority" onchange="setPriority(${o.id},this.value)">${prioOptions(o.priority)}</select></div><div class="flex justify-between mt-2"><b>${M(o.amount)}</b><span class="mut">${PR[index]}%</span></div>${o.next ? `<div class="mut mt-1">Next: ${E(o.next)}</div>` : ''}<div class="flex justify-between items-center mt-2"><span class="chip ${chipC(o)}">${fd(o.close)}</span><span class="text-xs mut" title="Assigned rep">${repLink(o.owner)}</span></div><div class="mt-2 pt-2 border-t" style="border-color:var(--bd)" onclick="event.stopPropagation()">${docMeta(o)}</div>${
                canReassign
                  ? `<div class="mt-2" onclick="event.stopPropagation()"><label class="mut text-xs">Change assigned rep<select class="inp mt-1" style="width:100%" onchange="reassignOpportunity(${o.id},this.value)">${activeReps()
                      .map(
                        (u) =>
                          `<option value="${E(u.ownerCode)}" ${u.ownerCode === o.owner ? 'selected' : ''}>${E(u.name)}</option>`
                      )
                      .join('')}</select></label></div>`
                  : ''
              }</div>`
          )
          .join('')}</div></div>`;
      }
    ).join('')}</div>`
  );
};

// Role-filtered quotations and invoices lists.

const previousQuotesView = V.quotes;
V.quotes = () => {
  const list = S.quotes.filter((q) => S.role !== 'rep' || visibleOpps().some((o) => o.id == q.opp));
  return (
    `<h1 class="text-xl font-bold mb-3">Quotations</h1><p class="mut mb-3">Quotation records are visible to the assigned rep, Admin and CEO.</p>` +
    table(
      [
        'Quotation no.',
        'Opportunity',
        'Assigned rep',
        'Total',
        'Discount',
        'Status',
        'Invoice no.',
      ],
      list
        .map((q) => {
          const o = S.opps.find((x) => x.id == q.opp) || {};
          const inv = q.invoiceId && S.invoices.find((x) => x.id === q.invoiceId);
          return `<tr class="r" onclick="openQuoteRecord('${E(q.no)}')"><td><b>${E(q.no)}</b></td><td>${E(o.name || '')}</td><td>${repLink(o.owner)}</td><td>${M(quoteTotal(q))}</td><td>${quoteDiscount(q).toFixed(2)}%</td><td>${E(q.status)}</td><td>${inv ? E(inv.invoiceNo) : '—'}</td></tr>`;
        })
        .join('')
    )
  );
};
V.invoices = () => {
  const list = S.invoices.filter(
    (i) => S.role !== 'rep' || visibleOpps().some((o) => o.id == i.opp)
  );
  return (
    `<h1 class="text-xl font-bold mb-3">Invoices</h1>` +
    table(
      [
        'Invoice no.',
        'Quotation no.',
        'Opportunity',
        'Assigned rep',
        'Customer',
        'Total',
        'Status',
      ],
      list
        .map((i) => {
          const o = S.opps.find((x) => x.id == i.opp) || {};
          return `<tr class="r" onclick="openInvoice('${E(i.id)}')"><td><b>${E(i.invoiceNo)}</b></td><td>${E(i.quoteNo)}</td><td>${E(i.opportunity)}</td><td>${repLink(o.owner)}</td><td>${E(i.account)}</td><td>${M(i.total)}</td><td>${E(i.status)}</td></tr>`;
        })
        .join('')
    )
  );
};

// Contacts page with designation, email and primary-contact flag.

// Contacts page: designation, email, contact number and primary-contact flag (c[5]).
V.contacts = () =>
  `<div class="flex items-center mb-3"><h1 class="text-xl font-bold flex-1">Contacts</h1><button class="btn btn-p" onclick="openContactForm()">New contact</button></div>` +
  table(
    ['Name', 'Designation', 'Account', 'Email', 'Contact number', ''],
    S.contacts
      .map(
        (c, i) =>
          `<tr><td><b>${E(c[0])}</b> ${c[5] ? '<span class="chip">Primary</span>' : ''}</td><td>${E(c[1])}</td><td>${E(c[2])}</td><td><a style="color:var(--pr)" href="mailto:${E(c[3])}">${E(c[3])}</a></td><td><a style="color:var(--pr)" href="tel:${E(c[4])}">${E(c[4] || '—')}</a></td><td class="text-right whitespace-nowrap"><button class="btn" onclick="openContactEditor(${i})">Edit</button> <button class="btn" style="color:var(--err)" onclick="deleteContact(${i})">Delete</button></td></tr>`
      )
      .join('')
  );
function contactFormHtml(c, submit, title, saveLabel) {
  const val = (k) => E((c && c[k]) || '');
  return `<div class="fixed inset-0 z-40 grid place-items-center p-4" style="background:rgba(0,0,0,.5)"><form class="card p-5 w-full max-w-lg max-h-full overflow-auto" onsubmit="${submit}"><h2 class="text-lg font-bold mb-3">${title}</h2><div class="grid sm:grid-cols-2 gap-3"><label class="block sm:col-span-2">Full name *<input class="inp" name="name" value="${val(0)}" required></label><label class="block">Designation *<input class="inp" name="title" value="${val(1)}" placeholder="e.g. Chief Operating Officer" required></label><label class="block">Account *<input class="inp" name="account" value="${val(2)}" list="acct-list" required><datalist id="acct-list">${knownAccounts()
    .map((a) => `<option value="${E(a)}">`)
    .join(
      ''
    )}</datalist></label><label class="block">Email *<input class="inp" name="email" type="email" value="${val(3)}" required></label><label class="block">Contact number *<input class="inp" name="mobile" type="tel" value="${val(4)}" placeholder="+91 98765 43210" required></label><label class="flex items-center gap-2 sm:col-span-2"><input type="checkbox" name="primary" ${c && c[5] ? 'checked' : ''}> Primary contact for this account</label></div><div class="flex justify-end gap-2 mt-4"><button type="button" class="btn" onclick="$('#modal').innerHTML=''">Cancel</button><button class="btn btn-p">${saveLabel}</button></div></form></div>`;
}
// Only one primary contact per account.
function applyPrimaryContact(index) {
  const mine = S.contacts[index];
  if (!mine[5]) return;
  S.contacts.forEach((c, i) => {
    if (i !== index && String(c[2]).toLowerCase() === String(mine[2]).toLowerCase()) c[5] = false;
  });
}
function openContactForm() {
  $('#modal').innerHTML = contactFormHtml(null, 'saveContact(event)', 'New contact', 'Save');
  $('#modal input').focus();
}
function saveContact(e) {
  e.preventDefault();
  const v = Object.fromEntries(new FormData(e.target));
  S.contacts.push([
    v.name.trim(),
    v.title.trim(),
    v.account.trim(),
    v.email.trim(),
    v.mobile.trim(),
    !!v.primary,
  ]);
  applyPrimaryContact(S.contacts.length - 1);
  $('#modal').innerHTML = '';
  save();
  toast('Contact added');
  render();
}
function openContactEditor(i) {
  const c = S.contacts[i];
  if (!c) return;
  $('#modal').innerHTML = contactFormHtml(
    c,
    `saveContactEdit(event,${i})`,
    'Edit contact',
    'Save changes'
  );
}
function saveContactEdit(e, i) {
  e.preventDefault();
  const v = Object.fromEntries(new FormData(e.target));
  if (!S.contacts[i]) return;
  S.contacts[i] = [
    v.name.trim(),
    v.title.trim(),
    v.account.trim(),
    v.email.trim(),
    v.mobile.trim(),
    !!v.primary,
  ];
  applyPrimaryContact(i);
  $('#modal').innerHTML = '';
  save();
  toast('Contact updated');
  render();
}

// "Others" dropdowns used in popups and quote page.

// ---------------------------------------------------------------------------
// "Others" dropdowns, approval notes, terms & conditions and approval history
// ---------------------------------------------------------------------------
// Popup forms: a dropdown with an "Others" entry that reveals a text box.
function formOtherSelect(name, options, selected) {
  const opts = options
    .map((o) => `<option ${o === selected ? 'selected' : ''}>${E(o)}</option>`)
    .join('');
  return `<select class="inp" name="${name}" onchange="toggleOther(this)">${opts}<option value="Others">Others</option></select><input class="inp mt-1" name="${name}Other" data-other placeholder="Please specify" style="display:none">`;
}
function toggleOther(select) {
  const box = select.parentNode.querySelector('[data-other]');
  const on = select.value === 'Others';
  box.style.display = on ? '' : 'none';
  box.required = on;
  if (on) box.focus();
}
const pickOther = (values, name) =>
  values[name] === 'Others' ? (values[name + 'Other'] || '').trim() || 'Others' : values[name];

// Quote page: same idea, but the value lives in S.qd.
const QUOTE_STATUS_CHOICES = ['Draft', 'Presented to Customer', 'Under Negotiation', 'On Hold'];
function quoteOtherSelect(field, options, current, disabled) {
  const custom = !!current && !options.includes(current) && current !== 'Others';
  const isOther = custom || current === 'Others';
  const opts = options
    .map((o) => `<option ${!isOther && o === current ? 'selected' : ''}>${E(o)}</option>`)
    .join('');
  return `<select class="inp" ${disabled ? 'disabled' : ''} onchange="quoteSelectOther(this,'${field}')">${opts}<option value="Others" ${isOther ? 'selected' : ''}>Others</option></select><input class="inp" style="margin-top:6px;display:${isOther ? '' : 'none'}" placeholder="Please specify" value="${custom ? E(current) : ''}" ${disabled ? 'disabled' : ''} oninput="S.qd.${field}=this.value.trim()||'Others'">`;
}
function quoteSelectOther(select, field) {
  const box = select.parentNode.querySelector('input');
  if (select.value === 'Others') {
    box.style.display = '';
    box.focus();
    S.qd[field] = box.value.trim() || 'Others';
  } else {
    box.style.display = 'none';
    S.qd[field] = select.value;
  }
}

const whenText = (t) =>
  t ? new Date(t).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : '';
const canReview = (q) =>
  (S.role === 'ceo' && ['Pending Admin Approval', 'Pending CEO Approval'].includes(q.status)) ||
  (S.role === 'admin' && q.status === 'Pending Admin Approval');
function addQuoteHistory(q, action, note) {
  (q.history = q.history || []).push({ t: Date.now(), by: roleNow().name, action, note });
}

// Approval banner, notes, approve / reject and approval history.

// Banner at the top of the quote that says where approval stands.
function approvalBanner(q, inv) {
  const box = (tone, icon, title, lines) =>
    `<div class="qt-banner ${tone}"><span class="ms">${icon}</span><div><b>${title}</b>${lines
      .filter(Boolean)
      .map((l) => `<div>${l}</div>`)
      .join('')}</div></div>`;
  if (['Approved', 'Sent to client', 'Paid'].includes(q.status))
    return box('ok', 'verified', 'Approval granted', [
      `Approved by <b>${E(q.approvedBy || '')}</b> on ${whenText(q.approvedAt)}`,
      q.approvedNotes ? `Approval notes: ${E(q.approvedNotes)}` : '',
      q.tnc ? `Terms &amp; conditions: ${E(q.tnc)}` : '',
      inv && canSeeInvoices() ? `Invoice ${E(inv.invoiceNo)} generated` : '',
    ]);
  if (q.status === 'Rejected')
    return box('err', 'cancel', 'Approval rejected', [
      `Rejected by <b>${E(q.rejectedBy || '')}</b> on ${whenText(q.rejectedAt)}`,
      q.rejectedNotes ? `Reason: ${E(q.rejectedNotes)}` : '',
      'Update the quote and submit it again with notes.',
    ]);
  if (q.status.startsWith('Pending'))
    return box('wr', 'hourglass_top', `Awaiting approval from ${E(q.nextApprover || 'approver')}`, [
      `Submitted by <b>${E(q.createdBy || '')}</b> on ${whenText(q.requestedAt)}`,
      q.notes ? `Notes: ${E(q.notes)}` : '',
    ]);
  return '';
}

// Step 3: notes for the approver, terms & conditions, and the approval trail.
function approvalSection(q, floor, locked) {
  const canEditTnc = !locked && ['admin', 'ceo'].includes(S.role);
  const history = (q.history || [])
    .slice()
    .reverse()
    .map(
      (h) =>
        `<div class="qt-hist"><b>${E(h.action)}</b> · ${E(h.by)} · <span class="mut">${whenText(h.t)}</span><div>${E(h.note || '')}</div></div>`
    )
    .join('');
  return `<section class="qt-section"><div class="qt-section-head"><span class="ms">approval</span><b>Approval Authority</b></div><div class="qt-body"><p>Reps cannot give discounts · Admin up to <b>${adminDiscountLimit()}%</b> (set by the CEO) · CEO any discount. Any line priced below the product minimum always needs CEO approval.</p><p class="mut" style="margin-top:6px">${floor.length ? `Lines below minimum: ${floor.map((i) => E(i.c)).join(', ')}` : 'No lines are below their product minimum.'}</p></div></section>
<section class="qt-section"><div class="qt-section-head"><span class="ms">edit_note</span><b>Notes for approval <i class="qt-req">*</i></b></div><div class="qt-body"><textarea class="inp" rows="3" ${locked ? 'disabled' : ''} placeholder="Explain the discount or pricing so the approver can decide. Required before submitting." oninput="S.qd.notes=this.value">${E(q.notes || '')}</textarea></div></section>
${tncSection(q, locked)}${history ? `<section class="qt-section"><div class="qt-section-head"><span class="ms">history</span><b>Approval history</b></div><div class="qt-body">${history}</div></section>` : ''}`;
}

// Approve / reject now ask for notes (required) and, on approval, terms & conditions.
function approveQuote(no) {
  const q = S.quotes.find((x) => x.no === no);
  if (!q) return toast('Quotation not found');
  if (!['admin', 'ceo'].includes(S.role)) return toast('Only Admin or CEO can approve');
  if (q.status === 'Pending CEO Approval' && S.role !== 'ceo')
    return toast('CEO approval is required');
  if (S.role === 'admin' && quoteDiscount(q) > adminDiscountLimit())
    return toast(`Discount exceeds the Admin limit of ${adminDiscountLimit()}%`);
  if (belowProductFloor(q).length && S.role !== 'ceo')
    return toast('Below-minimum product pricing requires CEO approval');
  if (!['Pending Admin Approval', 'Pending CEO Approval'].includes(q.status))
    return toast('Quote is not pending approval');
  openApprovalDialog(q, 'approve');
}
function rejectQuote(no) {
  const q = S.quotes.find((x) => x.no === no);
  if (!q) return toast('Quotation not found');
  if (!['admin', 'ceo'].includes(S.role)) return toast('Only Admin or CEO can reject');
  if (q.status === 'Pending CEO Approval' && S.role !== 'ceo')
    return toast('CEO approval required');
  if (!['Pending Admin Approval', 'Pending CEO Approval'].includes(q.status))
    return toast('Quotation is not pending approval');
  openApprovalDialog(q, 'reject');
}
function openApprovalDialog(q, mode) {
  const approve = mode === 'approve';
  $('#modal').innerHTML =
    `<div class="fixed inset-0 z-40 grid place-items-center p-4" style="background:rgba(0,0,0,.5)"><form class="card p-5 w-full max-w-lg max-h-full overflow-auto space-y-3" onsubmit="finishApproval(event,'${E(q.no)}','${mode}')"><h2 class="text-lg font-bold">${approve ? 'Approve' : 'Reject'} quotation ${E(q.no)}</h2>` +
    `<div class="p-3 rounded text-xs" style="background:var(--hov)"><b>Notes from ${E(q.createdBy || 'the rep')}:</b> ${E(q.notes || '—')}<br><span class="mut">Discount ${quoteDiscount(q).toFixed(2)}% · Total ${M(quoteTotal(q))}</span></div>` +
    `<label class="block">${approve ? 'Approval notes' : 'Reason for rejection'} *<textarea class="inp" name="notes" rows="3" required placeholder="${approve ? 'Why is this approved?' : 'What needs to change?'}"></textarea></label>` +
    (approve
      ? `<label class="block">Terms &amp; conditions <span class="mut text-xs">(optional)</span><textarea class="inp" name="tnc" rows="4" placeholder="Conditions that apply to this approval">${E(effectiveTnc(q))}</textarea></label>`
      : '') +
    `<div class="flex justify-end gap-2"><button type="button" class="btn" onclick="$('#modal').innerHTML=''">Cancel</button><button class="btn btn-p">${approve ? 'Approve' : 'Reject'}</button></div></form></div>`;
  $('#modal textarea').focus();
}
function finishApproval(e, no, mode) {
  e.preventDefault();
  const q = S.quotes.find((x) => x.no === no);
  const v = Object.fromEntries(new FormData(e.target));
  const notes = (v.notes || '').trim();
  if (!q) return;
  if (!notes)
    return toast(
      mode === 'approve' ? 'Add approval notes first' : 'Add a reason for the rejection'
    );
  const o = S.opps.find((x) => x.id == q.opp);
  $('#modal').innerHTML = '';
  if (mode === 'reject') {
    q.status = 'Rejected';
    q.rejectedBy = roleNow().name;
    q.rejectedAt = Date.now();
    q.rejectedNotes = notes;
    q.nextApprover = null;
    addQuoteHistory(q, 'Rejected', notes);
    if (o) logOpp(o.id, 'sync', `Quote ${q.no} rejected by ${roleNow().name}: ${notes}`);
    storeQuote(q);
    save();
    toast('Quotation rejected');
    return render();
  }
  q.status = 'Approved';
  q.approvedBy = roleNow().name;
  q.approvedAt = Date.now();
  q.approvedNotes = notes;
  {
    const t = (v.tnc || '').trim();
    q.tnc = t && t !== standardTnc().trim() ? t : undefined;
  }
  q.nextApprover = null;
  addQuoteHistory(q, 'Approved', notes + (q.tnc ? ` — Terms: ${q.tnc}` : ''));
  const inv = newInvoice(q);
  if (o) {
    o.amount = Math.round(quoteTotal(q));
    o.items = clone(q.items);
    logOpp(
      o.id,
      'sync',
      `Quote ${q.no} approved by ${roleNow().name}; invoice ${inv.invoiceNo} generated`
    );
  }
  storeQuote(q);
  save();
  toast('Approval granted · ' + inv.invoiceNo + ' generated');
  render();
}

// Quotation status shown on the opportunity page.

// Quotation status on the opportunity page (header item + side card).
function quoteStatusInfo(q) {
  const s = q.status;
  if (s === 'Approved') return { tone: 'ok', text: 'Approved' };
  if (s === 'Sent to client') return { tone: 'ok', text: 'Approved · Sent to client' };
  if (s === 'Paid') return { tone: 'ok', text: 'Paid' };
  if (s === 'Rejected') return { tone: 'er', text: 'Rejected' };
  if (s === 'Expired') return { tone: 'er', text: 'Expired' };
  if (s === 'Pending CEO Approval') return { tone: 'wr', text: 'Under approval · CEO' };
  if (s === 'Pending Admin Approval') return { tone: 'wr', text: 'Under approval · Admin' };
  return { tone: '', text: q.label && q.label !== 'Draft' ? `Draft · ${q.label}` : 'Draft' };
}
const quoteStatusChip = (q) => {
  const i = quoteStatusInfo(q);
  return `<span class="chip ${i.tone}">${i.text}</span>`;
};
const quotesOf = (o) => S.quotes.filter((q) => q.opp == o.id);
function quoteHeaderStatus(o) {
  const list = quotesOf(o);
  if (!list.length) return '<span class="mut">No quotation yet</span>';
  const q = list[list.length - 1];
  const i = quoteStatusInfo(q);
  return `<a class="cursor-pointer" onclick="openQuoteRecord('${E(q.no)}')" title="Open ${E(q.no)}"><span class="chip ${i.tone}">${i.text}</span></a>`;
}
function quoteStatusCard(o) {
  const list = quotesOf(o);
  const rows = list
    .slice()
    .reverse()
    .map((q) => {
      const i = quoteStatusInfo(q);
      const approved = ['Approved', 'Sent to client', 'Paid'].includes(q.status),
        detail = approved
          ? (q.approvedBy
              ? `Approved by ${E(q.approvedBy)} · ${whenText(q.approvedAt)}`
              : 'Approved') + (q.approvedNotes ? ` — ${E(q.approvedNotes)}` : '')
          : q.status === 'Rejected'
            ? `Rejected by ${E(q.rejectedBy || '')} · ${whenText(q.rejectedAt)}` +
              (q.rejectedNotes ? ` — ${E(q.rejectedNotes)}` : '')
            : q.status.startsWith('Pending')
              ? `Awaiting ${E(q.nextApprover || 'approver')}` +
                (q.createdBy ? ` · submitted by ${E(q.createdBy)}` : '')
              : 'Not submitted for approval';
      const inv = q.invoiceId && S.invoices.find((x) => x.id === q.invoiceId);
      return `<div class="py-2 border-b cursor-pointer" style="border-color:var(--bd)" onclick="openQuoteRecord('${E(q.no)}')"><div class="flex justify-between items-center gap-2"><b>${E(q.no)}</b><span class="chip ${i.tone}">${i.text}</span></div><div class="mut text-xs">${detail}${inv && canSeeInvoices() ? ` · ${E(inv.invoiceNo)}` : ''}</div></div>`;
    })
    .join('');
  return `<div class="card p-4"><div class="flex justify-between items-center"><b>Quotation status (${list.length})</b><button class="btn" onclick="openQuote(${o.id})">New quote</button></div>${rows || '<p class="mut mt-2">No quotation yet. Use Generate quote to start one.</p>'}</div>`;
}

// Teams, rep stats, leaderboard and targets.

// ===========================================================================
// Teams, leaderboard and role-based settings
// ===========================================================================
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
      return `<tr style="${me ? 'background:var(--hov)' : ''}"><td>${rankBadge(r.rank)}</td><td><div class="flex items-center gap-2"><span class="w-7 h-7 rounded-full grid place-items-center text-xs font-bold" style="background:var(--hov);color:var(--pr)">${E(personInitials(r.user.name))}</span><b>${repLink(r.user.ownerCode)}</b>${me ? '<span class="chip">You</span>' : ''}</div></td><td class="text-right"><b>${M(r.won)}</b></td><td class="text-right">${r.deals}</td><td class="text-right">${M(r.pipeline)}</td><td><div class="flex items-center gap-2">${progressBar(r.attain)}<span class="text-xs">${Math.round(r.attain)}%</span></div></td></tr>`;
    })
    .join('');
  return `<div class="card p-4"><div class="flex justify-between items-start gap-2 flex-wrap"><div><b class="text-lg">${E(team.name)}</b><div class="mut text-xs">${ranked.length} rep${ranked.length === 1 ? '' : 's'} · ranked by ${LB_METRICS[metric].toLowerCase()}</div></div><div class="text-right"><b>${M(totalWon)}</b><div class="mut text-xs">of ${M(totalTarget)} team target (${totalTarget ? Math.round((totalWon / totalTarget) * 100) : 0}%)</div></div></div>${table(['#', 'Rep', 'Won', 'Deals', 'Open pipeline', 'Target'], rows || '<tr><td colspan="6" class="mut">No reps in this team yet.</td></tr>')}</div>`;
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
  // Plain reps see only their own team; Senior Reps, Admin and CEO see every team.
  if (S.role === 'rep' && !isSeniorRep(S.users.find((u) => u.id === S.authUser))) {
    const me = S.users.find((u) => u.role === 'rep' && u.ownerCode === meCode);
    const team = me && teamById(me.teamId);
    if (!team)
      return `<div class="card p-4 mb-3"><b>Team leaderboard</b><p class="mut mt-1">You have not been assigned to a team yet. Ask your admin to add you to a team.</p></div>`;
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

// Leaderboard section injected into the home page.

const homeWithoutBoard = V.home;
V.home = () =>
  homeWithoutBoard().replace(
    '<div class="grid lg:grid-cols-2 gap-3"><div class="card p-4"><b>Top opportunities</b>',
    leaderboardSection() +
      '<div class="grid lg:grid-cols-2 gap-3"><div class="card p-4"><b>Top opportunities</b>'
  );

// ---------- quote defaults come from Settings ----------

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
let SETTINGS_SECTIONS = () => {
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
      ['limits', 'Approval limits', 'approval'],
      ['terms', 'Terms & conditions', 'gavel']
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
    const teamCards = S.teams
      .map(
        (t) =>
          `<div class="card p-3"><div class="mut text-xs">Team name · ${teamReps(t.id).length} rep${teamReps(t.id).length === 1 ? '' : 's'}</div><input class="inp mt-1" value="${E(t.name)}" onchange="renameTeam('${t.id}',this.value)"><button class="btn mt-2" onclick="openUserForm('${t.id}')"><span class="ms">person_add</span>Add rep</button></div>`
      )
      .join('');
    const repRows = reps
      .map(
        (u) =>
          `<tr><td><b>${E(u.name)}</b><div class="mut text-xs">${E(u.ownerCode)}</div></td><td><select class="inp" style="width:auto" onchange="setRepTeam('${u.id}',this.value)">${teamOptions(u.teamId)}</select></td><td><input class="inp" type="number" min="0" step="10000" style="width:140px" value="${u.target || 0}" onchange="setRepTarget('${u.id}',this.value)"></td><td>${M(repStats(u).won)}</td></tr>`
      )
      .join('');
    return `${secHead('groups', 'Teams & targets', 'Create teams, add reps, move reps between teams and set each rep’s sales target.')}<form class="flex gap-2 flex-wrap mb-3" onsubmit="createTeam(event)"><input class="inp" style="flex:1 1 220px;max-width:340px" name="name" placeholder="New team name" maxlength="40" required><button class="btn btn-p"><span class="ms">group_add</span>Create team</button><button type="button" class="btn" onclick="openUserForm()"><span class="ms">person_add</span>Add rep</button></form><div class="grid sm:grid-cols-2 xl:grid-cols-3 gap-3 mb-4">${teamCards}</div>${table(['Rep', 'Team', 'Target (₹)', 'Won so far'], repRows)}`;
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
function createTeam(e) {
  e.preventDefault();
  if (!['admin', 'ceo'].includes(S.role)) return toast('Only Admin and CEO can create teams');
  const name = String(new FormData(e.target).get('name') || '').trim();
  if (!name) return;
  if (S.teams.some((t) => t.name.toLowerCase() === name.toLowerCase()))
    return toast('A team with that name already exists');
  const slug =
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || 'team';
  let id = slug;
  for (let n = 2; S.teams.some((t) => t.id === id); n++) id = `${slug}-${n}`;
  S.teams.push({ id, name });
  save();
  toast(`${name} created`);
  render();
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

// Discount rules: only Admin and CEO can give discounts, and the CEO decides how much Admin may give.

const DEFAULT_ADMIN_DISCOUNT = 5;
function adminDiscountLimit() {
  const v = Number(S.settings && S.settings.adminDiscountLimit);
  return Number.isFinite(v) && v >= 0 && v <= 100 ? v : DEFAULT_ADMIN_DISCOUNT;
}
function canGiveDiscount() {
  return ['admin', 'ceo'].includes(S.role);
}

// Server-side style guards for the quote builder (the inputs are also disabled in the UI).
// Reps may type a discount; the quote then goes to Admin or CEO for approval (see quoteRoute).
const tieredBeforePolicy = applyTieredDiscount;
applyTieredDiscount = function () {
  if (!canGiveDiscount()) return toast('Only Admin and CEO can give discounts');
  return tieredBeforePolicy.apply(this, arguments);
};

// CEO sets the Admin limit. Pending Admin approvals above a lowered limit move to the CEO.
function saveAdminDiscountLimit(e) {
  e.preventDefault();
  if (S.role !== 'ceo') return toast('Only the CEO can change the Admin discount limit');
  const raw = new FormData(e.target).get('limit'),
    n = Math.round(Number(raw) * 10) / 10;
  if (raw === '' || !Number.isFinite(n) || n < 0 || n > 100)
    return toast('Enter a limit between 0 and 100');
  const before = adminDiscountLimit();
  S.settings.adminDiscountLimit = n;
  S.settings.adminDiscountLimitBy = roleNow().name;
  S.settings.adminDiscountLimitAt = Date.now();
  let moved = 0;
  S.quotes.forEach((q) => {
    if (q.status === 'Pending Admin Approval' && quoteDiscount(q) > n) {
      q.status = 'Pending CEO Approval';
      q.nextApprover = ROLE_CFG.ceo.name;
      addQuoteHistory(q, 'Escalated', `Discount is above the new Admin limit of ${n}%`);
      if (typeof queuePopup === 'function')
        queuePopup({ kind: 'needs-approval', no: q.no, toRole: 'ceo', by: S.authUser });
      moved++;
    }
  });
  save();
  toast(
    `Admin discount limit set to ${n}%` + (moved ? ` · ${moved} pending quote(s) sent to CEO` : '')
  );
  render();
}

SETTINGS_PANELS.limits = function () {
  const lim = adminDiscountLimit(),
    ceo = S.role === 'ceo',
    rows = [
      ['Rep / Senior Rep', 'No discount authority', 'Admin approval on every quote'],
      ['Admin', `Up to ${lim}% blended discount`, `CEO approval above ${lim}%`],
      ['CEO', 'Any discount', 'Final authority'],
    ],
    by = S.settings.adminDiscountLimitBy
      ? `Last changed by ${E(S.settings.adminDiscountLimitBy)} on ${whenText(S.settings.adminDiscountLimitAt)}.`
      : 'Using the default limit.',
    form = ceo
      ? `<form class="mb-4 p-3 rounded-lg flex flex-wrap items-end gap-3" style="background:var(--hov)" onsubmit="saveAdminDiscountLimit(event)"><label class="block">Admin discount limit (%)<input class="inp mt-1" style="width:140px" type="number" name="limit" min="0" max="100" step="0.5" required value="${lim}"></label><button class="btn btn-p">Save limit</button><span class="mut text-xs flex-1 min-w-[200px]">${by} Quotes above this limit go to the CEO. Lowering it moves pending Admin approvals above the new limit to the CEO.</span></form>`
      : `<p class="mut mb-3">The CEO sets the Admin discount limit. ${by}</p>`;
  return `${secHead('approval', 'Approval limits', 'Reps can enter a discount but it needs approval. The CEO decides how much Admin can approve.')}${form}${table(['Role', 'Discount authority', 'Escalation'], rows.map((r) => `<tr><td><b>${r[0]}</b></td><td>${r[1]}</td><td>${r[2]}</td></tr>`).join(''))}<p class="mut text-xs mt-3">Any line priced below its product minimum always needs CEO approval. Every submission needs notes for the approver.</p>`;
};

// Proper pop-ups for the approval flow: on submit, when approval is needed, and after approve / reject.

function showPopup({ tone = 'ok', icon = 'info', title, lines = [], actions = [] }) {
  const color = tone === 'err' ? 'var(--err)' : tone === 'wr' ? 'var(--warn)' : 'var(--ok)',
    close = `$('#modal').innerHTML=''`,
    buttons = actions
      .map(
        (a, i) =>
          `<button type="button" class="btn ${i === 0 ? 'btn-p' : ''}" ${i === 0 ? 'data-pop-primary' : ''} onclick="${close};${a.js || ''}">${E(a.label)}</button>`
      )
      .concat([
        `<button type="button" class="btn" ${actions.length ? '' : 'data-pop-primary'} onclick="${close}">Close</button>`,
      ])
      .join('');
  $('#modal').innerHTML =
    `<div class="fixed inset-0 z-40 grid place-items-center p-4" style="background:rgba(0,0,0,.5)" onclick="if(event.target===this){${close}}"><div class="card p-5 w-full max-w-md" role="dialog" aria-modal="true" aria-labelledby="pop-title">` +
    `<div class="flex items-start gap-3"><span class="ms" style="color:${color};font-size:36px">${icon}</span><div class="flex-1 min-w-0"><h2 id="pop-title" class="text-lg font-bold">${title}</h2>${lines
      .filter(Boolean)
      .map((l) => `<div class="mt-1">${l}</div>`)
      .join('')}</div></div>` +
    `<div class="flex justify-end gap-2 mt-4 flex-wrap">${buttons}</div></div></div>`;
  const p = $('#modal [data-pop-primary]');
  if (p) p.focus();
}

const POPUP_MAX_AGE = 7 * 864e5;
function queuePopup(p) {
  S.popups = (S.popups || []).slice(-199);
  S.popups.push({
    id: 'p' + Date.now() + Math.random().toString(36).slice(2, 6),
    t: Date.now(),
    seen: {},
    ...p,
  });
}
const quoteOf = (no) => S.quotes.find((x) => x.no === no);
const quoteFacts = (q) =>
  `<span class="mut">Discount ${quoteDiscount(q).toFixed(2)}% · Total ${M(quoteTotal(q))}</span>`;
const invoiceOf = (q) => (q.invoiceId ? S.invoices.find((i) => i.id === q.invoiceId) : null);
const invoiceActions = (q) => {
  const inv = invoiceOf(q);
  return inv && canSeeInvoices()
    ? [{ label: `Open ${inv.invoiceNo}`, js: `openInvoice('${E(inv.id)}')` }]
    : [];
};

// Pop-ups waiting for the signed-in person (approvals to review, or decisions on their quotes).
function popupForMe(p) {
  if (!S.authUser || p.by === S.authUser || (p.seen || {})[S.authUser]) return false;
  if (Date.now() - p.t > POPUP_MAX_AGE) return false;
  return p.toUser ? p.toUser === S.authUser : p.toRole ? p.toRole === S.role : false;
}
function showNextPopup() {
  const modal = $('#modal');
  if (!S.authUser || !modal || modal.innerHTML.trim()) return;
  const p = (S.popups || []).find(popupForMe);
  if (!p) return;
  p.seen = { ...(p.seen || {}), [S.authUser]: true }; // showing it counts as seen, so it never repeats
  save();
  if (String(p.kind).startsWith('tnc')) return showTncPopup(p);
  if (String(p.kind).startsWith('cq-')) return showCqPopup(p);
  if (String(p.kind).startsWith('bill-')) return showBillPopup(p);
  const q = quoteOf(p.no),
    o = q && S.opps.find((x) => x.id == q.opp);
  if (!q) return showNextPopup();
  if (p.kind === 'needs-approval') {
    if (!String(q.status).startsWith('Pending')) return showNextPopup(); // already decided
    return showPopup({
      tone: 'wr',
      icon: 'approval',
      title: `Approval needed: ${E(q.no)}`,
      lines: [
        `<b>${E(q.createdBy || 'A rep')}</b> submitted a quotation${o ? ` for <b>${E(o.name)}</b>` : ''}.`,
        quoteFacts(q),
        q.floorApprovalRequired
          ? '<span class="mut">Includes a price below the product minimum.</span>'
          : '',
        q.notes ? `Notes: ${E(q.notes)}` : '',
      ],
      actions: [{ label: 'Review now', js: `nav('approvals')` }],
    });
  }
  const approved = p.kind === 'approved';
  showPopup({
    tone: approved ? 'ok' : 'err',
    icon: approved ? 'verified' : 'cancel',
    title: `Quotation ${E(q.no)} ${approved ? 'approved' : 'rejected'}`,
    lines: [
      approved
        ? `Approved by <b>${E(q.approvedBy || '')}</b>.`
        : `Rejected by <b>${E(q.rejectedBy || '')}</b>.`,
      approved
        ? q.approvedNotes
          ? `Notes: ${E(q.approvedNotes)}`
          : ''
        : q.rejectedNotes
          ? `Reason: ${E(q.rejectedNotes)}`
          : '',
      approved && invoiceOf(q) && canSeeInvoices()
        ? `Invoice ${E(invoiceOf(q).invoiceNo)} generated.`
        : '',
      approved ? '' : 'Update the quote and submit it again with notes.',
    ],
    actions: [
      {
        label: approved ? 'View quote' : 'Review and resubmit',
        js: `openQuoteRecord('${E(q.no)}')`,
      },
      ...(approved ? invoiceActions(q) : []),
    ],
  });
}

// Toasts that the pop-ups replace; everything else (errors, validation) still shows.
function withoutToasts(rx, fn) {
  const real = toast;
  toast = (m, ...r) => (rx.test(String(m)) ? undefined : real(m, ...r));
  try {
    return fn();
  } finally {
    toast = real;
  }
}

const submitQuoteBeforePopups = submitQuote;
submitQuote = function () {
  const no = S.qd && S.qd.no,
    before = (quoteOf(no) || {}).requestedAt;
  withoutToasts(/^(Quotation sent for approval|Approved · invoice generated)/, () =>
    submitQuoteBeforePopups.apply(this, arguments)
  );
  const q = quoteOf(no);
  if (!q || !q.requestedAt || q.requestedAt === before) return;
  const pending = String(q.status).startsWith('Pending');
  if (pending)
    queuePopup({
      kind: 'needs-approval',
      no,
      toRole: q.status === 'Pending CEO Approval' ? 'ceo' : 'admin',
      by: S.authUser,
    });
  save();
  if (pending)
    showPopup({
      tone: 'wr',
      icon: 'hourglass_top',
      title: `Quotation ${E(q.no)} sent for approval`,
      lines: [
        `Routed to <b>${E(q.nextApprover || 'the approver')}</b> (${q.status === 'Pending CEO Approval' ? 'CEO' : 'Admin'}).`,
        quoteFacts(q),
        belowProductFloor(q).length
          ? '<span class="mut">A price is below the product minimum, so CEO approval is required.</span>'
          : '',
        'You will get a pop-up here as soon as it is approved or rejected.',
      ],
      actions: [{ label: 'Back to opportunity', js: `nav('opp-detail')` }],
    });
  else
    showPopup({
      tone: 'ok',
      icon: 'verified',
      title: `Quotation ${E(q.no)} approved`,
      lines: [
        `Approved by <b>${E(q.approvedBy || '')}</b> within their authority.`,
        quoteFacts(q),
        invoiceOf(q) && canSeeInvoices() ? `Invoice ${E(invoiceOf(q).invoiceNo)} generated.` : '',
      ],
      actions: invoiceActions(q),
    });
};

const finishApprovalBeforePopups = finishApproval;
finishApproval = function (e, no, mode) {
  const before = (quoteOf(no) || {}).status;
  withoutToasts(/^(Quotation rejected|Approval granted)/, () =>
    finishApprovalBeforePopups.apply(this, arguments)
  );
  const q = quoteOf(no);
  if (!q || q.status === before || !['Approved', 'Rejected'].includes(q.status)) return;
  const approved = q.status === 'Approved',
    creator = S.users.find((u) => u.name === q.createdBy);
  if (creator && creator.id !== S.authUser)
    queuePopup({
      kind: approved ? 'approved' : 'rejected',
      no,
      toUser: creator.id,
      by: S.authUser,
    });
  save();
  showPopup({
    tone: approved ? 'ok' : 'err',
    icon: approved ? 'verified' : 'cancel',
    title: `Quotation ${E(q.no)} ${approved ? 'approved' : 'rejected'}`,
    lines: [
      quoteFacts(q),
      approved && invoiceOf(q) ? `Invoice ${E(invoiceOf(q).invoiceNo)} generated.` : '',
      creator ? `${E(creator.name)} will see a pop-up about this decision.` : '',
    ],
    actions: [{ label: 'View quote', js: `openQuoteRecord('${E(q.no)}')` }],
  });
};

// Show waiting pop-ups after every render and when another tab saves new ones.
const renderBeforePopups = render;
render = function () {
  renderBeforePopups.apply(this, arguments);
  showNextPopup();
};
addEventListener('storage', (e) => {
  if (e.key === KEY) setTimeout(showNextPopup, 0);
});

// Account addresses: shown in a hover card on every account name; only Senior Reps, Admin and CEO can edit them.

// Demo addresses for the accounts that ship with the sample data.
const SAMPLE_ADDRESSES = [
  [
    'Plot 14, Sector 62, Noida, Uttar Pradesh 201301',
    'Warehouse 3, Kundli Industrial Area, Sonipat, Haryana 131028',
  ],
  ['4th Floor, Prestige Tech Park, Outer Ring Road, Bengaluru, Karnataka 560103', ''],
  [
    '12 Nariman Point, Mumbai, Maharashtra 400021',
    'Gate 2, MIDC Andheri East, Mumbai, Maharashtra 400093',
  ],
  ['88 Anna Salai, Chennai, Tamil Nadu 600002', ''],
  [
    'Banjara Hills Road No. 3, Hyderabad, Telangana 500034',
    'Plot 9, Genome Valley, Shameerpet, Telangana 500078',
  ],
  ['21 Park Street, Kolkata, West Bengal 700016', ''],
];
S.accountInfo = S.accountInfo || {};
[...new Set(S.opps.map((o) => o.account))].forEach((name, i) => {
  if (S.accountInfo[name]) return;
  const [address, shipping] = SAMPLE_ADDRESSES[i % SAMPLE_ADDRESSES.length];
  S.accountInfo[name] = {
    address,
    shipping: shipping || address,
    by: 'Sample data',
    at: Date.now(),
  };
});

const accountInfo = (name) => S.accountInfo[name] || { address: '', shipping: '' };
const acctAttr = (name) => `data-acct="${E(name)}" tabindex="0"`;
const acctSpan = (name) => `<span class="acct-hover" ${acctAttr(name)}>${E(name)}</span>`;
const acctEditBtn = (name) =>
  canEditAddress()
    ? ` <button type="button" class="hdr-ic" style="width:26px;height:26px;vertical-align:middle" title="Edit addresses" aria-label="Edit addresses for ${E(name)}" onclick="event.stopPropagation();openAccountEditor(${E(JSON.stringify(name))})"><span class="ms" style="font-size:18px">edit_location_alt</span></button>`
    : '';

// ----- hover card (also on keyboard focus) -----
let acctCard;
function showAcctCard(el) {
  const name = el.dataset.acct,
    info = accountInfo(name),
    line = (label, v) =>
      `<div class="mt-1"><div class="mut text-[11px]">${label}</div><div style="white-space:pre-wrap">${v ? E(v) : '<span class="mut">Not added</span>'}</div></div>`;
  if (!acctCard) {
    acctCard = document.createElement('div');
    acctCard.id = 'acct-card';
    acctCard.setAttribute('role', 'tooltip');
    document.body.appendChild(acctCard);
  }
  acctCard.innerHTML = `<b>${E(name)}</b>${line('Address', info.address)}${line('Shipping address', info.shipping)}`;
  acctCard.style.display = 'block';
  const r = el.getBoundingClientRect(),
    w = acctCard.offsetWidth,
    h = acctCard.offsetHeight;
  acctCard.style.left = Math.max(8, Math.min(innerWidth - w - 8, r.left)) + 'px';
  acctCard.style.top =
    (r.bottom + h + 12 > innerHeight ? Math.max(8, r.top - h - 6) : r.bottom + 6) + 'px';
}
function hideAcctCard() {
  if (acctCard) acctCard.style.display = 'none';
}
document.addEventListener('mouseover', (e) => {
  const el = e.target.closest && e.target.closest('[data-acct]');
  if (el) showAcctCard(el);
});
document.addEventListener('mouseout', (e) => {
  const el = e.target.closest && e.target.closest('[data-acct]');
  if (el && !(e.relatedTarget && el.contains(e.relatedTarget))) hideAcctCard();
});
document.addEventListener('focusin', (e) => {
  const el = e.target.closest && e.target.closest('[data-acct]');
  if (el) showAcctCard(el);
});
document.addEventListener('focusout', hideAcctCard);
addEventListener('scroll', hideAcctCard, true);
addEventListener('keydown', (e) => e.key === 'Escape' && hideAcctCard(), true);
addEventListener('hashchange', hideAcctCard);

// ----- editing (Senior Rep, Admin, CEO) -----
function openAccountEditor(name) {
  if (!canEditAddress()) return toast('Only Admin and CEO can edit addresses');
  hideAcctCard();
  const info = accountInfo(name);
  $('#modal').innerHTML =
    `<div class="fixed inset-0 z-40 grid place-items-center p-4" style="background:rgba(0,0,0,.5)"><form class="card p-5 w-full max-w-lg space-y-3" onsubmit="saveAccountAddress(event,${E(JSON.stringify(name))})"><h2 class="text-lg font-bold">Addresses — ${E(name)}</h2>` +
    `<label class="block">Address<textarea class="inp mt-1" name="address" rows="3" maxlength="300" placeholder="Registered / billing address">${E(info.address)}</textarea></label>` +
    `<label class="flex items-center gap-2"><input type="checkbox" name="same" ${info.address && info.address === info.shipping ? 'checked' : ''}> Shipping address is the same</label>` +
    `<label class="block">Shipping address<textarea class="inp mt-1" name="shipping" rows="3" maxlength="300" placeholder="Where goods are delivered">${E(info.shipping)}</textarea></label>` +
    `<div class="flex justify-end gap-2"><button type="button" class="btn" onclick="$('#modal').innerHTML=''">Cancel</button><button class="btn btn-p">Save</button></div></form></div>`;
  $('#modal textarea').focus();
}
function saveAccountAddress(e, name) {
  e.preventDefault();
  if (!canEditAddress()) return toast('Only Admin and CEO can edit addresses');
  const v = Object.fromEntries(new FormData(e.target)),
    address = (v.address || '').trim();
  S.accountInfo[name] = {
    address,
    shipping: v.same ? address : (v.shipping || '').trim(),
    by: roleNow().name,
    at: Date.now(),
  };
  S.opps
    .filter((o) => o.account === name)
    .forEach((o) => logOpp(o.id, 'sync', `Account addresses updated by ${roleNow().name}`));
  $('#modal').innerHTML = '';
  save();
  toast('Addresses saved');
  render();
}

// Accounts list: same columns as before, plus the address and an edit button for those allowed.
V.accounts = () => {
  const names = [...new Set(S.opps.map((o) => o.account))],
    edit = canEditAddress();
  return (
    `<h1 class="text-xl font-bold mb-3">Accounts</h1>` +
    table(
      ['Account', 'Open deals', 'Open pipeline', 'Won', 'Address', ''],
      names
        .map((a) => {
          const x = S.opps.filter((o) => o.account == a),
            open = x.filter((o) => o.stage < 5),
            info = accountInfo(a);
          return `<tr class="r" onclick="S.q='${E(a).replace(/'/g, '')}';nav('opps')"><td><b>${acctSpan(a)}</b></td><td>${open.length}</td><td>${M(open.reduce((s, o) => s + o.amount, 0))}</td><td>${M(x.filter((o) => o.stage == 5).reduce((s, o) => s + o.amount, 0))}</td><td class="mut text-xs">${info.address ? E(info.address) : 'Not added'}</td><td class="text-right">${edit ? `<button class="btn" onclick="event.stopPropagation();openAccountEditor(${E(JSON.stringify(a))})"><span class="ms">edit_location_alt</span>Edit</button>` : ''}</td></tr>`;
        })
        .join('')
    )
  );
};

// Quote creation pop-up, top action buttons (Sync / Sign / PO / Print), bill output, standard Terms & Conditions
// (Admin / CEO own them; rep changes need approval), "show discount on bill", and the Closed Won rule.

// ---------------------------------------------------------------------------
// Standard terms & conditions
// ---------------------------------------------------------------------------
const DEFAULT_TNC =
  '1. Prices are in INR and valid until the quote expiry date.\n2. Goods remain the property of the seller until payment is received in full.\n3. Delivery dates are estimates and may change with stock and shipping conditions.\n4. Any change to these terms must be agreed in writing.';
S.settings = S.settings || {};
if (!S.settings.tnc)
  S.settings.tnc = { text: DEFAULT_TNC, version: 1, by: 'System', at: Date.now() };
S.tncRequests = S.tncRequests || [];

const isAdminOrCeo = () => ['admin', 'ceo'].includes(S.role);
const standardTnc = () => S.settings.tnc.text;
const effectiveTnc = (q) => (q && q.tnc ? q.tnc : standardTnc());
const pendingTnc = (q) => S.tncRequests.find((r) => r.quoteNo === q.no && r.status === 'Pending');
const lastTncDecision = (q) =>
  S.tncRequests
    .filter((r) => r.quoteNo === q.no && r.status !== 'Pending')
    .sort((a, b) => (b.decidedAt || 0) - (a.decidedAt || 0))[0];

// Terms & conditions block on the quote (step 3): Admin / CEO edit directly, reps send a change for approval.
function tncSection(q, locked) {
  const eff = effectiveTnc(q),
    pend = pendingTnc(q),
    last = lastTncDecision(q),
    head = `<div class="qt-section-head"><span class="ms">gavel</span><b>Terms &amp; conditions</b><span class="mut text-xs">${q.tnc ? 'Custom for this quote' : 'Standard terms'}</span></div>`;
  let body;
  if (isAdminOrCeo() && !locked) {
    body = `<textarea class="inp" rows="6" aria-label="Terms and conditions" oninput="S.qd.tnc=this.value">${E(eff)}</textarea><p class="mut text-xs mt-1">These terms print on every bill. Admin / CEO changes apply straight away. The standard terms for all quotes are in Settings → Terms &amp; conditions.</p>`;
  } else {
    body =
      `<p style="white-space:pre-wrap">${E(eff)}</p>` +
      (pend
        ? `<div class="qt-banner wr mt-2"><span class="ms">hourglass_top</span><div><b>Change waiting for Admin / CEO approval</b><div class="mut">Requested by ${E(pend.by)} · ${whenText(pend.at)}</div><div style="white-space:pre-wrap">${E(pend.text)}</div></div></div>`
        : '') +
      (last && !pend
        ? `<div class="qt-banner ${last.status === 'Approved' ? 'ok' : 'err'} mt-2"><span class="ms">${last.status === 'Approved' ? 'verified' : 'cancel'}</span><div><b>Last change request ${last.status.toLowerCase()}</b>${last.decisionNote ? `<div>${E(last.decisionNote)}</div>` : ''}</div></div>`
        : '') +
      (!locked && !pend
        ? `<div class="mt-2"><button type="button" class="btn" onclick="openTncRequest()"><span class="ms">edit_note</span>Request change</button><span class="mut text-xs ml-2">Needs Admin / CEO approval</span></div>`
        : '');
  }
  return `<section class="qt-section">${head}<div class="qt-body">${body}</div></section>`;
}

function openTncRequest() {
  const q = S.qd;
  if (!q || pendingTnc(q)) return;
  $('#modal').innerHTML =
    `<div class="fixed inset-0 z-40 grid place-items-center p-4" style="background:rgba(0,0,0,.5)"><form class="card p-5 w-full max-w-lg max-h-full overflow-auto space-y-3" onsubmit="saveTncRequest(event)"><h2 class="text-lg font-bold">Request change to terms &amp; conditions</h2><p class="mut text-xs">Admin or CEO must approve before the new terms apply to quote ${E(q.no)}.</p>` +
    `<label class="block">Proposed terms *<textarea class="inp" name="text" rows="7" required>${E(effectiveTnc(q))}</textarea></label>` +
    `<label class="block">Why is this change needed? *<textarea class="inp" name="note" rows="2" required></textarea></label>` +
    `<div class="flex justify-end gap-2"><button type="button" class="btn" onclick="$('#modal').innerHTML=''">Cancel</button><button class="btn btn-p">Send for approval</button></div></form></div>`;
  $('#modal textarea').focus();
}
function saveTncRequest(e) {
  e.preventDefault();
  const q = S.qd,
    v = Object.fromEntries(new FormData(e.target)),
    text = (v.text || '').trim();
  if (!q || pendingTnc(q)) return;
  if (!text || !(v.note || '').trim()) return toast('Add the new terms and the reason');
  if (text === effectiveTnc(q).trim()) return toast('The terms are unchanged');
  if (isAdminOrCeo()) return toast('Admin and CEO can edit the terms directly');
  const r = {
    id: 'tr' + Date.now(),
    quoteNo: q.no,
    text,
    note: v.note.trim(),
    by: roleNow().name,
    byId: S.authUser,
    at: Date.now(),
    status: 'Pending',
  };
  S.tncRequests.push(r);
  queuePopup({ kind: 'tnc-request', no: q.no, reqId: r.id, toRole: 'admin', by: S.authUser });
  queuePopup({ kind: 'tnc-request', no: q.no, reqId: r.id, toRole: 'ceo', by: S.authUser });
  $('#modal').innerHTML = '';
  save();
  toast('Terms change sent to Admin / CEO for approval');
  render();
}
function decideTnc(id, approve) {
  if (!isAdminOrCeo()) return toast('Only Admin or CEO can decide this');
  const r = S.tncRequests.find((x) => x.id === id);
  if (!r || r.status !== 'Pending') return toast('This request was already decided');
  const note = approve ? '' : (prompt('Reason for rejecting this change (required)') || '').trim();
  if (!approve && !note) return toast('A reason is required to reject');
  r.status = approve ? 'Approved' : 'Rejected';
  r.decidedBy = roleNow().name;
  r.decidedAt = Date.now();
  r.decisionNote = note;
  if (approve) {
    const q = S.quotes.find((x) => x.no === r.quoteNo);
    if (q) q.tnc = r.text;
    if (S.qd && S.qd.no === r.quoteNo) S.qd.tnc = r.text;
    const inv = q && q.invoiceId && S.invoices.find((i) => i.id === q.invoiceId);
    if (inv && inv.status !== 'Paid') inv.tnc = r.text;
  }
  queuePopup({
    kind: approve ? 'tnc-approved' : 'tnc-rejected',
    no: r.quoteNo,
    reqId: r.id,
    toUser: r.byId,
    by: S.authUser,
  });
  save();
  toast(`Terms change ${approve ? 'approved' : 'rejected'}`);
  render();
}
function showTncPopup(p) {
  const r = S.tncRequests.find((x) => x.id === p.reqId);
  if (!r) return;
  if (p.kind === 'tnc-request') {
    if (r.status !== 'Pending') return;
    return showPopup({
      tone: 'wr',
      icon: 'gavel',
      title: `Terms change needs approval: ${E(r.quoteNo)}`,
      lines: [
        `<b>${E(r.by)}</b> asked to change the terms and conditions.`,
        `Reason: ${E(r.note)}`,
      ],
      actions: [{ label: 'Review now', js: `nav('approvals')` }],
    });
  }
  const ok = p.kind === 'tnc-approved';
  showPopup({
    tone: ok ? 'ok' : 'err',
    icon: ok ? 'verified' : 'cancel',
    title: `Terms change ${ok ? 'approved' : 'rejected'}: ${E(r.quoteNo)}`,
    lines: [
      `${ok ? 'Approved' : 'Rejected'} by <b>${E(r.decidedBy || '')}</b>.`,
      r.decisionNote ? `Reason: ${E(r.decisionNote)}` : '',
    ],
    actions: [{ label: 'Open quote', js: `openQuoteRecord('${E(r.quoteNo)}')` }],
  });
}

// Approvals page: terms & conditions requests for Admin / CEO.
const approvalsViewBeforeTnc = V.approvals;
V.approvals = function () {
  const html = approvalsViewBeforeTnc.apply(this, arguments);
  if (S.role === 'rep') return html;
  const pend = S.tncRequests.filter((r) => r.status === 'Pending'),
    done = S.tncRequests
      .filter((r) => r.status !== 'Pending')
      .sort((a, b) => b.decidedAt - a.decidedAt)
      .slice(0, 5),
    row = (r, actions) =>
      `<tr><td><b>${E(r.quoteNo)}</b></td><td>${E(r.by)}</td><td>${E(r.note)}</td><td style="white-space:pre-wrap;max-width:360px">${E(r.text)}</td><td>${actions}</td></tr>`;
  return (
    html +
    `<h2 class="text-lg font-bold mt-6 mb-2">Terms &amp; conditions requests</h2>` +
    (pend.length
      ? table(
          ['Quote', 'Requested by', 'Reason', 'Proposed terms', 'Action'],
          pend
            .map((r) =>
              row(
                r,
                `<button class="btn btn-p" onclick="decideTnc('${r.id}',true)">Approve</button> <button class="btn" style="color:var(--err)" onclick="decideTnc('${r.id}',false)">Reject</button>`
              )
            )
            .join('')
        )
      : '<p class="mut">No terms changes waiting.</p>') +
    (done.length
      ? `<p class="mut text-xs mt-3">Recent decisions: ${done.map((r) => `${E(r.quoteNo)} ${r.status.toLowerCase()} by ${E(r.decidedBy)}`).join(' · ')}</p>`
      : '')
  );
};

// Settings → Terms & conditions (Admin / CEO).
SETTINGS_PANELS.terms = function () {
  const t = S.settings.tnc;
  return `${secHead('gavel', 'Terms & conditions', 'These terms print on every quote and bill. Reps cannot change them; a rep can ask for a change on a quote, which Admin or CEO must approve.')}<form onsubmit="saveStandardTnc(event)" class="space-y-3"><textarea class="inp" name="text" rows="10" aria-label="Standard terms and conditions" required>${E(t.text)}</textarea><div class="flex items-center gap-3 flex-wrap"><button class="btn btn-p">Save terms</button><span class="mut text-xs">Version ${t.version} · last changed by ${E(t.by)} on ${whenText(t.at)}. New bills use the latest terms; bills already generated keep theirs.</span></div></form>`;
};
function saveStandardTnc(e) {
  e.preventDefault();
  if (!isAdminOrCeo()) return toast('Only Admin or CEO can change the terms');
  const text = (new FormData(e.target).get('text') || '').trim();
  if (!text) return toast('Terms cannot be empty');
  S.settings.tnc = {
    text,
    version: S.settings.tnc.version + 1,
    by: roleNow().name,
    at: Date.now(),
  };
  save();
  toast('Terms & conditions saved');
  render();
}

// ---------------------------------------------------------------------------
// Bill output (quote print view and invoice share this): grand total only, discount shown only if switched on
// ---------------------------------------------------------------------------
function billLinesTable(items, showDiscount) {
  const head = [
    'Product',
    'Code',
    'Qty',
    'Unit price',
    ...(showDiscount ? ['Discount'] : []),
    'Total',
  ];
  return table(
    head,
    items
      .map((x) => {
        const net = x.p * (1 - x.d / 100);
        return `<tr><td>${E(x.n)}</td><td>${E(x.c)}</td><td>${x.q}</td><td>${M(showDiscount ? x.p : net)}</td>${showDiscount ? `<td>${x.d}%</td>` : ''}<td>${M(net * x.q)}</td></tr>`;
      })
      .join('')
  );
}
function printQuote() {
  const q = S.qd,
    o = cur();
  if (!q || !o) return;
  $('#modal').innerHTML =
    `<div class="fixed inset-0 z-40 grid place-items-center p-4" style="background:rgba(0,0,0,.5)"><div class="card p-6 w-full max-w-3xl max-h-full overflow-auto"><div class="flex justify-between gap-3"><div><h2 class="text-xl font-bold">Quote ${E(q.no)}</h2><div class="mut">${E(q.name || '')}</div><div class="mut">Prepared for ${E(q.preparedFor || o.account)} · Valid until ${fd(q.exp)}</div></div><b>${E(o.account)}</b></div>` +
    `<div class="grid sm:grid-cols-2 gap-3 mt-3 text-sm"><div><div class="mut text-xs">Billing address</div><div style="white-space:pre-wrap">${E(q.address || '–')}</div></div><div><div class="mut text-xs">Shipping address</div><div style="white-space:pre-wrap">${E(q.shipping || '–')}</div></div></div>` +
    `<div class="my-4">${billLinesTable(q.items, !!q.showDiscount)}</div><div class="text-right text-lg font-bold">Grand total ${M(quoteTotal(q))}</div>` +
    `<div class="mt-4"><b>Terms &amp; conditions</b><div style="white-space:pre-wrap" class="text-sm">${E(effectiveTnc(q))}</div></div>` +
    (q.po
      ? `<p class="mt-3 text-sm"><b>Customer PO:</b> ${E(q.po.no)}${q.po.date ? ' · ' + fd(q.po.date) : ''}</p>`
      : '') +
    (q.signedBy
      ? `<p class="mt-1 text-sm"><b>Signed by:</b> ${E(q.signedBy)} · ${whenText(q.signedAt)}</p>`
      : '') +
    `<div class="flex justify-end gap-2 mt-4"><button class="btn" onclick="$('#modal').innerHTML=''">Close</button><button class="btn btn-p" onclick="window.print()">Print / Save PDF</button></div></div></div>`;
}

// Update a quote (stored copy, the open copy and its invoice) in one go.
function patchQuote(no, patch) {
  const q = S.quotes.find((x) => x.no === no);
  if (q) Object.assign(q, patch);
  if (S.qd && S.qd.no === no) Object.assign(S.qd, patch);
  const inv = q && q.invoiceId && S.invoices.find((i) => i.id === q.invoiceId);
  if (inv && 'showDiscount' in patch && inv.status !== 'Paid')
    inv.showDiscount = patch.showDiscount;
  save();
}
function setShowDiscount(on) {
  if (!canGiveDiscount()) return toast('Only Admin and CEO can change this');
  patchQuote(S.qd.no, { showDiscount: !!on });
  toast(on ? 'Discount will be shown on the bill' : 'Discount hidden on the bill');
  render();
}

// ---------------------------------------------------------------------------
// Top buttons: Sync quote, Sign, PO, Print
// ---------------------------------------------------------------------------
const quoteApproved = (q) => ['Approved', 'Sent to client', 'Paid'].includes(q.status);
function quoteToolbar(q) {
  const ok = quoteApproved(q),
    why = ok ? '' : 'Available once the quote is approved',
    syncOk = !String(q.status).startsWith('Pending') && q.status !== 'Rejected';
  return `<div class="qt-toolbar"><button class="btn" ${syncOk ? '' : 'disabled'} title="${syncOk ? "Copy this quote's products and total to the opportunity" : 'Not available while the quote is pending or rejected'}" onclick="syncQuote()"><span class="ms">sync</span>Sync Quote</button><button class="btn" ${ok ? '' : 'disabled'} title="${why}" onclick="openSignForm()"><span class="ms">draw</span>Sign</button><button class="btn" ${ok ? '' : 'disabled'} title="${why}" onclick="openPoForm()"><span class="ms">receipt_long</span>PO</button><button class="btn" onclick="printQuote()"><span class="ms">print</span>Print / PDF</button>${q.syncedAt ? `<span class="chip ok">Synced ${ago(q.syncedAt)}</span>` : ''}${q.signedBy ? `<span class="chip ok">Signed by ${E(q.signedBy)}</span>` : ''}${q.po ? `<span class="chip ok">PO ${E(q.po.no)}</span>` : ''}<span class="flex-1"></span><label class="qt-check" title="${canGiveDiscount() ? '' : 'Only Admin and CEO can change this'}"><input type="checkbox" ${q.showDiscount ? 'checked' : ''} ${canGiveDiscount() ? '' : 'disabled'} onchange="setShowDiscount(this.checked)"> Show discount on bill</label></div>`;
}
const quoteViewBeforeFlow = V.quote;
V.quote = function () {
  const html = quoteViewBeforeFlow.apply(this, arguments);
  return S.qd
    ? html.replace('<nav class="qt-steps">', quoteToolbar(S.qd) + '<nav class="qt-steps">')
    : html;
};

function syncQuote() {
  const q = S.qd,
    o = cur();
  if (!q || !o) return;
  if (String(q.status).startsWith('Pending') || q.status === 'Rejected')
    return toast('Not available while the quote is pending or rejected');
  S.quotes.forEach((x) => {
    if (x.opp == q.opp) x.primary = x.no === q.no;
  });
  q.primary = true;
  storeQuote(q);
  o.items = clone(q.items);
  o.amount = Math.round(quoteTotal(q));
  patchQuote(q.no, { syncedAt: Date.now(), primary: true });
  logOpp(
    o.id,
    'sync',
    `Quote ${q.no} synced to the opportunity by ${roleNow().name} (${M(o.amount)})`
  );
  toast('Quote synced to the opportunity');
  render();
}
function simpleQuoteForm(title, fields, submitJs, submitLabel) {
  $('#modal').innerHTML =
    `<div class="fixed inset-0 z-40 grid place-items-center p-4" style="background:rgba(0,0,0,.5)"><form class="card p-5 w-full max-w-md space-y-3" onsubmit="${submitJs}(event)"><h2 class="text-lg font-bold">${title}</h2>${fields}<div class="flex justify-end gap-2"><button type="button" class="btn" onclick="$('#modal').innerHTML=''">Cancel</button><button class="btn btn-p">${submitLabel}</button></div></form></div>`;
  $('#modal input').focus();
}
function openSignForm() {
  const q = S.qd;
  if (!q || !quoteApproved(q)) return toast('Available once the quote is approved');
  simpleQuoteForm(
    `Sign quotation ${E(q.no)}`,
    `<label class="block">Signed by *<input class="inp" name="by" required value="${E(q.signedBy || String(q.preparedFor || '').replace(/\s*\(.*\)\s*$/, ''))}"></label><label class="block">Date<input class="inp" type="date" name="date" value="${D(0)}"></label>`,
    'saveSign',
    'Save signature'
  );
}
function saveSign(e) {
  e.preventDefault();
  const q = S.qd,
    v = Object.fromEntries(new FormData(e.target));
  if (!q || !quoteApproved(q) || !(v.by || '').trim()) return;
  patchQuote(q.no, {
    signedBy: v.by.trim(),
    signedAt: v.date ? new Date(v.date + 'T12:00').getTime() : Date.now(),
  });
  logOpp(q.opp, 'sync', `Quote ${q.no} signed by ${v.by.trim()}`);
  $('#modal').innerHTML = '';
  toast('Signature recorded');
  render();
}
function openPoForm() {
  const q = S.qd;
  if (!q || !quoteApproved(q)) return toast('Available once the quote is approved');
  simpleQuoteForm(
    `Customer PO for ${E(q.no)}`,
    `<label class="block">PO number *<input class="inp" name="no" required value="${E((q.po || {}).no || '')}"></label><label class="block">PO date<input class="inp" type="date" name="date" value="${E((q.po || {}).date || D(0))}"></label>`,
    'savePo',
    'Save PO'
  );
}
function savePo(e) {
  e.preventDefault();
  const q = S.qd,
    v = Object.fromEntries(new FormData(e.target));
  if (!q || !quoteApproved(q) || !(v.no || '').trim()) return;
  patchQuote(q.no, { po: { no: v.no.trim(), date: v.date || '' } });
  const o = S.opps.find((x) => x.id == q.opp);
  if (o) (o.f = o.f || {}).po = v.no.trim(); // shows in "PO / Reference number" on the opportunity
  logOpp(q.opp, 'sync', `Customer PO ${v.no.trim()} recorded on quote ${q.no}`);
  $('#modal').innerHTML = '';
  toast('PO recorded');
  render();
}

// ---------------------------------------------------------------------------
// New quote pop-up with details already filled in (products come from the opportunity)
// ---------------------------------------------------------------------------
const openQuoteBeforeFlow = openQuote;
openQuote = function (id) {
  const o = S.opps.find((x) => x.id == id);
  if (!o) return openQuoteBeforeFlow.apply(this, arguments);
  // continue a draft the user has already worked on; an untouched default quote goes through the pop-up
  const draft = S.quotes
    .filter((q) => q.opp == id && !q.isDefault && ['Draft', 'Rejected'].includes(q.status))
    .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))[0];
  if (draft) {
    S.cur = id;
    S.qstep = 1;
    S.qd = clone(draft);
    return nav('quote');
  }
  openNewQuoteForm(o);
};

// Every open opportunity gets a default quote with its products and price, so the Quotes card is never empty.
// It follows the opportunity's products until someone saves or edits it.
function ensureDefaultQuotes() {
  let changed = false;
  S.opps.forEach((o) => {
    if (o.lost || o.stage === 5 || !o.items || !o.items.length) return;
    const mine = S.quotes.filter((q) => q.opp == o.id);
    if (!mine.length) {
      const no = 'Q-' + (1001 + S.quotes.length),
        d = quoteDefaults({ no }, o);
      S.quotes.push({
        opp: o.id,
        no,
        name: d.name,
        primary: true,
        isDefault: true,
        exp: D(quoteDefaultsSetting().validityDays),
        status: 'Draft',
        label: 'Draft',
        preparedFor: d.preparedFor,
        toEmail: d.toEmail,
        toPhone: d.toPhone,
        address: d.address,
        shipping: d.shipping,
        showDiscount: false,
        items: clone(o.items),
        createdAt: Date.now(),
      });
      changed = true;
      return;
    }
    mine
      .filter((q) => q.isDefault && q.status === 'Draft')
      .forEach((q) => {
        if (JSON.stringify(q.items) !== JSON.stringify(o.items)) {
          q.items = clone(o.items);
          changed = true;
        }
      });
  });
  if (changed) save();
}
const storeQuoteBeforeDefault = storeQuote;
storeQuote = function (q) {
  delete q.isDefault; // once someone saves a quote it is no longer the auto-filled default
  return storeQuoteBeforeDefault.apply(this, arguments);
};
const renderBeforeDefaultQuote = render;
render = function () {
  ensureDefaultQuotes();
  return renderBeforeDefaultQuote.apply(this, arguments);
};
// Creating an opportunity (new, clone, converted lead) always ends in nav(), so make sure its default quote exists first.
const navBeforeDefaultQuote = nav;
nav = function () {
  ensureDefaultQuotes();
  return navBeforeDefaultQuote.apply(this, arguments);
};
ensureDefaultQuotes();
function openNewQuoteForm(o) {
  const dq = S.quotes.find((x) => x.opp == o.id && x.isDefault && x.status === 'Draft'),
    no = dq ? dq.no : 'Q-' + (1001 + S.quotes.length),
    d = quoteDefaults({ no }, o),
    field = (label, control, req) =>
      `<label class="qt-field"><span>${label}${req ? ' <i class="qt-req">*</i>' : ''}</span>${control}</label>`,
    lines = o.items.map((i) => `${E(i.n)} × ${i.q}`).join(', ');
  $('#modal').innerHTML =
    `<div class="fixed inset-0 z-40 grid place-items-center p-4" style="background:rgba(0,0,0,.5)"><form class="card qt-section w-full max-w-3xl max-h-full overflow-auto" role="dialog" aria-modal="true" aria-label="New quote" onsubmit="createQuoteFromForm(event,${o.id})">` +
    `<div class="qt-section-head"><span class="ms">badge</span><b>Quote Information</b></div><div class="qt-grid">` +
    field('Quote Name', `<input class="inp" name="name" required value="${E(d.name)}">`, true) +
    field(
      'Expiration Date',
      `<input type="date" class="inp" name="exp" required value="${D(quoteDefaultsSetting().validityDays)}">`
    ) +
    field(
      'Status',
      `<select class="inp" name="label">${QUOTE_STATUS_CHOICES.map((s) => `<option>${E(s)}</option>`).join('')}</select>`
    ) +
    (contactsOfAccount(o.account).length
      ? field(
          'Customer Contact',
          `<select class="inp" onchange="fillQuoteFormContact(this)"><option value="">Choose a contact…</option>${contactOptions(o.account, String(d.preparedFor).replace(/\s*\(.*\)\s*$/, ''))}</select>`
        )
      : '') +
    field('Prepared For', `<input class="inp" name="preparedFor" value="${E(d.preparedFor)}">`) +
    field(
      'Send To (Email)',
      `<input class="inp" type="email" name="toEmail" value="${E(d.toEmail)}" placeholder="customer@company.com">`
    ) +
    field(
      'WhatsApp Number',
      `<input class="inp" type="tel" name="toPhone" value="${E(d.toPhone)}" placeholder="+91 98765 43210">`
    ) +
    field('Sales Rep / Owner', `<input class="inp" value="${E(ownerLabel(o.owner))}" disabled>`) +
    field(
      'Billing Address',
      `<input class="inp" name="address" value="${E(d.address)}" placeholder="Street, city, state, PIN">`
    ) +
    field(
      'Shipping Address',
      `<input class="inp" name="shipping" value="${E(d.shipping)}" placeholder="Street, city, state, PIN">`
    ) +
    `</div><div class="qt-body"><div class="mut text-xs">Products from this opportunity (${o.items.length}) — added to the quote automatically</div><div>${lines || '—'}</div><div class="font-semibold mt-1">Total ${M(o.items.reduce((a, i) => a + i.p * i.q * (1 - i.d / 100), 0))}</div></div>` +
    `<div class="flex justify-end gap-2 p-3"><button type="button" class="btn" onclick="$('#modal').innerHTML=''">Cancel</button><button class="btn btn-p">Create quote</button></div></form></div>`;
  $('#modal input').focus();
}
function createQuoteFromForm(e, id) {
  e.preventDefault();
  const o = S.opps.find((x) => x.id == id),
    v = Object.fromEntries(new FormData(e.target));
  if (!o || !(v.name || '').trim() || !v.exp)
    return toast('Quote name and expiry date are required');
  // finishing the pop-up turns the opportunity's default quote into a real one (same number)
  const dq = S.quotes.find((x) => x.opp == o.id && x.isDefault && x.status === 'Draft'),
    no = dq ? dq.no : 'Q-' + (1001 + S.quotes.length);
  S.qd = {
    opp: o.id,
    no,
    name: v.name.trim(),
    primary: true,
    exp: v.exp,
    status: 'Draft',
    label: v.label,
    preparedFor: (v.preparedFor || '').trim(),
    toEmail: (v.toEmail || '').trim(),
    toPhone: (v.toPhone || '').trim(),
    address: (v.address || '').trim(),
    shipping: (v.shipping || '').trim(),
    showDiscount: false,
    items: clone(o.items),
    createdAt: Date.now(),
    createdBy: roleNow().name,
  };
  storeQuote(S.qd);
  if (S.qd.primary) S.quotes.forEach((x) => x.opp == o.id && x.no !== no && (x.primary = false));
  S.cur = o.id;
  S.qstep = 1;
  $('#modal').innerHTML = '';
  save();
  nav('quote');
}

// ---------------------------------------------------------------------------
// Closed Won: Admin / CEO only, with notes, once payment is received
// ---------------------------------------------------------------------------
const setStageBeforeClosedWon = setStage;
setStage = function (o, i) {
  const won = o.stage === 5 && !o.lost;
  if (i === 5) {
    if (won) return;
    if (!isAdminOrCeo())
      return toast('Only Admin or CEO can mark a deal Closed Won, once payment is received');
    return openClosedWon(o);
  }
  if (won && !isAdminOrCeo()) return toast('Only Admin or CEO can change a Closed Won deal');
  return setStageBeforeClosedWon.apply(this, arguments);
};
function openClosedWon(o) {
  const invs = S.invoices.filter((i) => i.opp == o.id),
    paid = invs.some((i) => i.status === 'Paid');
  $('#modal').innerHTML =
    `<div class="fixed inset-0 z-40 grid place-items-center p-4" style="background:rgba(0,0,0,.5)"><form class="card p-5 w-full max-w-lg max-h-full overflow-auto space-y-3" onsubmit="confirmClosedWon(event,${o.id})"><h2 class="text-lg font-bold">Mark Closed Won — ${E(o.name)}</h2>` +
    `<p class="mut text-sm">Close the deal only after the payment has been received.</p>` +
    (invs.length
      ? `<div class="p-3 rounded text-xs" style="background:var(--hov)">${invs.map((i) => `${E(i.invoiceNo)}: <b>${E(i.status)}</b> · ${M(i.total)}`).join('<br>')}</div>`
      : '') +
    `<label class="flex items-center gap-2"><input type="checkbox" name="paid" ${paid ? 'checked' : ''}> Payment has been received</label>` +
    `<label class="block">Closed Won notes *<textarea class="inp" name="notes" rows="4" required placeholder="Payment details, reference, anything the team should know"></textarea></label>` +
    `<div class="flex justify-end gap-2"><button type="button" class="btn" onclick="$('#modal').innerHTML=''">Cancel</button><button class="btn btn-p">Mark Closed Won</button></div></form></div>`;
  $('#modal textarea').focus();
}
function confirmClosedWon(e, id) {
  e.preventDefault();
  const o = S.opps.find((x) => x.id == id),
    v = Object.fromEntries(new FormData(e.target)),
    notes = (v.notes || '').trim();
  if (!o || !isAdminOrCeo()) return toast('Only Admin or CEO can mark a deal Closed Won');
  if (!v.paid) return toast('Confirm that the payment has been received');
  if (!notes) return toast('Add Closed Won notes');
  $('#modal').innerHTML = '';
  o.lost = false;
  setStageBeforeClosedWon(o, 5);
  o.closedWon = { notes, by: roleNow().name, at: Date.now() };
  (o.f = o.f || {}).won = notes;
  logOpp(o.id, 'sync', `Closed Won by ${roleNow().name} after payment received. Notes: ${notes}`);
  save();
  render();
}
function toggleClosedStage() {
  const o = cur();
  if (!o || !isAdminOrCeo()) return toast('Only Admin or CEO can change the closed stage');
  if (o.lost) return openClosedWon(o);
  o.lost = true;
  logOpp(o.id, 'sync', `Marked Closed Lost by ${roleNow().name}`);
  save();
  toast('Marked closed lost');
  render();
}

// Sending quotes: customer email / phone on the quote, Send by email or WhatsApp, a customer link where the
// customer can view, accept and sign, view tracking, and automatic expiry.
//
// Prototype note: there is no server. Email and WhatsApp open the sender's own mail / WhatsApp with the message
// filled in, and the customer link (and its "opened" tracking) works in a browser that has this CRM's data.

// ---------- customer contact on the quote ----------
const contactsOfAccount = (acct) => S.contacts.filter((c) => c[2] === acct);
function pickQuoteContact(name) {
  const o = cur(),
    c = o && S.contacts.find((x) => x[0] === name);
  if (!c || !S.qd) return;
  S.qd.preparedFor = `${c[0]}${c[1] ? ' (' + c[1] + ')' : ''}`;
  S.qd.toEmail = c[3] || '';
  S.qd.toPhone = c[4] || '';
  render();
}
function fillQuoteFormContact(sel) {
  const c = S.contacts.find((x) => x[0] === sel.value),
    f = sel.form;
  if (!c) return;
  f.elements.preparedFor.value = `${c[0]}${c[1] ? ' (' + c[1] + ')' : ''}`;
  f.elements.toEmail.value = c[3] || '';
  f.elements.toPhone.value = c[4] || '';
}
const contactOptions = (acct, selectedName) =>
  contactsOfAccount(acct)
    .map(
      (c) =>
        `<option value="${E(c[0])}" ${c[0] === selectedName ? 'selected' : ''}>${E(c[0])}${c[1] ? ' – ' + E(c[1]) : ''}</option>`
    )
    .join('');

// ---------- links, messages ----------
const quoteToken = (q) =>
  q.token || (q.token = 'cq' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36));
const quoteLink = (q) => `${location.origin}${location.pathname}#cq/${quoteToken(q)}`;
const phoneDigits = (p) => {
  const d = String(p || '').replace(/\D/g, '');
  return d.length === 10 ? '91' + d : d; // 10-digit Indian numbers get +91
};
const quoteExpired = (q) => !q.customer && !['Paid'].includes(q.status) && q.exp && days(q.exp) < 0;
const quoteIsSendable = (q) => ['Approved', 'Sent to client', 'Paid'].includes(q.status);

function quoteMessage(q, o) {
  const co = (S.settings.company || {}).name || 'our team',
    first =
      String(q.preparedFor || '')
        .replace(/\s*\(.*\)\s*$/, '')
        .split(' ')[0] || 'there';
  return `Hello ${first},\n\nPlease find quotation ${q.no} for ${o.account}.\nTotal: ${M(quoteTotal(q))}\nValid until: ${fd(q.exp)}\n\nView, accept and sign it here:\n${quoteLink(q)}\n\nRegards,\n${roleNow().name}\n${co}`;
}

// ---------- Send modal ----------
function openSendQuote() {
  const q = S.qd,
    o = cur();
  if (!q || !o) return;
  if (!quoteIsSendable(q)) return toast('Quotes can be sent once they are approved');
  if (q.status === 'Expired' || quoteExpired(q))
    return toast('This quote has expired. Extend the expiry first');
  const ch = S.sendChan === 'whatsapp' ? 'whatsapp' : 'email';
  $('#modal').innerHTML =
    `<div class="fixed inset-0 z-40 grid place-items-center p-4" style="background:rgba(0,0,0,.5)"><form class="card p-5 w-full max-w-lg max-h-full overflow-auto space-y-3" onsubmit="doSendQuote(event)"><h2 class="text-lg font-bold">Send quotation ${E(q.no)}</h2>` +
    `<div class="flex gap-2"><button type="button" class="btn ${ch === 'email' ? 'btn-p' : ''}" onclick="S.sendChan='email';openSendQuote()"><span class="ms">mail</span>Email</button><button type="button" class="btn ${ch === 'whatsapp' ? 'btn-p' : ''}" onclick="S.sendChan='whatsapp';openSendQuote()"><span class="ms">chat</span>WhatsApp</button></div>` +
    (contactsOfAccount(o.account).length
      ? `<label class="block">Contact<select class="inp" onchange="const c=S.contacts.find(x=>x[0]===this.value);if(c){this.form.elements.to.value=${ch === 'email' ? 'c[3]' : 'c[4]'}||''}"><option value="">Choose a contact…</option>${contactOptions(o.account, '')}</select></label>`
      : '') +
    `<input type="hidden" name="chan" value="${ch}">` +
    (ch === 'email'
      ? `<label class="block">To (email) *<input class="inp" name="to" type="email" required value="${E(q.toEmail || '')}" placeholder="customer@company.com"></label><label class="block">Subject<input class="inp" name="subject" value="${E(`Quotation ${q.no} – ${o.account}`)}"></label>`
      : `<label class="block">WhatsApp number *<input class="inp" name="to" type="tel" required value="${E(q.toPhone || '')}" placeholder="+91 98765 43210"></label>`) +
    `<label class="block">Message<textarea class="inp" name="msg" rows="9">${E(quoteMessage(q, o))}</textarea></label>` +
    `<p class="mut text-xs">This opens your ${ch === 'email' ? 'email app' : 'WhatsApp'} with the message filled in. The link lets the customer view, accept and sign the quote, and you will see when it is opened.</p>` +
    `<div class="flex justify-end gap-2 flex-wrap"><button type="button" class="btn" onclick="copyQuoteLink()"><span class="ms">link</span>Copy link</button><button type="button" class="btn" onclick="$('#modal').innerHTML=''">Cancel</button><button class="btn btn-p">${ch === 'email' ? 'Open email' : 'Open WhatsApp'}</button></div></form></div>`;
  const t = $('#modal [name=to]');
  if (t && !t.value) t.focus();
}
function copyQuoteLink() {
  const q = S.qd;
  if (!q) return;
  const l = quoteLink(q);
  patchQuote(q.no, { token: q.token });
  (navigator.clipboard ? navigator.clipboard.writeText(l) : Promise.reject()).then(
    () => toast('Link copied'),
    () => prompt('Copy this link', l)
  );
}
function doSendQuote(e) {
  e.preventDefault();
  const q = S.qd,
    o = cur(),
    v = Object.fromEntries(new FormData(e.target)),
    to = (v.to || '').trim();
  if (!q || !o || !to) return;
  if (v.chan === 'email' && !/^\S+@\S+\.\S+$/.test(to)) return toast('Enter a valid email address');
  if (v.chan === 'whatsapp' && phoneDigits(to).length < 11)
    return toast('Enter the number with country code');
  const url =
    v.chan === 'email'
      ? `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(v.subject || '')}&body=${encodeURIComponent(v.msg || '')}`
      : `https://wa.me/${phoneDigits(to)}?text=${encodeURIComponent(v.msg || '')}`;
  const sends = [...(q.sends || []), { channel: v.chan, to, at: Date.now(), by: roleNow().name }];
  patchQuote(q.no, {
    token: quoteToken(q),
    sends,
    sentAt: Date.now(),
    ...(v.chan === 'email' ? { toEmail: to } : { toPhone: to }),
  });
  logOpp(
    o.id,
    v.chan === 'email' ? 'mail' : 'sync',
    `Quote ${q.no} sent to ${to} by ${v.chan === 'email' ? 'email' : 'WhatsApp'} (${roleNow().name})`
  );
  $('#modal').innerHTML = '';
  const a = document.createElement('a');
  a.href = url;
  a.target = '_blank';
  a.rel = 'noopener';
  document.body.appendChild(a);
  a.click();
  a.remove();
  toast(`Quote ready to send by ${v.chan === 'email' ? 'email' : 'WhatsApp'} to ${to}`);
  render();
}

// ---------- toolbar: Send, status chips, extend ----------
function sendQuoteChips(q) {
  const last = (q.sends || []).slice(-1)[0],
    views = (q.views || []).length,
    cs = q.customer;
  return (
    (last
      ? `<span class="chip ok" title="${E(last.to)}">Sent by ${last.channel === 'email' ? 'email' : 'WhatsApp'} to ${E(last.to)} · ${ago(last.at)}</span>`
      : '') +
    (views
      ? `<span class="chip ${cs ? 'ok' : ''}">Opened ${views}× · last ${ago(q.views[views - 1].at)}</span>`
      : last
        ? '<span class="chip">Not opened yet</span>'
        : '') +
    (cs
      ? `<span class="chip ${cs.status === 'Accepted' ? 'ok' : 'wr'}">Customer ${E(cs.status.toLowerCase())}${cs.name ? ' · ' + E(cs.name) : ''}</span>`
      : '') +
    (q.status === 'Expired' || quoteExpired(q) ? '<span class="chip wr">Expired</span>' : '')
  );
}
const quoteToolbarBeforeSend = quoteToolbar;
quoteToolbar = function (q) {
  let html = quoteToolbarBeforeSend.apply(this, arguments);
  const send = `<button class="btn" ${quoteIsSendable(q) ? '' : 'disabled'} title="${quoteIsSendable(q) ? 'Send by email or WhatsApp' : 'Quotes can be sent once approved'}" onclick="openSendQuote()"><span class="ms">send</span>Send</button>`,
    extend =
      (q.status === 'Expired' || quoteExpired(q)) && S.role !== 'rep'
        ? `<button class="btn btn-p" onclick="extendQuote()"><span class="ms">event_repeat</span>Extend expiry</button>`
        : '';
  html = html.replace(
    '<span class="ms">print</span>Print / PDF</button>',
    '<span class="ms">print</span>Print / PDF</button>' + send + extend
  );
  return html.replace(
    '<span class="flex-1"></span>',
    sendQuoteChips(q) + '<span class="flex-1"></span>'
  );
};
function extendQuote() {
  const q = S.qd;
  if (!q || S.role === 'rep') return toast('Only Admin or CEO can extend an expired quote');
  const exp = D(quoteDefaultsSetting().validityDays);
  const patch = { exp };
  if (q.status === 'Expired')
    patch.status = ['Approved', 'Sent to client'].includes(q.prevStatus) ? q.prevStatus : 'Draft';
  patchQuote(q.no, patch);
  const rec = S.quotes.find((x) => x.no === q.no);
  if (rec) addQuoteHistory(rec, 'Extended', `Expiry moved to ${fd(exp)} by ${roleNow().name}`);
  save();
  toast('Expiry extended to ' + fd(exp));
  render();
}

// ---------- the quick contact picker + email fields in the quote form ----------
const quoteDefaultsBeforeSend = quoteDefaults;
quoteDefaults = function (q, o) {
  const d = quoteDefaultsBeforeSend.apply(this, arguments),
    name = String(d.preparedFor || '').replace(/\s*\(.*\)\s*$/, ''),
    c =
      S.contacts.find((x) => x[2] === o.account && x[0] === name) ||
      contactsOfAccount(o.account)[0];
  d.toEmail = q.toEmail ?? (c ? c[3] || '' : '');
  d.toPhone = q.toPhone ?? (c ? c[4] || '' : '');
  return d;
};

// ---------- automatic expiry ----------
function expireQuotes() {
  let changed = false;
  S.quotes.forEach((q) => {
    if (!q.exp || days(q.exp) >= 0) return;
    if (q.isDefault) {
      q.exp = D(quoteDefaultsSetting().validityDays); // an untouched default quote never expires
      changed = true;
    } else if (['Draft', 'Rejected'].includes(q.status) || String(q.status).startsWith('Pending')) {
      q.prevStatus = q.status;
      q.status = 'Expired';
      addQuoteHistory(q, 'Expired', `Validity ended on ${fd(q.exp)}`);
      changed = true;
    }
  });
  if (changed) save();
}
const renderBeforeExpiry = render;
render = function () {
  expireQuotes();
  return renderBeforeExpiry.apply(this, arguments);
};
const navBeforeExpiry = nav;
nav = function () {
  expireQuotes();
  return navBeforeExpiry.apply(this, arguments);
};
expireQuotes();

// ---------- customer page (#cq/<token>) ----------
const customerRoute = () => /^#cq\//.test(location.hash);
const quoteByToken = (t) => S.quotes.find((q) => q.token && q.token === t);

function trackQuoteView(q) {
  const k = 'cqv-' + q.token;
  try {
    if (sessionStorage.getItem(k) && Date.now() - +sessionStorage.getItem(k) < 30 * 60e3) return;
    sessionStorage.setItem(k, String(Date.now()));
  } catch (e) {}
  const first = !(q.views || []).length;
  q.views = [...(q.views || []), { at: Date.now() }].slice(-200);
  q.firstViewedAt = q.firstViewedAt || Date.now();
  const o = S.opps.find((x) => x.id == q.opp);
  if (o) logOpp(o.id, 'sync', `Customer opened quote ${q.no}${first ? ' for the first time' : ''}`);
  if (first) {
    const creator = S.users.find((u) => u.name === q.createdBy);
    queuePopup({
      kind: 'cq-viewed',
      no: q.no,
      toUser: creator ? creator.id : undefined,
      toRole: creator ? undefined : 'admin',
      by: 'customer',
    });
  }
  save();
}
function renderCustomerQuote() {
  document.body.classList.add('cq-mode');
  const h = document.querySelector('header');
  if (h) h.style.display = 'none';
  const app = $('#app');
  app.className = 'min-h-screen p-3 md:p-6 max-w-3xl mx-auto';
  const q = quoteByToken(location.hash.slice(4)),
    co = S.settings.company || {};
  if (!q) {
    app.innerHTML = `<div class="card p-6 text-center"><h1 class="text-xl font-bold">Link not valid</h1><p class="mut mt-2">This quotation link is not valid. Please ask the sender for a new one.</p></div>`;
    return;
  }
  trackQuoteView(q);
  const o = S.opps.find((x) => x.id == q.opp) || {},
    expired = q.status === 'Expired' || quoteExpired(q),
    cs = q.customer,
    banner = cs
      ? `<div class="qt-banner ${cs.status === 'Accepted' ? 'ok' : 'wr'}"><span class="ms">${cs.status === 'Accepted' ? 'verified' : 'info'}</span><div><b>You ${cs.status.toLowerCase()} this quotation</b><div>${E(cs.name || '')} · ${whenText(cs.at)}</div>${cs.reason ? `<div>Reason: ${E(cs.reason)}</div>` : ''}</div></div>`
      : expired
        ? `<div class="qt-banner wr"><span class="ms">event_busy</span><div><b>This quotation has expired</b><div>It was valid until ${fd(q.exp)}. Please contact us for an updated quote.</div></div></div>`
        : !quoteIsSendable(q)
          ? `<div class="qt-banner wr"><span class="ms">hourglass_top</span><div><b>This quotation is not available yet</b></div></div>`
          : '';
  const actions =
    !cs && !expired && quoteIsSendable(q)
      ? `<form class="card p-4 mt-3 space-y-3" onsubmit="customerRespond(event,'${E(q.token)}','Accepted')"><b>Accept and sign</b><label class="block">Your full name (as signature) *<input class="inp" name="name" required value="${E(String(q.preparedFor || '').replace(/\s*\(.*\)\s*$/, ''))}"></label><label class="flex items-start gap-2"><input type="checkbox" name="agree" required class="mt-1"> <span>I accept this quotation and its terms &amp; conditions.</span></label><div class="flex gap-2 flex-wrap"><button class="btn btn-p">Accept &amp; sign</button><button type="button" class="btn" style="color:var(--err)" onclick="customerDecline('${E(q.token)}')">Decline</button></div></form>`
      : '';
  app.innerHTML =
    `<div class="card p-4 md:p-6"><div class="flex justify-between gap-3 flex-wrap"><div><div class="mut text-xs">${E(co.name || 'Quotation')}</div><h1 class="text-xl font-bold">Quotation ${E(q.no)}</h1><div class="mut">${E(q.name || '')}</div></div><div class="text-right"><div class="mut text-xs">Valid until</div><b>${fd(q.exp)}</b></div></div>${banner ? `<div class="mt-3">${banner}</div>` : ''}` +
    `<div class="grid sm:grid-cols-2 gap-3 mt-4 text-sm"><div><div class="mut text-xs">Prepared for</div><b>${E(q.preparedFor || o.account || '')}</b><div class="mut">${E(o.account || '')}</div></div><div><div class="mut text-xs">Billing address</div><div style="white-space:pre-wrap">${E(q.address || '–')}</div><div class="mut text-xs mt-2">Shipping address</div><div style="white-space:pre-wrap">${E(q.shipping || '–')}</div></div></div>` +
    `<div class="my-4 overflow-x-auto">${billLinesTable(q.items, !!q.showDiscount)}</div><div class="text-right text-lg font-bold">Grand total ${M(quoteTotal(q))}</div>` +
    `<div class="mt-4"><b>Terms &amp; conditions</b><div style="white-space:pre-wrap" class="text-sm">${E(effectiveTnc(q))}</div></div></div>${actions}`;
}
function customerRespond(e, token, status) {
  e.preventDefault();
  const q = quoteByToken(token),
    v = Object.fromEntries(new FormData(e.target));
  if (!q || q.customer || q.status === 'Expired' || quoteExpired(q)) return;
  q.customer = { status, name: (v.name || '').trim(), at: Date.now() };
  if (status === 'Accepted') {
    q.signedBy = q.customer.name;
    q.signedAt = q.customer.at;
  }
  addQuoteHistory(q, 'Customer ' + status.toLowerCase(), q.customer.name);
  const o = S.opps.find((x) => x.id == q.opp);
  if (o)
    logOpp(o.id, 'sync', `Customer ${status.toLowerCase()} quote ${q.no} (${q.customer.name})`);
  const creator = S.users.find((u) => u.name === q.createdBy);
  queuePopup({
    kind: status === 'Accepted' ? 'cq-accepted' : 'cq-declined',
    no: q.no,
    toUser: creator ? creator.id : undefined,
    toRole: creator ? undefined : 'admin',
    by: 'customer',
  });
  if (creator && creator.role === 'rep')
    queuePopup({
      kind: status === 'Accepted' ? 'cq-accepted' : 'cq-declined',
      no: q.no,
      toRole: 'admin',
      by: 'customer',
    });
  save();
  renderCustomerQuote();
}
function customerDecline(token) {
  const reason = (prompt('Reason for declining (optional)') || '').trim(),
    q = quoteByToken(token);
  if (!q || q.customer || q.status === 'Expired' || quoteExpired(q)) return;
  q.customer = { status: 'Declined', name: '', at: Date.now(), reason };
  addQuoteHistory(q, 'Customer declined', reason);
  const o = S.opps.find((x) => x.id == q.opp);
  if (o) logOpp(o.id, 'sync', `Customer declined quote ${q.no}${reason ? ': ' + reason : ''}`);
  const creator = S.users.find((u) => u.name === q.createdBy);
  queuePopup({
    kind: 'cq-declined',
    no: q.no,
    toUser: creator ? creator.id : undefined,
    toRole: creator ? undefined : 'admin',
    by: 'customer',
  });
  save();
  renderCustomerQuote();
}
// popups for the sales team about what the customer did
function showCqPopup(p) {
  const q = quoteOf(p.no);
  if (!q) return;
  const accepted = p.kind === 'cq-accepted',
    viewed = p.kind === 'cq-viewed';
  showPopup({
    tone: accepted ? 'ok' : viewed ? 'wr' : 'err',
    icon: accepted ? 'verified' : viewed ? 'visibility' : 'cancel',
    title: viewed
      ? `Customer opened quote ${E(q.no)}`
      : `Customer ${accepted ? 'accepted' : 'declined'} quote ${E(q.no)}`,
    lines: viewed
      ? [`${E(q.preparedFor || 'The customer')} just opened the quotation you sent.`]
      : [
          q.customer ? `${E(q.customer.name || '')} · ${whenText(q.customer.at)}` : '',
          q.customer && q.customer.reason ? `Reason: ${E(q.customer.reason)}` : '',
        ],
    actions: [{ label: 'Open quote', js: `openQuoteRecord('${E(q.no)}')` }],
  });
}
function applyCustomerRoute() {
  if (customerRoute()) renderCustomerQuote();
  else if (document.body.classList.contains('cq-mode')) {
    document.body.classList.remove('cq-mode');
    $('#app').className = 'p-3 md:p-4 max-w-[1500px] mx-auto';
    render();
  }
}
addEventListener('hashchange', applyCustomerRoute); // runs after the app's own hashchange renderers
setTimeout(applyCustomerRoute, 0);

// Price book: configurable volume tiers (global, with optional per-product override), bundles,
// and minimum / maximum selling price per product. Admin and CEO manage it in Settings → Price book.

const DEFAULT_TIERS = [
  { min: 2, pct: 5 },
  { min: 4, pct: 10 },
];
function priceBook() {
  const st = S.settings || (S.settings = {});
  if (!st.priceBook) st.priceBook = { tiers: DEFAULT_TIERS.map((t) => ({ ...t })), bundles: [] };
  if (!st.priceBook.tiers) st.priceBook.tiers = DEFAULT_TIERS.map((t) => ({ ...t }));
  if (!st.priceBook.bundles) st.priceBook.bundles = [];
  return st.priceBook;
}
const canManagePriceBook = () => ['admin', 'ceo'].includes(S.role);
const cleanTiers = (arr) =>
  (arr || [])
    .map((t) => ({ min: Math.floor(+t.min), pct: Math.round(+t.pct * 10) / 10 }))
    .filter((t) => t.min >= 2 && t.pct >= 0 && t.pct <= 100)
    .sort((a, b) => a.min - b.min);
function tiersFor(code) {
  const p = S.products.find((x) => x.code === code);
  return p && p.tiers && p.tiers.length ? cleanTiers(p.tiers) : cleanTiers(priceBook().tiers);
}
function tierPct(code, qty) {
  let pct = 0;
  tiersFor(code).forEach((t) => {
    if (qty >= t.min) pct = t.pct;
  });
  return pct;
}
// the biggest discount that still keeps the unit price at or above the product's minimum price
function maxDiscountFor(code, listPrice) {
  const p = S.products.find((x) => x.code === code);
  if (!p || !p.minPrice || !listPrice) return 100;
  return Math.max(0, Math.floor((1 - p.minPrice / listPrice) * 1000) / 10);
}

// Replaces the fixed 5% / 10% tiers.
applyTieredDiscount = function () {
  if (!canGiveDiscount()) return toast('Only Admin and CEO can give discounts');
  let capped = 0;
  S.qd.items.forEach((i) => {
    if (i.bundle) return; // bundle lines keep their bundle price
    const want = tierPct(i.c, i.q),
      cap = maxDiscountFor(i.c, i.p);
    i.d = Math.min(want, cap);
    if (want > cap) capped++;
  });
  toast('Volume tiers applied' + (capped ? ` · ${capped} line(s) held at the minimum price` : ''));
  render();
};

function addQuoteBundle(id) {
  const b = priceBook().bundles.find((x) => x.id === id);
  if (!b || !S.qd) return;
  b.items.forEach((bi) => {
    const p = S.products.find((x) => x.code === bi.c);
    if (!p) return;
    const pct = Math.min(+b.pct || 0, maxDiscountFor(p.code, p.listPrice)),
      ex = S.qd.items.find((i) => i.c === p.code && i.bundle === b.name);
    if (ex) ex.q += bi.q;
    else S.qd.items.push({ n: p.name, c: p.code, p: p.listPrice, q: bi.q, d: pct, bundle: b.name });
  });
  toast(`Bundle “${b.name}” added`);
  render();
}
const quoteLinesCardBeforePB = quoteLinesCard;
quoteLinesCard = function (q) {
  let html = quoteLinesCardBeforePB.apply(this, arguments);
  const bundles = priceBook().bundles.filter((b) => b.active !== false);
  if (bundles.length && html.includes('onclick="calculateQuotePricing()"'))
    html = html.replace(
      '<button class="btn qt-tool" onclick="calculateQuotePricing()"',
      `<select class="btn qt-tool" aria-label="Add bundle" onchange="addQuoteBundle(this.value);this.value=''"><option value="">+ Add Bundle</option>${bundles.map((b) => `<option value="${E(b.id)}">${E(b.name)} (${b.pct}% off)</option>`).join('')}</select><button class="btn qt-tool" onclick="calculateQuotePricing()"`
    );
  return html;
};
const quoteLineRowsBeforePB = quoteLineRows;
quoteLineRows = function () {
  const q = arguments[0];
  let html = quoteLineRowsBeforePB.apply(this, arguments);
  // tag bundle lines under the product name
  q.items.forEach((i) => {
    if (i.bundle)
      html = html.replace(
        `<b class="qt-link">${E(i.n)}</b>`,
        `<b class="qt-link">${E(i.n)}</b> <span class="chip">Bundle: ${E(i.bundle)}</span>`
      );
  });
  return html;
};

// ---------- settings ----------
const SETTINGS_SECTIONS_BeforePB = SETTINGS_SECTIONS;
SETTINGS_SECTIONS = function () {
  const base = SETTINGS_SECTIONS_BeforePB.apply(this, arguments),
    ix = base.findIndex((s) => s[0] === 'limits');
  if (S.role !== 'rep' && !base.some((s) => s[0] === 'pricebook'))
    base.splice(ix < 0 ? base.length : ix, 0, ['pricebook', 'Price book', 'sell']);
  return base;
};
const tiersText = (arr) =>
  cleanTiers(arr)
    .map((t) => `${t.min}:${t.pct}`)
    .join(', ');
const parseTiersText = (s) =>
  cleanTiers(
    String(s || '')
      .split(/[,;\n]/)
      .map((x) => x.split(':'))
      .filter((a) => a.length === 2)
      .map(([m, p]) => ({ min: m, pct: p }))
  );
function pbTierRows() {
  const t = priceBook().tiers;
  return t
    .map(
      (r, k) =>
        `<tr><td><input class="inp" type="number" min="2" value="${r.min}" aria-label="From quantity" onchange="pbSetTier(${k},'min',this.value)"></td><td><input class="inp" type="number" min="0" max="100" step="0.1" value="${r.pct}" aria-label="Discount percent" onchange="pbSetTier(${k},'pct',this.value)"></td><td><button class="btn" onclick="pbDelTier(${k})" aria-label="Remove tier"><span class="ms">delete</span></button></td></tr>`
    )
    .join('');
}
function pbSetTier(k, f, v) {
  if (!canManagePriceBook()) return;
  const t = priceBook().tiers[k];
  if (!t) return;
  t[f] = +v;
  save();
  render();
}
function pbAddTier() {
  if (!canManagePriceBook()) return;
  const t = priceBook().tiers,
    last = t.length ? Math.max(...t.map((x) => +x.min || 0)) : 1;
  t.push({ min: last + 2, pct: 0 });
  save();
  render();
}
function pbDelTier(k) {
  if (!canManagePriceBook()) return;
  priceBook().tiers.splice(k, 1);
  save();
  render();
}
function pbSaveTiers() {
  if (!canManagePriceBook()) return;
  const pb = priceBook(),
    clean = cleanTiers(pb.tiers);
  if (clean.length !== pb.tiers.length)
    return toast('Each tier needs a quantity of 2 or more and a discount of 0–100%');
  const qs = clean.map((t) => t.min);
  if (new Set(qs).size !== qs.length) return toast('Two tiers cannot start at the same quantity');
  pb.tiers = clean;
  save();
  toast('Volume tiers saved');
  render();
}
function pbSetProduct(code, f, v) {
  if (!canManagePriceBook()) return;
  const p = S.products.find((x) => x.code === code);
  if (!p) return;
  const n = f === 'tiers' ? parseTiersText(v) : +v;
  const next = { ...p, [f]: n };
  if (
    f !== 'tiers' &&
    !(next.minPrice > 0 && next.minPrice <= next.listPrice && next.listPrice <= next.maxPrice)
  ) {
    toast('Prices must satisfy minimum ≤ list ≤ maximum');
    return render();
  }
  Object.assign(p, next);
  if (f === 'tiers' && !n.length) delete p.tiers;
  save();
  toast('Price book updated');
  render();
}
function openBundleForm(id = '') {
  if (!canManagePriceBook()) return toast('Only Admin and CEO can manage bundles');
  const b = priceBook().bundles.find((x) => x.id === id) || {},
    qty = (c) => (b.items || []).find((i) => i.c === c)?.q || 0;
  $('#modal').innerHTML =
    `<div class="fixed inset-0 z-40 grid place-items-center p-4" style="background:rgba(0,0,0,.5)"><form class="card p-5 w-full max-w-lg max-h-full overflow-auto space-y-3" onsubmit="saveBundle(event,'${E(id)}')"><h2 class="text-lg font-bold">${id ? 'Edit' : 'New'} bundle</h2>` +
    `<label class="block">Bundle name *<input class="inp" name="name" required value="${E(b.name || '')}"></label>` +
    `<label class="block">Bundle discount % *<input class="inp" name="pct" type="number" min="0" max="100" step="0.1" required value="${b.pct ?? 10}"></label>` +
    `<div><b>Products and quantity</b><div class="grid gap-1 mt-1">${S.products
      .filter((p) => p.active !== false)
      .map(
        (p) =>
          `<label class="flex items-center gap-2"><input class="inp" style="width:80px" type="number" min="0" name="q_${E(p.code)}" value="${qty(p.code)}"><span>${E(p.name)} <span class="mut text-xs">${E(p.code)} · ${M(p.listPrice)}</span></span></label>`
      )
      .join(
        ''
      )}</div><p class="mut text-xs">Leave the quantity at 0 to leave a product out.</p></div>` +
    `<label class="flex items-center gap-2"><input type="checkbox" name="active" ${b.active !== false ? 'checked' : ''}> Available on quotes</label>` +
    `<div class="flex justify-end gap-2"><button type="button" class="btn" onclick="$('#modal').innerHTML=''">Cancel</button><button class="btn btn-p">Save bundle</button></div></form></div>`;
}
function saveBundle(e, id) {
  e.preventDefault();
  if (!canManagePriceBook()) return;
  const fd_ = new FormData(e.target),
    name = (fd_.get('name') || '').trim(),
    pct = Math.round(+fd_.get('pct') * 10) / 10,
    items = S.products
      .map((p) => ({ c: p.code, q: Math.floor(+fd_.get('q_' + p.code) || 0) }))
      .filter((i) => i.q > 0);
  if (!name) return toast('Name the bundle');
  if (items.length < 2) return toast('A bundle needs at least two products');
  if (!(pct >= 0 && pct <= 100)) return toast('Discount must be 0–100%');
  const pb = priceBook();
  if (pb.bundles.some((b) => b.name.toLowerCase() === name.toLowerCase() && b.id !== id))
    return toast('A bundle with this name already exists');
  const rec = {
    id: id || 'b' + Date.now().toString(36),
    name,
    pct,
    items,
    active: !!fd_.get('active'),
  };
  const ix = pb.bundles.findIndex((b) => b.id === id);
  if (ix >= 0) pb.bundles[ix] = rec;
  else pb.bundles.push(rec);
  $('#modal').innerHTML = '';
  save();
  toast('Bundle saved');
  render();
}
function deleteBundle(id) {
  if (!canManagePriceBook()) return;
  const pb = priceBook();
  pb.bundles = pb.bundles.filter((b) => b.id !== id);
  save();
  render();
}
SETTINGS_PANELS.pricebook = function () {
  const ok = canManagePriceBook(),
    pb = priceBook(),
    dis = ok ? '' : 'disabled';
  const bundleList = pb.bundles.length
    ? pb.bundles
        .map((b) => {
          const list = b.items.reduce(
            (s, i) => s + ((S.products.find((p) => p.code === i.c) || {}).listPrice || 0) * i.q,
            0
          );
          return `<tr><td><b>${E(b.name)}</b>${b.active === false ? ' <span class="chip">Off</span>' : ''}</td><td>${b.items.map((i) => `${i.q}× ${E(i.c)}`).join(', ')}</td><td class="text-right">${b.pct}%</td><td class="text-right">${M(list * (1 - b.pct / 100))}</td><td class="text-right">${ok ? `<button class="btn" onclick="openBundleForm('${E(b.id)}')">Edit</button> <button class="btn" onclick="deleteBundle('${E(b.id)}')" aria-label="Delete bundle"><span class="ms">delete</span></button>` : ''}</td></tr>`;
        })
        .join('')
    : '<tr><td colspan="5" class="mut">No bundles yet</td></tr>';
  const prodRows = S.products
    .map(
      (p) =>
        `<tr><td><b>${E(p.name)}</b><div class="mut text-xs">${E(p.code)}</div></td><td><input class="inp" type="number" min="0.01" step="0.01" value="${p.minPrice}" ${dis} aria-label="Minimum price" onchange="pbSetProduct('${E(p.code)}','minPrice',this.value)"></td><td><input class="inp" type="number" min="0.01" step="0.01" value="${p.listPrice}" ${dis} aria-label="List price" onchange="pbSetProduct('${E(p.code)}','listPrice',this.value)"></td><td><input class="inp" type="number" min="0.01" step="0.01" value="${p.maxPrice}" ${dis} aria-label="Maximum price" onchange="pbSetProduct('${E(p.code)}','maxPrice',this.value)"></td><td><input class="inp" placeholder="uses global tiers" value="${E(tiersText(p.tiers))}" ${dis} aria-label="Product tiers" onchange="pbSetProduct('${E(p.code)}','tiers',this.value)"></td></tr>`
    )
    .join('');
  return (
    secHead('sell', 'Price book', 'Volume tiers, bundles and price limits used on every quote.') +
    (ok ? '' : '<p class="mut">Only Admin and CEO can change the price book.</p>') +
    `<h3 class="font-bold mt-2">Volume tiers (all products)</h3><p class="mut text-xs mb-2">Used by “Apply Tiered Discount”. A line gets the discount of the highest tier its quantity reaches, but never below the product's minimum price.</p><div class="overflow-x-auto"><table class="w-full"><thead><tr><th class="text-left">From quantity</th><th class="text-left">Discount %</th><th></th></tr></thead><tbody>${pbTierRows()}</tbody></table></div>${ok ? '<div class="flex gap-2 mt-2"><button class="btn" onclick="pbAddTier()"><span class="ms">add</span>Add tier</button><button class="btn btn-p" onclick="pbSaveTiers()">Save tiers</button></div>' : ''}` +
    `<h3 class="font-bold mt-5">Bundles</h3><div class="overflow-x-auto"><table class="w-full"><thead><tr><th class="text-left">Name</th><th class="text-left">Contents</th><th class="text-right">Discount</th><th class="text-right">Bundle price</th><th></th></tr></thead><tbody>${bundleList}</tbody></table></div>${ok ? '<button class="btn mt-2" onclick="openBundleForm()"><span class="ms">add</span>New bundle</button>' : ''}` +
    `<h3 class="font-bold mt-5">Price limits &amp; product tiers</h3><p class="mut text-xs mb-2">Minimum ≤ list ≤ maximum. Type tiers for one product as <code>quantity:percent</code>, e.g. <code>3:8, 10:15</code>. Leave empty to use the global tiers.</p><div class="overflow-x-auto"><table class="w-full"><thead><tr><th class="text-left">Product</th><th class="text-left">Min ₹</th><th class="text-left">List ₹</th><th class="text-left">Max ₹</th><th class="text-left">Tiers</th></tr></thead><tbody>${prodRows}</tbody></table></div>`
  );
};

// Product cart on the quote: pick several products with quantities, review the cart, then add it all to the quote.

S.cart = S.cart || {};
const cartCount = () => Object.values(S.cart).reduce((a, n) => a + n, 0);
const cartTotal = () =>
  Object.entries(S.cart).reduce((a, [c, n]) => a + ((S.products.find((p) => p.code === c) || {}).listPrice || 0) * n, 0);

const quoteLinesCardBeforeCart = quoteLinesCard;
quoteLinesCard = function () {
  let html = quoteLinesCardBeforeCart.apply(this, arguments);
  const mark = '<button class="btn qt-tool" onclick="calculateQuotePricing()"';
  if (html.includes(mark))
    html = html.replace(
      mark,
      `<button class="btn qt-tool" onclick="openCart()"><span class="ms">shopping_cart</span>Cart${cartCount() ? ` <span class="chip ok">${cartCount()}</span>` : ''}</button>` + mark
    );
  return html;
};
function openCart() {
  const q = S.qd;
  if (!q || !['Draft', 'Rejected'].includes(q.status)) return toast('Open a draft quote to use the cart');
  const term = (S.cartQ || '').toLowerCase(),
    prods = S.products.filter((p) => p.active !== false && (!term || (p.name + ' ' + p.code).toLowerCase().includes(term))),
    rows = prods
      .map(
        (p) =>
          `<div class="flex items-center gap-2 py-2" style="border-bottom:1px solid var(--bd)"><div class="flex-1 min-w-0"><b>${E(p.name)}</b><div class="mut text-xs">${E(p.code)} · ${M(p.listPrice)}</div></div><button class="btn" aria-label="Less" onclick="cartSet('${E(p.code)}',${(S.cart[p.code] || 0) - 1})">−</button><input class="inp" style="width:64px;text-align:center" type="number" min="0" value="${S.cart[p.code] || 0}" aria-label="Quantity of ${E(p.name)}" onchange="cartSet('${E(p.code)}',this.value)"><button class="btn" aria-label="More" onclick="cartSet('${E(p.code)}',${(S.cart[p.code] || 0) + 1})">+</button></div>`
      )
      .join('') || '<p class="mut py-3">No products match.</p>',
    lines = Object.entries(S.cart)
      .map(([c, n]) => {
        const p = S.products.find((x) => x.code === c);
        return p ? `<div class="flex justify-between gap-2 text-sm py-1"><span>${n} × ${E(p.name)}</span><span>${M(p.listPrice * n)}</span></div>` : '';
      })
      .join('');
  $('#modal').innerHTML =
    `<div class="fixed inset-0 z-40 grid place-items-center p-4" style="background:rgba(0,0,0,.5)"><div class="card p-5 w-full max-w-2xl max-h-full overflow-auto"><div class="flex items-center gap-2"><span class="ms" style="color:var(--pr)">shopping_cart</span><h2 class="text-lg font-bold flex-1">Cart for ${E(q.no)}</h2><button class="btn" aria-label="Close" onclick="$('#modal').innerHTML=''"><span class="ms">close</span></button></div>` +
    `<input class="inp mt-3" type="search" placeholder="Search products" value="${E(S.cartQ || '')}" oninput="S.cartQ=this.value;openCart();const i=$('#modal input[type=search]');i.focus();i.setSelectionRange(i.value.length,i.value.length)">` +
    `<div class="mt-2" style="max-height:34vh;overflow:auto">${rows}</div>` +
    `<div class="mt-3 p-3 rounded" style="background:var(--hov)"><b>In your cart (${cartCount()})</b>${lines || '<div class="mut text-sm">Nothing yet. Use + to add products.</div>'}<div class="flex justify-between font-bold mt-1"><span>Cart total (list price)</span><span>${M(cartTotal())}</span></div></div>` +
    `<div class="flex justify-end gap-2 mt-3 flex-wrap"><button class="btn" ${cartCount() ? '' : 'disabled'} onclick="cartClear()">Empty cart</button><button class="btn btn-p" ${cartCount() ? '' : 'disabled'} onclick="cartToQuote()"><span class="ms">add_shopping_cart</span>Add to quote</button></div></div></div>`;
}
function cartSet(code, n) {
  n = Math.max(0, Math.floor(+n || 0));
  if (n) S.cart[code] = n;
  else delete S.cart[code];
  save();
  openCart();
}
function cartClear() {
  S.cart = {};
  save();
  openCart();
}
function cartToQuote() {
  const q = S.qd;
  if (!q || !['Draft', 'Rejected'].includes(q.status) || !cartCount()) return;
  let n = 0;
  Object.entries(S.cart).forEach(([c, qty]) => {
    const p = S.products.find((x) => x.code === c);
    if (!p) return;
    const ex = q.items.find((i) => i.c === c && !i.bundle);
    if (ex) ex.q += qty;
    else q.items.push({ n: p.name, c: p.code, p: p.listPrice, q: qty, d: 0 });
    n += qty;
  });
  S.cart = {};
  S.cartQ = '';
  $('#modal').innerHTML = '';
  save();
  toast(`${n} item${n === 1 ? '' : 's'} added to the quote`);
  render();
}

// Billing: GST-ready invoices, partial payments and balance due, overdue reminders,
// invoice PDF (print), and the Close Won prompt once an invoice is paid in full.

// ---------- company & GST settings ----------
const INDIAN_STATES = {
  '01': 'Jammu & Kashmir',
  '02': 'Himachal Pradesh',
  '03': 'Punjab',
  '04': 'Chandigarh',
  '05': 'Uttarakhand',
  '06': 'Haryana',
  '07': 'Delhi',
  '08': 'Rajasthan',
  '09': 'Uttar Pradesh',
  10: 'Bihar',
  11: 'Sikkim',
  12: 'Arunachal Pradesh',
  13: 'Nagaland',
  14: 'Manipur',
  15: 'Mizoram',
  16: 'Tripura',
  17: 'Meghalaya',
  18: 'Assam',
  19: 'West Bengal',
  20: 'Jharkhand',
  21: 'Odisha',
  22: 'Chhattisgarh',
  23: 'Madhya Pradesh',
  24: 'Gujarat',
  26: 'Dadra & Nagar Haveli and Daman & Diu',
  27: 'Maharashtra',
  29: 'Karnataka',
  30: 'Goa',
  31: 'Lakshadweep',
  32: 'Kerala',
  33: 'Tamil Nadu',
  34: 'Puducherry',
  35: 'Andaman & Nicobar',
  36: 'Telangana',
  37: 'Andhra Pradesh',
  38: 'Ladakh',
};
const GSTIN_RX = /^\d{2}[A-Z]{5}\d{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;
const stateOfGstin = (g) => INDIAN_STATES[String(g || '').slice(0, 2)] || '';
const stateOptions = (sel) =>
  `<option value="">Select state…</option>` +
  Object.values(INDIAN_STATES)
    .sort()
    .map((s) => `<option ${s === sel ? 'selected' : ''}>${E(s)}</option>`)
    .join('');
function companyInfo() {
  S.settings = S.settings || {};
  const c = S.settings.company || (S.settings.company = {});
  if (c.defaultGst === undefined) c.defaultGst = 18;
  if (!c.priceMode) c.priceMode = 'inclusive';
  if (c.gstEnabled === undefined) c.gstEnabled = true;
  if (c.reminderEveryDays === undefined) c.reminderEveryDays = 3;
  return c;
}
const canManageBilling = () => ['admin', 'ceo'].includes(S.role);

SETTINGS_PANELS.company = function () {
  const c = companyInfo(),
    ok = canManageBilling(),
    dis = ok ? '' : 'disabled',
    f = (label, name, val, extra = '') =>
      settingsField(
        label,
        `<input class="inp" name="${name}" value="${E(val || '')}" ${dis} ${extra}>`
      );
  return (
    secHead(
      'receipt_long',
      'Company & GST',
      'Printed on every invoice. Needed for GST-ready tax invoices.'
    ) +
    `<form class="grid md:grid-cols-2 gap-3" onsubmit="saveCompany(event)">` +
    f('Company name *', 'name', c.name, 'required') +
    f(
      'GSTIN',
      'gstin',
      c.gstin,
      'maxlength="15" placeholder="27ABCDE1234F1Z5" style="text-transform:uppercase"'
    ) +
    f('PAN', 'pan', c.pan, 'maxlength="10"') +
    settingsField(
      'State (place of supply for your business) *',
      `<select class="inp" name="state" ${dis}>${stateOptions(c.state)}</select>`
    ) +
    `<div class="md:col-span-2">${settingsField('Registered address', `<textarea class="inp" name="address" rows="3" ${dis}>${E(c.address || '')}</textarea>`)}</div>` +
    f('Email', 'email', c.email, 'type="email"') +
    f('Phone', 'phone', c.phone) +
    settingsField(
      'GST on invoices',
      `<select class="inp" name="gstEnabled" ${dis}><option value="yes" ${c.gstEnabled ? 'selected' : ''}>Charge GST</option><option value="no" ${!c.gstEnabled ? 'selected' : ''}>No GST (plain invoice)</option></select>`
    ) +
    settingsField(
      'Default GST rate % (when a product has none)',
      `<input class="inp" name="defaultGst" type="number" min="0" max="40" step="0.01" value="${c.defaultGst}" ${dis}>`
    ) +
    settingsField(
      'Prices on quotes are',
      `<select class="inp" name="priceMode" ${dis}><option value="inclusive" ${c.priceMode === 'inclusive' ? 'selected' : ''}>GST inclusive (invoice total = quote total)</option><option value="exclusive" ${c.priceMode === 'exclusive' ? 'selected' : ''}>GST exclusive (GST added on top)</option></select>`
    ) +
    settingsField(
      'Remind about overdue invoices every (days)',
      `<input class="inp" name="reminderEveryDays" type="number" min="1" max="60" value="${c.reminderEveryDays}" ${dis}>`
    ) +
    `<div class="md:col-span-2">${settingsField('Bank details (shown on invoice)', `<textarea class="inp" name="bank" rows="3" ${dis} placeholder="Bank, A/c no., IFSC, UPI">${E(c.bank || '')}</textarea>`)}</div>` +
    (ok
      ? `<div class="md:col-span-2 flex justify-end"><button class="btn btn-p">Save company details</button></div>`
      : '<p class="mut md:col-span-2">Only Admin and CEO can change these details.</p>') +
    `</form>`
  );
};
function saveCompany(e) {
  e.preventDefault();
  if (!canManageBilling()) return toast('Only Admin and CEO can change company details');
  const v = Object.fromEntries(new FormData(e.target)),
    gstin = (v.gstin || '').trim().toUpperCase();
  if (!(v.name || '').trim()) return toast('Enter the company name');
  if (gstin && !GSTIN_RX.test(gstin))
    return toast('That GSTIN does not look right (15 characters)');
  const state = v.state || stateOfGstin(gstin);
  if (gstin && stateOfGstin(gstin) && state && stateOfGstin(gstin) !== state)
    return toast('GSTIN state code does not match the selected state');
  const rate = +v.defaultGst;
  if (!(rate >= 0 && rate <= 40)) return toast('Enter a GST rate between 0 and 40');
  Object.assign(companyInfo(), {
    name: v.name.trim(),
    gstin,
    pan: (v.pan || '').trim().toUpperCase(),
    state,
    address: (v.address || '').trim(),
    email: (v.email || '').trim(),
    phone: (v.phone || '').trim(),
    bank: (v.bank || '').trim(),
    gstEnabled: v.gstEnabled === 'yes',
    defaultGst: rate,
    priceMode: v.priceMode,
    reminderEveryDays: Math.max(1, Math.floor(+v.reminderEveryDays || 3)),
  });
  save();
  toast('Company details saved');
  render();
}
const SETTINGS_SECTIONS_BeforeBilling = SETTINGS_SECTIONS;
SETTINGS_SECTIONS = function () {
  const base = SETTINGS_SECTIONS_BeforeBilling.apply(this, arguments);
  if (S.role !== 'rep' && !base.some((s) => s[0] === 'company'))
    base.splice(
      Math.max(
        0,
        base.findIndex((s) => s[0] === 'limits')
      ),
      0,
      ['company', 'Company & GST', 'receipt_long']
    );
  return base;
};

// ---------- account GSTIN / state ----------
const accountGst = (name) => {
  const a = (S.accountInfo || {})[name] || {};
  return { gstin: a.gstin || '', state: a.state || stateOfGstin(a.gstin) };
};
const openAccountEditorBeforeGst = openAccountEditor;
openAccountEditor = function (name) {
  openAccountEditorBeforeGst.apply(this, arguments);
  const form = $('#modal form');
  if (!form) return;
  const g = accountGst(name),
    block = document.createElement('div');
  block.className = 'grid grid-cols-2 gap-3';
  block.innerHTML = `<label class="block">GSTIN<input class="inp mt-1" name="gstin" maxlength="15" value="${E(g.gstin)}" placeholder="Customer GSTIN" style="text-transform:uppercase"></label><label class="block">State<select class="inp mt-1" name="state">${stateOptions(g.state)}</select></label>`;
  form.querySelector('.flex.justify-end').before(block);
};
const saveAccountAddressBeforeGst = saveAccountAddress;
saveAccountAddress = function (e, name) {
  if (!canEditAddress()) return saveAccountAddressBeforeGst.apply(this, arguments);
  const v = Object.fromEntries(new FormData(e.target)),
    gstin = (v.gstin || '').trim().toUpperCase();
  if (gstin && !GSTIN_RX.test(gstin)) {
    e.preventDefault();
    return toast('That GSTIN does not look right (15 characters)');
  }
  saveAccountAddressBeforeGst.apply(this, arguments);
  if (S.accountInfo[name]) {
    S.accountInfo[name].gstin = gstin;
    S.accountInfo[name].state = v.state || stateOfGstin(gstin);
    save();
  }
};

// ---------- tax calculation ----------
const r2 = (n) => Math.round((Number(n) || 0) * 100) / 100;
function liveGst(i) {
  const c = companyInfo(),
    a = accountGst(i.account),
    info = (S.accountInfo || {})[i.account] || {},
    rates = {},
    hsn = {};
  (i.items || []).forEach((it) => {
    const p = S.products.find((x) => x.code === it.c) || {};
    rates[it.c] = c.gstEnabled
      ? p.gst !== undefined && p.gst !== '' && p.gst !== null
        ? +p.gst
        : +c.defaultGst || 0
      : 0;
    hsn[it.c] = p.hsn || '';
  });
  return {
    enabled: !!c.gstEnabled,
    mode: c.priceMode,
    intra: !(c.state && a.state) || c.state === a.state,
    rates,
    hsn,
    company: {
      name: c.name,
      gstin: c.gstin,
      pan: c.pan,
      state: c.state,
      address: c.address,
      email: c.email,
      phone: c.phone,
      bank: c.bank,
    },
    customer: {
      gstin: a.gstin,
      state: a.state,
      address: info.address || '',
      shipping: info.shipping || '',
    },
  };
}
const invGst = (i) => i.gst || liveGst(i);
function invoiceCalc(i) {
  const g = invGst(i);
  const lines = (i.items || []).map((it) => {
    const net = it.p * (1 - (it.d || 0) / 100) * it.q,
      rate = +g.rates[it.c] || 0,
      taxable = g.mode === 'inclusive' ? net / (1 + rate / 100) : net,
      tax = (taxable * rate) / 100;
    return {
      it,
      rate,
      hsn: g.hsn[it.c] || '',
      taxable: r2(taxable),
      cgst: g.intra ? r2(tax / 2) : 0,
      sgst: g.intra ? r2(tax / 2) : 0,
      igst: g.intra ? 0 : r2(tax),
      amount: r2(taxable + tax),
    };
  });
  const sum = (k) => r2(lines.reduce((s, l) => s + l[k], 0)),
    gross = sum('amount'),
    payable = Math.round(gross),
    byRate = {};
  lines.forEach((l) => {
    const k = l.hsn + '|' + l.rate,
      r =
        byRate[k] ||
        (byRate[k] = { hsn: l.hsn, rate: l.rate, taxable: 0, cgst: 0, sgst: 0, igst: 0 });
    ['taxable', 'cgst', 'sgst', 'igst'].forEach((f) => (r[f] = r2(r[f] + l[f])));
  });
  return {
    g,
    lines,
    taxable: sum('taxable'),
    cgst: sum('cgst'),
    sgst: sum('sgst'),
    igst: sum('igst'),
    gross,
    roundOff: r2(payable - gross),
    payable,
    summary: Object.values(byRate),
  };
}
function rupeesInWords(n) {
  n = Math.round(Number(n) || 0);
  if (n === 0) return 'Zero Rupees Only';
  const ones = [
      '',
      'One',
      'Two',
      'Three',
      'Four',
      'Five',
      'Six',
      'Seven',
      'Eight',
      'Nine',
      'Ten',
      'Eleven',
      'Twelve',
      'Thirteen',
      'Fourteen',
      'Fifteen',
      'Sixteen',
      'Seventeen',
      'Eighteen',
      'Nineteen',
    ],
    tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'],
    two = (x) => (x < 20 ? ones[x] : tens[Math.floor(x / 10)] + (x % 10 ? ' ' + ones[x % 10] : '')),
    three = (x) =>
      x >= 100
        ? ones[Math.floor(x / 100)] + ' Hundred' + (x % 100 ? ' ' + two(x % 100) : '')
        : two(x);
  const parts = [];
  [
    [1e7, 'Crore'],
    [1e5, 'Lakh'],
    [1e3, 'Thousand'],
  ].forEach(([d, name]) => {
    const q = Math.floor(n / d);
    if (q) parts.push(three(q) + ' ' + name);
    n %= d;
  });
  if (n) parts.push(three(n));
  return parts.join(' ') + ' Rupees Only';
}

// ---------- payments ----------
const PAY_METHODS = ['Bank transfer (NEFT/RTGS/IMPS)', 'UPI', 'Cheque', 'Cash', 'Card', 'Other'];
const invPayable = (i) => invoiceCalc(i).payable;
function invPaid(i) {
  if (!(i.payments || []).length) return i.status === 'Paid' ? invPayable(i) : 0;
  return r2(i.payments.reduce((s, p) => s + p.amount, 0));
}
const invBalance = (i) => Math.max(0, r2(invPayable(i) - invPaid(i)));
function invDueDate(i) {
  if (i.dueDate) return i.dueDate;
  const t = String(i.terms || ''),
    n = /receipt|immediate/i.test(t) ? 0 : (t.match(/(\d+)/) || [0, 30])[1],
    base = new Date(i.sentAt || i.generatedAt || Date.now());
  return new Date(base.getTime() + n * 864e5).toISOString().slice(0, 10);
}
const invIsOpen = (i) => ['Submitted to client', 'Partially paid'].includes(i.status);
const invOverdueDays = (i) =>
  invIsOpen(i) && invBalance(i) > 0 ? Math.max(0, -days(invDueDate(i))) : 0;
const invStatusChip = (i) => {
  const od = invOverdueDays(i);
  return i.status === 'Paid'
    ? '<span class="chip ok">Paid</span>'
    : od
      ? `<span class="chip" style="background:var(--err);color:#fff">Overdue ${od}d</span>`
      : i.status === 'Partially paid'
        ? '<span class="chip wr">Partially paid</span>'
        : `<span class="chip">${E(i.status)}</span>`;
};
function openPaymentForm(id) {
  const i = S.invoices.find((x) => x.id === id);
  if (!i) return;
  if (!canManageBilling()) return toast('Only Admin and CEO can record payments');
  if (!invIsOpen(i))
    return toast(
      i.status === 'Paid'
        ? 'This invoice is already paid'
        : 'Submit the invoice to the client first'
    );
  $('#modal').innerHTML =
    `<div class="fixed inset-0 z-40 grid place-items-center p-4" style="background:rgba(0,0,0,.5)"><form class="card p-5 w-full max-w-md max-h-full overflow-auto space-y-3" onsubmit="recordPayment(event,'${E(id)}')"><h2 class="text-lg font-bold">Record payment — ${E(i.invoiceNo)}</h2>` +
    `<div class="p-3 rounded text-sm" style="background:var(--hov)">Invoice total <b>${M(invPayable(i))}</b> · Received <b>${M(invPaid(i))}</b> · Balance due <b>${M(invBalance(i))}</b></div>` +
    `<label class="block">Amount received (₹) *<input class="inp" name="amount" type="number" min="1" max="${invBalance(i)}" step="0.01" required value="${invBalance(i)}"></label>` +
    `<label class="block">Date received *<input class="inp" name="date" type="date" required value="${D(0)}" max="${D(0)}"></label>` +
    `<label class="block">Method<select class="inp" name="method">${PAY_METHODS.map((m) => `<option>${m}</option>`).join('')}</select></label>` +
    `<label class="block">Reference (UTR / cheque no.)<input class="inp" name="ref"></label>` +
    `<label class="block">Note<input class="inp" name="note"></label>` +
    `<div class="flex justify-end gap-2"><button type="button" class="btn" onclick="$('#modal').innerHTML=''">Cancel</button><button class="btn btn-p">Record payment</button></div></form></div>`;
  $('#modal [name=amount]').focus();
}
function recordPayment(e, id) {
  e.preventDefault();
  const i = S.invoices.find((x) => x.id === id),
    v = Object.fromEntries(new FormData(e.target)),
    amt = r2(v.amount);
  if (!i || !canManageBilling() || !invIsOpen(i)) return;
  if (!(amt > 0)) return toast('Enter the amount received');
  if (amt > invBalance(i) + 0.001)
    return toast(`Amount is more than the balance due (${M(invBalance(i))})`);
  if (!v.date || v.date > D(0)) return toast('Payment date cannot be in the future');
  i.gst = i.gst || liveGst(i); // freeze the tax figures once money is received
  if (!(i.payments || []).length && i.status === 'Paid') i.payments = [];
  i.payments = [
    ...(i.payments || []),
    {
      id: 'pay' + Date.now().toString(36),
      amount: amt,
      date: v.date,
      method: v.method,
      ref: (v.ref || '').trim(),
      note: (v.note || '').trim(),
      by: roleNow().name,
      at: Date.now(),
    },
  ];
  const left = invBalance(i);
  i.status = left <= 0.5 ? 'Paid' : 'Partially paid';
  logOpp(
    i.opp,
    'sync',
    `Payment of ${M(amt)} recorded on ${i.invoiceNo} by ${roleNow().name}${left > 0.5 ? ` · balance ${M(left)}` : ' · paid in full'}`
  );
  if (i.status === 'Paid') {
    i.paidAt = Date.now();
    const q = S.quotes.find((x) => x.no === i.quoteNo);
    if (q) q.status = 'Paid';
    const o = S.opps.find((x) => x.id == i.opp);
    if (o && !(o.stage === 5 && !o.lost))
      queuePopup({ kind: 'bill-paidfull', inv: i.id, toRole: 'admin', by: S.authUser });
  }
  $('#modal').innerHTML = '';
  save();
  if (i.status === 'Paid') setTimeout(() => showBillPopup({ kind: 'bill-paidfull', inv: i.id }), 0);
  toast(i.status === 'Paid' ? 'Paid in full' : `Payment recorded · balance ${M(left)}`);
  render();
}
function deletePayment(id, pid) {
  const i = S.invoices.find((x) => x.id === id);
  if (!i || !canManageBilling() || !confirm('Remove this payment entry?')) return;
  const o = S.opps.find((x) => x.id == i.opp);
  if (o && o.stage === 5 && !o.lost) return toast('The deal is already Closed Won');
  i.payments = (i.payments || []).filter((p) => p.id !== pid);
  i.status = !i.payments.length
    ? 'Submitted to client'
    : invBalance(i) <= 0.5
      ? 'Paid'
      : 'Partially paid';
  if (i.status !== 'Paid') {
    delete i.paidAt;
    const q = S.quotes.find((x) => x.no === i.quoteNo);
    if (q && q.status === 'Paid') q.status = 'Sent to client';
  }
  logOpp(i.opp, 'sync', `A payment entry was removed from ${i.invoiceNo} by ${roleNow().name}`);
  save();
  render();
}
// the old "Mark as paid" now records the full balance
markInvoicePaid = function (id) {
  const i = S.invoices.find((x) => x.id === id);
  if (!i) return;
  openPaymentForm(id);
};
const sendInvoiceBeforeBilling = sendInvoice;
sendInvoice = function (id) {
  const i = S.invoices.find((x) => x.id === id);
  if (i && !i.gst) {
    i.gst = liveGst(i); // tax details are fixed once the invoice goes to the client
    i.dueDate = undefined;
  }
  sendInvoiceBeforeBilling.apply(this, arguments);
  if (i) {
    i.dueDate = invDueDate(i);
    save();
  }
};

// ---------- Close Won prompt ----------
function showBillPopup(p) {
  const i = S.invoices.find((x) => x.id === p.inv),
    o = i && S.opps.find((x) => x.id == i.opp);
  if (!i && p.kind !== 'bill-overdue') return;
  if (p.kind === 'bill-paidfull')
    return showPopup({
      tone: 'ok',
      icon: 'paid',
      title: `${E(i.invoiceNo)} is paid in full`,
      lines: [
        `${E(i.account)} has paid ${M(invPayable(i))}.`,
        o ? `Mark <b>${E(o.name)}</b> as Closed Won?` : '',
      ],
      actions:
        o && !(o.stage === 5 && !o.lost)
          ? [{ label: 'Mark Closed Won', js: `openClosedWon(S.opps.find(x=>x.id==${o.id}))` }]
          : [],
    });
  if (p.kind === 'bill-overdue') {
    const list = S.invoices
      .filter((x) => invOverdueDays(x) > 0)
      .sort((a, b) => invOverdueDays(b) - invOverdueDays(a));
    return showPopup({
      tone: 'err',
      icon: 'schedule',
      title: `${list.length} overdue invoice${list.length === 1 ? '' : 's'}`,
      lines: list
        .slice(0, 5)
        .map(
          (x) =>
            `<b>${E(x.invoiceNo)}</b> · ${E(x.account)} · ${M(invBalance(x))} · ${invOverdueDays(x)} days late`
        )
        .concat(list.length > 5 ? [`and ${list.length - 5} more`] : []),
      actions: [{ label: 'View overdue', js: `S.invFilter='overdue';nav('invoices')` }],
    });
  }
}
// One overdue digest per person per day.
function queueOverdueDigest() {
  if (!S.authUser || !canSeeInvoices()) return;
  const k = S.authUser + '|' + D(0);
  S.overdueSeen = S.overdueSeen || {};
  if (S.overdueSeen[k] || !S.invoices.some((x) => invOverdueDays(x) > 0)) return;
  S.overdueSeen[k] = 1;
  queuePopup({ kind: 'bill-overdue', toUser: S.authUser, id_: k });
  save();
  setTimeout(showNextPopup, 0);
}
// Safety net: an invoice paid in full whose deal is still open reminds Admin / CEO on the deal and invoice pages.
const needsCloseWon = (i) => {
  const o = S.opps.find((x) => x.id == i.opp);
  return i.status === 'Paid' && o && !(o.stage === 5 && !o.lost) && canManageBilling();
};

// ---------- reminders ----------
function reminderText(i) {
  const c = companyInfo(),
    od = invOverdueDays(i);
  return `Hello,\n\nThis is a friendly reminder that invoice ${i.invoiceNo} for ${i.account} ${od ? `was due on ${fd(invDueDate(i))} and is now ${od} day${od === 1 ? '' : 's'} overdue` : `is due on ${fd(invDueDate(i))}`}.\n\nInvoice total: ${M(invPayable(i))}\nReceived: ${M(invPaid(i))}\nBalance due: ${M(invBalance(i))}\n\nKindly arrange the payment at the earliest.${c.bank ? '\n\nBank details:\n' + c.bank : ''}\n\nThank you,\n${roleNow().name}\n${c.name || ''}`;
}
function openReminder(id) {
  const i = S.invoices.find((x) => x.id === id);
  if (!i || !canManageBilling()) return toast('Only Admin and CEO can send reminders');
  const q = S.quotes.find((x) => x.no === i.quoteNo) || {},
    ch = S.sendChan === 'whatsapp' ? 'whatsapp' : 'email';
  $('#modal').innerHTML =
    `<div class="fixed inset-0 z-40 grid place-items-center p-4" style="background:rgba(0,0,0,.5)"><form class="card p-5 w-full max-w-lg max-h-full overflow-auto space-y-3" onsubmit="sendReminder(event,'${E(id)}')"><h2 class="text-lg font-bold">Payment reminder — ${E(i.invoiceNo)}</h2>` +
    `<div class="flex gap-2"><button type="button" class="btn ${ch === 'email' ? 'btn-p' : ''}" onclick="S.sendChan='email';openReminder('${E(id)}')"><span class="ms">mail</span>Email</button><button type="button" class="btn ${ch === 'whatsapp' ? 'btn-p' : ''}" onclick="S.sendChan='whatsapp';openReminder('${E(id)}')"><span class="ms">chat</span>WhatsApp</button></div><input type="hidden" name="chan" value="${ch}">` +
    (ch === 'email'
      ? `<label class="block">To (email) *<input class="inp" type="email" name="to" required value="${E(q.toEmail || '')}"></label><label class="block">Subject<input class="inp" name="subject" value="${E(`Payment reminder – ${i.invoiceNo}`)}"></label>`
      : `<label class="block">WhatsApp number *<input class="inp" type="tel" name="to" required value="${E(q.toPhone || '')}"></label>`) +
    `<label class="block">Message<textarea class="inp" name="msg" rows="9">${E(reminderText(i))}</textarea></label>` +
    `<div class="flex justify-end gap-2"><button type="button" class="btn" onclick="$('#modal').innerHTML=''">Cancel</button><button class="btn btn-p">${ch === 'email' ? 'Open email' : 'Open WhatsApp'}</button></div></form></div>`;
}
function sendReminder(e, id) {
  e.preventDefault();
  const i = S.invoices.find((x) => x.id === id),
    v = Object.fromEntries(new FormData(e.target)),
    to = (v.to || '').trim();
  if (!i || !to) return;
  if (v.chan === 'email' && !/^\S+@\S+\.\S+$/.test(to)) return toast('Enter a valid email address');
  if (v.chan === 'whatsapp' && phoneDigits(to).length < 11)
    return toast('Enter the number with country code');
  const url =
    v.chan === 'email'
      ? `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(v.subject || '')}&body=${encodeURIComponent(v.msg || '')}`
      : `https://wa.me/${phoneDigits(to)}?text=${encodeURIComponent(v.msg || '')}`;
  i.reminders = [
    ...(i.reminders || []),
    { channel: v.chan, to, at: Date.now(), by: roleNow().name },
  ];
  logOpp(
    i.opp,
    v.chan === 'email' ? 'mail' : 'sync',
    `Payment reminder for ${i.invoiceNo} sent to ${to} (${roleNow().name})`
  );
  save();
  $('#modal').innerHTML = '';
  const a = document.createElement('a');
  a.href = url;
  a.target = '_blank';
  a.rel = 'noopener';
  document.body.appendChild(a);
  a.click();
  a.remove();
  toast('Reminder ready to send');
  render();
}
const lastReminder = (i) => (i.reminders || []).slice(-1)[0];
const reminderDue = (i) =>
  invOverdueDays(i) > 0 &&
  (!lastReminder(i) || Date.now() - lastReminder(i).at > companyInfo().reminderEveryDays * 864e5);

// notifications: overdue and due-soon invoices
const allNotificationItemsBeforeBilling = allNotificationItems;
allNotificationItems = function () {
  const items = allNotificationItemsBeforeBilling.apply(this, arguments);
  if (!canSeeInvoices()) return items;
  const extra = [];
  S.invoices.forEach((i) => {
    if (!invIsOpen(i)) {
      if (needsCloseWon(i))
        extra.push({
          icon: 'paid',
          text: `${i.invoiceNo} is paid – close the deal`,
          sub: E(i.account),
          go: `openInvoice('${E(i.id)}')`,
        });
      return;
    }
    const od = invOverdueDays(i),
      left = days(invDueDate(i));
    if (od)
      extra.push({
        icon: 'schedule',
        text: `${i.invoiceNo} is ${od} day${od === 1 ? '' : 's'} overdue`,
        sub: `${E(i.account)} · balance ${M(invBalance(i))}`,
        go: `openInvoice('${E(i.id)}')`,
      });
    else if (left <= 3)
      extra.push({
        icon: 'event',
        text: `${i.invoiceNo} is due ${left === 0 ? 'today' : 'in ' + left + ' days'}`,
        sub: `${E(i.account)} · balance ${M(invBalance(i))}`,
        go: `openInvoice('${E(i.id)}')`,
      });
  });
  return extra.concat(items);
};
const renderBeforeBilling = render;
render = function () {
  renderBeforeBilling.apply(this, arguments);
  queueOverdueDigest();
};

// ---------- invoice pages ----------
V.invoices = () => {
  const all = S.invoices.filter(
      (i) => S.role !== 'rep' || visibleOpps().some((o) => o.id == i.opp)
    ),
    f = S.invFilter || 'all',
    open = all.filter(invIsOpen),
    od = all.filter((i) => invOverdueDays(i) > 0),
    pass = {
      all: () => true,
      unpaid: (i) => i.status !== 'Paid',
      overdue: (i) => invOverdueDays(i) > 0,
      paid: (i) => i.status === 'Paid',
    },
    list = all.filter(pass[f] || pass.all),
    tile = (label, val, sub = '') =>
      `<div class="card p-3 flex-1 min-w-[150px]"><div class="mut text-xs">${label}</div><div class="text-xl font-bold">${val}</div><div class="mut text-xs">${sub}</div></div>`,
    chip = (k, l) =>
      `<button class="btn ${f === k ? 'btn-p' : ''}" onclick="S.invFilter='${k}';render()">${l}</button>`;
  return (
    `<h1 class="text-xl font-bold mb-3">Invoices</h1><div class="flex gap-3 flex-wrap mb-3">${tile('Outstanding', M(open.reduce((s, i) => s + invBalance(i), 0)), open.length + ' open invoices')}${tile('Overdue', `<span style="color:var(--err)">${M(od.reduce((s, i) => s + invBalance(i), 0))}</span>`, od.length + ' invoices')}${tile('Received', M(all.reduce((s, i) => s + invPaid(i), 0)))}</div>` +
    `<div class="flex gap-2 flex-wrap mb-3">${chip('all', 'All')}${chip('unpaid', 'Unpaid')}${chip('overdue', 'Overdue')}${chip('paid', 'Paid')}</div>` +
    table(
      ['Invoice no.', 'Quotation no.', 'Customer', 'Total', 'Paid', 'Balance', 'Due', 'Status'],
      list
        .map(
          (i) =>
            `<tr class="r" onclick="openInvoice('${i.id}')"><td><b>${i.invoiceNo}</b></td><td>${i.quoteNo}</td><td>${E(i.account)}</td><td>${M(invPayable(i))}</td><td>${M(invPaid(i))}</td><td><b>${M(invBalance(i))}</b></td><td>${invIsOpen(i) ? fd(invDueDate(i)) : '–'}</td><td>${invStatusChip(i)}</td></tr>`
        )
        .join('')
    )
  );
};
V['invoice-detail'] = () => {
  const i = S.invoices.find((x) => x.id === S.currentInvoice);
  if (!i) return V.invoices();
  const c = invoiceCalc(i),
    admin = canManageBilling(),
    od = invOverdueDays(i),
    last = lastReminder(i);
  const pays = (i.payments || []).length
    ? `<table class="w-full text-sm"><thead><tr><th class="text-left">Date</th><th class="text-left">Method</th><th class="text-left">Reference</th><th class="text-right">Amount</th><th class="text-left">By</th><th></th></tr></thead><tbody>${i.payments.map((p) => `<tr><td>${fd(p.date)}</td><td>${E(p.method)}</td><td>${E(p.ref || '–')}</td><td class="text-right"><b>${M(p.amount)}</b></td><td>${E(p.by)}</td><td>${admin ? `<button class="btn" aria-label="Remove payment" onclick="deletePayment('${E(i.id)}','${E(p.id)}')"><span class="ms">delete</span></button>` : ''}</td></tr>`).join('')}</tbody></table>`
    : i.status === 'Paid'
      ? '<p class="mut">Marked as paid.</p>'
      : '<p class="mut">No payments recorded yet.</p>';
  return (
    `<div class="mut cursor-pointer mb-2" onclick="nav('invoices')">‹ Back to invoices</div><div class="card p-5"><div class="flex gap-3 flex-wrap items-start"><div style="flex:1 1 220px"><h1 class="text-xl font-bold">Invoice ${E(i.invoiceNo)} ${invStatusChip(i)}</h1><p class="mut">From quotation ${E(i.quoteNo)} · Terms ${E(i.terms)}${invIsOpen(i) || i.status === 'Paid' ? ' · Due ' + fd(invDueDate(i)) : ''}</p></div><div class="flex gap-2 flex-wrap"><button class="btn" onclick="openInvoiceSheet('${E(i.id)}')"><span class="ms">description</span>View GST invoice</button><button class="btn" onclick="printInvoice('${E(i.id)}')"><span class="ms">picture_as_pdf</span>Download PDF</button></div></div>` +
    (needsCloseWon(i)
      ? `<div class="qt-banner ok mt-3"><span class="ms">paid</span><div><b>Paid in full</b><div>Close the deal once the payment has cleared.</div></div><button class="btn btn-p" onclick="openClosedWon(S.opps.find(x=>x.id==${i.opp}))">Mark Closed Won</button></div>`
      : '') +
    (od
      ? `<div class="qt-banner wr mt-3"><span class="ms">schedule</span><div><b>${od} day${od === 1 ? '' : 's'} overdue</b><div>${last ? `Last reminder ${ago(last.at)} to ${E(last.to)}` : 'No reminder sent yet'}</div></div>${admin ? `<button class="btn btn-p" onclick="openReminder('${E(i.id)}')">Send reminder</button>` : ''}</div>`
      : '') +
    `<div class="mt-4"><b>${E(i.account)}</b><div class="mut">${E(i.opportunity)}</div></div><div class="overflow-x-auto">${billLinesTable(i.items, !!i.showDiscount)}</div>` +
    `<div class="grid sm:grid-cols-2 gap-4 mt-3"><div>${invoiceTermsBlock(i)}</div><div class="text-sm"><div class="flex justify-between"><span>Taxable value</span><span>${M(c.taxable)}</span></div>${c.g.intra ? `<div class="flex justify-between"><span>CGST</span><span>${M(c.cgst)}</span></div><div class="flex justify-between"><span>SGST</span><span>${M(c.sgst)}</span></div>` : `<div class="flex justify-between"><span>IGST</span><span>${M(c.igst)}</span></div>`}<div class="flex justify-between text-lg font-bold mt-1"><span>Grand total</span><span>${M(c.payable)}</span></div><div class="flex justify-between"><span>Received</span><span>${M(invPaid(i))}</span></div><div class="flex justify-between text-lg font-bold" style="color:${invBalance(i) ? 'var(--err)' : 'var(--ok)'}"><span>Balance due</span><span>${M(invBalance(i))}</span></div></div></div>` +
    `<div class="mt-4"><b>Payments</b><div class="overflow-x-auto">${pays}</div></div>` +
    `<div class="flex justify-end gap-2 mt-4 flex-wrap">${!invIsOpen(i) && i.status !== 'Paid' ? `<button class="btn btn-p" onclick="sendInvoice('${E(i.id)}')">Submit to client</button>` : ''}${admin && invIsOpen(i) ? `<button class="btn btn-p" onclick="openPaymentForm('${E(i.id)}')"><span class="ms">add_card</span>Record payment</button>` : ''}${admin && invIsOpen(i) ? `<button class="btn" onclick="openReminder('${E(i.id)}')"><span class="ms">notifications_active</span>Send reminder</button>` : ''}</div></div>`
  );
};

// ---------- the printable GST invoice ----------
function invoiceSheetHtml(i) {
  const c = invoiceCalc(i),
    g = c.g,
    co = g.company,
    cu = g.customer,
    tax = g.enabled,
    intra = g.intra,
    th = (t, r) => `<th class="${r ? 'text-right' : 'text-left'}">${t}</th>`,
    head = [
      '#',
      'Description',
      tax ? 'HSN/SAC' : '',
      'Qty',
      'Rate',
      'Disc %',
      'Taxable',
      ...(tax ? (intra ? ['CGST', 'SGST'] : ['IGST']) : []),
      'Amount',
    ].filter((x, k) => x !== '' || k === 0);
  const rows = c.lines
    .map(
      (l, k) =>
        `<tr><td>${k + 1}</td><td>${E(l.it.n)}<div class="mut text-xs">${E(l.it.c)}</div></td>${tax ? `<td>${E(l.hsn || '–')}</td>` : ''}<td class="text-right">${l.it.q}</td><td class="text-right">${M(l.it.p)}</td><td class="text-right">${l.it.d || 0}%</td><td class="text-right">${M(l.taxable)}</td>${tax ? (intra ? `<td class="text-right">${M(l.cgst)}<div class="mut text-xs">${l.rate / 2}%</div></td><td class="text-right">${M(l.sgst)}<div class="mut text-xs">${l.rate / 2}%</div></td>` : `<td class="text-right">${M(l.igst)}<div class="mut text-xs">${l.rate}%</div></td>`) : ''}<td class="text-right"><b>${M(l.amount)}</b></td></tr>`
    )
    .join('');
  const sumRows = c.summary
    .map(
      (s) =>
        `<tr><td>${E(s.hsn || '–')}</td><td class="text-right">${M(s.taxable)}</td><td class="text-right">${s.rate}%</td><td class="text-right">${M(s.cgst + s.sgst + s.igst)}</td></tr>`
    )
    .join('');
  const addr = (t) => `<div style="white-space:pre-wrap">${E(t || '–')}</div>`;
  return (
    `<div class="inv-sheet text-sm"><div class="flex justify-between gap-3 flex-wrap"><div><div class="text-xl font-bold">${E(co.name || 'Your company')}</div>${addr(co.address)}${co.gstin ? `<div>GSTIN: <b>${E(co.gstin)}</b></div>` : ''}${co.pan ? `<div>PAN: ${E(co.pan)}</div>` : ''}${co.state ? `<div>State: ${E(co.state)}</div>` : ''}${co.email || co.phone ? `<div>${E(co.email || '')} ${E(co.phone || '')}</div>` : ''}</div>` +
    `<div class="text-right"><div class="text-xl font-bold">${tax ? 'TAX INVOICE' : 'INVOICE'}</div><div>No: <b>${E(i.invoiceNo)}</b></div><div>Date: ${fd(new Date(i.sentAt || i.generatedAt || Date.now()).toISOString().slice(0, 10))}</div><div>Due: ${fd(invDueDate(i))}</div><div class="mut">Quotation ${E(i.quoteNo)}</div></div></div>` +
    `<div class="grid sm:grid-cols-2 gap-3 mt-3"><div><div class="mut text-xs">Bill to</div><b>${E(i.account)}</b>${addr(cu.address)}${cu.gstin ? `<div>GSTIN: <b>${E(cu.gstin)}</b></div>` : ''}</div><div><div class="mut text-xs">Ship to</div>${addr(cu.shipping || cu.address)}${tax ? `<div class="mt-1">Place of supply: <b>${E(cu.state || co.state || '–')}</b> (${intra ? 'intra-state: CGST + SGST' : 'inter-state: IGST'})</div>` : ''}</div></div>` +
    `<div class="overflow-x-auto mt-3"><table class="w-full inv-table"><thead><tr>${head.map((h, k) => th(h, k > 2)).join('')}</tr></thead><tbody>${rows}</tbody></table></div>` +
    `<div class="grid sm:grid-cols-2 gap-4 mt-3"><div>${tax ? `<table class="w-full text-xs"><thead><tr><th class="text-left">HSN/SAC</th><th class="text-right">Taxable</th><th class="text-right">Rate</th><th class="text-right">Tax</th></tr></thead><tbody>${sumRows}</tbody></table>` : ''}</div><div><div class="flex justify-between"><span>Taxable value</span><span>${M(c.taxable)}</span></div>${tax ? (intra ? `<div class="flex justify-between"><span>CGST</span><span>${M(c.cgst)}</span></div><div class="flex justify-between"><span>SGST</span><span>${M(c.sgst)}</span></div>` : `<div class="flex justify-between"><span>IGST</span><span>${M(c.igst)}</span></div>`) : ''}${c.roundOff ? `<div class="flex justify-between"><span>Round off</span><span>${c.roundOff > 0 ? '+' : '−'}₹${Math.abs(c.roundOff).toFixed(2)}</span></div>` : ''}<div class="flex justify-between text-lg font-bold" style="border-top:1px solid var(--bd);margin-top:4px;padding-top:4px"><span>Total</span><span>${M(c.payable)}</span></div>${invPaid(i) ? `<div class="flex justify-between"><span>Received</span><span>${M(invPaid(i))}</span></div><div class="flex justify-between font-bold"><span>Balance due</span><span>${M(invBalance(i))}</span></div>` : ''}</div></div>` +
    `<div class="mt-2"><span class="mut">Amount in words:</span> <b>${rupeesInWords(c.payable)}</b></div>` +
    (co.bank ? `<div class="mt-3"><b>Bank details</b>${addr(co.bank)}</div>` : '') +
    `<div class="mt-3"><b>Terms &amp; conditions</b><div style="white-space:pre-wrap" class="text-xs">${E(i.tnc || effectiveTnc(S.quotes.find((q) => q.no === i.quoteNo) || {}))}</div></div>` +
    `<div class="flex justify-between mt-6 text-xs"><span class="mut">This is a computer generated invoice.</span><span style="text-align:center">For ${E(co.name || 'the company')}<br><br><br>Authorised signatory</span></div></div>`
  );
}
function openInvoiceSheet(id) {
  const i = S.invoices.find((x) => x.id === id);
  if (!i) return;
  if (!companyInfo().name) toast('Add your company & GSTIN in Settings → Company & GST');
  $('#modal').innerHTML =
    `<div class="fixed inset-0 z-40 grid place-items-center p-4" style="background:rgba(0,0,0,.5)"><div class="card p-6 w-full max-w-4xl max-h-full overflow-auto">${invoiceSheetHtml(i)}<div class="flex justify-end gap-2 mt-4 no-print"><button class="btn" onclick="$('#modal').innerHTML=''">Close</button><button class="btn btn-p" onclick="printInvoice('${E(id)}',true)"><span class="ms">picture_as_pdf</span>Download PDF</button></div></div></div>`;
}
// Opens the invoice and the browser's print dialog, with the file name set to the invoice number
// (choose "Save as PDF" as the printer).
function printInvoice(id, already) {
  const i = S.invoices.find((x) => x.id === id);
  if (!i) return;
  if (!already) openInvoiceSheet(id);
  const t = document.title;
  document.title = i.invoiceNo;
  const back = () => {
    document.title = t;
    removeEventListener('afterprint', back);
  };
  addEventListener('afterprint', back);
  window.print();
}

// Who may create opportunities: Admin, CEO and Senior Reps. Regular reps cannot.
// "Senior rep" is a rep account with senior = true: same portal and data access, plus permission to add opportunities.

function isSeniorRep(u) {
  return !!u && u.role === 'rep' && u.senior === true;
}
function roleTitle(u) {
  return isSeniorRep(u) ? 'SENIOR REP' : String((u && u.role) || '').toUpperCase();
}
// A Senior Rep can create opportunities (for any rep), and sees all opportunities, teams and rep names.
// Senior Reps can also reassign an opportunity's owner. Editing account addresses stays with Admin and CEO.
function hasSeniorRights() {
  if (['admin', 'ceo'].includes(S.role)) return true;
  return isSeniorRep((S.users || []).find((u) => u.id === S.authUser));
}
function canAddOpportunity() {
  return hasSeniorRights();
}
function canEditOwner() {
  return hasSeniorRights(); // change an opportunity's assigned rep (Senior Rep, Admin, CEO)
}
function canEditAddress() {
  return ['admin', 'ceo'].includes(S.role); // account address and shipping address
}
// Invoices are for Admin and CEO only. A Senior Rep's extra rights are just: add opportunities,
// edit account addresses and reassign opportunities to any rep (plus seeing all teams).
function canSeeInvoices() {
  return !S.authUser || ['admin', 'ceo'].includes(S.role);
}
const NO_ADD_OPP_MSG = 'Only Admin, CEO and Senior Reps can add opportunities';

// One-time demo data: Dan Mills (login dan / rep123) is a Senior Rep; everyone else stays a regular rep.
if (!S.seniorSeeded) {
  const dan = (S.users || []).find((u) => u.username === 'dan' && u.role === 'rep');
  if (dan && dan.senior == null) dan.senior = true;
  S.seniorSeeded = true;
  save();
}

// Block every path that creates an opportunity.
const modalBeforePermissions = modal;
modal = function (k) {
  if (k === 'opp' && !canAddOpportunity()) return toast(NO_ADD_OPP_MSG);
  return modalBeforePermissions.apply(this, arguments);
};
const saveOpportunityBeforePermissions = saveOpportunityExtended;
saveOpportunityExtended = function (e) {
  if (!canAddOpportunity()) {
    e.preventDefault();
    $('#modal').innerHTML = '';
    return toast(NO_ADD_OPP_MSG);
  }
  return saveOpportunityBeforePermissions.apply(this, arguments);
};
const convertBeforePermissions = convert; // lead -> opportunity also creates one
convert = function () {
  if (!canAddOpportunity()) return toast(NO_ADD_OPP_MSG);
  return convertBeforePermissions.apply(this, arguments);
};

// Admin / CEO can promote a rep to Senior Rep, or take it away again.
function toggleSeniorRep(id) {
  const u = S.users.find((x) => x.id === id);
  if (!['admin', 'ceo'].includes(S.role) || !u || u.role !== 'rep')
    return toast('You do not have permission to change this account');
  u.senior = !isSeniorRep(u);
  save();
  toast(u.name + (u.senior ? ' is now a Senior Rep' : ' is now a regular Rep'));
  render();
}

// Invoices are hidden from regular reps: routes, the open action, nav links and invoice columns.
const navBeforeInvoiceGuard = nav;
nav = function (v) {
  if (['invoices', 'invoice-detail'].includes(v) && !canSeeInvoices())
    return toast('Invoices are not available for your role');
  return navBeforeInvoiceGuard.apply(this, arguments);
};
const openInvoiceBeforeGuard = openInvoice;
openInvoice = function () {
  if (!canSeeInvoices()) return toast('Invoices are not available for your role');
  return openInvoiceBeforeGuard.apply(this, arguments);
};
function hideInvoiceUi() {
  if (canSeeInvoices()) return;
  document.querySelectorAll('#nav a[href="#invoices"]').forEach((a) => a.remove());
  document.querySelectorAll('#app table').forEach((t) => {
    const th = [...t.querySelectorAll('th')].find((h) =>
      /^invoice( no\.)?$/i.test(h.textContent.trim())
    );
    if (!th) return;
    const i = th.cellIndex;
    t.querySelectorAll('tr').forEach((r) => r.cells[i] && r.cells[i].remove());
  });
}
const renderBeforeInvoiceGuard = render;
render = function () {
  if (['invoices', 'invoice-detail'].includes(location.hash.slice(1)) && !canSeeInvoices())
    location.hash = '#home';
  renderBeforeInvoiceGuard.apply(this, arguments);
  hideInvoiceUi();
};

// The app's hashchange listeners hold older copies of render(), so after a real navigation (clicking a nav link)
// the invoice clean-up, redirect and approval pop-ups are re-applied here.
['invoices', 'invoice-detail'].forEach((k) => {
  const base = V[k];
  V[k] = function () {
    return canSeeInvoices()
      ? base.apply(this, arguments)
      : '<div class="card p-4"><b>Not available</b><p class="mut mt-1">Invoices are not available for your role.</p></div>';
  };
});
addEventListener('hashchange', () => {
  if (['invoices', 'invoice-detail'].includes(location.hash.slice(1)) && !canSeeInvoices())
    return (location.hash = '#home');
  hideInvoiceUi();
  showNextPopup();
});

// Activity text mentions invoice numbers; people who cannot see invoices only see "invoice".
function hideInvoiceRefs(text) {
  return canSeeInvoices()
    ? text
    : String(text)
        .replace(/invoice\s+INV-[\w-]+/gi, 'invoice')
        .replace(/INV-[\w-]+/g, 'invoice');
}

// Opportunity record page (Details tab): collapsible field sections on the left, related-list cards on the right.

const BASIC_RIGHT = RIGHT.filter((f) => !['won', 'lost', 'notes', 'desc', 'next'].includes(f[0]));
const addrRow = (label, key) => (o) => {
  const info = accountInfo(o.account),
    pen = canEditAddress()
      ? `<span class="ms" title="Edit addresses" onclick="openAccountEditor(${E(JSON.stringify(o.account))})">edit</span>`
      : '';
  return sfRow(
    label,
    `<div style="white-space:pre-wrap">${info[key] ? E(info[key]) : '–'}</div>`,
    pen
  );
};
const checkRow = (label, ok) =>
  sfRow(
    label,
    `<span class="sf-cb-ro ${ok ? 'on' : ''}" role="img" aria-label="${ok ? 'Yes' : 'No'}">${ok ? '✓' : ''}</span>`
  );
const approvedQuote = (o) =>
  S.quotes.some((q) => q.opp == o.id && ['Approved', 'Sent to client', 'Paid'].includes(q.status));
const discounts = (o) => o.items.map((i) => +i.d || 0);

const QUAL_KEYS = [
  'valDriver',
  'pain',
  'champion',
  'decisionCrit',
  'procProcess',
  'econBuyer',
  'demo',
  'nextDate',
];
const CHECK_KEYS = [
  'ckEula',
  'ckSec',
  'ckBudget',
  'ckMulti',
  'ckExec',
  'ckWorkback',
  'ckBiz',
  'ckQuote',
  'ckCLevel',
  'ckExec2',
];
// Money / number fields are stored as numbers.
const NUM_KEYS = new Set([
  'priorAmt',
  'priorArr',
  'totalFyc',
  'totalArr',
  'currentAcv',
  'priorMyr',
  'churnAmt',
  'priceLimit',
  'longestTerm',
  'y1',
  'y2',
  'y3',
  'y4',
  'y5',
  'avgContract',
  'arrOrig',
  'bestCase',
  'pullFwd',
  'renewalUsd',
  'ltcLength',
]);
const YESNO = ['', 'Yes', 'No'];

const SF_SECTIONS = [
  {
    id: 'info',
    title: 'Opportunity Information',
    left: [
      ...LEFT,
      ['chNotes', 'Channel initiated notes', 'ta'],
      ['potMatch', 'Potential matches button', 'b'],
    ],
    right: [...BASIC_RIGHT, ['yoy', 'Original YoY', 'n'], ['reasonWon', 'Reason won', 't']],
  },
  {
    id: 'address',
    title: 'Address Information',
    left: [addrRow('Billing Address', 'address'), ['acctNs', 'Account NS info', 'ta']],
    right: [addrRow('Shipping Address', 'shipping')],
  },
  {
    id: 'checklist',
    title: 'BIG Deal Check List',
    left: [
      ['ckEula', 'EULA / Contract signed', 'b'],
      ['ckSec', 'Security signed off', 'b'],
      ['ckBudget', 'Budget confirmed', 'b'],
      ['ckMulti', 'Multi-year presented to finance', 'b'],
      ['ckExec', 'Executive summary', 'b'],
    ],
    right: [
      ['ckWorkback', 'Workback plan', 'b'],
      ['ckBiz', 'Business impacted if close date not met', 'b'],
      ['ckQuote', 'Quote submitted in customer system', 'b'],
      ['ckCLevel', 'Exec (C-level) approver aware of request', 'b'],
      ['ckExec2', 'Executive summary', 'b'],
    ],
  },
  {
    id: 'renewal',
    title: 'Renewal Opportunity Information',
    left: [
      ['priorOpp', 'Prior opportunity', 't'],
      ['renewalOpp', 'Renewal opportunity', 't'],
      ['priorInv', 'Prior opp invoice number', 't'],
      ['priorAmt', 'Prior opportunity amount', 'n'],
      ['priorArr', 'Prior ARR total', 'n'],
      ['totalFyc', 'Total FYC value', 'n'],
      ['totalArr', 'Total ARR value', 'n'],
      ['currentAcv', 'Current ACV total – quote', 'n'],
    ],
    right: [
      ['renewalDate', 'Renewal date', 'd'],
      [
        'renewalStatus',
        'Renewal status',
        's',
        ['Not started', 'In Progress', 'Quoted', 'Renewed', 'Churned'],
      ],
      (o) => {
        const d = gv(o, 'renewalDate');
        return sfRow('Days left before maint renewal date', d ? days(d) : '–');
      },
      ['renewalTag', 'Renewal hashtag', 't'],
      ['priorMyr', 'Prior opp MYR', 'n'],
      ['churnAmt', 'Churn', 'n'],
      ['renewalOptOut', 'Renewal automation opt out', 'b'],
      ['priceLimit', 'Prior opp renewal price increase limit', 'n'],
    ],
  },
  {
    id: 'orders',
    title: 'Discount and Order Processing Info',
    left: [
      ['po', 'PO / Reference number', 't'],
      (o) => {
        if (!canSeeInvoices()) return '';
        const nos = S.quotes
          .filter((q) => q.opp == o.id && q.invoiceId)
          .map((q) => (S.invoices.find((i) => i.id === q.invoiceId) || {}).invoiceNo)
          .filter(Boolean);
        return sfRow('Invoice #', nos.length ? E(nos.join(', ')) : '–');
      },
      ['bookedFin', 'Booked by finance', 'b'],
      ['licDelivered', 'License info delivered', 'b'],
    ],
    right: [
      (o) =>
        sfRow(
          'Average opportunity discount',
          `${(discounts(o).reduce((a, b) => a + b, 0) / (o.items.length || 1)).toFixed(2)}%`
        ),
      (o) => sfRow('Largest line item discount', `${Math.max(0, ...discounts(o)).toFixed(2)}%`),
      ['longestTerm', 'Longest line item term', 'n'],
      (o) => checkRow('Discount has been approved', approvedQuote(o)),
    ],
  },
  {
    id: 'multiyear',
    title: 'Multi Year Billing Information',
    left: [
      ['y1', 'Year 1', 'n'],
      ['y2', 'Year 2', 'n'],
      ['y3', 'Year 3', 'n'],
      ['y4', 'Year 4', 'n'],
      ['y5', 'Year 5', 'n'],
      ['avgContract', 'Average contract value', 'n'],
      ['ltcStart', 'LTC contract start date', 'd'],
      ['ltcEnd', 'LTC contract end date', 'd'],
      ['ltcLength', 'LTC contract length', 'n'],
    ],
    right: [
      ['payType', 'Payment type', 's', ['PO', 'Credit card', 'Wire', 'Invoice']],
      ['arrOrig', 'ARR original amount', 'n'],
      ['flexInit', 'FlexPay (initial)', 'b'],
      ['flexSub', 'FlexPay (subsequent)', 'b'],
      ['priorPo', 'Prior opp PO number', 't'],
    ],
  },
  {
    id: 'extra',
    title: 'Additional Deal Information',
    left: [
      ['aceId', 'AWS ACE opportunity ID', 't'],
      ['aceStatus', 'AWS ACE status', 't'],
      ['bitbar', 'BitBar device pending', 'b'],
      ['mgrName', 'Manager name', 't'],
      ['planhat', 'Planhat opp sync', 'b'],
      ['salesPlays', 'Sales plays', 't'],
      ['notes', 'At-risk notes', 'ta'],
      ['sdrShadow', 'SDR deal shadow', 't'],
      ['closedRole', 'Closed owner role', 't'],
      ['forecastBig', 'Forecasted big deal', 'b'],
    ],
    right: [
      ['bestCase', 'Best case', 'n'],
      ['m2s', 'M2S', 'b'],
      ['m2sDisp', 'M2S disposition', 't'],
      ['entDisp', 'ENT support disposition', 't'],
      ['commit', 'Commit', 't'],
      ['jep', 'JEP', 't'],
      ['pullFwd', 'Pull forward', 'n'],
      ['renewalUsd', 'Renewal total amount USD', 'n'],
      ['awsOffer', 'AWS private offer generated', 'b'],
      ['awsOfferId', 'AWS private offer ID', 't'],
      ['awsContact', 'Date of first contact with AWS rep', 'd'],
      ['awsNext', 'Next steps with AWS', 't'],
      ['slmPlan', 'SLM / K8 plan', 't'],
      ['slmDate', 'SLM / K8 plan date', 'd'],
      ['deskStatus', 'Deal desk status', 't'],
      ['deskNotes', 'Deal desk notes', 't'],
      ['apiHub', 'API Hub upgraded customer', 't'],
      ['churn12', 'Risk / churn last 12 months', 'b'],
      ['coSell', 'Reflect / Atlassian co-sell', 'b'],
      ['dsrLink', 'Digital sales room page link', 't'],
    ],
  },
  {
    id: 'exit',
    title: 'Exit Criteria',
    left: [
      ['xValue', 'Value driver', 't'],
      ['xPain', 'Identified pain', 't'],
      ['xMap', 'MAP', 't'],
      ['xChampion', 'Champion', 't'],
      ['xTech', 'Technical fit confirmed', 'b'],
      ['xPoc', 'POC pack', 't'],
      ['competitor2', 'Competitors', 't'],
      ['xBudget', 'Prospect budget process', 't'],
      ['xEcon', 'Economic buyer', 't'],
      ['xTechWin', 'Technical win confirmed', 'b'],
    ],
    right: [
      ['procContact', 'Procurement contact', 't'],
      ['xCriteria', 'Decision criteria', 't'],
      ['xVendor', 'Vendor of choice confirmed', 'b'],
      ['xPaperwork', 'Backend paperwork started', 'b'],
    ],
  },
  {
    id: 'qual',
    title: 'Qualification Criteria',
    left: [
      ['demo', 'Most recent demo', 'd'],
      ['valDriver', 'Value driver', 't'],
      ['pain', 'Identified pain', 'ta'],
      ['decisionCrit', 'Decision criteria', 't'],
      ['procProcess', 'Procurement process', 't'],
      ['champion', 'Champion', 't'],
      ['genNotes', 'General notes', 'ta'],
      ['desc', 'Description', 'ta'],
    ],
    right: [
      (o) => {
        const filled = [...QUAL_KEYS, ...CHECK_KEYS].filter((k) => gv(o, k)).length;
        return sfRow(
          'Qualification score',
          Math.round((filled / (QUAL_KEYS.length + CHECK_KEYS.length)) * 100)
        );
      },
      ['urgency', 'Urgency', 's', ['Low', 'Medium', 'High', 'Immediate']],
      ['urgencyNote', 'Urgency details', 't'],
      ['next', 'Next step', 't'],
      ['nextDate', 'Next step date', 'd'],
      ['econBuyer', 'Economic buyer', 't'],
      ['callBrief', 'Most recent call brief – Gong', 't'],
      ['nextGong', 'Next steps – Gong', 't'],
    ],
  },
  {
    id: 'notes',
    title: 'Win / Loss',
    left: [['won', 'Why we won', 'ta']],
    right: [['lost', 'Why we lost', 'ta']],
  },
];

// Every field label, for the field-history card.
const SF_LABELS = Object.fromEntries(
  [
    ...LEFT,
    ...RIGHT,
    ...SF_SECTIONS.flatMap((s) => [...s.left, ...s.right].filter(Array.isArray)),
  ].map((f) => [f[0], f[1]])
);
function recordFieldChange(o, k, from, to) {
  (o.fh = o.fh || []).unshift({
    t: Date.now(),
    f: SF_LABELS[k] || k,
    by: roleNow().name,
    from,
    to,
  });
  o.fh = o.fh.slice(0, 100);
}

function toggleSec(id, open) {
  S.secClosed = S.secClosed || {};
  if (!!S.secClosed[id] === !open) return;
  S.secClosed[id] = !open;
  save();
}
function toggleRel(id) {
  S.relClosed = S.relClosed || {};
  S.relClosed[id] = !S.relClosed[id];
  const b = document.getElementById('rel-' + id);
  if (b) b.style.display = S.relClosed[id] ? 'none' : '';
  save();
}

const sectionHtml = (o, s) => {
  const col = (list) => list.map((f) => (typeof f === 'function' ? f(o) : fld(o, f))).join('');
  return `<details class="sf-sec" ${(S.secClosed || {})[s.id] ? '' : 'open'} ontoggle="toggleSec('${s.id}',this.open)"><summary><span class="ms sf-chev">expand_more</span>${s.title}</summary><div class="sf-grid"><div>${col(s.left)}</div><div>${col(s.right)}</div></div></details>`;
};

// ----- right-hand related list cards -----
const kv = (label, v) => `<div class="sf-kv"><div>${label}</div><div>${v}</div></div>`;
function relCard(id, icon, color, title, count, body, viewAll, plus, addJs, addLabel) {
  const closed = (S.relClosed || {})[id];
  return `<div class="sf-rel"><div class="sf-rel-h"><span class="sf-ic" style="background:${color}"><span class="ms">${icon}</span></span><b class="flex-1">${title} (${count}${plus ? '+' : ''})</b>${addJs ? `<button type="button" class="btn" onclick="${addJs}">${addLabel || 'Add'}</button>` : ''}<button type="button" class="hdr-ic" style="width:28px;height:28px" aria-label="Show or hide ${title}" onclick="toggleRel('${id}')"><span class="ms">arrow_drop_down</span></button></div><div id="rel-${id}" style="${closed ? 'display:none' : ''}"><div class="sf-rel-b">${body || '<p class="mut py-2">Nothing here yet.</p>'}</div>${viewAll ? `<a class="sf-viewall" onclick="${viewAll}">View All</a>` : ''}</div></div>`;
}
const histVal = (v) => (v === true ? '✓' : v === false || v === '' || v == null ? '–' : E(v));

function sidebarHtml(o) {
  const Q = S.quotes.filter((q) => q.opp == o.id),
    R = roles(o),
    P = (o.partners = o.partners || []),
    acts = S.acts[o.id] || [],
    files = o.attachments || [],
    last = acts[0],
    stageRows = (
      o.sh && o.sh.length
        ? o.sh
        : [
            {
              stage: o.lost ? 'Closed Lost' : ST[o.stage],
              amount: o.amount,
              close: o.close,
              by: '',
              t: last ? last.t : 0,
            },
          ]
    ).slice(0, 3),
    fh = o.fh || [],
    links = [
      ['Contact roles', R.length, 'rel-contacts'],
      ['Products', o.items.length, 'rel-products'],
      ['Quotes', Q.length, 'rel-quotes'],
      ['Partners', P.length, 'rel-partners'],
      ['Files', files.length, 'rel-files'],
      ['Activities', acts.length, 'rel-acts'],
    ];
  return [
    `<div class="sf-rel"><div class="sf-rel-h"><b class="flex-1">Related List Quick Links</b></div><div class="sf-rel-b grid grid-cols-2 gap-1 py-2">${links
      .map(
        (l) =>
          `<a class="rep-link" onclick="document.getElementById('${l[2]}').scrollIntoView({block:'center',behavior:'smooth'})">${l[0]} (${l[1]})</a>`
      )
      .join('')}</div></div>`,
    relCard(
      'contacts',
      'groups',
      '#0b63c5',
      'Contact Roles',
      R.length,
      R.map((r) => {
        const c = S.contacts.find((x) => x[0] == r.name) || [];
        return `<div class="sf-rec"><b>${E(r.name)}</b>${r.primary ? ' <span class="chip ok">Primary</span>' : ''}${kv('Role', E(r.role))}${kv('Title', E(c[1] || '–'))}${kv('Phone', E(c[4] || '–'))}</div>`;
      }).join(''),
      null,
      false,
      "modal('role')"
    ),
    relCard(
      'partners',
      'handshake',
      '#c2410c',
      'Opportunity Partners',
      P.length,
      P.map(
        (p) =>
          `<div class="sf-rec"><b>${E(p.name)}</b>${kv('Partner Type', E(p.type || '–'))}</div>`
      ).join(''),
      null,
      false,
      "modal('partner')"
    ),
    relCard(
      'quotes',
      'request_quote',
      '#2e9e5b',
      'Quotes',
      Q.length,
      Q.map(
        (q) =>
          `<div class="sf-rec"><a class="rep-link" onclick="openQuoteRecord('${E(q.no)}')">${E(q.no)}</a>${q.isDefault ? ' <span class="chip">Default</span>' : ''}${kv('Quote Name', E(q.name || '–'))}${kv('Status', quoteStatusChip(q))}${kv('Price', `<b>${M(quoteTotal(q))}</b>`)}${(q.sends || []).length ? kv('Sent', E(q.sends[q.sends.length - 1].channel === 'email' ? 'Email · ' + q.sends[q.sends.length - 1].to : 'WhatsApp · ' + q.sends[q.sends.length - 1].to)) : ''}${(q.views || []).length ? kv('Opened', `${q.views.length}× · ${ago(q.views[q.views.length - 1].at)}`) : ''}${q.customer ? kv('Customer', E(q.customer.status)) : ''}${kv('Expiration Date', q.exp ? fd(q.exp) : '–')}</div>`
      ).join(''),
      "tab('related')",
      false,
      `openQuote(${o.id})`,
      'New quote'
    ),
    relCard(
      'products',
      'inventory_2',
      '#d9480f',
      'Products',
      o.items.length,
      o.items
        .map(
          (i) =>
            `<div class="sf-rec"><a class="rep-link" onclick="openQuote(${o.id})">${E(i.n)}</a>${kv('Product Code', E(i.c))}${kv('Quantity', i.q)}${kv('List Price', M(i.p))}${+i.d ? kv('Discount', (+i.d).toFixed(2) + '%') : ''}</div>`
        )
        .join(''),
      "tab('related')"
    ),
    relCard(
      'stage',
      'timeline',
      '#13a38a',
      'Stage History',
      (o.sh || []).length || 1,
      stageRows
        .map(
          (s) =>
            `<div class="sf-rec">${kv('Stage', E(s.stage))}${kv('Amount', M(s.amount))}${kv('Close Date', s.close ? fd(s.close) : '–')}${kv('Last Modified By', E(s.by || '–'))}${kv('Last Modified', s.t ? whenText(s.t) : '–')}</div>`
        )
        .join(''),
      "tab('activity')",
      (o.sh || []).length > 3
    ),
    relCard(
      'fieldhist',
      'history',
      '#e8590c',
      'Opportunity Field History',
      Math.min(fh.length, 3),
      fh
        .slice(0, 3)
        .map(
          (h) =>
            `<div class="sf-rec">${kv('Date', whenText(h.t))}${kv('Field', E(h.f))}${kv('User', E(h.by))}${kv('Original Value', histVal(h.from))}${kv('New Value', histVal(h.to))}</div>`
        )
        .join(''),
      "tab('activity')",
      fh.length > 3
    ),
    relCard(
      'files',
      'attach_file',
      '#6b7a90',
      'Files',
      files.length,
      filesCardBody(files),
      "tab('related')"
    ),
    relCard(
      'acts',
      'event_note',
      '#7c4dff',
      'Activities',
      acts.length,
      acts
        .slice(0, 3)
        .map(
          (a) =>
            `<div class="sf-rec flex gap-2"><span class="ms mut">${E(a.k || 'sync')}</span><div><div>${E(hideInvoiceRefs(a.x))}</div><div class="mut text-xs">${ago(a.t)}</div></div></div>`
        )
        .join(''),
      "tab('activity')",
      acts.length > 3
    ),
  ].join('');
}

function recordPage(o) {
  return `<div class="space-y-3">${SF_SECTIONS.map((s) => sectionHtml(o, s)).join('')}</div>`;
}

// Files card: several ways to add a file (choose files, take a photo / scan, drag and drop, add a link),
// a category for each file, and a list that can be filtered and downloaded.

const FILE_CATS = [
  'General',
  'Proposal',
  'Contract',
  'Customer PO',
  'Payment proof',
  'Photo',
  'Other',
];
const MAX_FILE_BYTES = 100 * 1024 * 1024;

const uploadOppFilesBeforeCats = uploadOppFiles;
uploadOppFiles = async function (fileList) {
  const o = cur();
  if (!o) return;
  const files = Array.from(fileList || []),
    big = files.filter((f) => f.size > MAX_FILE_BYTES),
    ok = files.filter((f) => f.size <= MAX_FILE_BYTES);
  if (big.length) toast(`${big.map((f) => f.name).join(', ')} is over 100 MB and was skipped`);
  if (!ok.length) return;
  const before = (o.attachments || []).length,
    cat = FILE_CATS.includes(S.fileCat) ? S.fileCat : 'General';
  await uploadOppFilesBeforeCats.call(this, ok);
  (o.attachments || []).slice(before).forEach((f) => {
    f.cat = cat;
    f.by = roleNow().name;
  });
  if ((o.attachments || []).length > before) {
    logOpp(
      o.id,
      'sync',
      `${ok.length} file${ok.length === 1 ? '' : 's'} uploaded (${cat}) by ${roleNow().name}`
    );
    save();
    render();
  }
};

const downloadOppFileBeforeLinks = downloadOppFile;
downloadOppFile = function (id) {
  const f = ((cur() || {}).attachments || []).find((x) => x.id === id);
  if (f && f.link) return window.open(f.link, '_blank', 'noopener');
  return downloadOppFileBeforeLinks.apply(this, arguments);
};

function openFileLinkForm() {
  $('#modal').innerHTML =
    `<div class="fixed inset-0 z-40 grid place-items-center p-4" style="background:rgba(0,0,0,.5)"><form class="card p-5 w-full max-w-md space-y-3" onsubmit="saveFileLink(event)"><h2 class="text-lg font-bold">Add a link</h2><p class="mut text-xs">For a file kept in Google Drive, OneDrive, Dropbox or anywhere else.</p>` +
    `<label class="block">Link *<input class="inp" name="url" type="url" required placeholder="https://"></label><label class="block">Name *<input class="inp" name="name" required></label>` +
    `<label class="block">Category<select class="inp" name="cat">${FILE_CATS.map((c) => `<option ${c === S.fileCat ? 'selected' : ''}>${c}</option>`).join('')}</select></label>` +
    `<div class="flex justify-end gap-2"><button type="button" class="btn" onclick="$('#modal').innerHTML=''">Cancel</button><button class="btn btn-p">Add link</button></div></form></div>`;
  $('#modal [name=url]').focus();
}
function saveFileLink(e) {
  e.preventDefault();
  const o = cur(),
    v = Object.fromEntries(new FormData(e.target)),
    url = (v.url || '').trim();
  if (!o) return;
  if (!/^https?:\/\//i.test(url)) return toast('Links must start with http:// or https://');
  (o.attachments = o.attachments || []).push({
    id: 'link-' + Date.now() + Math.random().toString(36).slice(2, 6),
    name: (v.name || '').trim() || url,
    link: url,
    size: 0,
    type: 'Link',
    cat: FILE_CATS.includes(v.cat) ? v.cat : 'General',
    addedAt: Date.now(),
    by: roleNow().name,
  });
  logOpp(o.id, 'sync', `Link “${(v.name || url).trim()}” added by ${roleNow().name}`);
  $('#modal').innerHTML = '';
  save();
  toast('Link added');
  render();
}
function setFileCat(c) {
  S.fileCat = c;
  const sel = document.querySelectorAll('select.file-cat');
  sel.forEach((s) => (s.value = c));
}
function setFileFilter(c) {
  S.fileFilter = c;
  render();
}
function fileRow(f) {
  return `<div class="sf-rec flex items-center gap-2"><span class="ms mut">${f.link ? 'link' : attachmentIcon(f.name)}</span><div class="min-w-0 flex-1"><a class="rep-link break-words" onclick="downloadOppFile('${E(f.id)}')">${E(f.name)}</a><div class="mut text-xs">${f.cat ? `<span class="chip">${E(f.cat)}</span> ` : ''}${f.addedAt ? whenText(f.addedAt) + ' · ' : ''}${f.link ? 'Link' : formatFileSize(f.size)}${f.by ? ' · ' + E(f.by) : ''}</div></div><button class="hdr-ic" style="width:28px;height:28px" title="${f.link ? 'Open link' : 'Download'}" aria-label="Download ${E(f.name)}" onclick="downloadOppFile('${E(f.id)}')"><span class="ms" style="font-size:18px">${f.link ? 'open_in_new' : 'download'}</span></button><button class="hdr-ic" style="width:28px;height:28px" title="Remove" aria-label="Remove ${E(f.name)}" onclick="removeOppFile('${E(f.id)}')"><span class="ms" style="font-size:18px">delete</span></button></div>`;
}
function filesCardBody(files) {
  const flt = S.fileFilter || 'All',
    cats = [...new Set(files.map((f) => f.cat).filter(Boolean))],
    shown = files.filter((f) => flt === 'All' || f.cat === flt);
  return (
    `<div class="file-drop" ondragover="event.preventDefault();this.classList.add('over')" ondragleave="this.classList.remove('over')" ondrop="event.preventDefault();this.classList.remove('over');uploadOppFiles(event.dataTransfer.files)">` +
    `<div class="flex gap-2 flex-wrap justify-center"><label class="btn btn-p cursor-pointer"><span class="ms">upload_file</span>Upload files<input type="file" multiple class="hidden" onchange="uploadOppFiles(this.files);this.value=''"></label>` +
    `<label class="btn cursor-pointer"><span class="ms">photo_camera</span>Take photo<input type="file" accept="image/*" capture="environment" class="hidden" onchange="uploadOppFiles(this.files);this.value=''"></label>` +
    `<button type="button" class="btn" onclick="openFileLinkForm()"><span class="ms">link</span>Add link</button></div>` +
    `<div class="mut text-xs mt-2 text-center">or drop files here · up to 100 MB each</div>` +
    `<label class="block mt-2 text-xs"><span class="mut">Category for new files</span><select class="inp file-cat" onchange="setFileCat(this.value)">${FILE_CATS.map((c) => `<option ${c === (S.fileCat || 'General') ? 'selected' : ''}>${c}</option>`).join('')}</select></label></div>` +
    (cats.length > 1
      ? `<div class="flex gap-1 flex-wrap my-2">${['All', ...cats].map((c) => `<button type="button" class="btn ${c === flt ? 'btn-p' : ''}" style="padding:2px 10px;font-size:12px" onclick="setFileFilter('${E(c)}')">${E(c)}</button>`).join('')}</div>`
      : '') +
    shown.slice(0, 8).map(fileRow).join('') +
    (shown.length > 8
      ? `<div class="mut text-xs mt-1">and ${shown.length - 8} more · View All</div>`
      : '')
  );
}

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

// Open-record tabs: rename (double-click, pencil or F2), Alt+1..9 to switch, and the first render.

const tabIsActive = (id) =>
  ['#opp-detail', '#quote'].includes(location.hash) && String(S.cur) === String(id);

// Tabs the signed-in person is allowed to see, in bar order.
function visibleTabIds() {
  S.openTabs = S.openTabs || [];
  const allowed = new Set(visibleOpps().map((o) => o.id));
  return S.openTabs.filter((id) => allowed.has(id));
}

// A tab shows its custom name if one was set, otherwise the opportunity name.
function tabLabel(id) {
  const o = S.opps.find((x) => x.id == id);
  return (S.tabNames && S.tabNames[id]) || (o ? o.name : '');
}

function drawOppTabs() {
  const header = document.querySelector('header');
  if (!header) return;
  let bar = document.getElementById('rec-tabs');
  if (!bar) {
    bar = document.createElement('div');
    bar.id = 'rec-tabs';
    bar.className = 'rec-tabs';
    header.appendChild(bar);
  }
  S.openTabs = S.openTabs || [];
  // Opening an opportunity (from anywhere) adds it to the tab bar.
  if (
    location.hash === '#opp-detail' &&
    S.cur &&
    S.opps.some((o) => o.id == S.cur) &&
    !S.openTabs.includes(S.cur)
  ) {
    S.openTabs.push(S.cur);
    save();
  }
  const tabs = visibleTabIds();
  bar.style.display = S.authUser && tabs.length ? 'flex' : 'none';
  bar.innerHTML = tabs
    .map((id, i) => {
      const label = tabLabel(id);
      const hint = i < 9 ? ` (Alt+${i + 1})` : '';
      const key = i < 9 ? `<kbd>${i + 1}</kbd>` : '';
      return `<div class="rec-tab ${tabIsActive(id) ? 'on' : ''}" data-id="${id}" title="${E(label)}${hint}" onclick="nav('opp-detail',${id})" ondblclick="renameOppTab(${id},event)"><span class="ms">handshake</span>${key}<span class="rec-tab-name">${E(label)}</span><button class="rec-tab-x" aria-label="Rename tab" title="Rename tab" onclick="renameOppTab(${id},event)"><span class="ms" style="font-size:14px">edit</span></button><button class="rec-tab-x" aria-label="Close tab" onclick="closeOppTab(${id},event)"><span class="ms">close</span></button></div>`;
    })
    .join('');
}

function setTabName(id, name) {
  S.tabNames = S.tabNames || {};
  const clean = name.trim().slice(0, 40);
  const o = S.opps.find((x) => x.id == id);
  // Empty or same as the opportunity name means "go back to the default".
  if (!clean || (o && clean === o.name)) delete S.tabNames[id];
  else S.tabNames[id] = clean;
  save();
}

// Swap the tab label for a text box. Enter or click away saves, Esc cancels.
function renameOppTab(id, ev) {
  if (ev) {
    ev.stopPropagation();
    ev.preventDefault();
  }
  const tab = document.querySelector(`.rec-tab[data-id="${id}"]`);
  const nameEl = tab && tab.querySelector('.rec-tab-name');
  if (!nameEl) return;
  const input = document.createElement('input');
  input.className = 'inp rec-tab-edit';
  input.value = tabLabel(id);
  input.maxLength = 40;
  input.setAttribute('aria-label', 'Tab name');
  let finished = false;
  const finish = (keep) => {
    if (finished) return;
    finished = true;
    if (keep) setTabName(id, input.value);
    drawOppTabs();
  };
  input.onclick = (e) => e.stopPropagation();
  input.ondblclick = (e) => e.stopPropagation();
  input.onkeydown = (e) => {
    e.stopPropagation();
    if (e.key === 'Enter') finish(true);
    else if (e.key === 'Escape') finish(false);
  };
  input.onblur = () => finish(true);
  nameEl.replaceWith(input);
  input.focus();
  input.select();
}

function closeOppTab(id, ev) {
  if (ev) ev.stopPropagation();
  const i = S.openTabs.indexOf(id);
  if (i < 0) return;
  const wasActive = tabIsActive(id);
  S.openTabs.splice(i, 1);
  if (S.tabNames) delete S.tabNames[id];
  save();
  if (!wasActive) return drawOppTabs();
  const next = S.openTabs[i] ?? S.openTabs[i - 1];
  next ? nav('opp-detail', next) : nav('opps');
}

// Alt+1 ... Alt+9 jump to the nth open tab. F2 renames the tab you are on.
addEventListener('keydown', (e) => {
  if (!S.authUser) return;
  if (e.key === 'F2' && !e.altKey && !e.ctrlKey && !e.metaKey) {
    const active = visibleTabIds().find(tabIsActive);
    if (active == null || /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)) return;
    e.preventDefault();
    return renameOppTab(active);
  }
  if (!e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
  // e.code, not e.key: on a Mac Option+digit types a symbol instead of the digit.
  const m = /^(?:Digit|Numpad)([1-9])$/.exec(e.code);
  if (!m) return;
  const id = visibleTabIds()[Number(m[1]) - 1];
  if (id == null) return;
  e.preventDefault();
  nav('opp-detail', id);
});

const renderWithoutTabs = render;
render = function () {
  renderWithoutTabs.apply(this, arguments);
  drawOppTabs();
};
addEventListener('hashchange', () => drawOppTabs());

save();
render();

// Quote record page (Salesforce-style) and the "New Quote" pop-up.
// Layout: breadcrumb, header actions, details strip, status path, then three columns
// (Quote / Client information | Line items, addresses, financial summary | Approvals, PDFs, activity).
// It reuses every existing action (submitQuote, approveQuote, syncQuote, openSendQuote, …).

const QR_PATH = ['Draft', 'Needs Review', 'In Review', 'Approved', 'Presented', 'Accepted'];

// Where the quote sits on the status path.
function qrPathIndex(q) {
  if (q.status === 'Paid' || (q.customer && q.customer.status === 'Accepted')) return 5;
  if (q.status === 'Sent to client') return 4;
  if (q.status === 'Approved') return 3;
  if (String(q.status).startsWith('Pending')) return 2;
  return (q.notes || '').trim() && ['Draft', 'Rejected'].includes(q.status) ? 1 : 0;
}
function qrPath(q) {
  const at = qrPathIndex(q),
    bad = q.status === 'Rejected' || q.status === 'Expired';
  return `<nav class="qr-path" aria-label="Quote status">${QR_PATH.map((s, i) => {
    const cls = i < at ? 'done' : i === at ? (bad ? 'bad' : 'cur') : '';
    return `<div class="qr-step ${cls}">${i < at ? '<span class="ms">check</span>' : ''}${i === at && i === 3 ? '<small>APPROVED</small>' : ''}<span>${i === at && i === 3 ? '' : s}${i === at && i === 3 ? 'Approved' : ''}</span></div>`;
  }).join('')}</nav>`;
}

// ---------- small helpers ----------
const qrList = (q) => q.items.reduce((a, i) => a + i.p * i.q, 0);
const qrRow = (k, v) => `<div class="qr-kv"><span>${k}</span><b>${v}</b></div>`;
const qrCard = (title, body, extra) =>
  `<section class="qr-card"><header><b>${title}</b>${extra || ''}</header><div class="qr-body">${body}</div></section>`;
const qrMoney = (n) => M(n);

function qrSortedItems(q) {
  const rows = q.items.map((i, k) => ({ i, k }));
  if (S.qSort === 'name') rows.sort((a, b) => String(a.i.n).localeCompare(String(b.i.n)));
  if (S.qSort === 'sub')
    rows.sort((a, b) => b.i.p * b.i.q * (1 - b.i.d / 100) - a.i.p * a.i.q * (1 - a.i.d / 100));
  return rows;
}
function qrCycleSort() {
  S.qSort = !S.qSort ? 'name' : S.qSort === 'name' ? 'sub' : '';
  toast(S.qSort === 'name' ? 'Sorted by product name' : S.qSort === 'sub' ? 'Sorted by subtotal' : 'Original order');
  render();
}
function qrToggleEdit() {
  S.qEdit = S.qEdit === false;
  render();
}
function qrToggleInfo() {
  S.qInfoEdit = !S.qInfoEdit;
  render();
}

// ---------- line items ----------
function qrLines(q, locked) {
  const floor = belowProductFloor(q),
    edit = !locked && S.qEdit !== false,
    products = S.products
      .filter((p) => p.active !== false)
      .map((p) => `<option value="${E(p.code)}">${E(p.name)} · ${M(p.listPrice)}</option>`)
      .join(''),
    bundles =
      typeof priceBook === 'function'
        ? priceBook().bundles.filter((b) => b.active !== false)
        : [],
    rows = qrSortedItems(q)
      .map(({ i, k }, n) => {
        const net = i.p * (1 - i.d / 100),
          low = floor.includes(i),
          qty = edit
            ? `<input class="qr-num" type="number" min="1" value="${i.q}" aria-label="Quantity" onchange="changeQuoteItem(${k},'q',this.value)">`
            : i.q,
          disc = edit
            ? `<input class="qr-num" type="number" min="0" max="100" step="0.1" value="${i.d}" aria-label="Discount percent" title="${canGiveDiscount() ? '' : 'Your discount goes to Admin / CEO for approval'}" onchange="changeQuoteItem(${k},'d',this.value)">`
            : `<span class="qr-pill ${i.d ? 'ok' : ''}">${i.d}%</span>`;
        return `<tr><td class="qr-mut">${n + 1}</td><td><b>${E(i.n)}</b><div class="qr-sub">${E(i.c)}${i.bundle ? ` · <span class="qr-tag">Bundle: ${E(i.bundle)}</span>` : ''}${low ? ' · <span class="qr-tag bad">Below min price</span>' : ''}</div></td><td class="qr-r">${qty}</td><td class="qr-r">${qrMoney(i.p)}</td><td class="qr-r">${disc}</td><td class="qr-r">${qrMoney(net)}</td><td class="qr-r"><b>${qrMoney(net * i.q)}</b></td>${edit ? `<td class="qr-r"><button class="qr-x" title="Remove" aria-label="Remove line" onclick="removeQuoteItem(${k})"><span class="ms">delete</span></button></td>` : ''}</tr>`;
      })
      .join('');
  const tools = locked
    ? ''
    : `<select class="qr-btn" aria-label="Add products" onchange="addQuoteProduct(this.value);this.value=''"><option value="">+ Add Products</option>${products}</select>` +
      (bundles.length
        ? `<select class="qr-btn" aria-label="Add bundle" onchange="addQuoteBundle(this.value);this.value=''"><option value="">+ Add Bundle</option>${bundles.map((b) => `<option value="${E(b.id)}">${E(b.name)} (${b.pct}% off)</option>`).join('')}</select>`
        : '') +
      (typeof openCart === 'function'
        ? `<button class="qr-btn" onclick="openCart()"><span class="ms">shopping_cart</span>Cart${typeof cartCount === 'function' && cartCount() ? ` <span class="qr-pill ok">${cartCount()}</span>` : ''}</button>`
        : '') +
      `<button class="qr-btn" onclick="qrToggleEdit()">${edit ? 'Done editing' : 'Edit Products'}</button>` +
      (canGiveDiscount()
        ? `<button class="qr-btn" onclick="applyTieredDiscount()" title="Quantity-tier discount">Tiered discount</button>`
        : '');
  return `<section class="qr-card"><header class="qr-lines-head"><b>Line Items Table</b><span class="qr-pill">${q.items.length} ${q.items.length === 1 ? 'Item' : 'Items'}</span><span class="flex-1"></span>${tools}<button class="qr-btn" onclick="qrCycleSort()"><span class="ms">sort</span>Sort${S.qSort ? ' · ' + (S.qSort === 'name' ? 'Name' : 'Subtotal') : ''}</button></header><div class="qr-scroll"><table class="qr-table"><thead><tr><th>#</th><th>Line item</th><th class="qr-r">Qty</th><th class="qr-r">List price</th><th class="qr-r">Discount</th><th class="qr-r">Net price</th><th class="qr-r">Subtotal</th>${edit ? '<th></th>' : ''}</tr></thead><tbody>${rows || '<tr><td colspan="8" class="qr-mut" style="padding:18px">No products yet. Use “Add Products”.</td></tr>'}</tbody></table></div></section>`;
}

// ---------- financial summary ----------
function qrTax(q, o) {
  try {
    if (typeof invoiceCalc !== 'function') return null;
    const c = invoiceCalc({ account: o.account, items: q.items, terms: q.terms });
    return c && c.g ? c : null;
  } catch (e) {
    return null;
  }
}
function qrFinancial(q, o) {
  const list = qrList(q),
    total = quoteTotal(q),
    off = list - total,
    pct = list ? (off / list) * 100 : 0,
    tax = qrTax(q, o),
    inclusive = tax && tax.g.mode === 'inclusive',
    taxAmt = tax ? tax.cgst + tax.sgst + tax.igst : 0,
    grand = tax && !inclusive ? tax.gross : total;
  return `<section class="qr-card qr-fin"><header><b>Financial Summary</b></header><div class="qr-body">${qrRow('Subtotal', qrMoney(list))}<div class="qr-kv"><span>Discount</span><b class="qr-green">${pct ? pct.toFixed(2) + '% (−' + qrMoney(off) + ')' : '—'}</b></div><div class="qr-kv qr-strong"><span>Total Price</span><b>${qrMoney(total)}</b></div>${tax && taxAmt ? qrRow(inclusive ? 'GST (included)' : 'GST', qrMoney(taxAmt)) : ''}</div><div class="qr-grand"><div><small>GRAND TOTAL</small><strong>${qrMoney(grand)}</strong></div><span class="qr-pill dark">${E(q.terms || 'Net 30')} Term</span></div></section>`;
}

// ---------- left column ----------
function qrInfo(q, o, d, locked) {
  const start = q.createdAt ? fd(new Date(q.createdAt).toISOString().slice(0, 10)) : '—';
  if (S.qInfoEdit && !locked) {
    const f = (l, c) => `<label class="qr-field"><span>${l}</span>${c}</label>`;
    return qrCard(
      'Quote Information',
      f('Quote name', `<input class="inp" value="${E(d.name)}" onchange="S.qd.name=this.value">`) +
        f('Expiration date', `<input type="date" class="inp" value="${E(q.exp || '')}" onchange="S.qd.exp=this.value">`) +
        f('Payment terms', `<select class="inp" onchange="S.qd.terms=this.value">${PAYMENT_TERMS.map((t) => `<option ${t === (q.terms || 'Net 30') ? 'selected' : ''}>${t}</option>`).join('')}</select>`) +
        f('Prepared for', `<input class="inp" value="${E(d.preparedFor)}" onchange="S.qd.preparedFor=this.value">`) +
        f('Email', `<input class="inp" type="email" value="${E(d.toEmail)}" placeholder="customer@company.com" onchange="S.qd.toEmail=this.value">`) +
        f('WhatsApp', `<input class="inp" type="tel" value="${E(d.toPhone)}" placeholder="+91 98765 43210" onchange="S.qd.toPhone=this.value">`) +
        f('Billing address', `<textarea class="inp" rows="2" onchange="S.qd.address=this.value">${E(d.address)}</textarea>`) +
        f('Shipping address', `<textarea class="inp" rows="2" onchange="S.qd.shipping=this.value">${E(d.shipping)}</textarea>`) +
        `<div class="qr-actions"><button class="qr-btn" onclick="qrToggleInfo()">Close</button><button class="qr-btn pri" onclick="storeQuote(S.qd);save();S.qInfoEdit=false;toast('Quote details saved');render()">Save</button></div>`,
      ''
    );
  }
  return qrCard(
    'Quote Information',
    qrRow('Primary', q.primary === false ? 'No' : 'Yes') +
      qrRow('Start Date', start) +
      qrRow('End Date', q.exp ? fd(q.exp) : '—') +
      qrRow('Payment Terms', E(q.terms || 'Net 30')) +
      qrRow('Owner', E(ownerLabel(o.owner))),
    locked ? '' : `<a class="qr-link" onclick="qrToggleInfo()">Edit</a>`
  );
}
function qrClient(q, o, d) {
  const acc = (S.accountInfo || {})[o.account] || {},
    name = String(d.preparedFor || '').replace(/\s*\(.*\)\s*$/, ''),
    title = (String(d.preparedFor).match(/\((.*)\)\s*$/) || [])[1] || '',
    block = (label, html) => `<div class="qr-blk"><small>${label}</small>${html}</div>`;
  return qrCard(
    'Client Information',
    block(
      'BILLING ADDRESS',
      `<div class="qr-strong">${E(o.account)}</div><div style="white-space:pre-wrap">${E(d.address || acc.address || '—')}</div>`
    ) +
      block('EMAIL', d.toEmail ? `<a class="qr-link" href="mailto:${E(d.toEmail)}">${E(d.toEmail)}</a>` : '—') +
      block(
        'PRIMARY CONTACT',
        `<div class="qr-strong">${E(name || '—')}</div>${title ? `<div>${E(title)}</div>` : ''}${d.toPhone ? `<a class="qr-link" href="tel:${E(d.toPhone)}">${E(d.toPhone)}</a>` : ''}`
      )
  );
}

// ---------- right column ----------
function qrApprovals(q, floor, locked) {
  const hist = (q.history || []).filter((h) => ['Submitted', 'Approved', 'Rejected', 'Escalated'].includes(h.action)),
    pending = String(q.status).startsWith('Pending'),
    done = ['Approved', 'Sent to client', 'Paid'].includes(q.status),
    rows = [];
  if (done)
    rows.push(
      `<div class="qr-appr"><span class="qr-ok ms">check_circle</span><div><b>Approved by ${E(q.approvedBy || 'approver')}</b><div class="qr-sub">Date: ${q.approvedAt ? fd(new Date(q.approvedAt).toISOString().slice(0, 10)) : '—'}</div>${q.approvedNotes ? `<div class="qr-sub">${E(q.approvedNotes)}</div>` : ''}</div></div>`
    );
  if (pending)
    rows.push(
      `<div class="qr-appr"><span class="qr-wait ms">hourglass_top</span><div><b>Awaiting ${E(q.nextApprover || 'approver')}</b><div class="qr-sub">Submitted by ${E(q.createdBy || '')} · ${whenText(q.requestedAt)}</div></div></div>`
    );
  if (q.status === 'Rejected')
    rows.push(
      `<div class="qr-appr"><span class="qr-bad ms">cancel</span><div><b>Rejected by ${E(q.rejectedBy || '')}</b><div class="qr-sub">${whenText(q.rejectedAt)}${q.rejectedNotes ? ' — ' + E(q.rejectedNotes) : ''}</div></div></div>`
    );
  const route = quoteRoute(q),
    count = done ? '1 / 1' : pending || q.status === 'Rejected' ? '0 / 1' : '—',
    notes = locked
      ? q.notes
        ? `<div class="qr-blk"><small>NOTES FOR APPROVAL</small><div>${E(q.notes)}</div></div>`
        : ''
      : `<label class="qr-field"><span>Notes for approval <i class="qt-req">*</i></span><textarea id="qr-notes" class="inp" rows="3" placeholder="Explain the discount or pricing so the approver can decide." oninput="S.qd.notes=this.value">${E(q.notes || '')}</textarea></label><div class="qr-sub">${route.approver ? 'Will go to: <b>' + E(route.approver) + '</b>' : ''}${floor.length ? ' · Below minimum price → CEO' : ''}</div>`;
  return qrCard(
    'Approvals',
    (rows.join('') || (locked ? '' : '')) + notes + (!rows.length && locked ? '<div class="qr-sub">No approval needed.</div>' : ''),
    `<span class="qr-pill ${done ? 'ok' : ''}">${count}</span>`
  );
}
function qrPdfs(q) {
  const list = q.pdfs || [];
  return qrCard(
    'Quote PDFs',
    list.length
      ? list
          .slice()
          .reverse()
          .map(
            (p) =>
              `<div class="qr-pdf"><span class="qr-pdfi">PDF</span><div><b>${E(p.name)}</b><div class="qr-sub">Created ${ago(p.at)} · ${p.kb} KB</div></div></div><div class="qr-links"><a class="qr-link" onclick="printQuote()">View</a>${quoteIsSendable(q) ? '<a class="qr-link" onclick="openSendQuote()">Email PDF</a>' : ''}</div>`
          )
          .join('')
      : '<div class="qr-sub">No PDF yet. Use “Create PDF”.</div>',
    `<span class="qr-pill">${list.length}</span>`
  );
}
function qrActivity(q, o) {
  const ev = [];
  (q.history || []).forEach((h) => ev.push({ t: h.t, a: `${E(h.action)} · ${E(h.by)}`, n: h.note }));
  (q.sends || []).forEach((s) =>
    ev.push({ t: s.at, a: `Sent by ${s.channel === 'email' ? 'email' : 'WhatsApp'}`, n: s.to })
  );
  if (q.signedBy) ev.push({ t: q.signedAt, a: `Signed by ${E(q.signedBy)}` });
  if (q.syncedAt) ev.push({ t: q.syncedAt, a: 'Synced to the opportunity' });
  ev.push({ t: q.createdAt || 0, a: `Created by ${E(q.createdBy || ownerLabel(o.owner))}` });
  ev.sort((a, b) => (b.t || 0) - (a.t || 0));
  return qrCard(
    'Activity history',
    ev
      .slice(0, 8)
      .map(
        (e) =>
          `<div class="qr-act"><i></i><div><b>${e.a}</b>${e.n ? `<div class="qr-sub">${E(e.n)}</div>` : ''}${e.t ? `<div class="qr-sub">${whenText(e.t)}</div>` : ''}</div></div>`
      )
      .join('')
  );
}

// ---------- header ----------
function qrHeader(q, o, inv, locked) {
  const syncOk = !String(q.status).startsWith('Pending') && q.status !== 'Rejected',
    ok = quoteApproved(q),
    review = canReview(q),
    menu = `<details class="qr-menu"><summary class="qr-btn" aria-label="More actions"><span class="ms">expand_more</span></summary><div class="qr-pop">` +
      `<button ${ok ? '' : 'disabled'} onclick="openSignForm()"><span class="ms">draw</span>Sign</button>` +
      `<button ${ok ? '' : 'disabled'} onclick="openPoForm()"><span class="ms">receipt_long</span>Customer PO</button>` +
      `<button ${quoteIsSendable(q) ? '' : 'disabled'} onclick="openSendQuote()"><span class="ms">send</span>Send to customer</button>` +
      ((q.status === 'Expired' || quoteExpired(q)) && S.role !== 'rep'
        ? `<button onclick="extendQuote()"><span class="ms">event_repeat</span>Extend expiry</button>`
        : '') +
      (!locked ? `<button onclick="saveQuoteDraft()"><span class="ms">save</span>Save as draft</button>` : '') +
      (inv && canSeeInvoices() ? `<button onclick="openInvoice('${inv.id}')"><span class="ms">receipt</span>Open ${E(inv.invoiceNo)}</button>` : '') +
      `<label class="qr-check" title="${canGiveDiscount() ? '' : 'Only Admin and CEO can change this'}"><input type="checkbox" ${q.showDiscount ? 'checked' : ''} ${canGiveDiscount() ? '' : 'disabled'} onchange="setShowDiscount(this.checked)"> Show discount on bill</label>` +
      `<button onclick="nav('opp-detail')"><span class="ms">arrow_back</span>Back to opportunity</button></div></details>`;
  return `<header class="qr-head"><div class="qr-title"><span class="qr-icon"><span class="ms">description</span></span><div><small>QUOTE</small><h1>${E(q.no)}</h1></div></div><div class="qr-acts">${q.syncedAt ? '<span class="qr-synced"><span class="ms">sync</span>Synced Quote</span>' : ''}${locked ? '' : `<button class="qr-btn" onclick="qrToggleInfo()">Edit</button>`}<button class="qr-btn" onclick="createQuotePdf()">Create PDF</button><button class="qr-btn ${q.syncedAt ? '' : 'pri'}" ${syncOk ? '' : 'disabled'} title="${syncOk ? "Copy this quote's products and total to the opportunity" : 'Not available while the quote is pending or rejected'}" onclick="syncQuote()"><span class="ms">sync</span>${q.syncedAt ? 'Re-sync' : 'Start Sync'}</button>${review ? `<button class="qr-btn bad" onclick="rejectQuote('${E(q.no)}')">Reject</button><button class="qr-btn pri" onclick="approveQuote('${E(q.no)}')">Approve</button>` : ''}${locked ? '' : `<button class="qr-btn pri" onclick="submitQuote()">Submit for Approval</button>`}${menu}</div></header>`;
}

// ---------- page ----------
V.quote = () => {
  const q = S.qd,
    o = cur();
  if (!q || !o) return V.opps();
  const inv = q.invoiceId && S.invoices.find((i) => i.id === q.invoiceId),
    locked = !['Draft', 'Rejected'].includes(q.status),
    d = quoteDefaults(q, o);
  if (!locked) {
    if (q.address === undefined) q.address = d.address;
    if (q.shipping === undefined) q.shipping = d.shipping;
    if (q.toEmail === undefined) q.toEmail = d.toEmail;
    if (q.toPhone === undefined) q.toPhone = d.toPhone;
  }
  const floor = belowProductFloor(q),
    chips = [
      `<span class="qr-pill ok">${E(quoteStatusInfo(q).text)}</span>`,
      q.label && q.label !== 'Draft' && !locked ? `<span class="qr-pill blue">${E(q.label)}</span>` : '',
      q.status === 'Expired' || quoteExpired(q) ? '<span class="qr-pill bad">Expired</span>' : '',
      q.signedBy ? `<span class="qr-pill ok">Signed by ${E(q.signedBy)}</span>` : '',
      q.po ? `<span class="qr-pill ok">PO ${E(q.po.no)}</span>` : '',
      typeof sendQuoteChips === 'function' ? sendQuoteChips(q).replace(/class="chip/g, 'class="qr-pill') : '',
    ].join(' ');
  return `<div class="qr-page"><div class="qr-crumb"><a onclick="nav('opps')">Opportunities</a> › <a onclick="nav('opp-detail')">${E(o.name)}</a> › <span>Quotes</span> › <b>${E(q.no)}</b></div>` +
    qrHeader(q, o, inv, locked) +
    `<div class="qr-strip"><div><small>Quote Number</small><b>${E(q.no)}</b></div><div><small>Account Name</small><b>${acctSpan(o.account)}</b><span>${E(q.name || d.name)}</span></div><div><small>Opportunity</small><a class="qr-link" onclick="nav('opp-detail')">${E(o.name)}</a></div><div class="qr-chips">${chips}</div></div>` +
    qrPath(q) +
    approvalBanner(q, inv).replace('class="qt-banner', 'class="qr-banner qt-banner') +
    (floor.length && !locked
      ? `<div class="qr-banner qt-banner wr"><span class="ms">warning</span><div><b>Below minimum price</b><div>${floor.map((i) => E(i.n)).join(', ')} — this quote goes to the CEO for approval.</div></div></div>`
      : '') +
    `<div class="qr-cols"><aside>${qrInfo(q, o, d, locked)}${qrClient(q, o, d)}</aside><main>${qrLines(q, locked)}<div class="qr-two">${qrCard('Primary Address', qrRow('Billing', E(d.address || '—')) + qrRow('Shipping', E(d.shipping || '—')) + qrRow('Entity Name', E(o.account)) + qrRow('Prepared For', E(d.preparedFor || '—')) + qrRow('Payment Terms', E(q.terms || 'Net 30')) + qrRow('Account Executive', E(ownerLabel(o.owner))), '<span class="qr-mut">Account</span>')}${qrFinancial(q, o)}</div>${tncSection(q, locked)}</main><aside>${qrApprovals(q, floor, locked)}${qrPdfs(q)}${qrActivity(q, o)}</aside></div></div>`;
};

// "Create PDF": opens the print sheet and keeps a record of each PDF in the Quote PDFs card.
function createQuotePdf() {
  const q = S.qd;
  if (!q) return;
  q.pdfs = q.pdfs || [];
  q.pdfs.push({
    name: `${q.no}-V${q.pdfs.length + 1}.pdf`,
    at: Date.now(),
    kb: 38 + q.items.length * 6,
  });
  patchQuote(q.no, { pdfs: q.pdfs });
  printQuote();
}

// Submitting without notes keeps you on the page and points at the notes box.
const submitQuoteBeforeRecord = submitQuote;
submitQuote = function () {
  const q = S.qd;
  if (q && q.items && q.items.length && !(q.notes || '').trim()) {
    toast('Add notes for approval before submitting');
    const t = document.getElementById('qr-notes');
    if (t) {
      t.scrollIntoView({ block: 'center' });
      t.focus();
    }
    return;
  }
  return submitQuoteBeforeRecord.apply(this, arguments);
};

// ---------------------------------------------------------------------------
// New Quote pop-up
// ---------------------------------------------------------------------------
function qfSection(id, title, inner) {
  return `<section class="qf-sec" id="qf-${id}"><button type="button" class="qf-head" onclick="this.parentNode.classList.toggle('shut')"><span class="ms">expand_more</span>${title}</button><div class="qf-grid">${inner}</div></section>`;
}
const qfField = (label, control, req, wide) =>
  `<label class="qf-field ${wide ? 'wide' : ''}"><span>${label}${req ? ' <i class="qt-req">*</i>' : ''}</span>${control}</label>`;
const qfRead = (label, value) =>
  `<div class="qf-field"><span>${label}</span><div class="qf-read">${value}</div></div>`;

function openNewQuoteForm(o) {
  const dq = S.quotes.find((x) => x.opp == o.id && x.isDefault && x.status === 'Draft'),
    no = dq ? dq.no : 'Q-' + (1001 + S.quotes.length),
    d = quoteDefaults({ no }, o),
    list = o.items.reduce((a, i) => a + i.p * i.q, 0),
    net = o.items.reduce((a, i) => a + i.p * i.q * (1 - i.d / 100), 0),
    pct = list ? ((list - net) / list) * 100 : 0,
    contacts = contactsOfAccount(o.account),
    contactName = String(d.preparedFor).replace(/\s*\(.*\)\s*$/, '');
  $('#modal').innerHTML =
    `<div class="qf-back"><button type="button" class="qf-close" aria-label="Close" onclick="$('#modal').innerHTML=''">&times;</button><form class="qf-modal" role="dialog" aria-modal="true" aria-label="New quote" onsubmit="createQuoteFromForm(event,${o.id},false)"><h2>New Quote</h2><div class="qf-scroll">` +
    qfSection(
      'info',
      'Quote Information',
      qfField('Quote Name', `<input class="inp" name="name" required value="${E(d.name)}">`, true) +
        qfField('Expiration Date', `<input type="date" class="inp" name="exp" required value="${D(quoteDefaultsSetting().validityDays)}">`, true) +
        qfField('Status', `<select class="inp" name="label">${QUOTE_STATUS_CHOICES.map((s) => `<option>${E(s)}</option>`).join('')}</select>`) +
        qfRead('Opportunity', E(o.name)) +
        qfRead('Sales Rep / Owner', E(ownerLabel(o.owner)))
    ) +
    qfSection(
      'prep',
      'Prepared For',
      (contacts.length
        ? qfField('Customer Contact', `<select class="inp" onchange="fillQuoteFormContact(this)"><option value="">Choose a contact…</option>${contactOptions(o.account, contactName)}</select>`, false, true)
        : '') +
        qfField('Prepared For', `<input class="inp" name="preparedFor" value="${E(d.preparedFor)}">`) +
        qfField('Email', `<input class="inp" type="email" name="toEmail" value="${E(d.toEmail)}" placeholder="customer@company.com">`) +
        qfField('Phone (WhatsApp)', `<input class="inp" type="tel" name="toPhone" value="${E(d.toPhone)}" placeholder="+91 98765 43210">`)
    ) +
    qfSection(
      'tot',
      'Totals',
      qfRead('Subtotal', M(list)) +
        qfRead('Discount', pct.toFixed(2) + '%') +
        qfRead('Total Price', M(net)) +
        qfRead('Line Items', `${o.items.length} copied from the opportunity`)
    ) +
    qfSection(
      'addr',
      'Address Information',
      qfField('Bill To', `<textarea class="inp" name="address" rows="3">${E(d.address)}</textarea>`) +
        qfField('Ship To', `<textarea class="inp" name="shipping" rows="3">${E(d.shipping)}</textarea>`)
    ) +
    `</div><footer><button type="button" class="qf-btn" onclick="$('#modal').innerHTML=''">Cancel</button><button type="button" class="qf-btn" onclick="createQuoteFromForm(event,${o.id},true)">Save &amp; New</button><button class="qf-btn pri">Save</button></footer></form></div>`;
  const first = $('#modal input');
  if (first) first.focus();
}

// Save opens the quote page; Save & New keeps the quote and opens a blank pop-up for the next one.
createQuoteFromForm = function (e, id, again) {
  if (e && e.preventDefault) e.preventDefault();
  const o = S.opps.find((x) => x.id == id),
    form = (e && e.target && (e.target.form || e.target)) || document.querySelector('#modal form'),
    v = Object.fromEntries(new FormData(form.tagName === 'FORM' ? form : document.querySelector('#modal form')));
  if (!o || !(v.name || '').trim() || !v.exp) return toast('Quote name and expiry date are required');
  const dq = S.quotes.find((x) => x.opp == o.id && x.isDefault && x.status === 'Draft'),
    no = dq ? dq.no : 'Q-' + (1001 + S.quotes.length);
  S.qd = {
    opp: o.id,
    no,
    name: v.name.trim(),
    primary: true,
    exp: v.exp,
    status: 'Draft',
    label: v.label,
    terms: v.terms || quoteDefaultsSetting().terms || 'Net 30',
    preparedFor: (v.preparedFor || '').trim(),
    toEmail: (v.toEmail || '').trim(),
    toPhone: (v.toPhone || '').trim(),
    address: (v.address || '').trim(),
    shipping: (v.shipping || '').trim(),
    showDiscount: false,
    items: clone(o.items),
    createdAt: Date.now(),
    createdBy: roleNow().name,
  };
  storeQuote(S.qd);
  S.quotes.forEach((x) => x.opp == o.id && x.no !== no && (x.primary = false));
  S.cur = o.id;
  S.qstep = 1;
  S.qEdit = true;
  S.qInfoEdit = false;
  save();
  if (again) {
    toast(`Quote ${no} saved`);
    return openNewQuoteForm(o);
  }
  $('#modal').innerHTML = '';
  nav('quote');
};
