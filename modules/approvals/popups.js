// Proper pop-ups for the approval flow: on submit, when approval is needed, and after approve / reject.

function showPopup({ tone = 'ok', icon = 'info', title, lines = [], actions = [] }) {
  const color = tone === 'err' ? 'var(--err)' : tone === 'wr' ? 'var(--warn)' : 'var(--ok)',
    close = `$('#modal').innerHTML=''`,
    buttons = actions
      .map(
        (a, i) =>
          `<button type="button" class="btn ${i === 0 ? 'btn-p' : ''}" ${i === 0 ? 'data-pop-primary' : ''} onclick="${close};${a.js || ''}">${E(a.label)}</button>`
      )
      .concat([
        `<button type="button" class="btn" ${actions.length ? '' : 'data-pop-primary'} onclick="${close}">Close</button>`,
      ])
      .join('');
  $('#modal').innerHTML =
    `<div class="fixed inset-0 z-40 grid place-items-center p-4" style="background:rgba(0,0,0,.5)" onclick="if(event.target===this){${close}}"><div class="card p-5 w-full max-w-md" role="dialog" aria-modal="true" aria-labelledby="pop-title">` +
    `<div class="flex items-start gap-3"><span class="ms" style="color:${color};font-size:36px">${icon}</span><div class="flex-1 min-w-0"><h2 id="pop-title" class="text-lg font-bold">${title}</h2>${lines
      .filter(Boolean)
      .map((l) => `<div class="mt-1">${l}</div>`)
      .join('')}</div></div>` +
    `<div class="flex justify-end gap-2 mt-4 flex-wrap">${buttons}</div></div></div>`;
  const p = $('#modal [data-pop-primary]');
  if (p) p.focus();
}

const POPUP_MAX_AGE = 7 * 864e5;
function queuePopup(p) {
  S.popups = (S.popups || []).slice(-199);
  S.popups.push({
    id: 'p' + Date.now() + Math.random().toString(36).slice(2, 6),
    t: Date.now(),
    seen: {},
    ...p,
  });
}
const quoteOf = (no) => S.quotes.find((x) => x.no === no);
const quoteFacts = (q) =>
  `<span class="mut">Discount ${quoteDiscount(q).toFixed(2)}% · Total ${M(quoteTotal(q))}</span>`;
const invoiceOf = (q) => (q.invoiceId ? S.invoices.find((i) => i.id === q.invoiceId) : null);
const invoiceActions = (q) => {
  const inv = invoiceOf(q);
  return inv && canSeeInvoices()
    ? [{ label: `Open ${inv.invoiceNo}`, js: `openInvoice('${E(inv.id)}')` }]
    : [];
};

// Pop-ups waiting for the signed-in person (approvals to review, or decisions on their quotes).
function popupForMe(p) {
  if (!S.authUser || p.by === S.authUser || (p.seen || {})[S.authUser]) return false;
  if (Date.now() - p.t > POPUP_MAX_AGE) return false;
  return p.toUser ? p.toUser === S.authUser : p.toRole ? p.toRole === S.role : false;
}
function showNextPopup() {
  const modal = $('#modal');
  if (!S.authUser || !modal || modal.innerHTML.trim()) return;
  const p = (S.popups || []).find(popupForMe);
  if (!p) return;
  p.seen = { ...(p.seen || {}), [S.authUser]: true }; // showing it counts as seen, so it never repeats
  save();
  if (String(p.kind).startsWith('tnc')) return showTncPopup(p);
  if (String(p.kind).startsWith('cq-')) return showCqPopup(p);
  if (String(p.kind).startsWith('bill-')) return showBillPopup(p);
  const q = quoteOf(p.no),
    o = q && S.opps.find((x) => x.id == q.opp);
  if (!q) return showNextPopup();
  if (p.kind === 'needs-approval') {
    if (!String(q.status).startsWith('Pending')) return showNextPopup(); // already decided
    return showPopup({
      tone: 'wr',
      icon: 'approval',
      title: `Approval needed: ${E(q.no)}`,
      lines: [
        `<b>${E(q.createdBy || 'A rep')}</b> submitted a quotation${o ? ` for <b>${E(o.name)}</b>` : ''}.`,
        quoteFacts(q),
        q.floorApprovalRequired
          ? '<span class="mut">Includes a price below the product minimum.</span>'
          : '',
        q.notes ? `Notes: ${E(q.notes)}` : '',
      ],
      actions: [{ label: 'Review now', js: `nav('approvals')` }],
    });
  }
  const approved = p.kind === 'approved';
  showPopup({
    tone: approved ? 'ok' : 'err',
    icon: approved ? 'verified' : 'cancel',
    title: `Quotation ${E(q.no)} ${approved ? 'approved' : 'rejected'}`,
    lines: [
      approved
        ? `Approved by <b>${E(q.approvedBy || '')}</b>.`
        : `Rejected by <b>${E(q.rejectedBy || '')}</b>.`,
      approved
        ? q.approvedNotes
          ? `Notes: ${E(q.approvedNotes)}`
          : ''
        : q.rejectedNotes
          ? `Reason: ${E(q.rejectedNotes)}`
          : '',
      approved && invoiceOf(q) && canSeeInvoices()
        ? `Invoice ${E(invoiceOf(q).invoiceNo)} generated.`
        : '',
      approved ? '' : 'Update the quote and submit it again with notes.',
    ],
    actions: [
      {
        label: approved ? 'View quote' : 'Review and resubmit',
        js: `openQuoteRecord('${E(q.no)}')`,
      },
      ...(approved ? invoiceActions(q) : []),
    ],
  });
}

