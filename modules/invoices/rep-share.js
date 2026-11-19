// Reps share an invoice with the client after Admin or CEO approves.
//
// Flow: the rep asks for approval on their quote page -> Admin and CEO get a pop-up (and a banner on the
// invoice page) to approve or reject -> once approved, the rep sends the client the invoice link by email
// or WhatsApp. On that link the client can view and download the invoice PDF and, if turned on, pay online.
// Admin and CEO can also allow sharing without a request.
// Stored on the invoice: i.share = { status: 'pending' | 'approved' | 'rejected', requestedBy, requestedByUid,
// requestedAt, decidedBy, decidedAt, note }.

const canApproveInvoiceShare = () => ['admin', 'ceo'].includes(S.role);
const invoiceById = (id) => S.invoices.find((x) => x.id === id);
const ownsInvoiceDeal = (i) => visibleOpps().some((o) => o.id == i.opp);
function repOfInvoice(i) {
  const o = S.opps.find((x) => x.id == i.opp);
  return o && (S.users || []).find((u) => u.role === 'rep' && u.ownerCode === o.owner);
}
const canShareInvoice = (i) =>
  !!i &&
  (canApproveInvoiceShare() || (ownsInvoiceDeal(i) && (i.share || {}).status === 'approved'));

function requestInvoiceShare(id) {
  const i = invoiceById(id);
  if (!i) return;
  if (!ownsInvoiceDeal(i)) return toast('You can only share invoices for your own deals');
  if ((i.share || {}).status === 'pending')
    return toast('Already waiting for Admin / CEO approval');
  if ((i.share || {}).status === 'approved') return openShareInvoice(id);
  i.share = {
    status: 'pending',
    requestedBy: roleNow().name,
    requestedByUid: S.authUser,
    requestedAt: Date.now(),
  };
  logOpp(
    i.opp,
    'sync',
    `${roleNow().name} asked Admin / CEO to approve sharing invoice ${i.invoiceNo} with the client`
  );
  ['admin', 'ceo'].forEach((r) =>
    queuePopup({ kind: 'bill-share-req', inv: i.id, toRole: r, by: S.authUser })
  );
  save();
  toast('Sent to Admin and CEO for approval');
  render();
}
function decideInvoiceShare(id, ok, note = '') {
  if (!canApproveInvoiceShare()) return toast('Only Admin or CEO can approve this');
  const i = invoiceById(id);
  if (!i) return;
  const prev = i.share || {};
  i.share = {
    ...prev,
    status: ok ? 'approved' : 'rejected',
    decidedBy: roleNow().name,
    decidedAt: Date.now(),
    note: String(note || '').trim(),
  };
  logOpp(
    i.opp,
    'sync',
    `${roleNow().name} ${ok ? 'approved' : 'rejected'} sharing invoice ${i.invoiceNo} with the client${i.share.note ? ': ' + i.share.note : ''}`
  );
  const rep = prev.requestedByUid ? { id: prev.requestedByUid } : repOfInvoice(i);
  if (rep)
    queuePopup({
      kind: ok ? 'bill-share-ok' : 'bill-share-no',
      inv: i.id,
      toUser: rep.id,
      by: S.authUser,
    });
  save();
  $('#modal').innerHTML = '';
  toast(ok ? 'Approved: the rep can now share this invoice' : 'Request rejected');
  render();
}
function openRejectInvoiceShare(id) {
  const i = invoiceById(id);
  if (!i) return;
  $('#modal').innerHTML =
    `<div class="fixed inset-0 z-40 grid place-items-center p-4" style="background:rgba(0,0,0,.5)"><form class="card p-5 w-full max-w-md space-y-3" onsubmit="event.preventDefault();decideInvoiceShare('${E(i.id)}',false,this.elements.note.value)"><h2 class="text-lg font-bold">Reject sharing ${E(i.invoiceNo)}</h2>` +
    `<label class="block">Reason (shown to the rep)<textarea class="inp mt-1" name="note" rows="3" maxlength="200" placeholder="e.g. Wait until the PO arrives"></textarea></label>` +
    `<div class="flex justify-end gap-2"><button type="button" class="btn" onclick="$('#modal').innerHTML=''">Cancel</button><button class="btn btn-p">Reject</button></div></form></div>`;
  $('#modal textarea').focus();
}

