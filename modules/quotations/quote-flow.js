// Quote creation pop-up, top action buttons (Sync / Sign / PO / Print), bill output, standard Terms & Conditions
// (Admin / CEO own them; rep changes need approval), "show discount on bill", and the Closed Won rule.

// ---------------------------------------------------------------------------
// Standard terms & conditions
// ---------------------------------------------------------------------------
const DEFAULT_TNC =
  '1. Prices are in INR and valid until the quote expiry date.\n2. Goods remain the property of the seller until payment is received in full.\n3. Delivery dates are estimates and may change with stock and shipping conditions.\n4. Any change to these terms must be agreed in writing.';
S.settings = S.settings || {};
if (!S.settings.tnc)
  S.settings.tnc = { text: DEFAULT_TNC, version: 1, by: 'System', at: Date.now() };
S.tncRequests = S.tncRequests || [];

const isAdminOrCeo = () => ['admin', 'ceo'].includes(S.role);
const standardTnc = () => S.settings.tnc.text;
const effectiveTnc = (q) => (q && q.tnc ? q.tnc : standardTnc());
const pendingTnc = (q) => S.tncRequests.find((r) => r.quoteNo === q.no && r.status === 'Pending');
const lastTncDecision = (q) =>
  S.tncRequests
    .filter((r) => r.quoteNo === q.no && r.status !== 'Pending')
    .sort((a, b) => (b.decidedAt || 0) - (a.decidedAt || 0))[0];

// Terms & conditions block on the quote (step 3): Admin / CEO edit directly, reps send a change for approval.
function tncSection(q, locked) {
  const eff = effectiveTnc(q),
    pend = pendingTnc(q),
    last = lastTncDecision(q),
    head = `<div class="qt-section-head"><span class="ms">gavel</span><b>Terms &amp; conditions</b><span class="mut text-xs">${q.tnc ? 'Custom for this quote' : 'Standard terms'}</span></div>`;
  let body;
  if (isAdminOrCeo() && !locked) {
    body = `<textarea class="inp" rows="6" aria-label="Terms and conditions" oninput="S.qd.tnc=this.value">${E(eff)}</textarea><p class="mut text-xs mt-1">These terms print on every bill. Admin / CEO changes apply straight away. The standard terms for all quotes are in Settings → Terms &amp; conditions.</p>`;
  } else {
    body =
      `<p style="white-space:pre-wrap">${E(eff)}</p>` +
      (pend
        ? `<div class="qt-banner wr mt-2"><span class="ms">hourglass_top</span><div><b>Change waiting for Admin / CEO approval</b><div class="mut">Requested by ${E(pend.by)} · ${whenText(pend.at)}</div><div style="white-space:pre-wrap">${E(pend.text)}</div></div></div>`
        : '') +
      (last && !pend
        ? `<div class="qt-banner ${last.status === 'Approved' ? 'ok' : 'err'} mt-2"><span class="ms">${last.status === 'Approved' ? 'verified' : 'cancel'}</span><div><b>Last change request ${last.status.toLowerCase()}</b>${last.decisionNote ? `<div>${E(last.decisionNote)}</div>` : ''}</div></div>`
        : '') +
      (!locked && !pend
        ? `<div class="mt-2"><button type="button" class="btn" onclick="openTncRequest()"><span class="ms">edit_note</span>Request change</button><span class="mut text-xs ml-2">Needs Admin / CEO approval</span></div>`
        : '');
  }
  return `<section class="qt-section">${head}<div class="qt-body">${body}</div></section>`;
}

