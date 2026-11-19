// Sending quotes: customer email / phone on the quote, Send by email or WhatsApp, a customer link where the
// customer can view, accept and sign, view tracking, and automatic expiry.
//
// Prototype note: there is no server. Email and WhatsApp open the sender's own mail / WhatsApp with the message
// filled in, and the customer link (and its "opened" tracking) works in a browser that has this CRM's data.

// ---------- customer contact on the quote ----------
const contactsOfAccount = (acct) => S.contacts.filter((c) => c[2] === acct);
function pickQuoteContact(name) {
  const o = cur(),
    c = o && S.contacts.find((x) => x[0] === name);
  if (!c || !S.qd) return;
  S.qd.preparedFor = `${c[0]}${c[1] ? ' (' + c[1] + ')' : ''}`;
  S.qd.toEmail = c[3] || '';
  S.qd.toPhone = c[4] || '';
  render();
}
function fillQuoteFormContact(sel) {
  const c = S.contacts.find((x) => x[0] === sel.value),
    f = sel.form;
  if (!c) return;
  f.elements.preparedFor.value = `${c[0]}${c[1] ? ' (' + c[1] + ')' : ''}`;
  f.elements.toEmail.value = c[3] || '';
  f.elements.toPhone.value = c[4] || '';
}
const contactOptions = (acct, selectedName) =>
  contactsOfAccount(acct)
    .map(
      (c) =>
        `<option value="${E(c[0])}" ${c[0] === selectedName ? 'selected' : ''}>${E(c[0])}${c[1] ? ' – ' + E(c[1]) : ''}</option>`
    )
    .join('');

// ---------- links, messages ----------
// A quote's link code is created once and then never changes: a second code would make the link the
// client already has show "Link not valid". Reuse the stored quote's code, and save a new one at once.
function quoteToken(q) {
  const stored = S.quotes.find((x) => x.no === q.no);
  if (stored && stored.token) return (q.token = stored.token);
  if (q.token) {
    if (stored) {
      stored.token = q.token;
      save();
    }
    return q.token;
  }
  const t = 'cq' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
  q.token = t;
  if (stored) stored.token = t;
  if (S.qd && S.qd.no === q.no) S.qd.token = t;
  save();
  return t;
}
// true when the link code (and send details) really reached browser storage
function quoteLinkSaved(q) {
  const back = load() || {};
  return !!(back.quotes || []).find((x) => x.no === q.no && x.token && x.token === q.token);
}
const quoteLink = (q) => `${location.origin}${location.pathname}#cq/${quoteToken(q)}`;
const phoneDigits = (p) => {
  const d = String(p || '').replace(/\D/g, '');
  return d.length === 10 ? '91' + d : d; // 10-digit Indian numbers get +91
};
const quoteExpired = (q) => !q.customer && !['Paid'].includes(q.status) && q.exp && days(q.exp) < 0;
const quoteIsSendable = (q) => ['Approved', 'Sent to client', 'Paid'].includes(q.status);

// How the client signs: 'link' (accept and e-sign online) or 'pdf' (download, sign by hand, upload).
// Chosen in the Send dialog; the customer page then offers only that method.
const quoteSignMode = (q) => (q && q.signMode === 'pdf' ? 'pdf' : 'link');
function quoteMessage(q, o, mode = quoteSignMode(q)) {
  const co = (S.settings.company || {}).name || 'our team',
    first =
      String(q.preparedFor || '')
        .replace(/\s*\(.*\)\s*$/, '')
        .split(' ')[0] || 'there';
  return `Hello ${first},\n\nPlease find quotation ${q.no} for ${o.account}.\nTotal: ${M(quoteTotal(q))}\nValid until: ${fd(q.exp)}${mode === 'pdf' ? `\n\nPlease download the quotation PDF from this link, print it, sign and stamp it, and upload the signed copy on the same page (or reply with it):\n${quoteLink(q)}` : `\n\nView, accept and sign it online here:\n${quoteLink(q)}`}\n\nRegards,\n${roleNow().name}\n${co}`;
}

