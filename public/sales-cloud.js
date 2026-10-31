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
function assignableReps() { return S.role === 'rep' ? activeReps().filter((u) => u.ownerCode === roleNow().owner) : activeReps(); }
function repOptions(selected) { return assignableReps().map((u) => `<option value="${E(u.ownerCode)}" ${u.ownerCode === selected ? 'selected' : ''}>${E(u.name)}</option>`).join(''); }
function defaultRepCode() { return S.role === 'rep' ? roleNow().owner : (activeReps()[0]?.ownerCode || roleNow().owner); }
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
  const ext = String(name || '').split('.').pop().toLowerCase();
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
      const id = globalThis.crypto?.randomUUID?.() || ('file-' + Date.now() + '-' + Math.random().toString(36).slice(2));
      await new Promise((resolve, reject) => {
        const tx = db.transaction('files', 'readwrite');
        tx.objectStore('files').put({ id, blob: file });
        tx.oncomplete = resolve;
        tx.onerror = () => reject(tx.error || new Error('File upload failed'));
        tx.onabort = () => reject(tx.error || new Error('File upload was cancelled'));
      });
      opportunity.attachments.push({ id, name: file.name, size: file.size, type: file.type, addedAt: Date.now() });
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
 <div class="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4">${hd('Account name', `<a class="cursor-pointer" style="color:var(--pr)" onclick="S.q='${E(o.account).replace(/'/g, '')}';nav('opps')">${E(o.account)}</a>`)}${hd('Close date', fd(o.close))}${hd('Amount', M(o.amount))}${hd('Assigned rep', E(ownerLabel(o.owner)))}${hd('Risk flag', `<span class="chip ${rk == 'High' ? 'wr' : rk == 'Low' || rk == 'None' ? 'ok' : ''}">${rk}</span>`)}</div></div>
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
 ${sec('Contact roles (' + R.length + ')', "modal('role')", 'Add')}${
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
        exp: D(14),
        status: 'Draft',
        terms: 'Net 30',
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
render();

// Sales Cloud extensions: portals, price controls, approvals, invoice history.
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
      generatedAt: Date.now(),
      status: 'Ready to submit',
      currency: 'INR',
    };
  S.invoices.push(inv);
  q.invoiceId = inv.id;
  return inv;
}
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
  S.qd = draft
    ? clone(draft)
    : {
        opp: id,
        no: 'Q-' + (1001 + S.quotes.length),
        exp: D(14),
        status: 'Draft',
        terms: 'Net 30',
        items: clone(o.items),
      };
  nav('quote');
}
function openQuoteRecord(no) {
  const q = S.quotes.find((x) => x.no === no);
  if (!q) return toast('Quotation not found');
  S.cur = q.opp;
  S.qd = clone(q);
  nav('quote');
}
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
  storeQuote(q);
  o.items = clone(q.items);
  if (q.status === 'Approved') {
    q.approvedBy = route.approver;
    q.approvedAt = Date.now();
    newInvoice(q);
    o.amount = Math.round(quoteTotal(q));
    storeQuote(q);
  }
  save();
  S.qd = clone(q);
  render();
  toast(q.status === 'Approved' ? 'Approved · invoice generated' : 'Quotation sent for approval');
}
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
  q.status = 'Approved';
  q.approvedBy = roleNow().name;
  q.approvedAt = Date.now();
  q.nextApprover = null;
  const inv = newInvoice(q),
    o = S.opps.find((x) => x.id == q.opp);
  if (o) {
    o.amount = Math.round(quoteTotal(q));
    o.items = clone(q.items);
    (S.acts[o.id] = S.acts[o.id] || []).unshift({
      k: 'sync',
      x: `Quote ${q.no} approved; invoice ${inv.invoiceNo} generated`,
      t: Date.now(),
    });
  }
  storeQuote(q);
  save();
  toast('Approved · ' + inv.invoiceNo + ' generated');
  render();
}
function rejectQuote(no) {
  const q = S.quotes.find((x) => x.no === no);
  if (!q) return toast('Quotation not found');
  if (!['admin', 'ceo'].includes(S.role)) return toast('Only Admin or CEO can reject');
  if (q.status === 'Pending CEO Approval' && S.role !== 'ceo')
    return toast('CEO approval required');
  if (!['Pending Admin Approval', 'Pending CEO Approval'].includes(q.status))
    return toast('Quotation is not pending approval');
  q.status = 'Rejected';
  q.rejectedBy = roleNow().name;
  q.rejectedAt = Date.now();
  q.nextApprover = null;
  storeQuote(q);
  save();
  toast('Quotation rejected');
  render();
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
V.quote = () => {
  const q = S.qd,
    o = cur();
  if (!q || !o) return V.opps();
  const inv = q.invoiceId && S.invoices.find((i) => i.id === q.invoiceId),
    locked = !['Draft', 'Rejected'].includes(q.status),
    floor = belowProductFloor(q),
    route = quoteRoute(q);
  return `<div class="mut cursor-pointer mb-1" onclick="nav('opp-detail')">‹ Back to ${E(o.name)}</div><h1 class="text-xl font-bold mb-1">Quotation ${q.no}</h1><p class="mut mb-3">${inv ? `Invoice number: ${inv.invoiceNo}` : 'Invoice is generated only after approval'}</p><div class="grid lg:grid-cols-3 gap-3"><div class="lg:col-span-2 space-y-3"><div class="card p-4 grid sm:grid-cols-3 gap-3"><label>Quote status<select class="inp" disabled><option>${E(q.status)}</option></select></label><label>Expires<input type="date" class="inp" value="${q.exp}" onchange="S.qd.exp=this.value" ${locked ? 'disabled' : ''}></label><label>Payment terms<select class="inp" onchange="S.qd.terms=this.value" ${locked ? 'disabled' : ''}>${['Net 30', 'Net 45', 'Net 60', 'Due on receipt'].map((t) => `<option ${t === q.terms ? 'selected' : ''}>${t}</option>`).join('')}</select></label></div><div class="card"><div class="p-4 pb-2 flex items-center"><b class="flex-1">Line items</b><select class="inp" style="width:auto" onchange="addQuoteProduct(this.value);this.value=''" ${locked ? 'disabled' : ''}><option value="">Add product…</option>${S.products
    .filter((p) => p.active !== false)
    .map((p) => `<option value="${E(p.code)}">${E(p.name)} · ${M(p.listPrice)}</option>`)
    .join('')}</select></div>${table(
    ['Product', 'List price', 'Qty', 'Discount %', 'Net unit price', 'Line total', 'Minimum'],
    q.items
      .map((i, k) => {
        const p = prodFor(i),
          net = i.p * (1 - i.d / 100);
        return `<tr><td>${E(i.n)}<br><small class="mut">${E(i.c)}</small></td><td>${M(i.p)}</td><td><input class="inp" type="number" min="1" style="width:65px" value="${i.q}" ${locked ? 'disabled' : ''} oninput="changeQuoteItem(${k},'q',this.value)"></td><td><input class="inp" type="number" min="0" max="100" step="0.1" style="width:70px" value="${i.d}" ${locked ? 'disabled' : ''} oninput="changeQuoteItem(${k},'d',this.value)"></td><td>${M(net)}</td><td>${M(net * i.q)}</td><td>${M(p.minPrice)} ${net < p.minPrice ? '<span class="chip wr">Below min</span>' : '<span class="chip ok">OK</span>'}</td></tr>`;
      })
      .join('')
  )}</div></div><div class="card p-4 h-fit"><div class="flex justify-between"><span class="mut">Subtotal</span>${M(q.items.reduce((a, i) => a + i.p * i.q, 0))}</div><div class="flex justify-between py-2"><span class="mut">Discount</span>${M(q.items.reduce((a, i) => a + (i.p * i.q * i.d) / 100, 0))}</div><div class="flex justify-between border-t pt-2 text-lg font-bold" style="border-color:var(--bd)"><span>Total</span>${M(quoteTotal(q))}</div><div class="p-3 rounded mt-3 ${floor.length ? 'wr' : 'ok'}"><b>${floor.length ? 'CEO approval required' : `Discount ${quoteDiscount(q).toFixed(2)}%`}</b><p class="mt-1">${floor.length ? 'At least one product is priced below its minimum selling price. CEO approval is mandatory.' : route.status === 'Approved' ? 'This quotation is within the active approver authority.' : `This quotation will be routed to ${E(route.approver)} for approval.`}</p><p class="mut text-xs mt-1">Rep 2% · Admin 5% · CEO unlimited.</p></div><div class="flex flex-col gap-2 mt-4">${!locked ? `<button class="btn btn-p justify-center" onclick="submitQuote()">Submit for approval</button><button class="btn justify-center" onclick="saveQuoteDraft()">Save draft</button>` : ''}${inv ? `<button class="btn btn-p" onclick="openInvoice('${inv.id}')">Open ${inv.invoiceNo}</button>` : ''}<button class="btn justify-center" onclick="nav('opp-detail')">Back</button></div></div></div>`;
};
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
V.approvals = () => {
  if (S.role === 'rep') return '<p class="mut">Approvals are managed by Admin and CEO.</p>';
  const list = S.quotes.filter((q) =>
    S.role === 'ceo' ? q.status === 'Pending CEO Approval' : q.status === 'Pending Admin Approval'
  );
  return (
    `<h1 class="text-xl font-bold mb-2">Quotation approvals</h1><p class="mut mb-3">Review discounts and product minimum-price exceptions. Any price below product minimum requires CEO approval.</p>` +
    table(
      ['Quote', 'Opportunity', 'Requested by', 'Discount', 'Total', 'Approval reason', 'Action'],
      list
        .map((q) => {
          const o = S.opps.find((x) => x.id == q.opp) || {};
          return `<tr><td><b>${q.no}</b></td><td>${E(o.name || '')}</td><td>${E(q.createdBy || 'Rep')}</td><td>${quoteDiscount(q).toFixed(2)}%</td><td>${M(quoteTotal(q))}</td><td>${belowProductFloor(q).length ? 'Below minimum price' : 'Discount approval'}</td><td class="whitespace-nowrap"><button class="btn btn-p" onclick="approveQuote('${q.no}')">Approve</button> <button class="btn" onclick="rejectQuote('${q.no}')">Reject</button></td></tr>`;
        })
        .join('')
    )
  );
};
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

// Add social account capture to new opportunities using a lightweight extension form.
const originalModal = modal;
modal = function (k) {
  if (k !== 'opp') return originalModal(k);
  const o = cur();
  $('#modal').innerHTML =
    `<div class="fixed inset-0 z-40 grid place-items-center p-4" style="background:rgba(0,0,0,.5)"><form class="card p-5 w-full max-w-md max-h-full overflow-auto space-y-3" onsubmit="saveOpportunityExtended(event)"><h2 class="text-lg font-bold">New opportunity</h2>${[
      ['name', 'Opportunity name'],
      ['account', 'Account'],
      ['amount', 'Amount (₹)'],
      ['close', 'Close date'],
    ]
      .map(
        ([n, l]) =>
          `<label class="block">${l}<input class="inp" name="${n}" ${n === 'amount' ? 'type="number" min="0"' : n === 'close' ? 'type="date"' : ''} ${n === 'close' ? `value="${D(30)}"` : ''} required></label>`
      )
      .join(
        ''
      )}<label class="block">Stage<select class="inp" name="stage">${ST.map((x, i) => `<option value="${i}">${x}</option>`).join('')}</select></label><label class="block">Assigned rep<select class="inp" name="owner" required>${repOptions(defaultRepCode()) || `<option value="${E(defaultRepCode())}">${E(ownerLabel(defaultRepCode()))}</option>`}</select><span class="mut text-xs">Choose the sales representative responsible for this opportunity.</span></label><b>Social accounts (optional)</b>${['linkedin', 'instagram', 'facebook', 'x'].map((k) => `<label class="block mut">${k}<input class="inp" name="${k}" placeholder="Profile URL or handle"></label>`).join('')}<div class="flex justify-end gap-2"><button type="button" class="btn" onclick="$('#modal').innerHTML=''">Cancel</button><button class="btn btn-p">Save</button></div></form></div>`;
};
function saveOpportunityExtended(e) {
  e.preventDefault();
  const v = Object.fromEntries(new FormData(e.target)),
    id = Math.max(0, ...S.opps.map((o) => o.id)) + 1,
    a = +v.amount;
  S.opps.push({
    id,
    name: v.name,
    account: v.account,
    amount: a,
    stage: +v.stage,
    close: v.close,
    owner: v.owner || defaultRepCode(),
    next: '',
    socials: { linkedin: v.linkedin, instagram: v.instagram, facebook: v.facebook, x: v.x },
    items: [{ n: 'Platform licence', c: 'GEN-100', p: a, q: 1, d: 0 }],
  });
  S.cur = id;
  $('#modal').innerHTML = '';
  save();
  nav('opp-detail');
}
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
 <div class="flex items-center gap-2 mb-5"><span class="ms" style="color:var(--pr);font-size:34px">cloud</span><div><b class="text-xl">Sales Cloud</b><div class="mut text-xs">Sign in to your workspace</div></div></div>
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
    console.warn('Could not sync Sales Cloud tab', err);
  }
});
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

