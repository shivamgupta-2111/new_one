// Online payments: a client payment page (#pay/<quote token>) for card, net banking and wallets,
// payment settings for Admin / CEO and payment receipts.
//
// Card, net banking and wallets need a payment gateway (Razorpay, Cashfree, PayU, Stripe…) with a server.
// Until one is connected they run in TEST MODE: the flow and records are real but no money moves.

const PAY_BANKS = [
  'State Bank of India',
  'HDFC Bank',
  'ICICI Bank',
  'Axis Bank',
  'Kotak Mahindra Bank',
  'Punjab National Bank',
  'Bank of Baroda',
  'Canara Bank',
  'Union Bank of India',
  'IDFC FIRST Bank',
  'Yes Bank',
  'IndusInd Bank',
];
const PAY_WALLETS = ['Paytm', 'PhonePe', 'Amazon Pay', 'MobiKwik'];
const PAY_METHOD_INFO = {
  card: ['credit_card', 'Card', 'Visa, Mastercard, RuPay, Amex'],
  netbanking: ['account_balance', 'Net banking', 'All major Indian banks'],
  wallet: ['account_balance_wallet', 'Wallet', PAY_WALLETS.join(', ')],
};

// ---------- settings ----------
function paySettings() {
  S.settings = S.settings || {};
  const p = S.settings.payments || (S.settings.payments = {});
  if (p.enabled === undefined) p.enabled = true;
  if (!p.methods) p.methods = { card: true, netbanking: true, wallet: true };
  delete p.methods.upi; // UPI is not offered
  delete p.upiId;
  delete p.payeeName;
  if (!p.mode) p.mode = 'test';
  return p;
}

const SETTINGS_SECTIONS_BeforeOnlinePay = SETTINGS_SECTIONS;
SETTINGS_SECTIONS = function () {
  const base = SETTINGS_SECTIONS_BeforeOnlinePay.apply(this, arguments);
  if (S.role !== 'rep' && !base.some((s) => s[0] === 'payments')) {
    const at = base.findIndex((s) => s[0] === 'company');
    base.splice(at < 0 ? base.length : at + 1, 0, ['payments', 'Online payments', 'payments']);
  }
  return base;
};
SETTINGS_PANELS.payments = function () {
  const p = paySettings(),
    ok = canManageBilling(),
    dis = ok ? '' : 'disabled',
    co = companyInfo(),
    method = (k) => {
      const [ic, label, sub] = PAY_METHOD_INFO[k];
      return `<label class="pay-set-m"><input type="checkbox" name="m_${k}" ${p.methods[k] ? 'checked' : ''} ${dis}><span class="ms">${ic}</span><span><b>${label}</b><span class="mut text-xs block">${sub}</span></span></label>`;
    };
  return (
    secHead(
      'payments',
      'Online payments',
      'Let clients pay invoices online from a payment link (card, net banking, wallets).'
    ) +
    `<form class="grid md:grid-cols-2 gap-3" onsubmit="savePaySettings(event)">` +
    settingsField(
      'Online payments',
      `<select class="inp" name="enabled" ${dis}><option value="yes" ${p.enabled ? 'selected' : ''}>On: clients can pay from the link</option><option value="no" ${!p.enabled ? 'selected' : ''}>Off</option></select>`
    ) +
    settingsField(
      'Payment gateway',
      `<select class="inp" name="mode" ${dis}><option value="test" selected>Test mode (no real money moves)</option><option value="live" disabled>Live: connect a gateway first</option></select>`
    ) +
    `<div class="md:col-span-2"><div class="text-sm font-semibold mb-1">Methods offered to clients</div><div class="grid sm:grid-cols-2 gap-2">${Object.keys(PAY_METHOD_INFO).map(method).join('')}</div></div>` +
    `<div class="md:col-span-2 p-3 rounded-lg text-sm" style="background:var(--hov)"><b>How it works</b><ul class="list-disc ml-5 mt-1 space-y-1"><li><b>Card, net banking and wallets</b> need a payment gateway such as Razorpay, Cashfree, PayU or Stripe, with your gateway keys kept on a server. Until one is connected they run in <b>test mode</b>: the screens and records are real, but no money moves. Test card: 4111 1111 1111 1111. A card ending 0002 is declined.</li></ul></div>` +
    (ok
      ? `<div class="md:col-span-2 flex justify-end"><button class="btn btn-p">Save payment settings</button></div>`
      : '<p class="mut md:col-span-2">Only Admin and CEO can change these settings.</p>') +
    `</form>`
  );
};
function savePaySettings(e) {
  e.preventDefault();
  if (!canManageBilling()) return toast('Only Admin and CEO can change payment settings');
  const f = e.target,
    v = Object.fromEntries(new FormData(f));
  const methods = {};
  Object.keys(PAY_METHOD_INFO).forEach((k) => (methods[k] = !!f.elements['m_' + k].checked));
  if (v.enabled === 'yes' && !Object.values(methods).some(Boolean))
    return toast('Pick at least one payment method');
  Object.assign(paySettings(), {
    enabled: v.enabled === 'yes',
    mode: 'test',
    methods,
  });
  save();
  toast('Payment settings saved');
  render();
}