// ---------- the share dialog (rep after approval; Admin / CEO any time) ----------
function invoiceShareMessage(i) {
  const q = quoteOfInvoice(i),
    co = companyInfo().name || (S.settings.company || {}).name || 'our team',
    first =
      String((q && q.preparedFor) || '')
        .replace(/\s*\(.*\)\s*$/, '')
        .split(' ')[0] || 'there';
  return `Hello ${first},\n\nPlease find invoice ${i.invoiceNo} for ${i.account}.\nAmount due: ${M(invBalance(i))}\nDue date: ${fd(invDueDate(i))}\n\nView and download the invoice${canPayOnline(i) ? ' (and pay online)' : ''} here:\n${paymentLink(i)}\n\nRegards,\n${roleNow().name}\n${co}`;
}
function openShareInvoice(id) {
  const i = invoiceById(id);
  if (!i) return;
  if (!canShareInvoice(i))
    return toast('Admin or CEO must approve before this invoice can be shared');
  const q = quoteOfInvoice(i);
  if (!q) return toast('This invoice has no quotation to link to');
  const ch = S.invChan === 'whatsapp' ? 'whatsapp' : 'email',
    o = S.opps.find((x) => x.id == i.opp) || {};
  $('#modal').innerHTML =
    `<div class="fixed inset-0 z-40 grid place-items-center p-4" style="background:rgba(0,0,0,.5)"><form class="card p-5 w-full max-w-lg max-h-full overflow-auto space-y-3" onsubmit="doShareInvoice(event,'${E(i.id)}')"><h2 class="text-lg font-bold">Share invoice ${E(i.invoiceNo)} with the client</h2>` +
    `<div class="flex gap-2"><button type="button" class="btn ${ch === 'email' ? 'btn-p' : ''}" onclick="S.invChan='email';openShareInvoice('${E(i.id)}')"><span class="ms">mail</span>Email</button><button type="button" class="btn ${ch === 'whatsapp' ? 'btn-p' : ''}" onclick="S.invChan='whatsapp';openShareInvoice('${E(i.id)}')"><span class="ms">chat</span>WhatsApp</button></div>` +
    (o.account && contactsOfAccount(o.account).length
      ? `<label class="block">Contact<select class="inp" onchange="const c=S.contacts.find(x=>x[0]===this.value);if(c){this.form.elements.to.value=${ch === 'email' ? 'c[3]' : 'c[4]'}||''}"><option value="">Choose a contact…</option>${contactOptions(o.account, '')}</select></label>`
      : '') +
    `<input type="hidden" name="chan" value="${ch}">` +
    (ch === 'email'
      ? `<label class="block">To (email) *<input class="inp" name="to" type="email" required value="${E(q.toEmail || '')}" placeholder="accounts@company.com"></label><label class="block">Subject<input class="inp" name="subject" value="${E(`Invoice ${i.invoiceNo} – ${i.account}`)}"></label>`
      : `<label class="block">WhatsApp number *<input class="inp" name="to" type="tel" required value="${E(q.toPhone || '')}" placeholder="+91 98765 43210"></label>`) +
    `<label class="block">Message<textarea class="inp" name="msg" rows="9">${E(invoiceShareMessage(i))}</textarea></label>` +
    `<p class="mut text-xs">This opens your ${ch === 'email' ? 'email app' : 'WhatsApp'} with the message filled in. On the link the client can view and download the invoice PDF${canPayOnline(i) ? ' and pay online' : ''}.</p>` +
    `<div class="flex justify-end gap-2 flex-wrap"><button type="button" class="btn" onclick="copyText(paymentLink(invoiceById('${E(i.id)}')),'Invoice link copied')"><span class="ms">link</span>Copy link</button><button type="button" class="btn" onclick="$('#modal').innerHTML=''">Cancel</button><button class="btn btn-p">${ch === 'email' ? 'Open email' : 'Open WhatsApp'}</button></div></form></div>`;
  const t = $('#modal [name=to]');
  if (t && !t.value) t.focus();
}
function doShareInvoice(e, id) {
  e.preventDefault();
  const i = invoiceById(id),
    v = Object.fromEntries(new FormData(e.target)),
    to = (v.to || '').trim();
  if (!i || !to || !canShareInvoice(i)) return;
  if (v.chan === 'email' && !/^\S+@\S+\.\S+$/.test(to)) return toast('Enter a valid email address');
  if (v.chan === 'whatsapp' && phoneDigits(to).length < 11)
    return toast('Enter the number with country code');
  const url =
    v.chan === 'email'
      ? `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(v.subject || '')}&body=${encodeURIComponent(v.msg || '')}`
      : `https://wa.me/${phoneDigits(to)}?text=${encodeURIComponent(v.msg || '')}`;
  i.sends = [...(i.sends || []), { channel: v.chan, to, at: Date.now(), by: roleNow().name }];
  if (!['Paid', 'Partly paid', 'Overdue'].includes(i.status)) i.status = 'Submitted to client';
  i.sentAt = i.sentAt || Date.now();
  const q = quoteOfInvoice(i);
  if (q && q.status !== 'Paid') q.status = 'Sent to client';
  if (q) quoteToken(q);
  if (!save() || (q && !quoteLinkSaved(q)))
    return toast(
      'Could not save (browser storage is full), so the invoice link would not open for the client. Nothing was sent.'
    );
  logOpp(
    i.opp,
    v.chan === 'email' ? 'mail' : 'sync',
    `Invoice ${i.invoiceNo} shared with ${to} by ${v.chan === 'email' ? 'email' : 'WhatsApp'} (${roleNow().name})`
  );
  save();
  $('#modal').innerHTML = '';
  const a = document.createElement('a');
  a.href = url;
  a.target = '_blank';
  a.rel = 'noopener';
  document.body.appendChild(a);
  a.click();
  a.remove();
  toast(`Invoice ready to send to ${to}`);
  render();
}

