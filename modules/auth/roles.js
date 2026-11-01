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
