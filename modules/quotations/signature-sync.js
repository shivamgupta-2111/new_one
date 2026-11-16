// Keeps the client's e-signature in step everywhere in the CRM.
// The quote page edits a working copy (S.qd). When the client signs from their link (often in another tab or
// browser), only the stored quote changes, so the copy is refreshed from the stored quote on every render.

const CLIENT_OWNED_QUOTE_KEYS = [
  'customer',
  'signedBy',
  'signedAt',
  'signedVia',
  'signedRecordedBy',
  'views',
  'firstViewedAt',
  'paidOnlineAt',
];
function adoptClientSignature(q) {
  if (!q || !q.customer || q.customer.status !== 'Accepted' || !q.customer.name) return false;
  if (q.signedBy === q.customer.name && q.signedAt === q.customer.at && q.signedVia === 'customer')
    return false;
  q.signedBy = q.customer.name;
  q.signedAt = q.customer.at;
  q.signedVia = 'customer';
  q.signedRecordedBy = undefined;
  return true;
}
function syncOpenQuoteFromStore() {
  let changed = false;
  (S.quotes || []).forEach((q) => (changed = adoptClientSignature(q) || changed));
  const q = S.qd,
    stored = q && (S.quotes || []).find((x) => x.no === q.no);
  if (stored) {
    CLIENT_OWNED_QUOTE_KEYS.forEach((k) => {
      if (JSON.stringify(q[k]) !== JSON.stringify(stored[k])) {
        q[k] = stored[k] === undefined ? undefined : clone(stored[k]);
        changed = true;
      }
    });
    // a payment made by the client marks the stored quote Paid; never let the open copy undo that
    if (stored.status === 'Paid' && q.status !== 'Paid') {
      q.status = 'Paid';
      changed = true;
    }
  }
  if (changed) save();
}
const renderBeforeSignatureSync = render;
render = function () {
  syncOpenQuoteFromStore();
  return renderBeforeSignatureSync.apply(this, arguments);
};
// another tab (the client's link) changed the data: refresh the open quote page
addEventListener('storage', (e) => {
  if (e.key !== KEY || clientRoute()) return;
  syncOpenQuoteFromStore();
  if (['quote', 'opp-detail', 'invoice-detail', 'invoices'].includes(location.hash.slice(1)) && S.authUser)
    render();
});
syncOpenQuoteFromStore();
