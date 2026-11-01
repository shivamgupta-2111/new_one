// Invoice list and invoice detail views.

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
