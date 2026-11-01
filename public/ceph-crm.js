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
  return S.role === 'rep'
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
 <button class="btn" onclick="S.view='${S.view == 'kanban' ? 'list' : 'kanban'}';render()"><span class="ms">${S.view == 'kanban' ? 'table_rows' : 'view_kanban'}</span>${S.view == 'kanban' ? 'List' : 'Board'}</button><button class="btn btn-p" onclick="modal('opp')"><span class="ms">add</span>New</button></div>`;
  if (S.view == 'list')
    return (
      bar +
      table(
        ['Name', 'Account', 'Stage', 'Amount', 'Close date', 'Assigned rep'],
        L.map(
          (o) =>
            `<tr class="r" onclick="nav('opp-detail',${o.id})"><td><b>${E(o.name)}</b></td><td>${E(o.account)}</td><td>${ST[o.stage]}</td><td>${M(o.amount)}</td><td>${fd(o.close)}</td><td>${E(ownerLabel(o.owner))}</td></tr>`
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
    details: `<div class="card p-4"><b>Details</b><div class="grid md:grid-cols-2 gap-x-8 mt-1"><div>${LEFT.map((f) => fld(o, f)).join('')}</div><div>${RIGHT.map((f) => fld(o, f)).join('')}</div></div></div>`,
    related: `<div class="space-y-3"><div class="card"><div class="p-4 pb-2 flex justify-between"><b>Products (${o.items.length})</b><button class="btn" onclick="openQuote(${o.id})">Edit products in quote</button></div>${table(['Product', 'Qty', 'List price', 'Discount', 'Total'], o.items.map((i) => `<tr><td>${E(i.n)}</td><td>${i.q}</td><td>${M(i.p)}</td><td>${i.d}%</td><td><b>${M(i.p * i.q * (1 - i.d / 100))}</b></td></tr>`).join(''))}</div><div class="card"><div class="p-4 pb-2 flex justify-between"><b>Quotes (${Q.length})</b><button class="btn btn-p" onclick="openQuote(${o.id})">New quote</button></div>${table(
      ['Quote', 'Invoice', 'Total', 'Status', 'Expires'],
      Q.map((q) => {
        const inv = q.invoiceId && S.invoices && S.invoices.find((i) => i.id === q.invoiceId);
        return `<tr class="r" onclick="openQuoteRecord('${q.no}')"><td><b>${q.no}</b></td><td>${inv ? inv.invoiceNo : '—'}</td><td>${M(qcalc(q).tot)}</td><td>${q.status}</td><td>${fd(q.exp)}</td></tr>`;
      }).join('')
    )}</div></div>`,
    activity: `<div class="space-y-3">${sec('Log activity')}<form onsubmit="logAct(event)" class="mt-2 grid sm:grid-cols-4 gap-2"><select name="k" class="inp"><option value="note_alt">Note</option><option value="call">Call</option><option value="mail">Email</option><option value="task_alt">Task</option></select><input name="x" required class="inp sm:col-span-2" placeholder="What happened or what needs doing?"><button class="btn btn-p justify-center">Log</button></form></div>
 ${sec('Upcoming tasks (' + tk.length + ')')}${tk.map((t) => `<label class="flex gap-2 py-2"><input type="checkbox" onchange="S.tasks.splice(S.tasks.indexOf(S.tasks.find(x=>x.t=='${E(t.t).replace(/'/g, '')}')),1);save();toast('Task completed');render()">${E(t.t)} <span class="mut">· ${t.due}</span></label>`).join('') || '<p class="mut mt-2">No open tasks for this deal.</p>'}</div>
 ${sec('Timeline')}${tl.map((a) => `<div class="flex gap-2 py-2 border-b" style="border-color:var(--bd)"><span class="ms mut">${a.k}</span><div><div>${E(a.x)}</div><small class="mut">${ago(a.t)}</small></div></div>`).join('') || '<p class="mut mt-2">No activity yet. Log your first call or note.</p>'}</div></div>`,
    chatter: `<div class="card p-4"><b>Chatter</b><form class="flex gap-2 my-3" onsubmit="event.preventDefault();const v=this.x.value.trim();if(v){(S.chat[S.cur]=S.chat[S.cur]||[]).unshift({x:v,t:Date.now()});save();render()}"><input name="x" class="inp" placeholder="Share an update with the team"><button class="btn btn-p">Share</button></form>${ch.map((c) => `<div class="flex gap-2 py-2 border-b" style="border-color:var(--bd)"><span class="w-8 h-8 rounded-full grid place-items-center text-white font-bold shrink-0" style="background:var(--pr)">AL</span><div><b>Alex Lee</b> <small class="mut">${ago(c.t)}</small><div>${E(c.x)}</div></div></div>`).join('') || '<p class="mut">Nobody has posted yet. Start the conversation.</p>'}</div>`,
  }[T];
  return `<div class="card p-4 mb-3"><div class="flex flex-wrap items-start gap-2"><span class="ms" style="color:var(--warn);font-size:32px">handshake</span><div class="flex-1 min-w-[220px]"><div class="mut cursor-pointer" onclick="nav('opps')">Opportunity ›</div><h1 class="text-xl font-bold">${E(o.name)}</h1></div>
 <button class="btn" onclick="o_f()">${cur().fol ? '✓ Following' : '+ Follow'}</button><button class="btn" onclick="shareToSlack()">Send to Slack</button><button class="btn" onclick="window.print()">Printable view</button><button class="btn" onclick="cloneOpp(0)">Clone</button><button class="btn" onclick="modal('edit')">Edit</button><button class="btn btn-p" onclick="openQuote(${o.id})">Generate quote</button>
 <details class="relative"><summary class="btn list-none">▾</summary><div class="card absolute right-0 mt-1 w-52 z-20 p-1 shadow-lg"><button class="${mi}" onclick="cloneOpp(1)">Clone with related</button><button class="${mi}" onclick="S.tab='details';S.ed='refRep';render()">Add referral</button><button class="${mi}" onclick="S.ed='owner';S.tab='details';render()">Change owner</button><button class="${mi}" onclick="o_s()">${cur().slack ? 'Turn off Slack alerts' : 'Turn on Slack alerts'}</button><button class="${mi}" style="color:var(--err)" onclick="if(confirm('Delete this opportunity?')){S.opps=S.opps.filter(x=>x.id!=${o.id});save();toast('Opportunity deleted');nav('opps')}">Delete</button></div></details></div>
 <div class="grid grid-cols-2 md:grid-cols-7 gap-4 mt-4">${hd('Account name', `<a class="cursor-pointer" style="color:var(--pr)" onclick="S.q='${E(o.account).replace(/'/g, '')}';nav('opps')">${E(o.account)}</a>`)}${hd('Close date', fd(o.close))}${hd('Amount', M(o.amount))}${hd('Assigned rep', E(ownerLabel(o.owner)))}${hd('Quotation', quoteHeaderStatus(o))}${hd('Priority', `<select class="inp" style="width:auto;padding:2px 6px" aria-label="Priority" onchange="setPriority(${o.id},this.value)">${prioOptions(o.priority)}</select>`)}${hd('Risk flag', `<span class="chip ${rk == 'High' ? 'wr' : rk == 'Low' || rk == 'None' ? 'ok' : ''}">${rk}</span>`)}</div></div>
 <div class="card p-3 mb-3 flex items-center gap-3"><div class="flex flex-1 overflow-x-auto gap-1">${ST.map((s, i) => `<div class="step ${i < o.stage || o.stage == 5 ? 'done' : i == o.stage ? 'cur' : ''}" ${i == 5 && o.lost ? 'style="background:var(--err)"' : ''} onclick="setStage(cur(),${i})">${i < o.stage || o.stage == 5 ? '✓ ' : ''}${i == 5 && o.lost ? 'Closed Lost' : s}</div>`).join('')}</div>${o.stage < 5 ? `<button class="btn btn-p" onclick="setStage(cur(),${o.stage + 1})">Mark stage as complete</button>` : `<button class="btn btn-p" onclick="const x=cur();x.lost=!x.lost;save();toast('Marked '+(x.lost?'closed lost':'closed won'));render()">Change closed stage</button>`}</div>
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
 <div class="grid lg:grid-cols-3 gap-3"><div class="lg:col-span-2">${pv}</div><div class="space-y-3">
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
          `<tr><td><b>${E(l[0])}</b></td><td>${E(l[1])}</td><td>${E(l[2])}</td><td><span class="chip ${l[3] == 'New' ? '' : 'wr'}">${l[3]}</span></td><td class="text-right"><button class="btn" onclick="convert(${i})">Convert to deal</button></td></tr>`
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
  rep: { label: 'Rep portal', owner: 'AL', limit: 2, name: 'Alex Lee' },
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
const visibleOpps = () =>
  S.role === 'rep' ? S.opps.filter((o) => o.owner === roleNow().owner) : S.opps;
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
      tnc: q.tnc || '',
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
    return pct <= 5
      ? { status: 'Approved', approver: roleNow().name }
      : { status: 'Pending CEO Approval', approver: ROLE_CFG.ceo.name };
  if (pct > 5) return { status: 'Pending CEO Approval', approver: ROLE_CFG.ceo.name };
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
    `<div class="fixed inset-0 z-40 grid place-items-center p-4" style="background:rgba(0,0,0,.5)"><form class="card p-5 w-full max-w-md space-y-3" onsubmit="saveProduct(event,'${code}')"><h2 class="text-lg font-bold">${code ? 'Edit product' : 'New product'}</h2><label class="block">Product name<input name="name" class="inp" required value="${E(p.name || '')}"></label><label class="block">Product code<input name="code" class="inp" required value="${E(p.code || '')}"></label><label class="block">List price (₹)<input name="listPrice" type="number" min="0.01" step="0.01" class="inp" required value="${p.listPrice ?? ''}"></label><label class="block">Minimum selling price (₹)<input name="minPrice" type="number" min="0.01" step="0.01" class="inp" required value="${p.minPrice ?? ''}"></label><label class="block">Maximum selling price (₹)<input name="maxPrice" type="number" min="0.01" step="0.01" class="inp" required value="${p.maxPrice ?? ''}"></label><label class="block">Status<select name="active" class="inp"><option value="yes" ${p.active !== false ? 'selected' : ''}>Active</option><option value="no" ${p.active === false ? 'selected' : ''}>Inactive</option></select></label><div class="flex justify-end gap-2"><button type="button" class="btn" onclick="$('#modal').innerHTML=''">Cancel</button><button class="btn btn-p">Save product</button></div></form></div>`;
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
    };
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
const ROLE_DISCOUNT_LIMIT = { rep: 2, admin: 5, ceo: null };