// ---------- Send modal ----------
function openSendQuote() {
  const q = S.qd,
    o = cur();
  if (!q || !o) return;
  if (!quoteIsSendable(q)) return toast('Quotes can be sent once they are approved');
  if (q.status === 'Expired' || quoteExpired(q))
    return toast('This quote has expired. Extend the expiry first');
  const ch = S.sendChan === 'whatsapp' ? 'whatsapp' : 'email',
    mode = S.sendMode && S.sendMode.no === q.no ? S.sendMode.mode : quoteSignMode(q);
  $('#modal').innerHTML =
    `<div class="fixed inset-0 z-40 grid place-items-center p-4" style="background:rgba(0,0,0,.5)"><form class="card p-5 w-full max-w-lg max-h-full overflow-auto space-y-3" onsubmit="doSendQuote(event)"><h2 class="text-lg font-bold">Send quotation ${E(q.no)}</h2>` +
    `<div class="flex gap-2"><button type="button" class="btn ${ch === 'email' ? 'btn-p' : ''}" onclick="S.sendChan='email';openSendQuote()"><span class="ms">mail</span>Email</button><button type="button" class="btn ${ch === 'whatsapp' ? 'btn-p' : ''}" onclick="S.sendChan='whatsapp';openSendQuote()"><span class="ms">chat</span>WhatsApp</button></div>` +
    (contactsOfAccount(o.account).length
      ? `<label class="block">Contact<select class="inp" onchange="const c=S.contacts.find(x=>x[0]===this.value);if(c){this.form.elements.to.value=${ch === 'email' ? 'c[3]' : 'c[4]'}||''}"><option value="">Choose a contact…</option>${contactOptions(o.account, '')}</select></label>`
      : '') +
    `<div><div class="text-sm font-semibold mb-1">How will the client sign?</div><div class="flex gap-2 flex-wrap"><button type="button" class="btn ${mode === 'link' ? 'btn-p' : ''}" onclick="S.sendMode={no:S.qd.no,mode:'link'};openSendQuote()"><span class="ms">draw</span>Sign online (link)</button><button type="button" class="btn ${mode === 'pdf' ? 'btn-p' : ''}" onclick="S.sendMode={no:S.qd.no,mode:'pdf'};openSendQuote()"><span class="ms">picture_as_pdf</span>Print &amp; sign (PDF)</button></div></div>` +
    `<input type="hidden" name="chan" value="${ch}"><input type="hidden" name="mode" value="${mode}">` +
    (ch === 'email'
      ? `<label class="block">To (email) *<input class="inp" name="to" type="email" required value="${E(q.toEmail || '')}" placeholder="customer@company.com"></label><label class="block">Subject<input class="inp" name="subject" value="${E(`Quotation ${q.no} – ${o.account}`)}"></label>`
      : `<label class="block">WhatsApp number *<input class="inp" name="to" type="tel" required value="${E(q.toPhone || '')}" placeholder="+91 98765 43210"></label>`) +
    `<label class="block">Message<textarea class="inp" name="msg" rows="9">${E(quoteMessage(q, o, mode))}</textarea></label>` +
    `<p class="mut text-xs">This opens your ${ch === 'email' ? 'email app' : 'WhatsApp'} with the message filled in. ${mode === 'pdf' ? 'The customer gets a PDF to print, sign by hand and upload back on the same page. They will not see the online signing option.' : 'The customer views the quote and accepts it with an online signature. They will not see the PDF / paper option.'} You will see when the link is opened.</p>` +
    `<div class="flex justify-end gap-2 flex-wrap"><button type="button" class="btn" onclick="copyQuoteLink()"><span class="ms">link</span>Copy link</button><button type="button" class="btn" onclick="$('#modal').innerHTML=''">Cancel</button><button class="btn btn-p">${ch === 'email' ? 'Open email' : 'Open WhatsApp'}</button></div></form></div>`;
  const t = $('#modal [name=to]');
  if (t && !t.value) t.focus();
}
function copyQuoteLink() {
  const q = S.qd;
  if (!q) return;
  const l = quoteLink(q),
    m = $('#modal [name=mode]');
  patchQuote(q.no, { token: quoteToken(q), signMode: m ? m.value : quoteSignMode(q) });
  if (!quoteLinkSaved(q))
    return toast(
      'Could not save the link (browser storage is full), so it would not open for the client'
    );
  (navigator.clipboard ? navigator.clipboard.writeText(l) : Promise.reject()).then(
    () => toast('Link copied'),
    () => prompt('Copy this link', l)
  );
}
function doSendQuote(e) {
  e.preventDefault();
  const q = S.qd,
    o = cur(),
    v = Object.fromEntries(new FormData(e.target)),
    to = (v.to || '').trim();
  if (!q || !o || !to) return;
  if (v.chan === 'email' && !/^\S+@\S+\.\S+$/.test(to)) return toast('Enter a valid email address');
  if (v.chan === 'whatsapp' && phoneDigits(to).length < 11)
    return toast('Enter the number with country code');
  const url =
    v.chan === 'email'
      ? `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(v.subject || '')}&body=${encodeURIComponent(v.msg || '')}`
      : `https://wa.me/${phoneDigits(to)}?text=${encodeURIComponent(v.msg || '')}`;
  const sends = [...(q.sends || []), { channel: v.chan, to, at: Date.now(), by: roleNow().name }];
  const signMode = v.mode === 'pdf' ? 'pdf' : 'link';
  sends[sends.length - 1].signMode = signMode;
  S.sendMode = undefined;
  patchQuote(q.no, {
    token: quoteToken(q),
    signMode,
    sends,
    sentAt: Date.now(),
    ...(v.chan === 'email' ? { toEmail: to } : { toPhone: to }),
  });
  if (!quoteLinkSaved(q))
    return toast(
      'Could not save the link (browser storage is full), so it would not open for the client. Nothing was sent.'
    );
  logOpp(
    o.id,
    v.chan === 'email' ? 'mail' : 'sync',
    `Quote ${q.no} sent to ${to} by ${v.chan === 'email' ? 'email' : 'WhatsApp'} · ${signMode === 'pdf' ? 'print & sign (PDF)' : 'sign online (link)'} (${roleNow().name})`
  );
  $('#modal').innerHTML = '';
  const a = document.createElement('a');
  a.href = url;
  a.target = '_blank';
  a.rel = 'noopener';
  document.body.appendChild(a);
  a.click();
  a.remove();
  toast(`Quote ready to send by ${v.chan === 'email' ? 'email' : 'WhatsApp'} to ${to}`);
  render();
}