// Slack share (records the share on the timeline)
function shareToSlack() {
  const o = cur();
  if (!o) return;
  logOpp(o.id, 'sync', `Deal shared to #deals in Slack by ${currentUser().name || 'user'}`);
  save();
  toast('Shared to #deals in Slack');
  render();
}

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

// Invoices: record payment after the invoice has been submitted
const baseInvoiceDetail = V['invoice-detail'];
V['invoice-detail'] = () => {
  const html = baseInvoiceDetail(),
    i = S.invoices.find((x) => x.id === S.currentInvoice);
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
  const theme = getTheme(), user = currentUser();
  const active = activeReps();
  const owned = active.map((u) => ({ user: u, count: S.opps.filter((o) => o.owner === u.ownerCode).length }));
  return `<div class="mb-4"><div class="mut">Workspace</div><h1 class="text-2xl font-bold">Settings</h1><p class="mut mt-1">Manage your workspace preferences, team assignments and data.</p></div>
  <div class="grid lg:grid-cols-3 gap-3 items-start">
   <section class="card p-4 lg:col-span-2"><div class="flex items-center gap-2 mb-1"><span class="ms" style="color:var(--pr)">palette</span><h2 class="font-bold text-lg">Appearance</h2></div><p class="mut mb-3">Choose how Sales Cloud looks on this device.</p><div class="grid sm:grid-cols-3 gap-2">${[['system','System','brightness_auto'],['light','Light','light_mode'],['dark','Dark','dark_mode']].map(([k,l,ic])=>`<button class="card p-3 flex items-center gap-2 ${theme===k?'':'mut'}" style="border-color:${theme===k?'var(--pr)':'var(--bd)'};background:${theme===k?'var(--hov)':'var(--card)'}" onclick="setTheme('${k}')"><span class="ms">${ic}</span><b>${l}</b><span class="flex-1"></span>${theme===k?'<span class="ms" style="color:var(--pr)">check_circle</span>':''}</button>`).join('')}</div></section>
   <section class="card p-4"><div class="flex items-center gap-2 mb-1"><span class="ms" style="color:var(--pr)">account_circle</span><h2 class="font-bold text-lg">My account</h2></div><p class="font-semibold mt-3">${E(user.name || roleNow().name)}</p><p class="mut">${E(user.username || '')} · ${(user.role || S.role).toUpperCase()}</p><p class="mut text-xs mt-3">Signed-in profile and portal access.</p><button class="btn mt-3" onclick="toggleUserMenu()">Account options</button></section>
   <section class="card p-4 lg:col-span-2"><div class="flex justify-between items-start gap-3"><div><div class="flex items-center gap-2"><span class="ms" style="color:var(--pr)">groups</span><h2 class="font-bold text-lg">Sales team & assignments</h2></div><p class="mut mt-1">See which representative is handling each opportunity. Assign a rep when creating or editing an opportunity.</p></div><button class="btn" onclick="nav('users')">Manage users</button></div>
    <div class="grid sm:grid-cols-2 gap-2 mt-4">${owned.map(({user:u,count})=>`<div class="rounded-lg border p-3 flex items-center gap-3" style="border-color:var(--bd)"><div class="w-9 h-9 rounded-full grid place-items-center font-bold" style="background:var(--hov);color:var(--pr)">${E((u.name||'?').split(/\s+/).map(x=>x[0]).slice(0,2).join('').toUpperCase())}</div><div class="flex-1 min-w-0"><b>${E(u.name)}</b><div class="mut text-xs">${E(u.username)} · ${E(u.ownerCode)}</div></div><div class="text-right"><b>${count}</b><div class="mut text-xs">opportunities</div></div></div>`).join('') || '<p class="mut">No active reps found. Create a Rep account to assign opportunities.</p>'}</div>
    <div class="mt-4 rounded-lg p-3" style="background:var(--hov)"><b class="text-sm">How assignment works</b><p class="mut text-xs mt-1">The assigned rep appears in the opportunity list, board and record details. Reps see opportunities assigned to their own account; Admins and CEOs can view and reassign all opportunities.</p></div>
   </section>
   <section class="card p-4"><div class="flex items-center gap-2 mb-1"><span class="ms" style="color:var(--pr)">database</span><h2 class="font-bold text-lg">Data management</h2></div><p class="mut mt-1">Restore the original demo records stored in this browser.</p><button class="btn mt-3 w-full justify-center" style="color:var(--err)" onclick="if(confirm('Reset all demo data? This will replace locally saved records.')){localStorage.removeItem(KEY);location.reload()}">Reset demo data</button><p class="mut text-xs mt-2">This action cannot be undone.</p></section>
   <section class="card p-4 lg:col-span-3"><div class="flex items-center gap-2"><span class="ms" style="color:var(--pr)">info</span><h2 class="font-bold">About this workspace</h2></div><div class="grid sm:grid-cols-3 gap-3 mt-3"><div><div class="mut text-xs">Opportunities</div><b>${S.opps.length}</b></div><div><div class="mut text-xs">Active representatives</div><b>${active.length}</b></div><div><div class="mut text-xs">Attachments tracked</div><b>${S.opps.reduce((n,o)=>n+(o.attachments||[]).length,0)}</b></div></div></section>
  </div>`;
};
function toggleSettings() { closePanels(); nav('settings'); }

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

