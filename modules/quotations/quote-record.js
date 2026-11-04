// Quote record page (Salesforce-style) and the "New Quote" pop-up.
// Layout: breadcrumb, header actions, details strip, status path, then three columns
// (Quote / Client information | Line items, addresses, financial summary | Approvals, PDFs, activity).
// It reuses every existing action (submitQuote, approveQuote, syncQuote, openSendQuote, …).

const QR_PATH = ['Draft', 'Needs Review', 'In Review', 'Approved', 'Presented', 'Accepted'];

// Where the quote sits on the status path.
function qrPathIndex(q) {
  if (q.status === 'Paid' || (q.customer && q.customer.status === 'Accepted')) return 5;
  if (q.status === 'Sent to client') return 4;
  if (q.status === 'Approved') return 3;
  if (String(q.status).startsWith('Pending')) return 2;
  return (q.notes || '').trim() && ['Draft', 'Rejected'].includes(q.status) ? 1 : 0;
}
function qrPath(q) {
  const at = qrPathIndex(q),
    bad = q.status === 'Rejected' || q.status === 'Expired';
  return `<nav class="qr-path" aria-label="Quote status">${QR_PATH.map((s, i) => {
    const cls = i < at ? 'done' : i === at ? (bad ? 'bad' : 'cur') : '';
    return `<div class="qr-step ${cls}">${i < at ? '<span class="ms">check</span>' : ''}${i === at && i === 3 ? '<small>APPROVED</small>' : ''}<span>${i === at && i === 3 ? '' : s}${i === at && i === 3 ? 'Approved' : ''}</span></div>`;
  }).join('')}</nav>`;
}

// ---------- small helpers ----------
const qrList = (q) => q.items.reduce((a, i) => a + i.p * i.q, 0);
const qrRow = (k, v) => `<div class="qr-kv"><span>${k}</span><b>${v}</b></div>`;
const qrCard = (title, body, extra) =>
  `<section class="qr-card"><header><b>${title}</b>${extra || ''}</header><div class="qr-body">${body}</div></section>`;
const qrMoney = (n) => M(n);

function qrSortedItems(q) {
  const rows = q.items.map((i, k) => ({ i, k }));
  if (S.qSort === 'name') rows.sort((a, b) => String(a.i.n).localeCompare(String(b.i.n)));
  if (S.qSort === 'sub')
    rows.sort((a, b) => b.i.p * b.i.q * (1 - b.i.d / 100) - a.i.p * a.i.q * (1 - a.i.d / 100));
  return rows;
}
function qrCycleSort() {
  S.qSort = !S.qSort ? 'name' : S.qSort === 'name' ? 'sub' : '';
  toast(S.qSort === 'name' ? 'Sorted by product name' : S.qSort === 'sub' ? 'Sorted by subtotal' : 'Original order');
  render();
}
function qrToggleEdit() {
  S.qEdit = S.qEdit === false;
  render();
}
function qrToggleInfo() {
  S.qInfoEdit = !S.qInfoEdit;
  render();
}

