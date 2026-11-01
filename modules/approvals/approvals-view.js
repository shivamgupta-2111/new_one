// Approvals queue view.

V.approvals = () => {
  if (S.role === 'rep') return '<p class="mut">Approvals are managed by Admin and CEO.</p>';
  const list = S.quotes.filter((q) =>
    S.role === 'ceo' ? q.status === 'Pending CEO Approval' : q.status === 'Pending Admin Approval'
  );
  return (
    `<h1 class="text-xl font-bold mb-2">Quotation approvals</h1><p class="mut mb-3">Review discounts and product minimum-price exceptions. Any price below product minimum requires CEO approval.</p>` +
    table(
      [
        'Quote',
        'Opportunity',
        'Requested by',
        'Discount',
        'Total',
        'Approval reason',
        'Notes',
        'Action',
      ],
      list
        .map((q) => {
          const o = S.opps.find((x) => x.id == q.opp) || {};
          return `<tr><td><b>${q.no}</b></td><td>${E(o.name || '')}</td><td>${E(q.createdBy || 'Rep')}</td><td>${quoteDiscount(q).toFixed(2)}%</td><td>${M(quoteTotal(q))}</td><td>${belowProductFloor(q).length ? 'Below minimum price' : 'Discount approval'}</td><td style="max-width:260px">${E(q.notes || '—')}</td><td class="whitespace-nowrap"><button class="btn btn-p" onclick="approveQuote('${q.no}')">Approve</button> <button class="btn" onclick="rejectQuote('${q.no}')">Reject</button></td></tr>`;
        })
        .join('')
    )
  );
};