const renderBeforeActions = render;
render = function () {
  renderBeforeActions();
  updateHeader();
};

// Ensure the first visible render uses the active portal and new navigation.
save();
render();


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
    return docs.map((d) =>
      `<span class="text-xs inline-flex flex-wrap gap-1 items-center"><b>Quote:</b> ${E(d.quoteNo)} <span class="mut">·</span> <b>Invoice:</b> ${d.invoiceNo ? E(d.invoiceNo) : '—'}</span>`
    ).join('<br>');
  };
  const repCell = (o) => canReassign
    ? `<select class="inp text-xs" style="width:auto;max-width:150px;padding:4px 24px 4px 8px" aria-label="Assigned representative" onclick="event.stopPropagation()" onchange="reassignOpportunity(${o.id},this.value)">${activeReps().map((u) => `<option value="${E(u.ownerCode)}" ${u.ownerCode === o.owner ? 'selected' : ''}>${E(u.name)}</option>`).join('')}</select>`
    : `<span>${E(ownerLabel(o.owner))}</span>`;
  const top = `<div class="flex flex-wrap items-center gap-2 mb-3"><div><div class="mut">Opportunities</div><h1 class="text-xl font-bold">${S.role === 'rep' ? 'My opportunities' : 'All opportunities'}</h1></div><span class="mut ml-2">${all.length} items · Total ${M(total)}</span><span class="flex-1"></span><input class="inp" style="width:200px" placeholder="Filter this list" value="${E(S.q || '')}" oninput="S.q=this.value;clearTimeout(window.ft);window.ft=setTimeout(()=>{render();const i=document.querySelector('[placeholder=\\'Filter this list\\']');if(i){i.focus();i.setSelectionRange(99,99)}},250)"><button class="btn" onclick="S.view='${S.view === 'kanban' ? 'list' : 'kanban'}';render()"><span class="ms">${S.view === 'kanban' ? 'table_rows' : 'view_kanban'}</span>${S.view === 'kanban' ? 'List' : 'Board'}</button><button class="btn btn-p" onclick="modal('opp')"><span class="ms">add</span>New</button></div>`;
  if (S.view === 'list') {
    return top + table(
      ['Opportunity', 'Account', 'Stage', 'Amount', 'Close date', 'Assigned rep', 'Quotation no.', 'Invoice no.'],
      all.map((o) => {
        const docs = opportunityDocuments(o);
        const quoteNumbers = docs.map((d) => E(d.quoteNo)).join('<br>') || '—';
        const invoiceNumbers = docs.map((d) => E(d.invoiceNo || '—')).join('<br>') || '—';
        return `<tr class="r" onclick="nav('opp-detail',${o.id})"><td><b>${E(o.name)}</b></td><td>${E(o.account)}</td><td>${E(ST[o.stage] || '—')}</td><td>${M(o.amount)}</td><td>${fd(o.close)}</td><td onclick="event.stopPropagation()">${repCell(o)}</td><td>${quoteNumbers}</td><td>${invoiceNumbers}</td></tr>`;
      }).join('')
    );
  }
  return top + `<p class="mut mb-2 flex items-center gap-1"><span class="ms">info</span>Drag a deal to another stage to update it. Assigned rep, quotation and invoice references are visible on every opportunity.</p><div class="flex gap-3 overflow-x-auto pb-3">${ST.map((stage, index) => {
    const deals = all.filter((o) => o.stage === index && !o.lost);
    return `<div class="kcol card shrink-0 w-80 p-2" style="background:var(--hov)" ondragover="event.preventDefault();this.classList.add('over')" ondragleave="this.classList.remove('over')" ondrop="drop(event,${index})"><div class="px-1 pb-2"><b>${stage}</b><div class="mut">${deals.length} deals · ${M(deals.reduce((sum,o)=>sum+(+o.amount||0),0))}</div></div><div class="space-y-2">${deals.map((o) => `<div class="kc card p-3" draggable="true" ondragstart="event.dataTransfer.setData('t',${o.id})" onclick="nav('opp-detail',${o.id})"><b style="color:var(--pr)">${E(o.name)}</b><div class="mut">${E(o.account)}</div><div class="flex justify-between mt-2"><b>${M(o.amount)}</b><span class="mut">${PR[index]}%</span></div>${o.next ? `<div class="mut mt-1">Next: ${E(o.next)}</div>` : ''}<div class="flex justify-between items-center mt-2"><span class="chip ${chipC(o)}">${fd(o.close)}</span><span class="text-xs mut" title="Assigned rep">${E(ownerLabel(o.owner))}</span></div><div class="mt-2 pt-2 border-t" style="border-color:var(--bd)" onclick="event.stopPropagation()">${docMeta(o)}</div>${canReassign ? `<div class="mt-2" onclick="event.stopPropagation()"><label class="mut text-xs">Change assigned rep<select class="inp mt-1" style="width:100%" onchange="reassignOpportunity(${o.id},this.value)">${activeReps().map((u)=>`<option value="${E(u.ownerCode)}" ${u.ownerCode===o.owner?'selected':''}>${E(u.name)}</option>`).join('')}</select></label></div>` : ''}</div>`).join('')}</div></div>`;
  }).join('')}</div>`;
};
const previousQuotesView = V.quotes;
V.quotes = () => {
  const list = S.quotes.filter((q) => S.role !== 'rep' || visibleOpps().some((o) => o.id == q.opp));
  return `<h1 class="text-xl font-bold mb-3">Quotations</h1><p class="mut mb-3">Quotation records are visible to the assigned rep, Admin and CEO.</p>` +
    table(['Quotation no.', 'Opportunity', 'Assigned rep', 'Total', 'Discount', 'Status', 'Invoice no.'],
      list.map((q) => {
        const o = S.opps.find((x) => x.id == q.opp) || {};
        const inv = q.invoiceId && S.invoices.find((x) => x.id === q.invoiceId);
        return `<tr class="r" onclick="openQuoteRecord('${E(q.no)}')"><td><b>${E(q.no)}</b></td><td>${E(o.name || '')}</td><td>${E(ownerLabel(o.owner))}</td><td>${M(quoteTotal(q))}</td><td>${quoteDiscount(q).toFixed(2)}%</td><td>${E(q.status)}</td><td>${inv ? E(inv.invoiceNo) : '—'}</td></tr>`;
      }).join(''));
};
V.invoices = () => {
  const list = S.invoices.filter((i) => S.role !== 'rep' || visibleOpps().some((o) => o.id == i.opp));
  return `<h1 class="text-xl font-bold mb-3">Invoices</h1>` +
    table(['Invoice no.', 'Quotation no.', 'Opportunity', 'Assigned rep', 'Customer', 'Total', 'Status'],
      list.map((i) => {
        const o = S.opps.find((x) => x.id == i.opp) || {};
        return `<tr class="r" onclick="openInvoice('${E(i.id)}')"><td><b>${E(i.invoiceNo)}</b></td><td>${E(i.quoteNo)}</td><td>${E(i.opportunity)}</td><td>${E(ownerLabel(o.owner))}</td><td>${E(i.account)}</td><td>${M(i.total)}</td><td>${E(i.status)}</td></tr>`;
      }).join(''));
};
save();
render();
