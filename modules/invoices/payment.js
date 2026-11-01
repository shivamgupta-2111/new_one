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