// ---------- toolbar: Send, status chips, extend ----------
function sendQuoteChips(q) {
  const last = (q.sends || []).slice(-1)[0],
    views = (q.views || []).length,
    cs = q.customer;
  return (
    (last
      ? `<span class="chip ok" title="${E(last.to)}">Sent by ${last.channel === 'email' ? 'email' : 'WhatsApp'} to ${E(last.to)} · ${ago(last.at)}</span>`
      : '') +
    (views
      ? `<span class="chip ${cs ? 'ok' : ''}">Opened ${views}× · last ${ago(q.views[views - 1].at)}</span>`
      : last
        ? '<span class="chip">Not opened yet</span>'
        : '') +
    (cs
      ? `<span class="chip ${cs.status === 'Accepted' ? 'ok' : 'wr'}">Customer ${E(cs.status.toLowerCase())}${cs.name ? ' · ' + E(cs.name) : ''}</span>`
      : '') +
    (q.status === 'Expired' || quoteExpired(q) ? '<span class="chip wr">Expired</span>' : '')
  );
}
const quoteToolbarBeforeSend = quoteToolbar;
quoteToolbar = function (q) {
  let html = quoteToolbarBeforeSend.apply(this, arguments);
  const send = `<button class="btn" ${quoteIsSendable(q) ? '' : 'disabled'} title="${quoteIsSendable(q) ? 'Send by email or WhatsApp' : 'Quotes can be sent once approved'}" onclick="openSendQuote()"><span class="ms">send</span>Send</button>`,
    extend =
      (q.status === 'Expired' || quoteExpired(q)) && S.role !== 'rep'
        ? `<button class="btn btn-p" onclick="extendQuote()"><span class="ms">event_repeat</span>Extend expiry</button>`
        : '';
  html = html.replace(
    '<span class="ms">print</span>Print / PDF</button>',
    '<span class="ms">print</span>Print / PDF</button>' + send + extend
  );
  return html.replace(
    '<span class="flex-1"></span>',
    sendQuoteChips(q) + '<span class="flex-1"></span>'
  );
};
function extendQuote() {
  const q = S.qd;
  if (!q || S.role === 'rep') return toast('Only Admin or CEO can extend an expired quote');
  const exp = D(quoteDefaultsSetting().validityDays);
  const patch = { exp };
  if (q.status === 'Expired')
    patch.status = ['Approved', 'Sent to client'].includes(q.prevStatus) ? q.prevStatus : 'Draft';
  patchQuote(q.no, patch);
  const rec = S.quotes.find((x) => x.no === q.no);
  if (rec) addQuoteHistory(rec, 'Extended', `Expiry moved to ${fd(exp)} by ${roleNow().name}`);
  save();
  toast('Expiry extended to ' + fd(exp));
  render();
}