// ---------- links and amounts ----------
const paymentRoute = () => /^#pay\//.test(location.hash);
const clientRoute = () => customerRoute() || paymentRoute();
const invoiceOfQuote = (q) =>
  q && q.invoiceId ? S.invoices.find((i) => i.id === q.invoiceId) : null;
const quoteOfInvoice = (i) => S.quotes.find((q) => q.no === i.quoteNo);
function paymentLink(i) {
  const q = quoteOfInvoice(i);
  return q ? `${location.origin}${location.pathname}#pay/${quoteToken(q)}` : '';
}
// what the client can still pay online
const payableNow = (i) => invBalance(i);
const canPayOnline = (i) =>
  !!i &&
  paySettings().enabled &&
  i.status !== 'Paid' &&
  Object.values(paySettings().methods).some(Boolean);

// The client's tab only writes the shared records, never the sales team's open pages and drafts.
const CLIENT_WRITE_KEYS = ['quotes', 'invoices', 'opps', 'acts', 'popups'];
const saveBeforeClientGuard = save;
save = function () {
  if (!clientRoute() || S.authUser) return saveBeforeClientGuard.apply(this, arguments);
  try {
    const stored = load() || {};
    CLIENT_WRITE_KEYS.forEach((k) => {
      if (S[k] !== undefined) stored[k] = S[k];
    });
    localStorage.setItem(KEY, JSON.stringify(stored));
    return true;
  } catch (e) {
    return storageWriteFailed(e);
  }
};

// The invoice goes to the client automatically when they pay before it was formally submitted.
function ensureInvoiceSubmitted(i) {
  if (invIsOpen(i) || i.status === 'Paid') return;
  i.gst = i.gst || liveGst(i);
  i.status = 'Submitted to client';
  i.sentAt = i.sentAt || Date.now();
  i.dueDate = invDueDate(i);
  const q = quoteOfInvoice(i);
  if (q && !['Paid'].includes(q.status)) q.status = 'Sent to client';
}
function settleInvoiceStatus(i) {
  const left = invBalance(i);
  const was = i.status;
  const received = (i.payments || []).some((p) => !p.pending);
  i.status = received && left <= 0.5 ? 'Paid' : received ? 'Partially paid' : 'Submitted to client';
  const q = quoteOfInvoice(i);
  if (i.status === 'Paid') {
    i.paidAt = i.paidAt || Date.now();
    if (q) q.status = 'Paid';
  } else {
    delete i.paidAt;
    if (q && q.status === 'Paid') q.status = 'Sent to client';
  }
  return was !== 'Paid' && i.status === 'Paid';
}
function notifyTeam(kind, i, extra = {}) {
  const q = quoteOfInvoice(i),
    creator = q && S.users.find((u) => u.name === q.createdBy);
  ['admin', 'ceo'].forEach((role) =>
    queuePopup({ kind, inv: i.id, toRole: role, by: 'customer', ...extra })
  );
  if (creator && creator.role === 'rep')
    queuePopup({ kind, inv: i.id, toUser: creator.id, by: 'customer', ...extra });
}
const txnId = (prefix) =>
  prefix +
  '_' +
  Date.now().toString(36).toUpperCase() +
  Math.random().toString(36).slice(2, 7).toUpperCase();