function openTncRequest() {
  const q = S.qd;
  if (!q || pendingTnc(q)) return;
  $('#modal').innerHTML =
    `<div class="fixed inset-0 z-40 grid place-items-center p-4" style="background:rgba(0,0,0,.5)"><form class="card p-5 w-full max-w-lg max-h-full overflow-auto space-y-3" onsubmit="saveTncRequest(event)"><h2 class="text-lg font-bold">Request change to terms &amp; conditions</h2><p class="mut text-xs">Admin or CEO must approve before the new terms apply to quote ${E(q.no)}.</p>` +
    `<label class="block">Proposed terms *<textarea class="inp" name="text" rows="7" required>${E(effectiveTnc(q))}</textarea></label>` +
    `<label class="block">Why is this change needed? *<textarea class="inp" name="note" rows="2" required></textarea></label>` +
    `<div class="flex justify-end gap-2"><button type="button" class="btn" onclick="$('#modal').innerHTML=''">Cancel</button><button class="btn btn-p">Send for approval</button></div></form></div>`;
  $('#modal textarea').focus();
}
function saveTncRequest(e) {
  e.preventDefault();
  const q = S.qd,
    v = Object.fromEntries(new FormData(e.target)),
    text = (v.text || '').trim();
  if (!q || pendingTnc(q)) return;
  if (!text || !(v.note || '').trim()) return toast('Add the new terms and the reason');
  if (text === effectiveTnc(q).trim()) return toast('The terms are unchanged');
  if (isAdminOrCeo()) return toast('Admin and CEO can edit the terms directly');
  const r = {
    id: 'tr' + Date.now(),
    quoteNo: q.no,
    text,
    note: v.note.trim(),
    by: roleNow().name,
    byId: S.authUser,
    at: Date.now(),
    status: 'Pending',
  };
  S.tncRequests.push(r);
  queuePopup({ kind: 'tnc-request', no: q.no, reqId: r.id, toRole: 'admin', by: S.authUser });
  queuePopup({ kind: 'tnc-request', no: q.no, reqId: r.id, toRole: 'ceo', by: S.authUser });
  $('#modal').innerHTML = '';
  save();
  toast('Terms change sent to Admin / CEO for approval');
  render();
}
function decideTnc(id, approve) {
  if (!isAdminOrCeo()) return toast('Only Admin or CEO can decide this');
  const r = S.tncRequests.find((x) => x.id === id);
  if (!r || r.status !== 'Pending') return toast('This request was already decided');
  const note = approve ? '' : (prompt('Reason for rejecting this change (required)') || '').trim();
  if (!approve && !note) return toast('A reason is required to reject');
  r.status = approve ? 'Approved' : 'Rejected';
  r.decidedBy = roleNow().name;
  r.decidedAt = Date.now();
  r.decisionNote = note;
  if (approve) {
    const q = S.quotes.find((x) => x.no === r.quoteNo);
    if (q) q.tnc = r.text;
    if (S.qd && S.qd.no === r.quoteNo) S.qd.tnc = r.text;
    const inv = q && q.invoiceId && S.invoices.find((i) => i.id === q.invoiceId);
    if (inv && inv.status !== 'Paid') inv.tnc = r.text;
  }
  queuePopup({
    kind: approve ? 'tnc-approved' : 'tnc-rejected',
    no: r.quoteNo,
    reqId: r.id,
    toUser: r.byId,
    by: S.authUser,
  });
  save();
  toast(`Terms change ${approve ? 'approved' : 'rejected'}`);
  render();
}
function showTncPopup(p) {
  const r = S.tncRequests.find((x) => x.id === p.reqId);
  if (!r) return;
  if (p.kind === 'tnc-request') {
    if (r.status !== 'Pending') return;
    return showPopup({
      tone: 'wr',
      icon: 'gavel',
      title: `Terms change needs approval: ${E(r.quoteNo)}`,
      lines: [
        `<b>${E(r.by)}</b> asked to change the terms and conditions.`,
        `Reason: ${E(r.note)}`,
      ],
      actions: [{ label: 'Review now', js: `nav('approvals')` }],
    });
  }
  const ok = p.kind === 'tnc-approved';
  showPopup({
    tone: ok ? 'ok' : 'err',
    icon: ok ? 'verified' : 'cancel',
    title: `Terms change ${ok ? 'approved' : 'rejected'}: ${E(r.quoteNo)}`,
    lines: [
      `${ok ? 'Approved' : 'Rejected'} by <b>${E(r.decidedBy || '')}</b>.`,
      r.decisionNote ? `Reason: ${E(r.decisionNote)}` : '',
    ],
    actions: [{ label: 'Open quote', js: `openQuoteRecord('${E(r.quoteNo)}')` }],
  });
}

