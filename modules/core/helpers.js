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