// Record a payment made by the client through the payment page.
function recordClientPayment(i, pay) {
  ensureInvoiceSubmitted(i);
  i.gst = i.gst || liveGst(i);
  const entry = {
    id: 'pay' + Date.now().toString(36),
    date: D(0),
    by: 'Client (online)',
    at: Date.now(),
    online: true,
    ...pay,
  };
  i.payments = [...(i.payments || []), entry];
  const fullyPaid = settleInvoiceStatus(i);
  entry.balanceAfter = invBalance(i);
  const q = quoteOfInvoice(i);
  if (q) q.paidOnlineAt = Date.now();
  logOpp(
    i.opp,
    'sync',
    `Client paid ${M(entry.amount)} online on ${i.invoiceNo} by ${entry.method}${fullyPaid ? ' · paid in full' : ` · balance ${M(invBalance(i))}`}`
  );
  notifyTeam('bill-online', i, { pay: entry.id });
  if (fullyPaid) {
    const o = S.opps.find((x) => x.id == i.opp);
    if (o && !(o.stage === 5 && !o.lost))
      queuePopup({ kind: 'bill-paidfull', inv: i.id, toRole: 'admin', by: 'customer' });
  }
  save();
  return entry;
}

// ---------- client payment page ----------
let PAY = { method: null, step: 'choose', receipt: null, busy: false };
function renderPaymentPage() {
  document.body.classList.add('cq-mode');
  const h = document.querySelector('header');
  if (h) h.style.display = 'none';
  const app = $('#app');
  app.className = 'min-h-screen p-3 md:p-6 max-w-3xl mx-auto';
  const q = quoteByToken(location.hash.slice(5)),
    i = invoiceOfQuote(q);
  const shell = (body) =>
    `<div class="pay-wrap">${body}<p class="pay-secure"><span class="ms">lock</span>Secure payment page · ${E(companyInfo().name || 'Ceph CRM')}</p></div>`;
  if (!q || !i) {
    app.innerHTML = shell(
      `<div class="card p-6 text-center"><span class="ms" style="font-size:40px;color:var(--mut)">link_off</span><h1 class="text-xl font-bold mt-2">Payment link not available</h1><p class="mut mt-2">${q ? 'The invoice for this quotation is not ready yet.' : 'This payment link is not valid.'} Please contact the sender.</p></div>`
    );
    return;
  }
  const p = paySettings(),
    due = payableNow(i),
    co = companyInfo(),
    contact = [co.email, co.phone].filter(Boolean).map(E).join(' · '),
    head = `<div class="card p-4 md:p-6 doc-sheet">${docLetterhead('PAYMENT', [
      ['Invoice', i.invoiceNo],
      ['Quotation', i.quoteNo],
      ['Due date', fd(invDueDate(i))],
    ])}<div class="pay-sum"><div><div class="mut text-xs">Billed to</div><b>${E(i.account)}</b></div><div><div class="mut text-xs">Invoice total</div><b>${M(invPayable(i))}</b></div><div><div class="mut text-xs">Paid</div><b>${M(invPaid(i))}</b></div><div class="pay-due"><div class="mut text-xs">Amount due</div><b>${M(due)}</b></div></div></div>`;

  if (PAY.receipt) {
    const r = (i.payments || []).find((x) => x.id === PAY.receipt);
    if (r) {
      app.innerHTML = shell(head + payReceiptCard(i, r, true));
      return;
    }
    PAY.receipt = null;
  }
  if (i.status === 'Paid' || due <= 0.5) {
    const online = (i.payments || []).filter((x) => x.online);
    app.innerHTML = shell(
      head +
        `<div class="card p-6 mt-3 text-center"><span class="ms pay-big-ok">task_alt</span><h2 class="text-xl font-bold mt-1">This invoice is paid in full</h2><p class="mut mt-1">Thank you for your payment.</p>${online.length ? `<div class="mt-4 text-left">${online.map((x) => `<div class="pay-row"><span>${fd(x.date)} · ${E(x.method)}</span><span><b>${M(x.amount)}</b> <a class="rep-link text-sm" onclick="showPayReceipt('${E(x.id)}')">Receipt</a></span></div>`).join('')}</div>` : ''}</div>`
    );
    return;
  }
  if (!canPayOnline(i)) {
    app.innerHTML = shell(
      head +
        `<div class="card p-6 mt-3 text-center"><h2 class="text-lg font-bold">Online payment is not available</h2><p class="mut mt-1">Please pay by bank transfer${companyInfo().bank ? ':' : '.'}</p>${companyInfo().bank ? `<pre class="pay-bank">${E(companyInfo().bank)}</pre>` : ''}</div>`
    );
    return;
  }
  const methods = Object.keys(PAY_METHOD_INFO).filter((k) => p.methods[k]);
  if (!methods.includes(PAY.method)) PAY.method = methods[0];
  const tabs = methods
    .map((k) => {
      const [ic, label] = PAY_METHOD_INFO[k];
      return `<button type="button" class="pay-tab ${PAY.method === k ? 'on' : ''}" onclick="payPick('${k}')" aria-pressed="${PAY.method === k}"><span class="ms">${ic}</span><span>${label}</span></button>`;
    })
    .join('');
  const testBadge = `<div class="pay-test"><span class="ms">science</span><div><b>Test mode</b> · no real money moves. Connect a payment gateway for live ${PAY_METHOD_INFO[PAY.method][1].toLowerCase()} payments.</div></div>`;
  app.innerHTML = shell(
    head +
      `<div class="card mt-3 pay-card"><div class="pay-tabs" role="tablist">${tabs}</div><div class="pay-body">${testBadge}${payMethodBody(i, q, due)}</div></div>` +
      `<p class="mut text-xs text-center mt-3">Paying ${M(due)} for invoice ${E(i.invoiceNo)}.${contact ? ` Questions? ${contact}` : ''}</p>`
  );
}
function payPick(k) {
  PAY.method = k;
  renderPaymentPage();
}
function payMethodBody(i, q, due) {
  const btn = (label, extra = '') =>
    `<button class="btn btn-p pay-go" ${extra}><span class="ms">lock</span>${label}</button>`;
  if (PAY.method === 'card')
    return `<form class="pay-form" onsubmit="payByCard(event)" autocomplete="on"><label class="block">Card number<div class="pay-card-num"><input class="inp" name="num" inputmode="numeric" autocomplete="cc-number" placeholder="1234 5678 9012 3456" maxlength="23" required oninput="cardNumInput(this)"><span id="card-brand" class="pay-brand"></span></div></label><label class="block">Name on card<input class="inp" name="name" autocomplete="cc-name" required placeholder="As printed on the card"></label><div class="grid grid-cols-2 gap-3"><label class="block">Expiry (MM/YY)<input class="inp" name="exp" inputmode="numeric" autocomplete="cc-exp" placeholder="MM/YY" maxlength="5" required oninput="cardExpInput(this)"></label><label class="block">CVV<input class="inp" name="cvv" type="password" inputmode="numeric" autocomplete="cc-csc" placeholder="•••" maxlength="4" required oninput="this.value=this.value.replace(/\\D/g,'')"></label></div><div id="pay-err" class="pay-err" role="alert"></div>${btn('Pay ' + M(due))}<p class="mut text-xs">Your card details are never stored. Only the card type and last 4 digits are kept on the receipt.</p></form>`;
  if (PAY.method === 'netbanking')
    return `<form class="pay-form" onsubmit="payByBank(event)"><div class="pay-bank-grid">${PAY_BANKS.slice(
      0,
      6
    )
      .map(
        (b) =>
          `<label class="pay-bank-opt"><input type="radio" name="bank" value="${E(b)}" onchange="this.form.other.value=''"><span>${E(b)}</span></label>`
      )
      .join(
        ''
      )}</div><label class="block">Other bank<select class="inp" name="other" onchange="if(this.value)[...this.form.bank].forEach(r=>r.checked=false)"><option value="">Choose a bank</option>${PAY_BANKS.slice(
      6
    )
      .map((b) => `<option>${E(b)}</option>`)
      .join(
        ''
      )}</select></label><div id="pay-err" class="pay-err" role="alert"></div>${btn('Pay ' + M(due))}<p class="mut text-xs">You will sign in to your bank to approve the payment.</p></form>`;
  return `<form class="pay-form" onsubmit="payByWallet(event)"><div class="pay-bank-grid">${PAY_WALLETS.map((w) => `<label class="pay-bank-opt"><input type="radio" name="wallet" value="${E(w)}" required><span>${E(w)}</span></label>`).join('')}</div><div id="pay-err" class="pay-err" role="alert"></div>${btn('Pay ' + M(due))}</form>`;
}
function copyText(t, msg) {
  try {
    navigator.clipboard.writeText(t).then(() => toast(msg || 'Copied'));
  } catch (e) {
    prompt('Copy this', t);
  }
}