// Defaults shown in the form until the user edits a field.
function quoteDefaults(q, o) {
  const contact = S.contacts.find((c) => c[2] === o.account);
  return {
    name: q.name ?? `${q.no} - ${o.name}`,
    preparedFor: q.preparedFor ?? (contact ? `${contact[0]} (${contact[1]})` : ''),
    address: q.address ?? '',
    primary: q.primary !== false,
  };
}

function quoteLineRows(q, locked, withActions) {
  return q.items
    .map((i, k) => {
      const net = i.p * (1 - i.d / 100);
      const saved = (i.p * i.q * i.d) / 100;
      const discountCell = withActions
        ? `<input class="inp qt-num" type="number" min="0" max="100" step="0.1" value="${i.d}" ${locked ? 'disabled' : ''} aria-label="Discount percent" onchange="changeQuoteItem(${k},'d',this.value)"><span class="qt-sub">${i.d ? `−${M(saved)}` : ''}</span>`
        : `${i.d}%`;
      const qtyCell = withActions
        ? `<input class="inp qt-num" type="number" min="1" value="${i.q}" ${locked ? 'disabled' : ''} aria-label="Quantity" onchange="changeQuoteItem(${k},'q',this.value)">`
        : i.q;
      const removeCell = withActions
        ? `<td class="qt-r">${locked ? '' : `<button class="qt-del" title="Remove" aria-label="Remove line" onclick="removeQuoteItem(${k})"><span class="ms">delete</span></button>`}</td>`
        : '';
      return `<tr><td><b class="qt-link">${E(i.n)}</b></td><td class="qt-code">${E(i.c)}</td><td class="qt-r">${M(i.p)}</td><td class="qt-r">${qtyCell}</td><td class="qt-r">${discountCell}</td><td class="qt-r"><b>${M(net * i.q)}</b></td>${removeCell}</tr>`;
    })
    .join('');
}