// ---------- line items ----------
function qrLines(q, locked) {
  const floor = belowProductFloor(q),
    edit = !locked && S.qEdit !== false,
    products = S.products
      .filter((p) => p.active !== false)
      .map((p) => `<option value="${E(p.code)}">${E(p.name)} · ${M(p.listPrice)}</option>`)
      .join(''),
    bundles =
      typeof priceBook === 'function'
        ? priceBook().bundles.filter((b) => b.active !== false)
        : [],
    rows = qrSortedItems(q)
      .map(({ i, k }, n) => {
        const net = i.p * (1 - i.d / 100),
          low = floor.includes(i),
          qty = edit
            ? `<input class="qr-num" type="number" min="1" value="${i.q}" aria-label="Quantity" onchange="changeQuoteItem(${k},'q',this.value)">`
            : i.q,
          disc = edit
            ? `<input class="qr-num" type="number" min="0" max="100" step="0.1" value="${i.d}" aria-label="Discount percent" title="${canGiveDiscount() ? '' : 'Your discount goes to Admin / CEO for approval'}" onchange="changeQuoteItem(${k},'d',this.value)">`
            : `<span class="qr-pill ${i.d ? 'ok' : ''}">${i.d}%</span>`;
        return `<tr><td class="qr-mut">${n + 1}</td><td><b>${E(i.n)}</b><div class="qr-sub">${E(i.c)}${i.bundle ? ` · <span class="qr-tag">Bundle: ${E(i.bundle)}</span>` : ''}${low ? ' · <span class="qr-tag bad">Below min price</span>' : ''}</div></td><td class="qr-r">${qty}</td><td class="qr-r">${qrMoney(i.p)}</td><td class="qr-r">${disc}</td><td class="qr-r">${qrMoney(net)}</td><td class="qr-r"><b>${qrMoney(net * i.q)}</b></td>${edit ? `<td class="qr-r"><button class="qr-x" title="Remove" aria-label="Remove line" onclick="removeQuoteItem(${k})"><span class="ms">delete</span></button></td>` : ''}</tr>`;
      })
      .join('');
  const tools = locked
    ? ''
    : `<select class="qr-btn" aria-label="Add products" onchange="addQuoteProduct(this.value);this.value=''"><option value="">+ Add Products</option>${products}</select>` +
      (bundles.length
        ? `<select class="qr-btn" aria-label="Add bundle" onchange="addQuoteBundle(this.value);this.value=''"><option value="">+ Add Bundle</option>${bundles.map((b) => `<option value="${E(b.id)}">${E(b.name)} (${b.pct}% off)</option>`).join('')}</select>`
        : '') +
      (typeof openCart === 'function'
        ? `<button class="qr-btn" onclick="openCart()"><span class="ms">shopping_cart</span>Cart${typeof cartCount === 'function' && cartCount() ? ` <span class="qr-pill ok">${cartCount()}</span>` : ''}</button>`
        : '') +
      `<button class="qr-btn" onclick="qrToggleEdit()">${edit ? 'Done editing' : 'Edit Products'}</button>` +
      (canGiveDiscount()
        ? `<button class="qr-btn" onclick="applyTieredDiscount()" title="Quantity-tier discount">Tiered discount</button>`
        : '');
  return `<section class="qr-card"><header class="qr-lines-head"><b>Line Items Table</b><span class="qr-pill">${q.items.length} ${q.items.length === 1 ? 'Item' : 'Items'}</span><span class="flex-1"></span>${tools}<button class="qr-btn" onclick="qrCycleSort()"><span class="ms">sort</span>Sort${S.qSort ? ' · ' + (S.qSort === 'name' ? 'Name' : 'Subtotal') : ''}</button></header><div class="qr-scroll"><table class="qr-table"><thead><tr><th>#</th><th>Line item</th><th class="qr-r">Qty</th><th class="qr-r">List price</th><th class="qr-r">Discount</th><th class="qr-r">Net price</th><th class="qr-r">Subtotal</th>${edit ? '<th></th>' : ''}</tr></thead><tbody>${rows || '<tr><td colspan="8" class="qr-mut" style="padding:18px">No products yet. Use “Add Products”.</td></tr>'}</tbody></table></div></section>`;
}

// ---------- financial summary ----------
function qrTax(q, o) {
  try {
    if (typeof invoiceCalc !== 'function') return null;
    const c = invoiceCalc({ account: o.account, items: q.items, terms: q.terms });
    return c && c.g ? c : null;
  } catch (e) {
    return null;
  }
}
function qrFinancial(q, o) {
  const list = qrList(q),
    total = quoteTotal(q),
    off = list - total,
    pct = list ? (off / list) * 100 : 0,
    tax = qrTax(q, o),
    inclusive = tax && tax.g.mode === 'inclusive',
    taxAmt = tax ? tax.cgst + tax.sgst + tax.igst : 0,
    grand = tax && !inclusive ? tax.gross : total;
  return `<section class="qr-card qr-fin"><header><b>Financial Summary</b></header><div class="qr-body">${qrRow('Subtotal', qrMoney(list))}<div class="qr-kv"><span>Discount</span><b class="qr-green">${pct ? pct.toFixed(2) + '% (−' + qrMoney(off) + ')' : '—'}</b></div><div class="qr-kv qr-strong"><span>Total Price</span><b>${qrMoney(total)}</b></div>${tax && taxAmt ? qrRow(inclusive ? 'GST (included)' : 'GST', qrMoney(taxAmt)) : ''}</div><div class="qr-grand"><div><small>GRAND TOTAL</small><strong>${qrMoney(grand)}</strong></div><span class="qr-pill dark">${E(q.terms || 'Net 30')} Term</span></div></section>`;
}