// --- card helpers ---
function cardBrand(num) {
  const n = String(num).replace(/\D/g, '');
  if (/^3[47]/.test(n)) return 'Amex';
  if (/^(508[5-9]|6069|607|608|6521|6522|817|819|82)/.test(n)) return 'RuPay';
  if (/^4/.test(n)) return 'Visa';
  if (/^(5[1-5]|2(2[2-9]|[3-6]\d|7[01]|720))/.test(n)) return 'Mastercard';
  if (/^(60|65)/.test(n)) return 'RuPay';
  return '';
}
function luhnOk(num) {
  const n = String(num).replace(/\D/g, '');
  if (n.length < 12 || n.length > 19) return false;
  let sum = 0;
  for (let k = 0; k < n.length; k++) {
    let d = +n[n.length - 1 - k];
    if (k % 2) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
  }
  return sum % 10 === 0;
}
function cardNumInput(el) {
  payError('');
  const d = el.value.replace(/\D/g, '').slice(0, 19),
    brand = cardBrand(d);
  el.value =
    brand === 'Amex'
      ? d.replace(/^(\d{4})(\d{0,6})(\d{0,5}).*/, (m, a, b, c) =>
          [a, b, c].filter(Boolean).join(' ')
        )
      : d.replace(/(\d{4})(?=\d)/g, '$1 ');
  const b = document.getElementById('card-brand');
  if (b) b.textContent = brand;
}
function cardExpInput(el) {
  const d = el.value.replace(/\D/g, '').slice(0, 4);
  el.value = d.length > 2 ? d.slice(0, 2) + '/' + d.slice(2) : d;
}
function payError(msg) {
  const el = document.getElementById('pay-err');
  if (el) el.textContent = msg;
  else toast(msg);
}
function currentPayInvoice() {
  const q = quoteByToken(location.hash.slice(5));
  return { q, i: invoiceOfQuote(q) };
}
// Simulated gateway round trip (test mode).
function gatewayRun(label, onDone) {
  if (PAY.busy) return;
  PAY.busy = true;
  $('#modal').innerHTML =
    `<div class="fixed inset-0 z-40 grid place-items-center p-4" style="background:rgba(0,0,0,.45)"><div class="card p-6 w-full max-w-sm text-center"><div class="pay-spin" aria-hidden="true"></div><b class="block mt-3">${E(label)}</b><p class="mut text-sm mt-1">Please do not close or refresh this page.</p><p class="pay-test-inline mt-3">Test mode</p></div></div>`;
  setTimeout(() => {
    $('#modal').innerHTML = '';
    PAY.busy = false;
    onDone();
  }, 1600);
}
function finishGatewayPayment(method, ref) {
  const { i } = currentPayInvoice();
  if (!i) return;
  const due = payableNow(i);
  if (due <= 0) return renderPaymentPage();
  const entry = recordClientPayment(i, {
    amount: due,
    method,
    ref,
    note: 'Paid online (test mode)',
    gateway: 'test',
  });
  PAY.receipt = entry.id;
  renderPaymentPage();
  scrollTo(0, 0);
}
function payByCard(e) {
  e.preventDefault();
  const v = Object.fromEntries(new FormData(e.target)),
    num = String(v.num || '').replace(/\D/g, ''),
    brand = cardBrand(num) || 'Card',
    [mm, yy] = String(v.exp || '')
      .split('/')
      .map((x) => +x),
    now = new Date(),
    cvvLen = brand === 'Amex' ? 4 : 3;
  if (!luhnOk(num)) return payError('Check the card number');
  if (!(mm >= 1 && mm <= 12) || !(yy >= 0)) return payError('Enter the expiry as MM/YY');
  const expEnd = new Date(2000 + yy, mm, 1);
  if (expEnd <= now) return payError('This card has expired');
  if (String(v.cvv || '').length !== cvvLen) return payError(`Enter the ${cvvLen}-digit CVV`);
  if (String(v.name || '').trim().length < 2) return payError('Enter the name on the card');
  payError('');
  const last4 = num.slice(-4);
  e.target.reset(); // card details are not kept anywhere
  gatewayRun('Processing your card payment…', () => {
    if (last4 === '0002') {
      renderPaymentPage();
      return payError('Your bank declined this payment. Try another card or method.');
    }
    finishGatewayPayment(`Card · ${brand} •••• ${last4}`, txnId('pay'));
  });
}
function payByBank(e) {
  e.preventDefault();
  const f = e.target,
    bank = (f.querySelector('input[name=bank]:checked') || {}).value || f.other.value;
  if (!bank) return payError('Choose your bank');
  gatewayRun(`Connecting to ${bank}…`, () =>
    finishGatewayPayment(`Net banking · ${bank}`, txnId('pay'))
  );
}
function payByWallet(e) {
  e.preventDefault();
  const w = (e.target.querySelector('input[name=wallet]:checked') || {}).value;
  if (!w) return payError('Choose a wallet');
  gatewayRun(`Opening ${w}…`, () => finishGatewayPayment(`Wallet · ${w}`, txnId('pay')));
}
// ---------- receipts ----------
function payReceiptCard(i, r, withActions) {
  return `<div class="card p-6 mt-3 pay-receipt"><div class="text-center"><span class="ms pay-big-ok">check_circle</span><h2 class="text-xl font-bold mt-1">Payment successful</h2><p class="mut">Thank you. A receipt is below.</p></div><div class="pay-rcpt-rows">${[
    ['Amount', `<b>${M(r.amount)}</b>`],
    ['Paid by', E(r.method)],
    ['Transaction ID', `<code>${E(r.ref)}</code>`],
    ['Date', whenText(r.at)],
    ['Invoice', E(i.invoiceNo)],
    ['Status', '<span class="chip ok">Received</span>'],
    ['Balance after this payment', M(r.balanceAfter ?? invBalance(i))],
  ]
    .map(([a, b]) => `<div class="pay-row"><span class="mut">${a}</span><span>${b}</span></div>`)
    .join(
      ''
    )}</div>${r.gateway === 'test' ? '<p class="pay-test-inline mt-2">Test mode payment · no money moved</p>' : ''}${withActions ? `<div class="flex justify-center gap-2 mt-4 flex-wrap"><button class="btn" onclick="printPayReceipt('${E(i.id)}','${E(r.id)}')"><span class="ms">download</span>Download receipt</button>${payableNow(i) > 0.5 ? `<button class="btn btn-p" onclick="PAY.receipt=null;renderPaymentPage()">Pay remaining ${M(payableNow(i))}</button>` : ''}</div>` : ''}</div>`;
}
function showPayReceipt(pid) {
  PAY.receipt = pid;
  renderPaymentPage();
}
function printPayReceipt(invId, pid) {
  const i = S.invoices.find((x) => x.id === invId),
    r = i && (i.payments || []).find((x) => x.id === pid);
  if (!i || !r) return;
  $('#modal').innerHTML =
    `<div class="fixed inset-0 z-40 grid place-items-center p-4" style="background:rgba(0,0,0,.5)"><div class="card p-6 w-full max-w-xl max-h-full overflow-auto doc-sheet">${docLetterhead(
      'PAYMENT RECEIPT',
      [
        ['Receipt', 'RCPT-' + String(r.id).slice(3).toUpperCase()],
        ['Invoice', i.invoiceNo],
        ['Date', fd(r.date)],
      ]
    )}<div class="mb-2"><div class="mut text-xs">Received from</div><b>${E(i.account)}</b></div>${payReceiptCard(i, r, false)}<div class="doc-foot">This is a computer generated receipt.</div><div class="flex justify-end gap-2 mt-4 no-print"><button class="btn" onclick="$('#modal').innerHTML=''">Close</button><button class="btn btn-p" onclick="window.print()">Print / Save PDF</button></div></div></div>`;
}