// ---------- Invoice card on the quote page ----------
function invoiceShareCard(q) {
  const i = q && q.invoiceId ? invoiceById(q.invoiceId) : null;
  if (!i) return '';
  const s = i.share || {},
    id = E(i.id),
    when = (t) => (t ? ago(t) : ''),
    admin = canApproveInvoiceShare();
  let body = '',
    pill = '';
  if (admin) {
    if (s.status === 'pending') {
      pill = '<span class="qr-pill wr">Approval needed</span>';
      body = `<div class="qr-sub">${E(s.requestedBy)} asked ${when(s.requestedAt)} to share this invoice with the client.</div><div class="qr-links mt-2"><a class="qr-link" onclick="decideInvoiceShare('${id}',true)">Approve</a><a class="qr-link" onclick="openRejectInvoiceShare('${id}')">Reject</a><a class="qr-link" onclick="openShareInvoice('${id}')">Share myself</a></div>`;
    } else {
      pill = s.status === 'approved' ? '<span class="qr-pill ok">Rep can share</span>' : '';
      body = `<div class="qr-sub">${s.status === 'approved' ? `Approved for the rep by ${E(s.decidedBy)} ${when(s.decidedAt)}.` : s.status === 'rejected' ? `Sharing rejected by ${E(s.decidedBy)}${s.note ? ': ' + E(s.note) : ''}.` : 'The rep cannot share it until you allow it.'}</div><div class="qr-links mt-2">${s.status === 'approved' ? '' : `<a class="qr-link" onclick="decideInvoiceShare('${id}',true)">Allow rep to share</a>`}<a class="qr-link" onclick="openShareInvoice('${id}')">Share with client</a><a class="qr-link" onclick="openInvoice('${id}')">Open invoice</a></div>`;
    }
  } else if (ownsInvoiceDeal(i)) {
    if (s.status === 'approved') {
      pill = '<span class="qr-pill ok">Approved</span>';
      body = `<div class="qr-sub">Approved by ${E(s.decidedBy)} ${when(s.decidedAt)}.${(i.sends || []).length ? ` Last shared ${when(i.sends[i.sends.length - 1].at)}.` : ''}</div><button class="btn btn-p mt-2" onclick="openShareInvoice('${id}')"><span class="ms">send</span>Share with client</button>`;
    } else if (s.status === 'pending') {
      pill = '<span class="qr-pill wr">Waiting</span>';
      body = `<div class="qr-sub">Waiting for Admin / CEO approval · requested ${when(s.requestedAt)}.</div>`;
    } else {
      pill = s.status === 'rejected' ? '<span class="qr-pill bad">Not approved</span>' : '';
      body = `<div class="qr-sub">${s.status === 'rejected' ? `Not approved by ${E(s.decidedBy)}${s.note ? ': ' + E(s.note) : ''}. You can ask again.` : 'Admin or CEO must approve before you can share this invoice with the client.'}</div><button class="btn mt-2" onclick="requestInvoiceShare('${id}')"><span class="ms">approval</span>Request approval to share</button>`;
    }
  } else return '';
  return qrCard(
    'Invoice',
    `<div class="qr-pdf"><span class="qr-pdfi">INV</span><div><b>${E(i.invoiceNo)}</b><div class="qr-sub">${M(invPayable(i))} · ${E(i.status)}</div></div></div>${body}`,
    pill
  );
}
const qrPdfsBeforeShare = qrPdfs;
qrPdfs = function (q) {
  return invoiceShareCard(q) + qrPdfsBeforeShare.apply(this, arguments);
};