// ---------- left column ----------
function qrInfo(q, o, d, locked) {
  const start = q.createdAt ? fd(new Date(q.createdAt).toISOString().slice(0, 10)) : '—';
  if (S.qInfoEdit && !locked) {
    const f = (l, c) => `<label class="qr-field"><span>${l}</span>${c}</label>`;
    return qrCard(
      'Quote Information',
      f('Quote name', `<input class="inp" value="${E(d.name)}" onchange="S.qd.name=this.value">`) +
        f('Expiration date', `<input type="date" class="inp" value="${E(q.exp || '')}" onchange="S.qd.exp=this.value">`) +
        f('Payment terms', `<select class="inp" onchange="S.qd.terms=this.value">${PAYMENT_TERMS.map((t) => `<option ${t === (q.terms || 'Net 30') ? 'selected' : ''}>${t}</option>`).join('')}</select>`) +
        f('Prepared for', `<input class="inp" value="${E(d.preparedFor)}" onchange="S.qd.preparedFor=this.value">`) +
        f('Email', `<input class="inp" type="email" value="${E(d.toEmail)}" placeholder="customer@company.com" onchange="S.qd.toEmail=this.value">`) +
        f('WhatsApp', `<input class="inp" type="tel" value="${E(d.toPhone)}" placeholder="+91 98765 43210" onchange="S.qd.toPhone=this.value">`) +
        f('Billing address', `<textarea class="inp" rows="2" onchange="S.qd.address=this.value">${E(d.address)}</textarea>`) +
        f('Shipping address', `<textarea class="inp" rows="2" onchange="S.qd.shipping=this.value">${E(d.shipping)}</textarea>`) +
        `<div class="qr-actions"><button class="qr-btn" onclick="qrToggleInfo()">Close</button><button class="qr-btn pri" onclick="storeQuote(S.qd);save();S.qInfoEdit=false;toast('Quote details saved');render()">Save</button></div>`,
      ''
    );
  }
  return qrCard(
    'Quote Information',
    qrRow('Primary', q.primary === false ? 'No' : 'Yes') +
      qrRow('Start Date', start) +
      qrRow('End Date', q.exp ? fd(q.exp) : '—') +
      qrRow('Payment Terms', E(q.terms || 'Net 30')) +
      qrRow('Owner', E(ownerLabel(o.owner))),
    locked ? '' : `<a class="qr-link" onclick="qrToggleInfo()">Edit</a>`
  );
}
function qrClient(q, o, d) {
  const acc = (S.accountInfo || {})[o.account] || {},
    name = String(d.preparedFor || '').replace(/\s*\(.*\)\s*$/, ''),
    title = (String(d.preparedFor).match(/\((.*)\)\s*$/) || [])[1] || '',
    block = (label, html) => `<div class="qr-blk"><small>${label}</small>${html}</div>`;
  return qrCard(
    'Client Information',
    block(
      'BILLING ADDRESS',
      `<div class="qr-strong">${E(o.account)}</div><div style="white-space:pre-wrap">${E(d.address || acc.address || '—')}</div>`
    ) +
      block('EMAIL', d.toEmail ? `<a class="qr-link" href="mailto:${E(d.toEmail)}">${E(d.toEmail)}</a>` : '—') +
      block(
        'PRIMARY CONTACT',
        `<div class="qr-strong">${E(name || '—')}</div>${title ? `<div>${E(title)}</div>` : ''}${d.toPhone ? `<a class="qr-link" href="tel:${E(d.toPhone)}">${E(d.toPhone)}</a>` : ''}`
      )
  );
}