// ---------- routing for the client page ----------
function applyPaymentRoute() {
  if (paymentRoute()) {
    PAY = { method: PAY.method, step: 'choose', receipt: null, busy: false };
    renderPaymentPage();
  }
}
addEventListener('hashchange', applyPaymentRoute); // runs after the app's own hashchange renderers
addEventListener('storage', (e) => {
  if (e.key === KEY && paymentRoute() && !PAY.busy) renderPaymentPage();
});
setTimeout(applyPaymentRoute, 0);

// ---------- client quote page: "Pay now" once accepted ----------
const renderCustomerQuoteBeforePay = renderCustomerQuote;
renderCustomerQuote = function () {
  renderCustomerQuoteBeforePay.apply(this, arguments);
  const q = quoteByToken(location.hash.slice(4)),
    i = invoiceOfQuote(q);
  if (!q || !i || !q.customer || q.customer.status !== 'Accepted') return;
  const due = payableNow(i),
    card = document.createElement('div');
  card.className = 'card p-4 md:p-5 mt-3 pay-cta';
  card.innerHTML =
    i.status === 'Paid'
      ? `<span class="ms" style="color:var(--ok)">task_alt</span><div class="flex-1"><b>Invoice ${E(i.invoiceNo)} is paid</b><div class="mut text-sm">Thank you for your payment.</div></div><a class="btn" href="#pay/${E(q.token)}">View receipt</a>`
      : canPayOnline(i) && due > 0.5
        ? `<span class="ms" style="color:var(--pr)">payments</span><div class="flex-1"><b>Pay invoice ${E(i.invoiceNo)}</b><div class="mut text-sm">${M(due)} due · card, net banking or wallet</div></div><a class="btn btn-p" href="#pay/${E(q.token)}"><span class="ms">lock</span>Pay now</a>`
        : '';
  if (card.innerHTML) $('#app').appendChild(card);
};

