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