// Invoice page (Admin / CEO): approve or reject a pending request, and a Share button.
const invoiceDetailBeforeShare = V['invoice-detail'];
V['invoice-detail'] = function () {
  let html = invoiceDetailBeforeShare.apply(this, arguments);
  const i = invoiceById(S.currentInvoice);
  if (!i || !canSeeInvoices()) return html;
  const s = i.share || {},
    id = E(i.id),
    banner =
      s.status === 'pending'
        ? `<div class="qt-banner wr mb-3"><span class="ms">approval</span><div class="flex-1"><b>${E(s.requestedBy)} wants to share this invoice with the client</b><div>Requested ${ago(s.requestedAt)}</div></div><div class="flex gap-2 flex-wrap"><button class="btn btn-p" onclick="decideInvoiceShare('${id}',true)">Approve</button><button class="btn" onclick="openRejectInvoiceShare('${id}')">Reject</button></div></div>`
        : s.status === 'approved'
          ? `<div class="qt-banner ok mb-3"><span class="ms">verified</span><div class="flex-1"><b>The rep can share this invoice with the client</b><div>Approved by ${E(s.decidedBy)} ${ago(s.decidedAt)}</div></div></div>`
          : '';
  html = html.replace(
    '<button class="btn" onclick="openInvoiceSheet(',
    `<button class="btn" onclick="openShareInvoice('${id}')"><span class="ms">send</span>Share with client</button>${s.status === 'approved' ? '' : `<button class="btn" onclick="decideInvoiceShare('${id}',true)"><span class="ms">approval</span>Allow rep to share</button>`}<button class="btn" onclick="openInvoiceSheet(`
  );
  return banner + html;
};