// Approvals page: terms & conditions requests for Admin / CEO.
const approvalsViewBeforeTnc = V.approvals;
V.approvals = function () {
  const html = approvalsViewBeforeTnc.apply(this, arguments);
  if (S.role === 'rep') return html;
  const pend = S.tncRequests.filter((r) => r.status === 'Pending'),
    done = S.tncRequests
      .filter((r) => r.status !== 'Pending')
      .sort((a, b) => b.decidedAt - a.decidedAt)
      .slice(0, 5),
    row = (r, actions) =>
      `<tr><td><b>${E(r.quoteNo)}</b></td><td>${E(r.by)}</td><td>${E(r.note)}</td><td style="white-space:pre-wrap;max-width:360px">${E(r.text)}</td><td>${actions}</td></tr>`;
  return (
    html +
    `<h2 class="text-lg font-bold mt-6 mb-2">Terms &amp; conditions requests</h2>` +
    (pend.length
      ? table(
          ['Quote', 'Requested by', 'Reason', 'Proposed terms', 'Action'],
          pend
            .map((r) =>
              row(
                r,
                `<button class="btn btn-p" onclick="decideTnc('${r.id}',true)">Approve</button> <button class="btn" style="color:var(--err)" onclick="decideTnc('${r.id}',false)">Reject</button>`
              )
            )
            .join('')
        )
      : '<p class="mut">No terms changes waiting.</p>') +
    (done.length
      ? `<p class="mut text-xs mt-3">Recent decisions: ${done.map((r) => `${E(r.quoteNo)} ${r.status.toLowerCase()} by ${E(r.decidedBy)}`).join(' · ')}</p>`
      : '')
  );
};

// Settings → Terms & conditions (Admin / CEO).
SETTINGS_PANELS.terms = function () {
  const t = S.settings.tnc;
  return `${secHead('gavel', 'Terms & conditions', 'These terms print on every quote and bill. Reps cannot change them; a rep can ask for a change on a quote, which Admin or CEO must approve.')}<form onsubmit="saveStandardTnc(event)" class="space-y-3"><textarea class="inp" name="text" rows="10" aria-label="Standard terms and conditions" required>${E(t.text)}</textarea><div class="flex items-center gap-3 flex-wrap"><button class="btn btn-p">Save terms</button><span class="mut text-xs">Version ${t.version} · last changed by ${E(t.by)} on ${whenText(t.at)}. New bills use the latest terms; bills already generated keep theirs.</span></div></form>`;
};
function saveStandardTnc(e) {
  e.preventDefault();
  if (!isAdminOrCeo()) return toast('Only Admin or CEO can change the terms');
  const text = (new FormData(e.target).get('text') || '').trim();
  if (!text) return toast('Terms cannot be empty');
  S.settings.tnc = {
    text,
    version: S.settings.tnc.version + 1,
    by: roleNow().name,
    at: Date.now(),
  };
  save();
  toast('Terms & conditions saved');
  render();
}

// ---------------------------------------------------------------------------
// Bill output (quote print view and invoice share this): grand total only, discount shown only if switched on
// ---------------------------------------------------------------------------
function billLinesTable(items, showDiscount) {
  const head = [
    'Product',
    'Code',
    'Qty',
    'Unit price',
    ...(showDiscount ? ['Discount'] : []),
    'Total',
  ];
  return table(
    head,
    items
      .map((x) => {
        const net = x.p * (1 - x.d / 100);
        return `<tr><td>${E(x.n)}</td><td>${E(x.c)}</td><td>${x.q}</td><td>${M(showDiscount ? x.p : net)}</td>${showDiscount ? `<td>${x.d}%</td>` : ''}<td>${M(net * x.q)}</td></tr>`;
      })
      .join('')
  );
}
function printQuote() {
  const q = S.qd,
    o = cur();
  if (!q || !o) return;
  $('#modal').innerHTML =
    `<div class="fixed inset-0 z-40 grid place-items-center p-4" style="background:rgba(0,0,0,.5)"><div class="card p-6 w-full max-w-3xl max-h-full overflow-auto"><div class="flex justify-between gap-3"><div><h2 class="text-xl font-bold">Quote ${E(q.no)}</h2><div class="mut">${E(q.name || '')}</div><div class="mut">Prepared for ${E(q.preparedFor || o.account)} · Valid until ${fd(q.exp)}</div></div><b>${E(o.account)}</b></div>` +
    `<div class="grid sm:grid-cols-2 gap-3 mt-3 text-sm"><div><div class="mut text-xs">Billing address</div><div style="white-space:pre-wrap">${E(q.address || '–')}</div></div><div><div class="mut text-xs">Shipping address</div><div style="white-space:pre-wrap">${E(q.shipping || '–')}</div></div></div>` +
    `<div class="my-4">${billLinesTable(q.items, !!q.showDiscount)}</div><div class="text-right text-lg font-bold">Grand total ${M(quoteTotal(q))}</div>` +
    `<div class="mt-4"><b>Terms &amp; conditions</b><div style="white-space:pre-wrap" class="text-sm">${E(effectiveTnc(q))}</div></div>` +
    (q.po
      ? `<p class="mt-3 text-sm"><b>Customer PO:</b> ${E(q.po.no)}${q.po.date ? ' · ' + fd(q.po.date) : ''}</p>`
      : '') +
    (q.signedBy
      ? `<p class="mt-1 text-sm"><b>Signed by:</b> ${E(q.signedBy)} · ${whenText(q.signedAt)}</p>`
      : '') +
    `<div class="flex justify-end gap-2 mt-4"><button class="btn" onclick="$('#modal').innerHTML=''">Close</button><button class="btn btn-p" onclick="window.print()">Print / Save PDF</button></div></div></div>`;
}