// ---------- the quick contact picker + email fields in the quote form ----------
const quoteDefaultsBeforeSend = quoteDefaults;
quoteDefaults = function (q, o) {
  const d = quoteDefaultsBeforeSend.apply(this, arguments),
    name = String(d.preparedFor || '').replace(/\s*\(.*\)\s*$/, ''),
    c =
      S.contacts.find((x) => x[2] === o.account && x[0] === name) ||
      contactsOfAccount(o.account)[0];
  d.toEmail = q.toEmail ?? (c ? c[3] || '' : '');
  d.toPhone = q.toPhone ?? (c ? c[4] || '' : '');
  return d;
};

// ---------- automatic expiry ----------
function expireQuotes() {
  let changed = false;
  S.quotes.forEach((q) => {
    if (!q.exp || days(q.exp) >= 0) return;
    if (q.isDefault) {
      q.exp = D(quoteDefaultsSetting().validityDays); // an untouched default quote never expires
      changed = true;
    } else if (['Draft', 'Rejected'].includes(q.status) || String(q.status).startsWith('Pending')) {
      q.prevStatus = q.status;
      q.status = 'Expired';
      addQuoteHistory(q, 'Expired', `Validity ended on ${fd(q.exp)}`);
      changed = true;
    }
  });
  if (changed) save();
}
const renderBeforeExpiry = render;
render = function () {
  expireQuotes();
  return renderBeforeExpiry.apply(this, arguments);
};
const navBeforeExpiry = nav;
nav = function () {
  expireQuotes();
  return navBeforeExpiry.apply(this, arguments);
};
expireQuotes();

// ---------- customer page (#cq/<token>) ----------
const customerRoute = () => /^#cq\//.test(location.hash);
const quoteByToken = (t) => S.quotes.find((q) => q.token && q.token === t);