// Pop-ups: Admin / CEO get the request; the rep hears back.
const showBillPopupBeforeShare = showBillPopup;
showBillPopup = function (p) {
  if (!['bill-share-req', 'bill-share-ok', 'bill-share-no'].includes(p.kind))
    return showBillPopupBeforeShare.apply(this, arguments);
  const i = invoiceById(p.inv);
  if (!i) return showNextPopup();
  const s = i.share || {},
    id = i.id;
  if (p.kind === 'bill-share-req') {
    if (s.status !== 'pending') return showNextPopup(); // already decided by the other approver
    return showPopup({
      tone: 'wr',
      icon: 'approval',
      title: `${E(s.requestedBy)} wants to share ${E(i.invoiceNo)}`,
      lines: [
        `${E(i.account)} · ${M(invPayable(i))}`,
        'Approve so the rep can send the invoice link to the client?',
      ],
      actions: [
        { label: 'Approve', js: `decideInvoiceShare('${id}',true)` },
        { label: 'Reject', js: `openRejectInvoiceShare('${id}')` },
        { label: 'Open invoice', js: `openInvoice('${id}')` },
      ],
    });
  }
  const q = quoteOfInvoice(i);
  return showPopup({
    tone: p.kind === 'bill-share-ok' ? 'ok' : 'err',
    icon: p.kind === 'bill-share-ok' ? 'verified' : 'block',
    title:
      p.kind === 'bill-share-ok'
        ? `You can share ${E(i.invoiceNo)} now`
        : `Sharing ${E(i.invoiceNo)} was not approved`,
    lines: [
      `${E(i.account)} · approved or reviewed by ${E(s.decidedBy || '')}`,
      p.kind === 'bill-share-no' && s.note ? `Reason: ${E(s.note)}` : '',
    ],
    actions:
      p.kind === 'bill-share-ok'
        ? [{ label: 'Share with client', js: `openShareInvoice('${id}')` }]
        : q
          ? [{ label: `Open ${q.no}`, js: `openQuoteRecord('${E(q.no)}')` }]
          : [],
  });
};

// ---------- client payment page: download the invoice as a PDF ----------
function payDownloadPdf() {
  const q = quoteByToken(location.hash.slice(5)),
    i = invoiceOfQuote(q);
  if (!i) return;
  $('#modal').innerHTML =
    `<div class="fixed inset-0 z-40 grid place-items-center p-4" style="background:rgba(0,0,0,.5)"><div class="card p-6 w-full max-w-4xl max-h-full overflow-auto">${invoiceSheetHtml(i)}<div class="flex justify-end gap-2 mt-4 no-print"><button class="btn" onclick="$('#modal').innerHTML=''">Close</button><button class="btn btn-p" onclick="printInvoiceForClient()"><span class="ms">picture_as_pdf</span>Save as PDF / Print</button></div></div></div>`;
  printInvoiceForClient();
}
function printInvoiceForClient() {
  const q = quoteByToken(location.hash.slice(5)),
    i = invoiceOfQuote(q),
    t = document.title;
  if (i) document.title = `${i.invoiceNo} Invoice`;
  const back = () => {
    document.title = t;
    removeEventListener('afterprint', back);
  };
  addEventListener('afterprint', back);
  window.print();
}
const renderPaymentPageBeforePdf = renderPaymentPage;
renderPaymentPage = function () {
  renderPaymentPageBeforePdf.apply(this, arguments);
  const i = invoiceOfQuote(quoteByToken(location.hash.slice(5))),
    app = $('#app');
  if (!i || !app || app.querySelector('#pay-pdf')) return;
  app.insertAdjacentHTML(
    'afterbegin',
    `<div id="pay-pdf" class="flex flex-wrap items-center gap-2 mb-2 no-print"><span class="mut text-sm flex-1">Invoice ${E(i.invoiceNo)} from ${E(companyInfo().name || 'Ceph CRM')}</span><button type="button" class="btn" onclick="payDownloadPdf()"><span class="ms">picture_as_pdf</span>Download invoice PDF</button></div>`
  );
};