// ---------- staff side ----------
function copyPaymentLink(invId) {
  const i = S.invoices.find((x) => x.id === invId);
  if (!i) return;
  if (!paySettings().enabled) return toast('Turn on online payments in Settings → Online payments');
  copyText(paymentLink(i), 'Payment link copied');
}
const reminderTextBeforePay = reminderText;
reminderText = function (i) {
  const t = reminderTextBeforePay.apply(this, arguments);
  return canPayOnline(i)
    ? t.replace(
        'Kindly arrange the payment at the earliest.',
        `Kindly arrange the payment at the earliest. You can pay online (card, net banking, wallet):\n${paymentLink(i)}`
      )
    : t;
};
// Invoice page: payment link and badges on online payments.
const invoiceDetailBeforePay = V['invoice-detail'];
V['invoice-detail'] = function () {
  let html = invoiceDetailBeforePay.apply(this, arguments);
  const i = S.invoices.find((x) => x.id === S.currentInvoice);
  if (!i) return html;
  const admin = canManageBilling();
  // badge the online rows in the payments table
  (i.payments || []).forEach((p) => {
    if (!p.online) return;
    const tag = p.pending
      ? ' <span class="chip wr">Not confirmed</span>'
      : p.gateway === 'test'
        ? ' <span class="chip">Online · test</span>'
        : ' <span class="chip ok">Online</span>';
    html = html.replace(
      `<td>${E(p.method)}</td><td>${E(p.ref || '–')}</td>`,
      `<td>${E(p.method)}${tag}</td><td>${E(p.ref || '–')}</td>`
    );
  });
  if (admin && canPayOnline(i))
    html = html.replace(
      '<button class="btn" onclick="openInvoiceSheet(',
      `<button class="btn" onclick="copyPaymentLink('${E(i.id)}')"><span class="ms">link</span>Copy payment link</button><button class="btn" onclick="openInvoiceSheet(`
    );
  return html;
};

// Pop-ups for the team about online payments.
const showBillPopupBeforePay = showBillPopup;
showBillPopup = function (p) {
  if (p.kind !== 'bill-online') return showBillPopupBeforePay.apply(this, arguments);
  const i = S.invoices.find((x) => x.id === p.inv),
    pay = i && (i.payments || []).find((x) => x.id === p.pay);
  if (!i) return showNextPopup();
  showPopup({
    tone: 'ok',
    icon: 'payments',
    title: `${E(i.account)} paid ${pay ? M(pay.amount) : ''} online`,
    lines: [
      pay ? `${E(pay.method)} · Ref <code>${E(pay.ref)}</code> · ${whenText(pay.at)}` : '',
      `Balance due now ${M(invBalance(i))}.`,
      pay && pay.gateway === 'test'
        ? '<span class="mut">Test mode payment: no money moved.</span>'
        : '',
    ],
    actions: canSeeInvoices()
      ? [{ label: `Open ${i.invoiceNo}`, js: `openInvoice('${E(i.id)}')` }]
      : [],
  });
};