function trackQuoteView(q) {
  const k = 'cqv-' + q.token;
  try {
    if (sessionStorage.getItem(k) && Date.now() - +sessionStorage.getItem(k) < 30 * 60e3) return;
    sessionStorage.setItem(k, String(Date.now()));
  } catch (e) {}
  const first = !(q.views || []).length;
  q.views = [...(q.views || []), { at: Date.now() }].slice(-200);
  q.firstViewedAt = q.firstViewedAt || Date.now();
  const o = S.opps.find((x) => x.id == q.opp);
  if (o) logOpp(o.id, 'sync', `Customer opened quote ${q.no}${first ? ' for the first time' : ''}`);
  if (first) {
    const creator = S.users.find((u) => u.name === q.createdBy);
    queuePopup({
      kind: 'cq-viewed',
      no: q.no,
      toUser: creator ? creator.id : undefined,
      toRole: creator ? undefined : 'admin',
      by: 'customer',
    });
  }
  save();
}
function renderCustomerQuote() {
  document.body.classList.add('cq-mode');
  const h = document.querySelector('header');
  if (h) h.style.display = 'none';
  const app = $('#app');
  app.className = 'min-h-screen p-3 md:p-6 max-w-3xl mx-auto';
  const q = quoteByToken(location.hash.slice(4)),
    co = S.settings.company || {};
  if (!q) {
    app.innerHTML = `<div class="card p-6 text-center"><h1 class="text-xl font-bold">Link not valid</h1><p class="mut mt-2">This quotation link is not valid. Please ask the sender for a new one.</p></div>`;
    return;
  }
  trackQuoteView(q);
  const o = S.opps.find((x) => x.id == q.opp) || {},
    expired = q.status === 'Expired' || quoteExpired(q),
    cs = q.customer,
    banner = cs
      ? `<div class="qt-banner ${cs.status === 'Accepted' ? 'ok' : 'wr'}"><span class="ms">${cs.status === 'Accepted' ? 'verified' : 'info'}</span><div><b>${cs.status === 'Accepted' ? (cs.via === 'paper' ? 'Thank you. We received your signed copy of this quotation.' : 'Thank you. You accepted and signed this quotation.') : 'You declined this quotation'}</b><div>${E(cs.name || '')} · ${whenText(cs.at)}</div>${cs.reason ? `<div>Reason: ${E(cs.reason)}</div>` : ''}</div></div>`
      : expired
        ? `<div class="qt-banner wr"><span class="ms">event_busy</span><div><b>This quotation has expired</b><div>It was valid until ${fd(q.exp)}. Please contact us for an updated quote.</div></div></div>`
        : !quoteIsSendable(q)
          ? `<div class="qt-banner wr"><span class="ms">hourglass_top</span><div><b>This quotation is not available yet</b></div></div>`
          : '';
  const actions =
    !cs && !expired && quoteIsSendable(q)
      ? quoteSignMode(q) === 'pdf'
        ? ''
        : `<form id="cq-sign" class="card p-4 md:p-5 mt-3 space-y-3 no-print" onsubmit="customerRespond(event,'${E(q.token)}','Accepted')" oninput="cqSignUpdate(this)" onchange="cqSignUpdate(this)"><div class="flex items-center gap-2"><span class="ms" style="color:var(--pr)">draw</span><b class="text-lg">Accept and sign</b></div><p class="mut text-sm">Type your full name. Your signature is created from it automatically.</p><label class="block">Your full name *<input class="inp mt-1" name="name" required minlength="2" maxlength="60" autocomplete="name" placeholder="e.g. ${E(String(q.preparedFor || 'Priya Sharma').replace(/\s*\(.*\)\s*$/, ''))}"></label><div class="sig-pad" aria-live="polite"><div class="sig-label">Your signature</div><div class="sig-pad-ink"><span class="mut text-sm">Your signature appears here as you type</span></div><div class="sig-line"></div><div class="sig-name mut">${fd(D(0))}</div></div><label class="flex items-start gap-2"><input type="checkbox" name="agree" required class="mt-1"> <span>I agree to this quotation and its terms &amp; conditions, and I accept the signature above as my electronic signature.</span></label><div class="flex gap-2 flex-wrap"><button class="btn btn-p" id="cq-accept" disabled><span class="ms">verified</span>Agree &amp; submit</button><button type="button" class="btn" style="color:var(--err)" onclick="customerDecline('${E(q.token)}')">Decline</button></div></form>`
      : '';
  // Paper option: download / print the quotation, sign it by hand and upload the signed copy.
  const canSign = !cs && !expired && quoteIsSendable(q) && quoteSignMode(q) === 'pdf';
  const toolbar =
    quoteSignMode(q) === 'pdf' && (quoteIsSendable(q) || cs)
      ? `<div class="flex flex-wrap items-center gap-2 mb-2 no-print"><span class="mut text-sm flex-1">Quotation ${E(q.no)} from ${E(co.name || 'Ceph CRM')}</span><button type="button" class="btn" onclick="cqDownloadPdf()"><span class="ms">picture_as_pdf</span>Download PDF</button></div>`
      : '';
  const paperBlock = canSign
    ? `<div class="paper-sign"><div class="paper-sign-title">Customer acceptance (sign by hand)</div><p class="text-sm">We accept this quotation and its terms and conditions.</p><div class="paper-sign-grid"><div><div class="paper-line"></div><div class="paper-lab">Name</div></div><div><div class="paper-line"></div><div class="paper-lab">Designation</div></div><div><div class="paper-line"></div><div class="paper-lab">Signature</div></div><div><div class="paper-line"></div><div class="paper-lab">Date</div></div></div><div class="paper-stamp">Company stamp</div><p class="text-xs mt-2">For ${E(o.account || q.preparedFor || 'the customer')} · Quote ${E(q.no)} · Grand total ${M(quoteTotal(q))}</p></div>`
    : '';
  const paperCard = canSign
    ? `<form id="cq-paper" class="card p-4 md:p-5 mt-3 space-y-3 no-print" onsubmit="customerUploadSigned(event,'${E(q.token)}')"><div class="flex items-center gap-2"><span class="ms" style="color:var(--pr)">print</span><b class="text-lg">Prefer to sign on paper?</b></div><ol class="paper-steps text-sm"><li><b>Download the PDF</b> and print it. It has space for your name, signature, date and company stamp.</li><li><b>Sign and stamp</b> the acceptance section at the end of the quotation.</li><li><b>Upload</b> a scan or clear photo of the signed page below${co.email ? `, or email it to ${E(co.email)}` : ''}.</li></ol><button type="button" class="btn" onclick="cqDownloadPdf()"><span class="ms">picture_as_pdf</span>Download PDF to sign</button><div class="grid sm:grid-cols-2 gap-3"><label class="block">Signed by (full name) *<input class="inp mt-1" name="name" required minlength="2" maxlength="60" autocomplete="name"></label><label class="block">Signed copy (PDF, JPG or PNG, up to 10 MB) *<input class="inp mt-1" name="file" type="file" required accept="application/pdf,image/jpeg,image/png"></label></div><button class="btn btn-p"><span class="ms">upload_file</span>Upload signed copy</button></form>`
    : '';
  app.innerHTML =
    toolbar +
    `<div class="card p-4 md:p-6 doc-sheet">${docLetterhead('QUOTATION', [
      ['Quote no.', q.no],
      ['Valid until', fd(q.exp)],
    ])}${q.name ? `<div class="font-semibold">${E(q.name)}</div>` : ''}${banner ? `<div class="mt-3">${banner}</div>` : ''}` +
    `<div class="grid sm:grid-cols-2 gap-3 mt-4 text-sm"><div><div class="mut text-xs">Prepared for</div><b>${E(q.preparedFor || o.account || '')}</b><div class="mut">${E(o.account || '')}</div>${billReceiverHtml(billReceiverOf(q))}</div><div><div class="mut text-xs">Billing address</div><div style="white-space:pre-wrap">${E(q.address || '–')}</div><div class="mut text-xs mt-2">Shipping address</div><div style="white-space:pre-wrap">${E(q.shipping || '–')}</div></div></div>` +
    `<div class="my-4 overflow-x-auto">${billLinesTable(q.items, !!q.showDiscount)}</div><div class="text-right text-lg font-bold">Grand total ${M(quoteTotal(q))}</div>` +
    `<div class="mt-4"><b>Terms &amp; conditions</b><div style="white-space:pre-wrap" class="text-sm">${E(effectiveTnc(q))}</div></div>` +
    (cs && cs.status === 'Accepted' && cs.name
      ? `<div class="doc-sign-row">${signatureBlock(cs.name, cs.at, 'Accepted & signed by', cs.via === 'paper' ? 'paper' : 'customer')}</div>`
      : '') +
    paperBlock +
    `</div>${actions}${paperCard}`;
}
// Live signature preview: Agree & submit unlocks once a full name is typed and the box is ticked.
function cqSignUpdate(form) {
  const name = String(form.elements.name.value || '')
      .replace(/\s+/g, ' ')
      .trim(),
    ok = name.length >= 2 && /[a-z]/i.test(name),
    ink = form.querySelector('.sig-pad-ink');
  ink.innerHTML = ok
    ? signatureSvg(name)
    : '<span class="mut text-sm">Your signature appears here as you type</span>';
  form.querySelector('.sig-pad').classList.toggle('signed', ok);
  $('#cq-accept').disabled = !(ok && form.elements.agree.checked);
}
function customerRespond(e, token, status) {
  e.preventDefault();
  const q = quoteByToken(token),
    v = Object.fromEntries(new FormData(e.target));
  if (!q || q.customer || q.status === 'Expired' || quoteExpired(q)) return;
  const signer = String(v.name || '')
    .replace(/\s+/g, ' ')
    .trim();
  if (status === 'Accepted' && (signer.length < 2 || !v.agree))
    return toast('Type your full name and tick the box to accept');
  q.customer = { status, name: signer, at: Date.now() };
  if (status === 'Accepted') {
    q.signedBy = q.customer.name;
    q.signedAt = q.customer.at;
    q.signedVia = 'customer';
    q.signedRecordedBy = undefined;
  }
  // keep the open working copy in step, so the CRM shows the client's signature straight away
  if (S.qd && S.qd.no === q.no)
    Object.assign(S.qd, {
      customer: clone(q.customer),
      signedBy: q.signedBy,
      signedAt: q.signedAt,
      signedVia: q.signedVia,
      signedRecordedBy: q.signedRecordedBy,
    });
  addQuoteHistory(q, 'Customer ' + status.toLowerCase(), q.customer.name);
  const o = S.opps.find((x) => x.id == q.opp);
  if (o)
    logOpp(o.id, 'sync', `Customer ${status.toLowerCase()} quote ${q.no} (${q.customer.name})`);
  const creator = S.users.find((u) => u.name === q.createdBy);
  queuePopup({
    kind: status === 'Accepted' ? 'cq-accepted' : 'cq-declined',
    no: q.no,
    toUser: creator ? creator.id : undefined,
    toRole: creator ? undefined : 'admin',
    by: 'customer',
  });
  if (creator && creator.role === 'rep')
    queuePopup({
      kind: status === 'Accepted' ? 'cq-accepted' : 'cq-declined',
      no: q.no,
      toRole: 'admin',
      by: 'customer',
    });
  save();
  renderCustomerQuote();
}
function customerDecline(token) {
  const reason = (prompt('Reason for declining (optional)') || '').trim(),
    q = quoteByToken(token);
  if (!q || q.customer || q.status === 'Expired' || quoteExpired(q)) return;
  q.customer = { status: 'Declined', name: '', at: Date.now(), reason };
  addQuoteHistory(q, 'Customer declined', reason);
  const o = S.opps.find((x) => x.id == q.opp);
  if (o) logOpp(o.id, 'sync', `Customer declined quote ${q.no}${reason ? ': ' + reason : ''}`);
  const creator = S.users.find((u) => u.name === q.createdBy);
  queuePopup({
    kind: 'cq-declined',
    no: q.no,
    toUser: creator ? creator.id : undefined,
    toRole: creator ? undefined : 'admin',
    by: 'customer',
  });
  save();
  renderCustomerQuote();
}
// popups for the sales team about what the customer did
function showCqPopup(p) {
  const q = quoteOf(p.no);
  if (!q) return;
  const accepted = p.kind === 'cq-accepted',
    viewed = p.kind === 'cq-viewed';
  showPopup({
    tone: accepted ? 'ok' : viewed ? 'wr' : 'err',
    icon: accepted ? 'verified' : viewed ? 'visibility' : 'cancel',
    title: viewed
      ? `Customer opened quote ${E(q.no)}`
      : `Customer ${accepted ? 'accepted' : 'declined'} quote ${E(q.no)}`,
    lines: viewed
      ? [`${E(q.preparedFor || 'The customer')} just opened the quotation you sent.`]
      : [
          q.customer ? `${E(q.customer.name || '')} · ${whenText(q.customer.at)}` : '',
          q.customer && q.customer.reason ? `Reason: ${E(q.customer.reason)}` : '',
        ],
    actions: [{ label: 'Open quote', js: `openQuoteRecord('${E(q.no)}')` }],
  });
}
function applyCustomerRoute() {
  if (customerRoute()) renderCustomerQuote();
  else if (document.body.classList.contains('cq-mode')) {
    document.body.classList.remove('cq-mode');
    $('#app').className = 'p-3 md:p-4 max-w-[1500px] mx-auto';
    render();
  }
}
addEventListener('hashchange', applyCustomerRoute); // runs after the app's own hashchange renderers
setTimeout(applyCustomerRoute, 0);

