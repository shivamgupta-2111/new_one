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