// Toasts that the pop-ups replace; everything else (errors, validation) still shows.
function withoutToasts(rx, fn) {
  const real = toast;
  toast = (m, ...r) => (rx.test(String(m)) ? undefined : real(m, ...r));
  try {
    return fn();
  } finally {
    toast = real;
  }
}

const submitQuoteBeforePopups = submitQuote;
submitQuote = function () {
  const no = S.qd && S.qd.no,
    before = (quoteOf(no) || {}).requestedAt;
  withoutToasts(/^(Quotation sent for approval|Approved · invoice generated)/, () =>
    submitQuoteBeforePopups.apply(this, arguments)
  );
  const q = quoteOf(no);
  if (!q || !q.requestedAt || q.requestedAt === before) return;
  const pending = String(q.status).startsWith('Pending');
  if (pending)
    queuePopup({
      kind: 'needs-approval',
      no,
      toRole: q.status === 'Pending CEO Approval' ? 'ceo' : 'admin',
      by: S.authUser,
    });
  save();
  if (pending)
    showPopup({
      tone: 'wr',
      icon: 'hourglass_top',
      title: `Quotation ${E(q.no)} sent for approval`,
      lines: [
        `Routed to <b>${E(q.nextApprover || 'the approver')}</b> (${q.status === 'Pending CEO Approval' ? 'CEO' : 'Admin'}).`,
        quoteFacts(q),
        belowProductFloor(q).length
          ? '<span class="mut">A price is below the product minimum, so CEO approval is required.</span>'
          : '',
        'You will get a pop-up here as soon as it is approved or rejected.',
      ],
      actions: [{ label: 'Back to opportunity', js: `nav('opp-detail')` }],
    });
  else
    showPopup({
      tone: 'ok',
      icon: 'verified',
      title: `Quotation ${E(q.no)} approved`,
      lines: [
        `Approved by <b>${E(q.approvedBy || '')}</b> within their authority.`,
        quoteFacts(q),
        invoiceOf(q) && canSeeInvoices() ? `Invoice ${E(invoiceOf(q).invoiceNo)} generated.` : '',
      ],
      actions: invoiceActions(q),
    });
};

const finishApprovalBeforePopups = finishApproval;
finishApproval = function (e, no, mode) {
  const before = (quoteOf(no) || {}).status;
  withoutToasts(/^(Quotation rejected|Approval granted)/, () =>
    finishApprovalBeforePopups.apply(this, arguments)
  );
  const q = quoteOf(no);
  if (!q || q.status === before || !['Approved', 'Rejected'].includes(q.status)) return;
  const approved = q.status === 'Approved',
    creator = S.users.find((u) => u.name === q.createdBy);
  if (creator && creator.id !== S.authUser)
    queuePopup({
      kind: approved ? 'approved' : 'rejected',
      no,
      toUser: creator.id,
      by: S.authUser,
    });
  save();
  showPopup({
    tone: approved ? 'ok' : 'err',
    icon: approved ? 'verified' : 'cancel',
    title: `Quotation ${E(q.no)} ${approved ? 'approved' : 'rejected'}`,
    lines: [
      quoteFacts(q),
      approved && invoiceOf(q) ? `Invoice ${E(invoiceOf(q).invoiceNo)} generated.` : '',
      creator ? `${E(creator.name)} will see a pop-up about this decision.` : '',
    ],
    actions: [{ label: 'View quote', js: `openQuoteRecord('${E(q.no)}')` }],
  });
};

// Show waiting pop-ups after every render and when another tab saves new ones.
const renderBeforePopups = render;
render = function () {
  renderBeforePopups.apply(this, arguments);
  showNextPopup();
};
addEventListener('storage', (e) => {
  if (e.key === KEY) setTimeout(showNextPopup, 0);
});