// ---------- right column ----------
function qrApprovals(q, floor, locked) {
  const hist = (q.history || []).filter((h) => ['Submitted', 'Approved', 'Rejected', 'Escalated'].includes(h.action)),
    pending = String(q.status).startsWith('Pending'),
    done = ['Approved', 'Sent to client', 'Paid'].includes(q.status),
    rows = [];
  if (done)
    rows.push(
      `<div class="qr-appr"><span class="qr-ok ms">check_circle</span><div><b>Approved by ${E(q.approvedBy || 'approver')}</b><div class="qr-sub">Date: ${q.approvedAt ? fd(new Date(q.approvedAt).toISOString().slice(0, 10)) : '—'}</div>${q.approvedNotes ? `<div class="qr-sub">${E(q.approvedNotes)}</div>` : ''}</div></div>`
    );
  if (pending)
    rows.push(
      `<div class="qr-appr"><span class="qr-wait ms">hourglass_top</span><div><b>Awaiting ${E(q.nextApprover || 'approver')}</b><div class="qr-sub">Submitted by ${E(q.createdBy || '')} · ${whenText(q.requestedAt)}</div></div></div>`
    );
  if (q.status === 'Rejected')
    rows.push(
      `<div class="qr-appr"><span class="qr-bad ms">cancel</span><div><b>Rejected by ${E(q.rejectedBy || '')}</b><div class="qr-sub">${whenText(q.rejectedAt)}${q.rejectedNotes ? ' — ' + E(q.rejectedNotes) : ''}</div></div></div>`
    );
  const route = quoteRoute(q),
    count = done ? '1 / 1' : pending || q.status === 'Rejected' ? '0 / 1' : '—',
    notes = locked
      ? q.notes
        ? `<div class="qr-blk"><small>NOTES FOR APPROVAL</small><div>${E(q.notes)}</div></div>`
        : ''
      : `<label class="qr-field"><span>Notes for approval <i class="qt-req">*</i></span><textarea id="qr-notes" class="inp" rows="3" placeholder="Explain the discount or pricing so the approver can decide." oninput="S.qd.notes=this.value">${E(q.notes || '')}</textarea></label><div class="qr-sub">${route.approver ? 'Will go to: <b>' + E(route.approver) + '</b>' : ''}${floor.length ? ' · Below minimum price → CEO' : ''}</div>`;
  return qrCard(
    'Approvals',
    (rows.join('') || (locked ? '' : '')) + notes + (!rows.length && locked ? '<div class="qr-sub">No approval needed.</div>' : ''),
    `<span class="qr-pill ${done ? 'ok' : ''}">${count}</span>`
  );
}
function qrPdfs(q) {
  const list = q.pdfs || [];
  return qrCard(
    'Quote PDFs',
    list.length
      ? list
          .slice()
          .reverse()
          .map(
            (p) =>
              `<div class="qr-pdf"><span class="qr-pdfi">PDF</span><div><b>${E(p.name)}</b><div class="qr-sub">Created ${ago(p.at)} · ${p.kb} KB</div></div></div><div class="qr-links"><a class="qr-link" onclick="printQuote()">View</a>${quoteIsSendable(q) ? '<a class="qr-link" onclick="openSendQuote()">Email PDF</a>' : ''}</div>`
          )
          .join('')
      : '<div class="qr-sub">No PDF yet. Use “Create PDF”.</div>',
    `<span class="qr-pill">${list.length}</span>`
  );
}
function qrActivity(q, o) {
  const ev = [];
  (q.history || []).forEach((h) => ev.push({ t: h.t, a: `${E(h.action)} · ${E(h.by)}`, n: h.note }));
  (q.sends || []).forEach((s) =>
    ev.push({ t: s.at, a: `Sent by ${s.channel === 'email' ? 'email' : 'WhatsApp'}`, n: s.to })
  );
  if (q.signedBy) ev.push({ t: q.signedAt, a: `Signed by ${E(q.signedBy)}` });
  if (q.syncedAt) ev.push({ t: q.syncedAt, a: 'Synced to the opportunity' });
  ev.push({ t: q.createdAt || 0, a: `Created by ${E(q.createdBy || ownerLabel(o.owner))}` });
  ev.sort((a, b) => (b.t || 0) - (a.t || 0));
  return qrCard(
    'Activity history',
    ev
      .slice(0, 8)
      .map(
        (e) =>
          `<div class="qr-act"><i></i><div><b>${e.a}</b>${e.n ? `<div class="qr-sub">${E(e.n)}</div>` : ''}${e.t ? `<div class="qr-sub">${whenText(e.t)}</div>` : ''}</div></div>`
      )
      .join('')
  );
}