// Update a quote (stored copy, the open copy and its invoice) in one go.
function patchQuote(no, patch) {
  const q = S.quotes.find((x) => x.no === no);
  if (q) Object.assign(q, patch);
  if (S.qd && S.qd.no === no) Object.assign(S.qd, patch);
  const inv = q && q.invoiceId && S.invoices.find((i) => i.id === q.invoiceId);
  if (inv && 'showDiscount' in patch && inv.status !== 'Paid')
    inv.showDiscount = patch.showDiscount;
  save();
}
function setShowDiscount(on) {
  if (!canGiveDiscount()) return toast('Only Admin and CEO can change this');
  patchQuote(S.qd.no, { showDiscount: !!on });
  toast(on ? 'Discount will be shown on the bill' : 'Discount hidden on the bill');
  render();
}

// ---------------------------------------------------------------------------
// Top buttons: Sync quote, Sign, PO, Print
// ---------------------------------------------------------------------------
const quoteApproved = (q) => ['Approved', 'Sent to client', 'Paid'].includes(q.status);
function quoteToolbar(q) {
  const ok = quoteApproved(q),
    why = ok ? '' : 'Available once the quote is approved',
    syncOk = !String(q.status).startsWith('Pending') && q.status !== 'Rejected';
  return `<div class="qt-toolbar"><button class="btn" ${syncOk ? '' : 'disabled'} title="${syncOk ? "Copy this quote's products and total to the opportunity" : 'Not available while the quote is pending or rejected'}" onclick="syncQuote()"><span class="ms">sync</span>Sync Quote</button><button class="btn" ${ok ? '' : 'disabled'} title="${why}" onclick="openSignForm()"><span class="ms">draw</span>Sign</button><button class="btn" ${ok ? '' : 'disabled'} title="${why}" onclick="openPoForm()"><span class="ms">receipt_long</span>PO</button><button class="btn" onclick="printQuote()"><span class="ms">print</span>Print / PDF</button>${q.syncedAt ? `<span class="chip ok">Synced ${ago(q.syncedAt)}</span>` : ''}${q.signedBy ? `<span class="chip ok">Signed by ${E(q.signedBy)}</span>` : ''}${q.po ? `<span class="chip ok">PO ${E(q.po.no)}</span>` : ''}<span class="flex-1"></span><label class="qt-check" title="${canGiveDiscount() ? '' : 'Only Admin and CEO can change this'}"><input type="checkbox" ${q.showDiscount ? 'checked' : ''} ${canGiveDiscount() ? '' : 'disabled'} onchange="setShowDiscount(this.checked)"> Show discount on bill</label></div>`;
}
const quoteViewBeforeFlow = V.quote;
V.quote = function () {
  const html = quoteViewBeforeFlow.apply(this, arguments);
  return S.qd
    ? html.replace('<nav class="qt-steps">', quoteToolbar(S.qd) + '<nav class="qt-steps">')
    : html;
};

