// Role-filtered quotations list.


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
          return `<tr class="r" onclick="openQuoteRecord('${E(q.no)}')"><td><b>${E(q.no)}</b></td><td>${E(o.name || '')}</td><td>${repLink(o.owner)}</td><td>${M(quoteTotal(q))}</td><td>${quoteDiscount(q).toFixed(2)}%</td><td>${E(q.status)}</td><td>${inv ? E(inv.invoiceNo) : '—'}</td></tr>`;
        })
        .join('')
    )
  );
};