// ---------- header ----------
function qrHeader(q, o, inv, locked) {
  const syncOk = !String(q.status).startsWith('Pending') && q.status !== 'Rejected',
    ok = quoteApproved(q),
    review = canReview(q),
    menu = `<details class="qr-menu"><summary class="qr-btn" aria-label="More actions"><span class="ms">expand_more</span></summary><div class="qr-pop">` +
      `<button ${ok ? '' : 'disabled'} onclick="openSignForm()"><span class="ms">draw</span>Sign</button>` +
      `<button ${ok ? '' : 'disabled'} onclick="openPoForm()"><span class="ms">receipt_long</span>Customer PO</button>` +
      `<button ${quoteIsSendable(q) ? '' : 'disabled'} onclick="openSendQuote()"><span class="ms">send</span>Send to customer</button>` +
      ((q.status === 'Expired' || quoteExpired(q)) && S.role !== 'rep'
        ? `<button onclick="extendQuote()"><span class="ms">event_repeat</span>Extend expiry</button>`
        : '') +
      (!locked ? `<button onclick="saveQuoteDraft()"><span class="ms">save</span>Save as draft</button>` : '') +
      (inv && canSeeInvoices() ? `<button onclick="openInvoice('${inv.id}')"><span class="ms">receipt</span>Open ${E(inv.invoiceNo)}</button>` : '') +
      `<label class="qr-check" title="${canGiveDiscount() ? '' : 'Only Admin and CEO can change this'}"><input type="checkbox" ${q.showDiscount ? 'checked' : ''} ${canGiveDiscount() ? '' : 'disabled'} onchange="setShowDiscount(this.checked)"> Show discount on bill</label>` +
      `<button onclick="nav('opp-detail')"><span class="ms">arrow_back</span>Back to opportunity</button></div></details>`;
  return `<header class="qr-head"><div class="qr-title"><span class="qr-icon"><span class="ms">description</span></span><div><small>QUOTE</small><h1>${E(q.no)}</h1></div></div><div class="qr-acts">${q.syncedAt ? '<span class="qr-synced"><span class="ms">sync</span>Synced Quote</span>' : ''}${locked ? '' : `<button class="qr-btn" onclick="qrToggleInfo()">Edit</button>`}<button class="qr-btn" onclick="createQuotePdf()">Create PDF</button><button class="qr-btn ${q.syncedAt ? '' : 'pri'}" ${syncOk ? '' : 'disabled'} title="${syncOk ? "Copy this quote's products and total to the opportunity" : 'Not available while the quote is pending or rejected'}" onclick="syncQuote()"><span class="ms">sync</span>${q.syncedAt ? 'Re-sync' : 'Start Sync'}</button>${review ? `<button class="qr-btn bad" onclick="rejectQuote('${E(q.no)}')">Reject</button><button class="qr-btn pri" onclick="approveQuote('${E(q.no)}')">Approve</button>` : ''}${locked ? '' : `<button class="qr-btn pri" onclick="submitQuote()">Submit for Approval</button>`}${menu}</div></header>`;
}