function quoteLinesCard(q, locked, withActions) {
  const head = ['Product Name', 'Code', 'List Price', 'Qty', 'Discount %', 'Total Price']
    .map((h, n) => `<th class="${n > 1 ? 'qt-r' : ''}">${h}</th>`)
    .concat(withActions ? ['<th class="qt-r">Actions</th>'] : [])
    .join('');
  const products = S.products
    .filter((p) => p.active !== false)
    .map((p) => `<option value="${E(p.code)}">${E(p.name)} · ${M(p.listPrice)}</option>`)
    .join('');
  const tools =
    withActions && !locked
      ? `<select class="btn qt-tool" aria-label="Add products" onchange="addQuoteProduct(this.value);this.value=''"><option value="">+ Add Products</option>${products}</select><button class="btn qt-tool" onclick="applyTieredDiscount()"><span class="ms">percent</span>Apply Tiered Discount</button><button class="btn qt-tool" onclick="calculateQuotePricing()"><span class="ms">sync</span>Calculate Pricing</button>`
      : '';
  return `<section class="qt-section"><div class="qt-section-head"><span class="ms">inventory_2</span><b>Line Items &amp; Product Bundling</b><span class="chip ok">${q.items.length} ${q.items.length === 1 ? 'Item' : 'Items'}</span><span class="flex-1"></span>${tools}</div><div class="overflow-x-auto"><table class="qt-table"><thead><tr>${head}</tr></thead><tbody>${quoteLineRows(q, locked, withActions)}</tbody></table></div></section>`;
}

