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