// ---------- page ----------
V.quote = () => {
  const q = S.qd,
    o = cur();
  if (!q || !o) return V.opps();
  const inv = q.invoiceId && S.invoices.find((i) => i.id === q.invoiceId),
    locked = !['Draft', 'Rejected'].includes(q.status),
    d = quoteDefaults(q, o);
  if (!locked) {
    if (q.address === undefined) q.address = d.address;
    if (q.shipping === undefined) q.shipping = d.shipping;
    if (q.toEmail === undefined) q.toEmail = d.toEmail;
    if (q.toPhone === undefined) q.toPhone = d.toPhone;
  }
  const floor = belowProductFloor(q),
    chips = [
      `<span class="qr-pill ok">${E(quoteStatusInfo(q).text)}</span>`,
      q.label && q.label !== 'Draft' && !locked ? `<span class="qr-pill blue">${E(q.label)}</span>` : '',
      q.status === 'Expired' || quoteExpired(q) ? '<span class="qr-pill bad">Expired</span>' : '',
      q.signedBy ? `<span class="qr-pill ok">Signed by ${E(q.signedBy)}</span>` : '',
      q.po ? `<span class="qr-pill ok">PO ${E(q.po.no)}</span>` : '',
      typeof sendQuoteChips === 'function' ? sendQuoteChips(q).replace(/class="chip/g, 'class="qr-pill') : '',
    ].join(' ');
  return `<div class="qr-page"><div class="qr-crumb"><a onclick="nav('opps')">Opportunities</a> › <a onclick="nav('opp-detail')">${E(o.name)}</a> › <span>Quotes</span> › <b>${E(q.no)}</b></div>` +
    qrHeader(q, o, inv, locked) +
    `<div class="qr-strip"><div><small>Quote Number</small><b>${E(q.no)}</b></div><div><small>Account Name</small><b>${acctSpan(o.account)}</b><span>${E(q.name || d.name)}</span></div><div><small>Opportunity</small><a class="qr-link" onclick="nav('opp-detail')">${E(o.name)}</a></div><div class="qr-chips">${chips}</div></div>` +
    qrPath(q) +
    approvalBanner(q, inv).replace('class="qt-banner', 'class="qr-banner qt-banner') +
    (floor.length && !locked
      ? `<div class="qr-banner qt-banner wr"><span class="ms">warning</span><div><b>Below minimum price</b><div>${floor.map((i) => E(i.n)).join(', ')} — this quote goes to the CEO for approval.</div></div></div>`
      : '') +
    `<div class="qr-cols"><aside>${qrInfo(q, o, d, locked)}${qrClient(q, o, d)}</aside><main>${qrLines(q, locked)}<div class="qr-two">${qrCard('Primary Address', qrRow('Billing', E(d.address || '—')) + qrRow('Shipping', E(d.shipping || '—')) + qrRow('Entity Name', E(o.account)) + qrRow('Prepared For', E(d.preparedFor || '—')) + qrRow('Payment Terms', E(q.terms || 'Net 30')) + qrRow('Account Executive', E(ownerLabel(o.owner))), '<span class="qr-mut">Account</span>')}${qrFinancial(q, o)}</div>${tncSection(q, locked)}</main><aside>${qrApprovals(q, floor, locked)}${qrPdfs(q)}${qrActivity(q, o)}</aside></div></div>`;
};

// "Create PDF": opens the print sheet and keeps a record of each PDF in the Quote PDFs card.
function createQuotePdf() {
  const q = S.qd;
  if (!q) return;
  q.pdfs = q.pdfs || [];
  q.pdfs.push({
    name: `${q.no}-V${q.pdfs.length + 1}.pdf`,
    at: Date.now(),
    kb: 38 + q.items.length * 6,
  });
  patchQuote(q.no, { pdfs: q.pdfs });
  printQuote();
}

// Submitting without notes keeps you on the page and points at the notes box.
const submitQuoteBeforeRecord = submitQuote;
submitQuote = function () {
  const q = S.qd;
  if (q && q.items && q.items.length && !(q.notes || '').trim()) {
    toast('Add notes for approval before submitting');
    const t = document.getElementById('qr-notes');
    if (t) {
      t.scrollIntoView({ block: 'center' });
      t.focus();
    }
    return;
  }
  return submitQuoteBeforeRecord.apply(this, arguments);
};

// ---------------------------------------------------------------------------
// New Quote pop-up
// ---------------------------------------------------------------------------
function qfSection(id, title, inner) {
  return `<section class="qf-sec" id="qf-${id}"><button type="button" class="qf-head" onclick="this.parentNode.classList.toggle('shut')"><span class="ms">expand_more</span>${title}</button><div class="qf-grid">${inner}</div></section>`;
}
const qfField = (label, control, req, wide) =>
  `<label class="qf-field ${wide ? 'wide' : ''}"><span>${label}${req ? ' <i class="qt-req">*</i>' : ''}</span>${control}</label>`;
const qfRead = (label, value) =>
  `<div class="qf-field"><span>${label}</span><div class="qf-read">${value}</div></div>`;

function openNewQuoteForm(o) {
  const dq = S.quotes.find((x) => x.opp == o.id && x.isDefault && x.status === 'Draft'),
    no = dq ? dq.no : 'Q-' + (1001 + S.quotes.length),
    d = quoteDefaults({ no }, o),
    list = o.items.reduce((a, i) => a + i.p * i.q, 0),
    net = o.items.reduce((a, i) => a + i.p * i.q * (1 - i.d / 100), 0),
    pct = list ? ((list - net) / list) * 100 : 0,
    contacts = contactsOfAccount(o.account),
    contactName = String(d.preparedFor).replace(/\s*\(.*\)\s*$/, '');
  $('#modal').innerHTML =
    `<div class="qf-back"><button type="button" class="qf-close" aria-label="Close" onclick="$('#modal').innerHTML=''">&times;</button><form class="qf-modal" role="dialog" aria-modal="true" aria-label="New quote" onsubmit="createQuoteFromForm(event,${o.id},false)"><h2>New Quote</h2><div class="qf-scroll">` +
    qfSection(
      'info',
      'Quote Information',
      qfField('Quote Name', `<input class="inp" name="name" required value="${E(d.name)}">`, true) +
        qfField('Expiration Date', `<input type="date" class="inp" name="exp" required value="${D(quoteDefaultsSetting().validityDays)}">`, true) +
        qfField('Status', `<select class="inp" name="label">${QUOTE_STATUS_CHOICES.map((s) => `<option>${E(s)}</option>`).join('')}</select>`) +
        qfRead('Opportunity', E(o.name)) +
        qfRead('Sales Rep / Owner', E(ownerLabel(o.owner)))
    ) +
    qfSection(
      'prep',
      'Prepared For',
      (contacts.length
        ? qfField('Customer Contact', `<select class="inp" onchange="fillQuoteFormContact(this)"><option value="">Choose a contact…</option>${contactOptions(o.account, contactName)}</select>`, false, true)
        : '') +
        qfField('Prepared For', `<input class="inp" name="preparedFor" value="${E(d.preparedFor)}">`) +
        qfField('Email', `<input class="inp" type="email" name="toEmail" value="${E(d.toEmail)}" placeholder="customer@company.com">`) +
        qfField('Phone (WhatsApp)', `<input class="inp" type="tel" name="toPhone" value="${E(d.toPhone)}" placeholder="+91 98765 43210">`)
    ) +
    qfSection(
      'tot',
      'Totals',
      qfRead('Subtotal', M(list)) +
        qfRead('Discount', pct.toFixed(2) + '%') +
        qfRead('Total Price', M(net)) +
        qfRead('Line Items', `${o.items.length} copied from the opportunity`)
    ) +
    qfSection(
      'addr',
      'Address Information',
      qfField('Bill To', `<textarea class="inp" name="address" rows="3">${E(d.address)}</textarea>`) +
        qfField('Ship To', `<textarea class="inp" name="shipping" rows="3">${E(d.shipping)}</textarea>`)
    ) +
    `</div><footer><button type="button" class="qf-btn" onclick="$('#modal').innerHTML=''">Cancel</button><button type="button" class="qf-btn" onclick="createQuoteFromForm(event,${o.id},true)">Save &amp; New</button><button class="qf-btn pri">Save</button></footer></form></div>`;
  const first = $('#modal input');
  if (first) first.focus();
}

// Save opens the quote page; Save & New keeps the quote and opens a blank pop-up for the next one.
createQuoteFromForm = function (e, id, again) {
  if (e && e.preventDefault) e.preventDefault();
  const o = S.opps.find((x) => x.id == id),
    form = (e && e.target && (e.target.form || e.target)) || document.querySelector('#modal form'),
    v = Object.fromEntries(new FormData(form.tagName === 'FORM' ? form : document.querySelector('#modal form')));
  if (!o || !(v.name || '').trim() || !v.exp) return toast('Quote name and expiry date are required');
  const dq = S.quotes.find((x) => x.opp == o.id && x.isDefault && x.status === 'Draft'),
    no = dq ? dq.no : 'Q-' + (1001 + S.quotes.length);
  S.qd = {
    opp: o.id,
    no,
    name: v.name.trim(),
    primary: true,
    exp: v.exp,
    status: 'Draft',
    label: v.label,
    terms: v.terms || quoteDefaultsSetting().terms || 'Net 30',
    preparedFor: (v.preparedFor || '').trim(),
    toEmail: (v.toEmail || '').trim(),
    toPhone: (v.toPhone || '').trim(),
    address: (v.address || '').trim(),
    shipping: (v.shipping || '').trim(),
    showDiscount: false,
    items: clone(o.items),
    createdAt: Date.now(),
    createdBy: roleNow().name,
  };
  storeQuote(S.qd);
  S.quotes.forEach((x) => x.opp == o.id && x.no !== no && (x.primary = false));
  S.cur = o.id;
  S.qstep = 1;
  S.qEdit = true;
  S.qInfoEdit = false;
  save();
  if (again) {
    toast(`Quote ${no} saved`);
    return openNewQuoteForm(o);
  }
  $('#modal').innerHTML = '';
  nav('quote');
};
