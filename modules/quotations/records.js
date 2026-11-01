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
