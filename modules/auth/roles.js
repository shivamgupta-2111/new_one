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
// Team view: a rep also sees their teammates' opportunities (view-only).
// Quotes, invoices and tasks still use visibleOpps(), so they stay private to each rep.
function teamOwnerCodes() {
  const me = (S.users || []).find((u) => u.id === S.authUser);
  if (!me || !me.teamId) return [roleNow().owner];
  return (S.users || [])
    .filter((u) => u.role === 'rep' && u.teamId === me.teamId)
    .map((u) => u.ownerCode);
}
function teamVisibleOpps() {
  if (seesAllOpps()) return S.opps;
  const codes = teamOwnerCodes();
  return S.opps.filter((o) => o.owner === roleNow().owner || codes.includes(o.owner));
}
// Only the deal's owner, a Senior Rep, Admin or CEO can change a deal.
function canEditOpp(o) {
  return !!o && (seesAllOpps() || o.owner === roleNow().owner);
}
function oppTeamName(o) {
  const u = (S.users || []).find((x) => x.role === 'rep' && x.ownerCode === o.owner);
  const t = u && (S.teams || []).find((x) => x.id === u.teamId);
  return t ? t.name : '';
}
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
