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
const quoteToken = (q) =>
  q.token || (q.token = 'cq' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36));
const quoteLink = (q) => `${location.origin}${location.pathname}#cq/${quoteToken(q)}`;
const phoneDigits = (p) => {
  const d = String(p || '').replace(/\D/g, '');
  return d.length === 10 ? '91' + d : d; // 10-digit Indian numbers get +91
};
const quoteExpired = (q) => !q.customer && !['Paid'].includes(q.status) && q.exp && days(q.exp) < 0;
const quoteIsSendable = (q) => ['Approved', 'Sent to client', 'Paid'].includes(q.status);

function quoteMessage(q, o) {
  const co = (S.settings.company || {}).name || 'our team',
    first =
      String(q.preparedFor || '')
        .replace(/\s*\(.*\)\s*$/, '')
        .split(' ')[0] || 'there';
  return `Hello ${first},\n\nPlease find quotation ${q.no} for ${o.account}.\nTotal: ${M(quoteTotal(q))}\nValid until: ${fd(q.exp)}\n\nView, accept and sign it here:\n${quoteLink(q)}\n\nRegards,\n${roleNow().name}\n${co}`;
}

// ---------- Send modal ----------
function openSendQuote() {
  const q = S.qd,
    o = cur();
  if (!q || !o) return;
  if (!quoteIsSendable(q)) return toast('Quotes can be sent once they are approved');
  if (q.status === 'Expired' || quoteExpired(q))
    return toast('This quote has expired. Extend the expiry first');
  const ch = S.sendChan === 'whatsapp' ? 'whatsapp' : 'email';
  $('#modal').innerHTML =
    `<div class="fixed inset-0 z-40 grid place-items-center p-4" style="background:rgba(0,0,0,.5)"><form class="card p-5 w-full max-w-lg max-h-full overflow-auto space-y-3" onsubmit="doSendQuote(event)"><h2 class="text-lg font-bold">Send quotation ${E(q.no)}</h2>` +
    `<div class="flex gap-2"><button type="button" class="btn ${ch === 'email' ? 'btn-p' : ''}" onclick="S.sendChan='email';openSendQuote()"><span class="ms">mail</span>Email</button><button type="button" class="btn ${ch === 'whatsapp' ? 'btn-p' : ''}" onclick="S.sendChan='whatsapp';openSendQuote()"><span class="ms">chat</span>WhatsApp</button></div>` +
    (contactsOfAccount(o.account).length
      ? `<label class="block">Contact<select class="inp" onchange="const c=S.contacts.find(x=>x[0]===this.value);if(c){this.form.elements.to.value=${ch === 'email' ? 'c[3]' : 'c[4]'}||''}"><option value="">Choose a contact…</option>${contactOptions(o.account, '')}</select></label>`
      : '') +
    `<input type="hidden" name="chan" value="${ch}">` +
    (ch === 'email'
      ? `<label class="block">To (email) *<input class="inp" name="to" type="email" required value="${E(q.toEmail || '')}" placeholder="customer@company.com"></label><label class="block">Subject<input class="inp" name="subject" value="${E(`Quotation ${q.no} – ${o.account}`)}"></label>`
      : `<label class="block">WhatsApp number *<input class="inp" name="to" type="tel" required value="${E(q.toPhone || '')}" placeholder="+91 98765 43210"></label>`) +
    `<label class="block">Message<textarea class="inp" name="msg" rows="9">${E(quoteMessage(q, o))}</textarea></label>` +
    `<p class="mut text-xs">This opens your ${ch === 'email' ? 'email app' : 'WhatsApp'} with the message filled in. The link lets the customer view, accept and sign the quote, and you will see when it is opened.</p>` +
    `<div class="flex justify-end gap-2 flex-wrap"><button type="button" class="btn" onclick="copyQuoteLink()"><span class="ms">link</span>Copy link</button><button type="button" class="btn" onclick="$('#modal').innerHTML=''">Cancel</button><button class="btn btn-p">${ch === 'email' ? 'Open email' : 'Open WhatsApp'}</button></div></form></div>`;
  const t = $('#modal [name=to]');
  if (t && !t.value) t.focus();
}
function copyQuoteLink() {
  const q = S.qd;
  if (!q) return;
  const l = quoteLink(q);
  patchQuote(q.no, { token: q.token });
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
  patchQuote(q.no, {
    token: quoteToken(q),
    sends,
    sentAt: Date.now(),
    ...(v.chan === 'email' ? { toEmail: to } : { toPhone: to }),
  });
  logOpp(
    o.id,
    v.chan === 'email' ? 'mail' : 'sync',
    `Quote ${q.no} sent to ${to} by ${v.chan === 'email' ? 'email' : 'WhatsApp'} (${roleNow().name})`
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
      ? `<div class="qt-banner ${cs.status === 'Accepted' ? 'ok' : 'wr'}"><span class="ms">${cs.status === 'Accepted' ? 'verified' : 'info'}</span><div><b>You ${cs.status.toLowerCase()} this quotation</b><div>${E(cs.name || '')} · ${whenText(cs.at)}</div>${cs.reason ? `<div>Reason: ${E(cs.reason)}</div>` : ''}</div></div>`
      : expired
        ? `<div class="qt-banner wr"><span class="ms">event_busy</span><div><b>This quotation has expired</b><div>It was valid until ${fd(q.exp)}. Please contact us for an updated quote.</div></div></div>`
        : !quoteIsSendable(q)
          ? `<div class="qt-banner wr"><span class="ms">hourglass_top</span><div><b>This quotation is not available yet</b></div></div>`
          : '';
  const actions =
    !cs && !expired && quoteIsSendable(q)
      ? `<form class="card p-4 mt-3 space-y-3" onsubmit="customerRespond(event,'${E(q.token)}','Accepted')"><b>Accept and sign</b><label class="block">Your full name (as signature) *<input class="inp" name="name" required value="${E(String(q.preparedFor || '').replace(/\s*\(.*\)\s*$/, ''))}"></label><label class="flex items-start gap-2"><input type="checkbox" name="agree" required class="mt-1"> <span>I accept this quotation and its terms &amp; conditions.</span></label><div class="flex gap-2 flex-wrap"><button class="btn btn-p">Accept &amp; sign</button><button type="button" class="btn" style="color:var(--err)" onclick="customerDecline('${E(q.token)}')">Decline</button></div></form>`
      : '';
  app.innerHTML =
    `<div class="card p-4 md:p-6"><div class="flex justify-between gap-3 flex-wrap"><div><div class="mut text-xs">${E(co.name || 'Quotation')}</div><h1 class="text-xl font-bold">Quotation ${E(q.no)}</h1><div class="mut">${E(q.name || '')}</div></div><div class="text-right"><div class="mut text-xs">Valid until</div><b>${fd(q.exp)}</b></div></div>${banner ? `<div class="mt-3">${banner}</div>` : ''}` +
    `<div class="grid sm:grid-cols-2 gap-3 mt-4 text-sm"><div><div class="mut text-xs">Prepared for</div><b>${E(q.preparedFor || o.account || '')}</b><div class="mut">${E(o.account || '')}</div></div><div><div class="mut text-xs">Billing address</div><div style="white-space:pre-wrap">${E(q.address || '–')}</div><div class="mut text-xs mt-2">Shipping address</div><div style="white-space:pre-wrap">${E(q.shipping || '–')}</div></div></div>` +
    `<div class="my-4 overflow-x-auto">${billLinesTable(q.items, !!q.showDiscount)}</div><div class="text-right text-lg font-bold">Grand total ${M(quoteTotal(q))}</div>` +
    `<div class="mt-4"><b>Terms &amp; conditions</b><div style="white-space:pre-wrap" class="text-sm">${E(effectiveTnc(q))}</div></div></div>${actions}`;
}
function customerRespond(e, token, status) {
  e.preventDefault();
  const q = quoteByToken(token),
    v = Object.fromEntries(new FormData(e.target));
  if (!q || q.customer || q.status === 'Expired' || quoteExpired(q)) return;
  q.customer = { status, name: (v.name || '').trim(), at: Date.now() };
  if (status === 'Accepted') {
    q.signedBy = q.customer.name;
    q.signedAt = q.customer.at;
  }
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