// ---------- paper signing from the customer link ----------
// Download PDF (cqDownloadPdf, in core/print-mode.js) opens the browser's print dialog ("Save as PDF").
// An unsigned quote prints with an empty acceptance section (name, designation, signature, date, stamp).
const SIGNED_COPY_MAX = 10 * 1024 * 1024; // kept in the browser's file database, not the main saved data
function customerUploadSigned(e, token) {
  e.preventDefault();
  const q = quoteByToken(token),
    form = e.target,
    file = form.elements.file.files[0],
    signer = String(form.elements.name.value || '')
      .replace(/\s+/g, ' ')
      .trim();
  if (!q || q.customer || q.status === 'Expired' || quoteExpired(q)) return;
  if (signer.length < 2) return toast('Enter the name of the person who signed');
  if (!file) return toast('Choose the signed copy to upload');
  if (!/^(application\/pdf|image\/(jpeg|png))$/.test(file.type))
    return toast('Upload a PDF, JPG or PNG file');
  if (file.size > SIGNED_COPY_MAX)
    return toast(
      'That file is over 10 MB. Please upload a smaller scan or photo of the signed page.'
    );
  const btn = form.querySelector('.btn-p'),
    key = signedCopyKey(q.no);
  btn.disabled = true;
  filePut(key, file)
    .then(() => {
      const at = Date.now();
      q.signedCopy = {
        name: file.name,
        type: file.type,
        size: file.size,
        at,
        signer,
        fileKey: key,
      };
      q.customer = { status: 'Accepted', name: signer, at, via: 'paper' };
      q.signedBy = signer;
      q.signedAt = at;
      q.signedVia = 'paper';
      q.signedRecordedBy = undefined;
      if (!save()) {
        ['signedCopy', 'customer', 'signedBy', 'signedAt', 'signedVia', 'signedRecordedBy'].forEach(
          (k) => delete q[k]
        );
        fileDelete(key).catch(() => {});
        btn.disabled = false;
        return toast('Could not save your upload here. Please email the signed copy instead.');
      }
      if (S.qd && S.qd.no === q.no)
        Object.assign(S.qd, {
          customer: clone(q.customer),
          signedBy: q.signedBy,
          signedAt: q.signedAt,
          signedVia: q.signedVia,
          signedCopy: clone(q.signedCopy),
        });
      addQuoteHistory(q, 'Customer uploaded signed copy', `${signer} · ${file.name}`);
      const o = S.opps.find((x) => x.id == q.opp);
      if (o) logOpp(o.id, 'sync', `Customer uploaded a signed copy of quote ${q.no} (${signer})`);
      const creator = S.users.find((u) => u.name === q.createdBy);
      queuePopup({
        kind: 'cq-accepted',
        no: q.no,
        toUser: creator ? creator.id : undefined,
        toRole: creator ? undefined : 'admin',
        by: 'customer',
      });
      save();
      toast('Thank you. Your signed copy was received.');
      renderCustomerQuote();
      window.scrollTo(0, 0);
    })
    .catch(() => {
      btn.disabled = false;
      toast('Could not store that file. Please try again or email the signed copy.');
    });
}