function syncQuote() {
  const q = S.qd,
    o = cur();
  if (!q || !o) return;
  if (String(q.status).startsWith('Pending') || q.status === 'Rejected')
    return toast('Not available while the quote is pending or rejected');
  S.quotes.forEach((x) => {
    if (x.opp == q.opp) x.primary = x.no === q.no;
  });
  q.primary = true;
  storeQuote(q);
  o.items = clone(q.items);
  o.amount = Math.round(quoteTotal(q));
  patchQuote(q.no, { syncedAt: Date.now(), primary: true });
  logOpp(
    o.id,
    'sync',
    `Quote ${q.no} synced to the opportunity by ${roleNow().name} (${M(o.amount)})`
  );
  toast('Quote synced to the opportunity');
  render();
}
function simpleQuoteForm(title, fields, submitJs, submitLabel) {
  $('#modal').innerHTML =
    `<div class="fixed inset-0 z-40 grid place-items-center p-4" style="background:rgba(0,0,0,.5)"><form class="card p-5 w-full max-w-md space-y-3" onsubmit="${submitJs}(event)"><h2 class="text-lg font-bold">${title}</h2>${fields}<div class="flex justify-end gap-2"><button type="button" class="btn" onclick="$('#modal').innerHTML=''">Cancel</button><button class="btn btn-p">${submitLabel}</button></div></form></div>`;
  $('#modal input').focus();
}
function openSignForm() {
  const q = S.qd;
  if (!q || !quoteApproved(q)) return toast('Available once the quote is approved');
  simpleQuoteForm(
    `Sign quotation ${E(q.no)}`,
    `<label class="block">Signed by *<input class="inp" name="by" required value="${E(q.signedBy || String(q.preparedFor || '').replace(/\s*\(.*\)\s*$/, ''))}"></label><label class="block">Date<input class="inp" type="date" name="date" value="${D(0)}"></label>`,
    'saveSign',
    'Save signature'
  );
}
function saveSign(e) {
  e.preventDefault();
  const q = S.qd,
    v = Object.fromEntries(new FormData(e.target));
  if (!q || !quoteApproved(q) || !(v.by || '').trim()) return;
  patchQuote(q.no, {
    signedBy: v.by.trim(),
    signedAt: v.date ? new Date(v.date + 'T12:00').getTime() : Date.now(),
  });
  logOpp(q.opp, 'sync', `Quote ${q.no} signed by ${v.by.trim()}`);
  $('#modal').innerHTML = '';
  toast('Signature recorded');
  render();
}
function openPoForm() {
  const q = S.qd;
  if (!q || !quoteApproved(q)) return toast('Available once the quote is approved');
  simpleQuoteForm(
    `Customer PO for ${E(q.no)}`,
    `<label class="block">PO number *<input class="inp" name="no" required value="${E((q.po || {}).no || '')}"></label><label class="block">PO date<input class="inp" type="date" name="date" value="${E((q.po || {}).date || D(0))}"></label>`,
    'savePo',
    'Save PO'
  );
}
function savePo(e) {
  e.preventDefault();
  const q = S.qd,
    v = Object.fromEntries(new FormData(e.target));
  if (!q || !quoteApproved(q) || !(v.no || '').trim()) return;
  patchQuote(q.no, { po: { no: v.no.trim(), date: v.date || '' } });
  const o = S.opps.find((x) => x.id == q.opp);
  if (o) (o.f = o.f || {}).po = v.no.trim(); // shows in "PO / Reference number" on the opportunity
  logOpp(q.opp, 'sync', `Customer PO ${v.no.trim()} recorded on quote ${q.no}`);
  $('#modal').innerHTML = '';
  toast('PO recorded');
  render();
}

// ---------------------------------------------------------------------------
// New quote pop-up with details already filled in (products come from the opportunity)
// ---------------------------------------------------------------------------
const openQuoteBeforeFlow = openQuote;
openQuote = function (id) {
  const o = S.opps.find((x) => x.id == id);
  if (!o) return openQuoteBeforeFlow.apply(this, arguments);
  // continue a draft the user has already worked on; an untouched default quote goes through the pop-up
  const draft = S.quotes
    .filter((q) => q.opp == id && !q.isDefault && ['Draft', 'Rejected'].includes(q.status))
    .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))[0];
  if (draft) {
    S.cur = id;
    S.qstep = 1;
    S.qd = clone(draft);
    return nav('quote');
  }
  openNewQuoteForm(o);
};

