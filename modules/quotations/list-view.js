// Role-filtered quotations and invoices lists.

const previousQuotesView = V.quotes;
V.quotes = () => {
  const list = S.quotes.filter((q) => S.role !== 'rep' || visibleOpps().some((o) => o.id == q.opp));
  return (
    `<h1 class="text-xl font-bold mb-3">Quotations</h1><p class="mut mb-3">Quotation records are visible to the assigned rep, Admin and CEO.</p>` +
    table(
      [
        'Quotation no.',
        'Opportunity',
        'Assigned rep',
        'Total',
        'Discount',
        'Status',
        'Invoice no.',
      ],
      list
        .map((q) => {
          const o = S.opps.find((x) => x.id == q.opp) || {};
          const inv = q.invoiceId && S.invoices.find((x) => x.id === q.invoiceId);
          return `<tr class="r" onclick="openQuoteRecord('${E(q.no)}')"><td><b>${E(q.no)}</b></td><td>${E(o.name || '')}</td><td>${E(ownerLabel(o.owner))}</td><td>${M(quoteTotal(q))}</td><td>${quoteDiscount(q).toFixed(2)}%</td><td>${E(q.status)}</td><td>${inv ? E(inv.invoiceNo) : '—'}</td></tr>`;
        })
        .join('')
    )
  );
};
V.invoices = () => {
  const list = S.invoices.filter(
    (i) => S.role !== 'rep' || visibleOpps().some((o) => o.id == i.opp)
  );
  return (
    `<h1 class="text-xl font-bold mb-3">Invoices</h1>` +
    table(
      [
        'Invoice no.',
        'Quotation no.',
        'Opportunity',
        'Assigned rep',
        'Customer',
        'Total',
        'Status',
      ],
      list
        .map((i) => {
          const o = S.opps.find((x) => x.id == i.opp) || {};
          return `<tr class="r" onclick="openInvoice('${E(i.id)}')"><td><b>${E(i.invoiceNo)}</b></td><td>${E(i.quoteNo)}</td><td>${E(i.opportunity)}</td><td>${E(ownerLabel(o.owner))}</td><td>${E(i.account)}</td><td>${M(i.total)}</td><td>${E(i.status)}</td></tr>`;
        })
        .join('')
    )
  );
};