function quoteSummaryRow(q, o, floor, route) {
  const subtotal = q.items.reduce((a, i) => a + i.p * i.q, 0);
  const discount = subtotal - quoteTotal(q);
  const limit = ROLE_DISCOUNT_LIMIT[S.role];
  const needsApproval = route.status !== 'Approved';
  const headline = floor.length
    ? 'CEO approval required'
    : needsApproval
      ? 'Approval Required'
      : 'Approval Not Required';
  const detail = floor.length
    ? 'At least one product is priced below its minimum selling price, so CEO approval is mandatory.'
    : needsApproval
      ? `Blended discount of ${quoteDiscount(q).toFixed(1)}% will be routed to ${E(route.approver)} for approval.`
      : `Total discount (${quoteDiscount(q).toFixed(1)}%) is within ${E(roleNow().name)}'s delegation authority.`;
  return `<div class="qt-bottom"><div class="qt-guide"><span class="qt-guide-icon"><span class="ms">auto_awesome</span></span><div><div class="qt-guide-title">Discount &amp; Pricing Guidance <span class="qt-badge">Insight</span></div><p><b>${headline}:</b> ${detail}</p><div class="qt-guide-stats"><span>Your limit: <b>${limit === null ? 'Unlimited' : limit.toFixed(1) + '%'}</b></span><span>Applied Blended Rate: <b>${quoteDiscount(q).toFixed(2)}%</b></span><span class="${floor.length ? 'qt-bad' : 'qt-good'}">Margin Protection: <b>${floor.length ? 'Below product minimum' : 'Verified'}</b></span></div></div></div><div class="qt-totals"><div class="qt-total-row"><span class="mut">Subtotal (List)</span><span>${M(subtotal)}</span></div><div class="qt-total-row"><span class="qt-link">Total Additional Discounts</span><span class="qt-link">${discount ? '−' : ''}${M(discount)}</span></div><div class="qt-total-row"><span class="mut">Estimated Tax / Surcharge</span><span>${M(0)}</span></div><div class="qt-total-row qt-grand"><b>Grand Total</b><b>${M(quoteTotal(q))}</b></div><small class="mut qt-r" style="display:block">All figures formatted in INR (₹)</small></div></div>`;
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
  const dis = locked ? 'disabled' : '';

  const field = (label, control, required) =>
    `<label class="qt-field"><span>${label}${required ? ' <i class="qt-req">*</i>' : ''}</span>${control}</label>`;

  const infoCard = `<section class="qt-section"><div class="qt-section-head"><span class="ms">badge</span><b>Quote Information</b></div><div class="qt-grid">${field('Quote Name', `<input class="inp" value="${E(d.name)}" ${dis} onchange="S.qd.name=this.value">`, true)}<label class="qt-check"><input type="checkbox" ${d.primary ? 'checked' : ''} ${dis} onchange="S.qd.primary=this.checked"> Primary Quote (Syncs to Opportunity)</label>${field('Expiration Date', `<input type="date" class="inp" value="${q.exp}" ${dis} onchange="S.qd.exp=this.value">`)}${field('Status', q.status === 'Draft' ? quoteOtherSelect('label', QUOTE_STATUS_CHOICES, q.label || 'Draft', false) : `<select class="inp" disabled><option>${E(q.status)}</option></select>`)}${field('Prepared For', `<input class="inp" value="${E(d.preparedFor)}" ${dis} onchange="S.qd.preparedFor=this.value">`)}${field('Sales Rep / Owner', `<input class="inp" value="${E(ownerLabel(o.owner))}" disabled>`)}${field('Payment Terms', quoteOtherSelect('terms', PAYMENT_TERMS, q.terms, locked))}${field('Billing / Shipping Address', `<input class="inp" value="${E(d.address)}" placeholder="Street, city, state, PIN" ${dis} onchange="S.qd.address=this.value">`)}</div></section>`;

  const approvalCard = approvalSection(q, floor, locked);

  const previewCard = `<section class="qt-section"><div class="qt-section-head"><span class="ms">visibility</span><b>Preview</b></div><div class="qt-body"><p><b>${E(d.name)}</b></p><p class="mut">Prepared for ${E(d.preparedFor || '—')} · Expires ${fd(q.exp)} · ${E(q.terms)}</p>${d.address ? `<p class="mut">${E(d.address)}</p>` : ''}<p style="margin-top:8px"><b>Terms &amp; conditions</b></p><p style="white-space:pre-wrap">${q.tnc ? E(q.tnc) : '<span class="mut">None added.</span>'}</p></div></section>`;

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

  const footer = `<div class="qt-foot">${locked ? '<span></span>' : `<button class="btn" onclick="saveQuoteDraft()">Save as Draft</button>`}<span class="flex-1"></span><button class="btn" onclick="nav('opp-detail')">Cancel</button><button class="btn" ${step === 1 ? 'disabled' : ''} onclick="S.qstep=${step - 1};render()">Back</button>${step < 4 ? `<button class="btn" onclick="S.qstep=${step + 1};render()">Next</button>` : ''}${canReview(q) ? `<button class="btn" style="color:var(--err)" onclick="rejectQuote('${E(q.no)}')">Reject</button><button class="btn btn-p" onclick="approveQuote('${E(q.no)}')">Approve</button>` : ''}${inv ? `<button class="btn btn-p" onclick="openInvoice('${inv.id}')">Open ${E(inv.invoiceNo)}</button>` : ''}${locked ? '' : `<button class="btn btn-p" onclick="submitQuote()">Save &amp; Generate PDF Quote<span class="ms">chevron_right</span></button>`}</div>`;

  return `<div class="qt-wrap card"><header class="qt-head"><span class="qt-head-icon"><span class="ms">description</span></span><div><h1>Generate Quote — ${E(o.name)}</h1><p>Primary Opportunity: <b>${E(o.name)}</b> &nbsp;|&nbsp; Account: <b>${E(o.account)}</b> &nbsp;|&nbsp; Stage: <b>${E(ST[o.stage] || '—')}</b></p></div></header><nav class="qt-steps">${stepper}</nav><div class="qt-content">${approvalBanner(q, inv)}${body}</div>${footer}</div>`;
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
        ['Product', 'Code', 'List price', 'Minimum price', 'Maximum price', 'Status', ''],
        S.products
          .map(
            (p) =>
              `<tr><td><b>${E(p.name)}</b></td><td>${E(p.code)}</td><td>${M(p.listPrice)}</td><td>${M(p.minPrice)}</td><td>${M(p.maxPrice)}</td><td>${p.active ? 'Active' : 'Inactive'}</td><td><button class="btn" onclick="openProductForm('${p.code}')">Edit</button></td></tr>`
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
  return `<div class="mut cursor-pointer mb-2" onclick="nav('invoices')">‹ Back to invoices</div><div class="card p-5"><h1 class="text-xl font-bold">Invoice ${i.invoiceNo}</h1><p class="mut">Generated from quotation ${i.quoteNo}</p><div class="mt-4"><b>${E(i.account)}</b><div class="mut">${E(i.opportunity)}</div></div>${table(['Product', 'Code', 'Qty', 'Unit price', 'Discount', 'Total'], i.items.map((x) => `<tr><td>${E(x.n)}</td><td>${E(x.c)}</td><td>${x.q}</td><td>${M(x.p)}</td><td>${x.d}%</td><td>${M(x.p * x.q * (1 - x.d / 100))}</td></tr>`).join(''))}<div class="text-right text-lg font-bold mt-3">Invoice total: ${M(i.total)}</div><div class="flex justify-end gap-2 mt-4"><button class="btn" onclick="window.print()">Print / Save PDF</button>${i.status !== 'Submitted to client' ? `<button class="btn btn-p" onclick="sendInvoice('${i.id}')">Submit to client</button>` : '<span class="chip ok">Submitted to client</span>'}</div></div>`;
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
    field('Amount (₹) *', '<input class="inp" name="amount" type="number" min="0" required>') +
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
    field(
      'Assigned rep',
      `<select class="inp" name="owner" required>${repOptions(defaultRepCode()) || `<option value="${E(defaultRepCode())}">${E(ownerLabel(defaultRepCode()))}</option>`}</select>`
    ) +
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
  const v = Object.fromEntries(new FormData(e.target)),
    id = Math.max(0, ...S.opps.map((o) => o.id)) + 1,
    a = +v.amount;
  S.opps.push({
    id,
    name: v.name.trim(),
    account: v.account.trim(),
    amount: a,
    stage: +v.stage,
    close: v.close,
    owner: v.owner || defaultRepCode(),
    priority: PRIORITIES.includes(v.priority) ? v.priority : 'Medium',
    type: pickOther(v, 'type'),
    source: pickOther(v, 'source'),
    description: (v.description || '').trim(),
    next: (v.next || '').trim(),
    socials: { linkedin: '', instagram: '', facebook: '', x: '' },
    items: [{ n: 'Platform licence', c: 'GEN-100', p: a, q: 1, d: 0 }],
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
  if (S.role === 'rep' && v === 'opp-detail' && cur() && cur().owner !== roleNow().owner) {
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
  if (S.role === 'rep' && v === 'opp-detail' && cur() && cur().owner !== roleNow().owner)
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
            `<tr><td><b>${E(x.name)}</b></td><td>${E(x.username)}</td><td>${x.role.toUpperCase()}</td><td>${E(x.ownerCode || '—')}</td><td><span class="chip ok">Active</span></td></tr>`
        )
        .join('')
    ) +
    `<p class="mut mt-3">Admins can create Rep accounts. CEOs can create Admin and Rep accounts.</p>`
  );
};
function openUserForm() {
  const role = S.role,
    allowed = role === 'ceo' ? ['admin', 'rep'] : role === 'admin' ? ['rep'] : [];
  if (!allowed.length) return toast('You do not have permission to create accounts');
  $('#modal').innerHTML =
    `<div class="fixed inset-0 z-40 grid place-items-center p-4" style="background:rgba(0,0,0,.5)"><form class="card p-5 w-full max-w-md space-y-3" onsubmit="createUser(event)"><h2 class="text-lg font-bold">Create user account</h2>
 <label class="block">Full name<input class="inp mt-1" name="name" required></label>
 <label class="block">Username<input class="inp mt-1" name="username" required></label>
 <label class="block">Temporary password<input class="inp mt-1" name="password" type="password" minlength="8" required></label>
 <label class="block">Portal role<select class="inp mt-1" name="role">${allowed.map((r) => `<option value="${r}">${r === 'admin' ? 'Admin' : 'Rep'}</option>`).join('')}</select></label>
 <div class="mut text-xs">${role === 'ceo' ? 'CEO can create Admin and Rep accounts.' : 'Admin can create Rep accounts only.'}</div>
 <div class="flex justify-end gap-2"><button type="button" class="btn" onclick="$('#modal').innerHTML=''">Cancel</button><button class="btn btn-p">Create account</button></div></form></div>`;
}
function createUser(e) {
  e.preventDefault();
  const v = Object.fromEntries(new FormData(e.target)),
    allowed = S.role === 'ceo' ? ['admin', 'rep'] : S.role === 'admin' ? ['rep'] : [];
  if (!allowed.includes(v.role)) return toast('Not authorised to create this role');
  if (S.users.some((u) => u.username.toLowerCase() === v.username.trim().toLowerCase()))
    return toast('Username already exists');
  const id = 'u-' + Date.now(),
    ownerCode = 'U' + (S.users.length + 1);
  S.users.push({
    id,
    name: v.name.trim(),
    username: v.username.trim(),
    password: v.password,
    role: v.role,
    ownerCode,
    active: true,
  });
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
      `<span class="flex-1"></span><span class="mut self-center px-2">${E(user.name)} · ${user.role.toUpperCase()}</span><a href="#" class="px-3 py-2 mut" onclick="logoutUser();return false">Sign out</a>`;
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
          `<tr><td><b>${E(l[0])}</b></td><td>${E(l[1])}</td><td>${E(l[2])}</td><td><select class="inp" style="width:auto" aria-label="Lead status" onchange="setLeadStatus(${i},this.value)">${LEAD_STATUS.map((s) => `<option ${s === l[3] ? 'selected' : ''}>${s}</option>`).join('')}</select></td><td class="text-right whitespace-nowrap"><button class="btn" onclick="convert(${i})">Convert to deal</button> <button class="btn" style="color:var(--err)" onclick="deleteLead(${i})">Delete</button></td></tr>`
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
        return `<tr><td><b>${E(x.name)}</b></td><td>${E(x.username)}</td><td>${x.role.toUpperCase()}</td><td>${E(x.ownerCode || '—')}</td><td><span class="chip ${on ? 'ok' : 'wr'}">${on ? 'Active' : 'Inactive'}</span></td><td class="text-right whitespace-nowrap">${can ? `<button class="btn" onclick="openResetPassword('${x.id}')">Reset password</button> <button class="btn" onclick="toggleUserActive('${x.id}')">${on ? 'Deactivate' : 'Activate'}</button>` : ''}</td></tr>`;
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
  const tnc = i.tnc ?? S.quotes.find((q) => q.no === i.quoteNo)?.tnc ?? '';
  return `<div class="mt-4"><b>Payment terms</b><div>${E(i.terms || 'Net 30')}</div></div><div class="mt-3"><b>Terms &amp; conditions</b><div style="white-space:pre-wrap">${tnc ? E(tnc) : '<span class="mut">None</span>'}</div></div>`;
}
V['invoice-detail'] = () => {
  const i = S.invoices.find((x) => x.id === S.currentInvoice);
  const html = i
    ? baseInvoiceDetail().replace(
        '<div class="text-right text-lg font-bold mt-3">Invoice total:',
        invoiceTermsBlock(i) + '<div class="text-right text-lg font-bold mt-3">Invoice total:'
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
const appsForRole = () =>
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
  if (!['admin', 'ceo'].includes(S.role)) {
    toast('Only Admin and CEO can change the assigned rep');
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
  if (k === 'owner' && !['admin', 'ceo'].includes(S.role)) {
    toast('Only Admin and CEO can change the assigned rep');
    S.ed = null;
    return render();
  }
  return previousOpportunityFieldSave(k, v);
};
V.opps = () => {
  const query = (S.q || '').toLowerCase();
  const all = visibleOpps().filter((o) => (o.name + ' ' + o.account).toLowerCase().includes(query));
  const total = all.reduce((sum, o) => sum + (+o.amount || 0), 0);
  const canReassign = ['admin', 'ceo'].includes(S.role);
  const docMeta = (o) => {
    const docs = opportunityDocuments(o);
    if (!docs.length) return '<span class="mut text-xs">Quote: — · Invoice: —</span>';
    return docs
      .map(
        (d) =>
          `<span class="text-xs inline-flex flex-wrap gap-1 items-center"><b>Quote:</b> ${E(d.quoteNo)} <span class="mut">·</span> <b>Invoice:</b> ${d.invoiceNo ? E(d.invoiceNo) : '—'}</span>`
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
          .join('')}</select>`
      : `<span>${E(ownerLabel(o.owner))}</span>`;
  const top = `<div class="flex flex-wrap items-center gap-2 mb-3"><div><div class="mut">Opportunities</div><h1 class="text-xl font-bold">${S.role === 'rep' ? 'My opportunities' : 'All opportunities'}</h1></div><span class="mut ml-2">${all.length} items · Total ${M(total)}</span><span class="flex-1"></span><input class="inp" style="width:200px" placeholder="Filter this list" value="${E(S.q || '')}" oninput="S.q=this.value;clearTimeout(window.ft);window.ft=setTimeout(()=>{render();const i=document.querySelector('[placeholder=\\'Filter this list\\']');if(i){i.focus();i.setSelectionRange(99,99)}},250)"><button class="btn" onclick="S.view='${S.view === 'kanban' ? 'list' : 'kanban'}';render()"><span class="ms">${S.view === 'kanban' ? 'table_rows' : 'view_kanban'}</span>${S.view === 'kanban' ? 'List' : 'Board'}</button><button class="btn btn-p" onclick="modal('opp')"><span class="ms">add</span>New</button></div>`;
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
            return `<tr class="r" onclick="nav('opp-detail',${o.id})"><td><b>${E(o.name)}</b></td><td>${E(o.account)}</td><td>${E(ST[o.stage] || '—')}</td><td onclick="event.stopPropagation()"><select class="inp text-xs" style="width:auto;padding:4px 24px 4px 8px" aria-label="Priority" onchange="setPriority(${o.id},this.value)">${prioOptions(o.priority)}</select></td><td>${M(o.amount)}</td><td>${fd(o.close)}</td><td onclick="event.stopPropagation()">${repCell(o)}</td><td>${quoteNumbers}</td><td>${invoiceNumbers}</td></tr>`;
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
              `<div class="kc card p-3" draggable="true" ondragstart="event.dataTransfer.setData('t',${o.id})" onclick="nav('opp-detail',${o.id})"><b style="color:var(--pr)">${E(o.name)}</b><div class="mut">${E(o.account)}</div><div class="mt-1" onclick="event.stopPropagation()"><select class="inp text-xs" style="width:auto;padding:2px 22px 2px 6px" aria-label="Priority" onchange="setPriority(${o.id},this.value)">${prioOptions(o.priority)}</select></div><div class="flex justify-between mt-2"><b>${M(o.amount)}</b><span class="mut">${PR[index]}%</span></div>${o.next ? `<div class="mut mt-1">Next: ${E(o.next)}</div>` : ''}<div class="flex justify-between items-center mt-2"><span class="chip ${chipC(o)}">${fd(o.close)}</span><span class="text-xs mut" title="Assigned rep">${E(ownerLabel(o.owner))}</span></div><div class="mt-2 pt-2 border-t" style="border-color:var(--bd)" onclick="event.stopPropagation()">${docMeta(o)}</div>${
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
          return `<tr class="r" onclick="openQuoteRecord('${E(q.no)}')"><td><b>${E(q.no)}</b></td><td>${E(o.name || '')}</td><td>${E(ownerLabel(o.owner))}</td><td>${M(quoteTotal(q))}</td><td>${quoteDiscount(q).toFixed(2)}%</td><td>${E(q.status)}</td><td>${inv ? E(inv.invoiceNo) : '—'}</td></tr>`;
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
          return `<tr class="r" onclick="openInvoice('${E(i.id)}')"><td><b>${E(i.invoiceNo)}</b></td><td>${E(i.quoteNo)}</td><td>${E(i.opportunity)}</td><td>${E(ownerLabel(o.owner))}</td><td>${E(i.account)}</td><td>${M(i.total)}</td><td>${E(i.status)}</td></tr>`;
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
  if (q.status === 'Approved' || q.status === 'Paid')
    return box('ok', 'verified', 'Approval granted', [
      `Approved by <b>${E(q.approvedBy || '')}</b> on ${whenText(q.approvedAt)}`,
      q.approvedNotes ? `Approval notes: ${E(q.approvedNotes)}` : '',
      q.tnc ? `Terms &amp; conditions: ${E(q.tnc)}` : '',
      inv ? `Invoice ${E(inv.invoiceNo)} generated` : '',
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
  return `<section class="qt-section"><div class="qt-section-head"><span class="ms">approval</span><b>Approval Authority</b></div><div class="qt-body"><p>Rep up to <b>2%</b> · Admin up to <b>5%</b> · CEO any discount. Any line priced below the product minimum always needs CEO approval.</p><p class="mut" style="margin-top:6px">${floor.length ? `Lines below minimum: ${floor.map((i) => E(i.c)).join(', ')}` : 'No lines are below their product minimum.'}</p></div></section>
<section class="qt-section"><div class="qt-section-head"><span class="ms">edit_note</span><b>Notes for approval <i class="qt-req">*</i></b></div><div class="qt-body"><textarea class="inp" rows="3" ${locked ? 'disabled' : ''} placeholder="Explain the discount or pricing so the approver can decide. Required before submitting." oninput="S.qd.notes=this.value">${E(q.notes || '')}</textarea></div></section>
<section class="qt-section"><div class="qt-section-head"><span class="ms">gavel</span><b>Terms &amp; conditions</b>${canEditTnc ? '' : '<span class="mut text-xs">Added by Admin / CEO</span>'}</div><div class="qt-body">${canEditTnc ? `<textarea class="inp" rows="4" placeholder="e.g. Pricing valid until the expiry date. Payment as per the terms above." oninput="S.qd.tnc=this.value">${E(q.tnc || '')}</textarea>` : `<p style="white-space:pre-wrap">${q.tnc ? E(q.tnc) : '<span class="mut">None added yet.</span>'}</p>`}</div></section>${history ? `<section class="qt-section"><div class="qt-section-head"><span class="ms">history</span><b>Approval history</b></div><div class="qt-body">${history}</div></section>` : ''}`;
}

// Approve / reject now ask for notes (required) and, on approval, terms & conditions.
function approveQuote(no) {
  const q = S.quotes.find((x) => x.no === no);
  if (!q) return toast('Quotation not found');
  if (!['admin', 'ceo'].includes(S.role)) return toast('Only Admin or CEO can approve');
  if (q.status === 'Pending CEO Approval' && S.role !== 'ceo')
    return toast('CEO approval is required');
  if (S.role === 'admin' && quoteDiscount(q) > 5) return toast('Discount exceeds Admin limit');
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
      ? `<label class="block">Terms &amp; conditions <span class="mut text-xs">(optional)</span><textarea class="inp" name="tnc" rows="4" placeholder="Conditions that apply to this approval">${E(q.tnc || '')}</textarea></label>`
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
  q.tnc = (v.tnc || '').trim();
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
  if (s === 'Paid') return { tone: 'ok', text: 'Paid' };
  if (s === 'Rejected') return { tone: 'er', text: 'Rejected' };
  if (s === 'Pending CEO Approval') return { tone: 'wr', text: 'Under approval · CEO' };
  if (s === 'Pending Admin Approval') return { tone: 'wr', text: 'Under approval · Admin' };
  return { tone: '', text: q.label && q.label !== 'Draft' ? `Draft · ${q.label}` : 'Draft' };
}
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
      const detail =
        q.status === 'Approved' || q.status === 'Paid'
          ? `Approved by ${E(q.approvedBy || '')} · ${whenText(q.approvedAt)}`
          : q.status === 'Rejected'
            ? `Rejected by ${E(q.rejectedBy || '')} · ${whenText(q.rejectedAt)}`
            : q.status.startsWith('Pending')
              ? `Awaiting ${E(q.nextApprover || 'approver')}`
              : 'Not submitted for approval';
      const inv = q.invoiceId && S.invoices.find((x) => x.id === q.invoiceId);
      return `<div class="py-2 border-b cursor-pointer" style="border-color:var(--bd)" onclick="openQuoteRecord('${E(q.no)}')"><div class="flex justify-between items-center gap-2"><b>${E(q.no)}</b><span class="chip ${i.tone}">${i.text}</span></div><div class="mut text-xs">${detail}${inv ? ` · ${E(inv.invoiceNo)}` : ''}</div></div>`;
    })
    .join('');
  return `<div class="card p-4"><div class="flex justify-between items-center"><b>Quotation status (${list.length})</b><button class="btn" onclick="openQuote(${o.id})">New quote</button></div>${rows || '<p class="mut mt-2">No quotation yet. Use Generate quote to start one.</p>'}</div>`;
}

// Teams, rep stats, leaderboard and targets.

// ===========================================================================
// Teams, leaderboard and role-based settings
// ===========================================================================
const TEAM_SIZE = 5;
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
      return `<tr style="${me ? 'background:var(--hov)' : ''}"><td>${rankBadge(r.rank)}</td><td><div class="flex items-center gap-2"><span class="w-7 h-7 rounded-full grid place-items-center text-xs font-bold" style="background:var(--hov);color:var(--pr)">${E(personInitials(r.user.name))}</span><b>${E(r.user.name)}</b>${me ? '<span class="chip">You</span>' : ''}</div></td><td class="text-right"><b>${M(r.won)}</b></td><td class="text-right">${r.deals}</td><td class="text-right">${M(r.pipeline)}</td><td><div class="flex items-center gap-2">${progressBar(r.attain)}<span class="text-xs">${Math.round(r.attain)}%</span></div></td></tr>`;
    })
    .join('');
  return `<div class="card p-4"><div class="flex justify-between items-start gap-2 flex-wrap"><div><b class="text-lg">${E(team.name)}</b><div class="mut text-xs">${ranked.length} of ${TEAM_SIZE} reps · ranked by ${LB_METRICS[metric].toLowerCase()}</div></div><div class="text-right"><b>${M(totalWon)}</b><div class="mut text-xs">of ${M(totalTarget)} team target (${totalTarget ? Math.round((totalWon / totalTarget) * 100) : 0}%)</div></div></div>${table(['#', 'Rep', 'Won', 'Deals', 'Open pipeline', 'Target'], rows || '<tr><td colspan="6" class="mut">No reps in this team yet.</td></tr>')}</div>`;
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
  if (S.role === 'rep') {
    const me = S.users.find((u) => u.role === 'rep' && u.ownerCode === meCode);
    const team = me && teamById(me.teamId);
    if (!team)
      return `<div class="card p-4 mb-3"><b>Team leaderboard</b><p class="mut mt-1">You have not been assigned to a team yet. Ask your admin to add you to Team Alpha or Team Beta.</p></div>`;
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

// Open-record tabs bar and the first render.

const tabIsActive = (id) =>
  ['#opp-detail', '#quote'].includes(location.hash) && String(S.cur) === String(id);

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
  const allowed = new Set(visibleOpps().map((o) => o.id));
  const tabs = S.openTabs.filter((id) => allowed.has(id));
  bar.style.display = S.authUser && tabs.length ? 'flex' : 'none';
  bar.innerHTML = tabs
    .map((id) => {
      const o = S.opps.find((x) => x.id == id);
      const name = o.name.length > 26 ? o.name.slice(0, 25) + '…' : o.name;
      return `<div class="rec-tab ${tabIsActive(id) ? 'on' : ''}" title="${E(o.name)}" onclick="nav('opp-detail',${id})"><span class="ms">handshake</span><span class="rec-tab-name">${E(name)}</span><button class="rec-tab-x" aria-label="Close tab" onclick="closeOppTab(${id},event)"><span class="ms">close</span></button></div>`;
    })
    .join('');
}
function closeOppTab(id, ev) {
  if (ev) ev.stopPropagation();
  const i = S.openTabs.indexOf(id);
  if (i < 0) return;
  const wasActive = tabIsActive(id);
  S.openTabs.splice(i, 1);
  save();
  if (!wasActive) return drawOppTabs();
  const next = S.openTabs[i] ?? S.openTabs[i - 1];
  next ? nav('opp-detail', next) : nav('opps');
}
const renderWithoutTabs = render;
render = function () {
  renderWithoutTabs.apply(this, arguments);
  drawOppTabs();
};
addEventListener('hashchange', () => drawOppTabs());

save();
render();