// Every open opportunity gets a default quote with its products and price, so the Quotes card is never empty.
// It follows the opportunity's products until someone saves or edits it.
function ensureDefaultQuotes() {
  let changed = false;
  S.opps.forEach((o) => {
    if (o.lost || o.stage === 5 || !o.items || !o.items.length) return;
    const mine = S.quotes.filter((q) => q.opp == o.id);
    if (!mine.length) {
      const no = 'Q-' + (1001 + S.quotes.length),
        d = quoteDefaults({ no }, o);
      S.quotes.push({
        opp: o.id,
        no,
        name: d.name,
        primary: true,
        isDefault: true,
        exp: D(quoteDefaultsSetting().validityDays),
        status: 'Draft',
        label: 'Draft',
        preparedFor: d.preparedFor,
        toEmail: d.toEmail,
        toPhone: d.toPhone,
        address: d.address,
        shipping: d.shipping,
        showDiscount: false,
        items: clone(o.items),
        createdAt: Date.now(),
      });
      changed = true;
      return;
    }
    mine
      .filter((q) => q.isDefault && q.status === 'Draft')
      .forEach((q) => {
        if (JSON.stringify(q.items) !== JSON.stringify(o.items)) {
          q.items = clone(o.items);
          changed = true;
        }
      });
  });
  if (changed) save();
}
const storeQuoteBeforeDefault = storeQuote;
storeQuote = function (q) {
  delete q.isDefault; // once someone saves a quote it is no longer the auto-filled default
  return storeQuoteBeforeDefault.apply(this, arguments);
};
const renderBeforeDefaultQuote = render;
render = function () {
  ensureDefaultQuotes();
  return renderBeforeDefaultQuote.apply(this, arguments);
};
// Creating an opportunity (new, clone, converted lead) always ends in nav(), so make sure its default quote exists first.
const navBeforeDefaultQuote = nav;
nav = function () {
  ensureDefaultQuotes();
  return navBeforeDefaultQuote.apply(this, arguments);
};
ensureDefaultQuotes();
function openNewQuoteForm(o) {
  const dq = S.quotes.find((x) => x.opp == o.id && x.isDefault && x.status === 'Draft'),
    no = dq ? dq.no : 'Q-' + (1001 + S.quotes.length),
    d = quoteDefaults({ no }, o),
    field = (label, control, req) =>
      `<label class="qt-field"><span>${label}${req ? ' <i class="qt-req">*</i>' : ''}</span>${control}</label>`,
    lines = o.items.map((i) => `${E(i.n)} × ${i.q}`).join(', ');
  $('#modal').innerHTML =
    `<div class="fixed inset-0 z-40 grid place-items-center p-4" style="background:rgba(0,0,0,.5)"><form class="card qt-section w-full max-w-3xl max-h-full overflow-auto" role="dialog" aria-modal="true" aria-label="New quote" onsubmit="createQuoteFromForm(event,${o.id})">` +
    `<div class="qt-section-head"><span class="ms">badge</span><b>Quote Information</b></div><div class="qt-grid">` +
    field('Quote Name', `<input class="inp" name="name" required value="${E(d.name)}">`, true) +
    field(
      'Expiration Date',
      `<input type="date" class="inp" name="exp" required value="${D(quoteDefaultsSetting().validityDays)}">`
    ) +
    field(
      'Status',
      `<select class="inp" name="label">${QUOTE_STATUS_CHOICES.map((s) => `<option>${E(s)}</option>`).join('')}</select>`
    ) +
    (contactsOfAccount(o.account).length
      ? field(
          'Customer Contact',
          `<select class="inp" onchange="fillQuoteFormContact(this)"><option value="">Choose a contact…</option>${contactOptions(o.account, String(d.preparedFor).replace(/\s*\(.*\)\s*$/, ''))}</select>`
        )
      : '') +
    field('Prepared For', `<input class="inp" name="preparedFor" value="${E(d.preparedFor)}">`) +
    field(
      'Send To (Email)',
      `<input class="inp" type="email" name="toEmail" value="${E(d.toEmail)}" placeholder="customer@company.com">`
    ) +
    field(
      'WhatsApp Number',
      `<input class="inp" type="tel" name="toPhone" value="${E(d.toPhone)}" placeholder="+91 98765 43210">`
    ) +
    field('Sales Rep / Owner', `<input class="inp" value="${E(ownerLabel(o.owner))}" disabled>`) +
    field(
      'Billing Address',
      `<input class="inp" name="address" value="${E(d.address)}" placeholder="Street, city, state, PIN">`
    ) +
    field(
      'Shipping Address',
      `<input class="inp" name="shipping" value="${E(d.shipping)}" placeholder="Street, city, state, PIN">`
    ) +
    `</div><div class="qt-body"><div class="mut text-xs">Products from this opportunity (${o.items.length}) — added to the quote automatically</div><div>${lines || '—'}</div><div class="font-semibold mt-1">Total ${M(o.items.reduce((a, i) => a + i.p * i.q * (1 - i.d / 100), 0))}</div></div>` +
    `<div class="flex justify-end gap-2 p-3"><button type="button" class="btn" onclick="$('#modal').innerHTML=''">Cancel</button><button class="btn btn-p">Create quote</button></div></form></div>`;
  $('#modal input').focus();
}
function createQuoteFromForm(e, id) {
  e.preventDefault();
  const o = S.opps.find((x) => x.id == id),
    v = Object.fromEntries(new FormData(e.target));
  if (!o || !(v.name || '').trim() || !v.exp)
    return toast('Quote name and expiry date are required');
  // finishing the pop-up turns the opportunity's default quote into a real one (same number)
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
  if (S.qd.primary) S.quotes.forEach((x) => x.opp == o.id && x.no !== no && (x.primary = false));
  S.cur = o.id;
  S.qstep = 1;
  $('#modal').innerHTML = '';
  save();
  nav('quote');
}

// ---------------------------------------------------------------------------
// Closed Won: Admin / CEO only, with notes, once payment is received
// ---------------------------------------------------------------------------
const setStageBeforeClosedWon = setStage;
setStage = function (o, i) {
  const won = o.stage === 5 && !o.lost;
  if (i === 5) {
    if (won) return;
    if (!isAdminOrCeo())
      return toast('Only Admin or CEO can mark a deal Closed Won, once payment is received');
    return openClosedWon(o);
  }
  if (won && !isAdminOrCeo()) return toast('Only Admin or CEO can change a Closed Won deal');
  return setStageBeforeClosedWon.apply(this, arguments);
};
function openClosedWon(o) {
  const invs = S.invoices.filter((i) => i.opp == o.id),
    paid = invs.some((i) => i.status === 'Paid');
  $('#modal').innerHTML =
    `<div class="fixed inset-0 z-40 grid place-items-center p-4" style="background:rgba(0,0,0,.5)"><form class="card p-5 w-full max-w-lg max-h-full overflow-auto space-y-3" onsubmit="confirmClosedWon(event,${o.id})"><h2 class="text-lg font-bold">Mark Closed Won — ${E(o.name)}</h2>` +
    `<p class="mut text-sm">Close the deal only after the payment has been received.</p>` +
    (invs.length
      ? `<div class="p-3 rounded text-xs" style="background:var(--hov)">${invs.map((i) => `${E(i.invoiceNo)}: <b>${E(i.status)}</b> · ${M(i.total)}`).join('<br>')}</div>`
      : '') +
    `<label class="flex items-center gap-2"><input type="checkbox" name="paid" ${paid ? 'checked' : ''}> Payment has been received</label>` +
    `<label class="block">Closed Won notes *<textarea class="inp" name="notes" rows="4" required placeholder="Payment details, reference, anything the team should know"></textarea></label>` +
    `<div class="flex justify-end gap-2"><button type="button" class="btn" onclick="$('#modal').innerHTML=''">Cancel</button><button class="btn btn-p">Mark Closed Won</button></div></form></div>`;
  $('#modal textarea').focus();
}
function confirmClosedWon(e, id) {
  e.preventDefault();
  const o = S.opps.find((x) => x.id == id),
    v = Object.fromEntries(new FormData(e.target)),
    notes = (v.notes || '').trim();
  if (!o || !isAdminOrCeo()) return toast('Only Admin or CEO can mark a deal Closed Won');
  if (!v.paid) return toast('Confirm that the payment has been received');
  if (!notes) return toast('Add Closed Won notes');
  $('#modal').innerHTML = '';
  o.lost = false;
  setStageBeforeClosedWon(o, 5);
  o.closedWon = { notes, by: roleNow().name, at: Date.now() };
  (o.f = o.f || {}).won = notes;
  logOpp(o.id, 'sync', `Closed Won by ${roleNow().name} after payment received. Notes: ${notes}`);
  save();
  render();
}
function toggleClosedStage() {
  const o = cur();
  if (!o || !isAdminOrCeo()) return toast('Only Admin or CEO can change the closed stage');
  if (o.lost) return openClosedWon(o);
  o.lost = true;
  logOpp(o.id, 'sync', `Marked Closed Lost by ${roleNow().name}`);
  save();
  toast('Marked closed lost');
  render();
}
