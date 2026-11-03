// Billing: GST-ready invoices, partial payments and balance due, overdue reminders,
// invoice PDF (print), and the Close Won prompt once an invoice is paid in full.

// ---------- company & GST settings ----------
const INDIAN_STATES = {
  '01': 'Jammu & Kashmir',
  '02': 'Himachal Pradesh',
  '03': 'Punjab',
  '04': 'Chandigarh',
  '05': 'Uttarakhand',
  '06': 'Haryana',
  '07': 'Delhi',
  '08': 'Rajasthan',
  '09': 'Uttar Pradesh',
  10: 'Bihar',
  11: 'Sikkim',
  12: 'Arunachal Pradesh',
  13: 'Nagaland',
  14: 'Manipur',
  15: 'Mizoram',
  16: 'Tripura',
  17: 'Meghalaya',
  18: 'Assam',
  19: 'West Bengal',
  20: 'Jharkhand',
  21: 'Odisha',
  22: 'Chhattisgarh',
  23: 'Madhya Pradesh',
  24: 'Gujarat',
  26: 'Dadra & Nagar Haveli and Daman & Diu',
  27: 'Maharashtra',
  29: 'Karnataka',
  30: 'Goa',
  31: 'Lakshadweep',
  32: 'Kerala',
  33: 'Tamil Nadu',
  34: 'Puducherry',
  35: 'Andaman & Nicobar',
  36: 'Telangana',
  37: 'Andhra Pradesh',
  38: 'Ladakh',
};
const GSTIN_RX = /^\d{2}[A-Z]{5}\d{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;
const stateOfGstin = (g) => INDIAN_STATES[String(g || '').slice(0, 2)] || '';
const stateOptions = (sel) =>
  `<option value="">Select state…</option>` +
  Object.values(INDIAN_STATES)
    .sort()
    .map((s) => `<option ${s === sel ? 'selected' : ''}>${E(s)}</option>`)
    .join('');
function companyInfo() {
  S.settings = S.settings || {};
  const c = S.settings.company || (S.settings.company = {});
  if (c.defaultGst === undefined) c.defaultGst = 18;
  if (!c.priceMode) c.priceMode = 'inclusive';
  if (c.gstEnabled === undefined) c.gstEnabled = true;
  if (c.reminderEveryDays === undefined) c.reminderEveryDays = 3;
  return c;
}
const canManageBilling = () => ['admin', 'ceo'].includes(S.role);

SETTINGS_PANELS.company = function () {
  const c = companyInfo(),
    ok = canManageBilling(),
    dis = ok ? '' : 'disabled',
    f = (label, name, val, extra = '') =>
      settingsField(
        label,
        `<input class="inp" name="${name}" value="${E(val || '')}" ${dis} ${extra}>`
      );
  return (
    secHead(
      'receipt_long',
      'Company & GST',
      'Printed on every invoice. Needed for GST-ready tax invoices.'
    ) +
    `<form class="grid md:grid-cols-2 gap-3" onsubmit="saveCompany(event)">` +
    f('Company name *', 'name', c.name, 'required') +
    f(
      'GSTIN',
      'gstin',
      c.gstin,
      'maxlength="15" placeholder="27ABCDE1234F1Z5" style="text-transform:uppercase"'
    ) +
    f('PAN', 'pan', c.pan, 'maxlength="10"') +
    settingsField(
      'State (place of supply for your business) *',
      `<select class="inp" name="state" ${dis}>${stateOptions(c.state)}</select>`
    ) +
    `<div class="md:col-span-2">${settingsField('Registered address', `<textarea class="inp" name="address" rows="3" ${dis}>${E(c.address || '')}</textarea>`)}</div>` +
    f('Email', 'email', c.email, 'type="email"') +
    f('Phone', 'phone', c.phone) +
    settingsField(
      'GST on invoices',
      `<select class="inp" name="gstEnabled" ${dis}><option value="yes" ${c.gstEnabled ? 'selected' : ''}>Charge GST</option><option value="no" ${!c.gstEnabled ? 'selected' : ''}>No GST (plain invoice)</option></select>`
    ) +
    settingsField(
      'Default GST rate % (when a product has none)',
      `<input class="inp" name="defaultGst" type="number" min="0" max="40" step="0.01" value="${c.defaultGst}" ${dis}>`
    ) +
    settingsField(
      'Prices on quotes are',
      `<select class="inp" name="priceMode" ${dis}><option value="inclusive" ${c.priceMode === 'inclusive' ? 'selected' : ''}>GST inclusive (invoice total = quote total)</option><option value="exclusive" ${c.priceMode === 'exclusive' ? 'selected' : ''}>GST exclusive (GST added on top)</option></select>`
    ) +
    settingsField(
      'Remind about overdue invoices every (days)',
      `<input class="inp" name="reminderEveryDays" type="number" min="1" max="60" value="${c.reminderEveryDays}" ${dis}>`
    ) +
    `<div class="md:col-span-2">${settingsField('Bank details (shown on invoice)', `<textarea class="inp" name="bank" rows="3" ${dis} placeholder="Bank, A/c no., IFSC, UPI">${E(c.bank || '')}</textarea>`)}</div>` +
    (ok
      ? `<div class="md:col-span-2 flex justify-end"><button class="btn btn-p">Save company details</button></div>`
      : '<p class="mut md:col-span-2">Only Admin and CEO can change these details.</p>') +
    `</form>`
  );
};
function saveCompany(e) {
  e.preventDefault();
  if (!canManageBilling()) return toast('Only Admin and CEO can change company details');
  const v = Object.fromEntries(new FormData(e.target)),
    gstin = (v.gstin || '').trim().toUpperCase();
  if (!(v.name || '').trim()) return toast('Enter the company name');
  if (gstin && !GSTIN_RX.test(gstin))
    return toast('That GSTIN does not look right (15 characters)');
  const state = v.state || stateOfGstin(gstin);
  if (gstin && stateOfGstin(gstin) && state && stateOfGstin(gstin) !== state)
    return toast('GSTIN state code does not match the selected state');
  const rate = +v.defaultGst;
  if (!(rate >= 0 && rate <= 40)) return toast('Enter a GST rate between 0 and 40');
  Object.assign(companyInfo(), {
    name: v.name.trim(),
    gstin,
    pan: (v.pan || '').trim().toUpperCase(),
    state,
    address: (v.address || '').trim(),
    email: (v.email || '').trim(),
    phone: (v.phone || '').trim(),
    bank: (v.bank || '').trim(),
    gstEnabled: v.gstEnabled === 'yes',
    defaultGst: rate,
    priceMode: v.priceMode,
    reminderEveryDays: Math.max(1, Math.floor(+v.reminderEveryDays || 3)),
  });
  save();
  toast('Company details saved');
  render();
}
const SETTINGS_SECTIONS_BeforeBilling = SETTINGS_SECTIONS;
SETTINGS_SECTIONS = function () {
  const base = SETTINGS_SECTIONS_BeforeBilling.apply(this, arguments);
  if (S.role !== 'rep' && !base.some((s) => s[0] === 'company'))
    base.splice(
      Math.max(
        0,
        base.findIndex((s) => s[0] === 'limits')
      ),
      0,
      ['company', 'Company & GST', 'receipt_long']
    );
  return base;
};

// ---------- account GSTIN / state ----------
const accountGst = (name) => {
  const a = (S.accountInfo || {})[name] || {};
  return { gstin: a.gstin || '', state: a.state || stateOfGstin(a.gstin) };
};
const openAccountEditorBeforeGst = openAccountEditor;
openAccountEditor = function (name) {
  openAccountEditorBeforeGst.apply(this, arguments);
  const form = $('#modal form');
  if (!form) return;
  const g = accountGst(name),
    block = document.createElement('div');
  block.className = 'grid grid-cols-2 gap-3';
  block.innerHTML = `<label class="block">GSTIN<input class="inp mt-1" name="gstin" maxlength="15" value="${E(g.gstin)}" placeholder="Customer GSTIN" style="text-transform:uppercase"></label><label class="block">State<select class="inp mt-1" name="state">${stateOptions(g.state)}</select></label>`;
  form.querySelector('.flex.justify-end').before(block);
};
const saveAccountAddressBeforeGst = saveAccountAddress;
saveAccountAddress = function (e, name) {
  if (!canEditAddress()) return saveAccountAddressBeforeGst.apply(this, arguments);
  const v = Object.fromEntries(new FormData(e.target)),
    gstin = (v.gstin || '').trim().toUpperCase();
  if (gstin && !GSTIN_RX.test(gstin)) {
    e.preventDefault();
    return toast('That GSTIN does not look right (15 characters)');
  }
  saveAccountAddressBeforeGst.apply(this, arguments);
  if (S.accountInfo[name]) {
    S.accountInfo[name].gstin = gstin;
    S.accountInfo[name].state = v.state || stateOfGstin(gstin);
    save();
  }
};

// ---------- tax calculation ----------
const r2 = (n) => Math.round((Number(n) || 0) * 100) / 100;
function liveGst(i) {
  const c = companyInfo(),
    a = accountGst(i.account),
    info = (S.accountInfo || {})[i.account] || {},
    rates = {},
    hsn = {};
  (i.items || []).forEach((it) => {
    const p = S.products.find((x) => x.code === it.c) || {};
    rates[it.c] = c.gstEnabled
      ? p.gst !== undefined && p.gst !== '' && p.gst !== null
        ? +p.gst
        : +c.defaultGst || 0
      : 0;
    hsn[it.c] = p.hsn || '';
  });
  return {
    enabled: !!c.gstEnabled,
    mode: c.priceMode,
    intra: !(c.state && a.state) || c.state === a.state,
    rates,
    hsn,
    company: {
      name: c.name,
      gstin: c.gstin,
      pan: c.pan,
      state: c.state,
      address: c.address,
      email: c.email,
      phone: c.phone,
      bank: c.bank,
    },
    customer: {
      gstin: a.gstin,
      state: a.state,
      address: info.address || '',
      shipping: info.shipping || '',
    },
  };
}
const invGst = (i) => i.gst || liveGst(i);
function invoiceCalc(i) {
  const g = invGst(i);
  const lines = (i.items || []).map((it) => {
    const net = it.p * (1 - (it.d || 0) / 100) * it.q,
      rate = +g.rates[it.c] || 0,
      taxable = g.mode === 'inclusive' ? net / (1 + rate / 100) : net,
      tax = (taxable * rate) / 100;
    return {
      it,
      rate,
      hsn: g.hsn[it.c] || '',
      taxable: r2(taxable),
      cgst: g.intra ? r2(tax / 2) : 0,
      sgst: g.intra ? r2(tax / 2) : 0,
      igst: g.intra ? 0 : r2(tax),
      amount: r2(taxable + tax),
    };
  });
  const sum = (k) => r2(lines.reduce((s, l) => s + l[k], 0)),
    gross = sum('amount'),
    payable = Math.round(gross),
    byRate = {};
  lines.forEach((l) => {
    const k = l.hsn + '|' + l.rate,
      r =
        byRate[k] ||
        (byRate[k] = { hsn: l.hsn, rate: l.rate, taxable: 0, cgst: 0, sgst: 0, igst: 0 });
    ['taxable', 'cgst', 'sgst', 'igst'].forEach((f) => (r[f] = r2(r[f] + l[f])));
  });
  return {
    g,
    lines,
    taxable: sum('taxable'),
    cgst: sum('cgst'),
    sgst: sum('sgst'),
    igst: sum('igst'),
    gross,
    roundOff: r2(payable - gross),
    payable,
    summary: Object.values(byRate),
  };
}
function rupeesInWords(n) {
  n = Math.round(Number(n) || 0);
  if (n === 0) return 'Zero Rupees Only';
  const ones = [
      '',
      'One',
      'Two',
      'Three',
      'Four',
      'Five',
      'Six',
      'Seven',
      'Eight',
      'Nine',
      'Ten',
      'Eleven',
      'Twelve',
      'Thirteen',
      'Fourteen',
      'Fifteen',
      'Sixteen',
      'Seventeen',
      'Eighteen',
      'Nineteen',
    ],
    tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'],
    two = (x) => (x < 20 ? ones[x] : tens[Math.floor(x / 10)] + (x % 10 ? ' ' + ones[x % 10] : '')),
    three = (x) =>
      x >= 100
        ? ones[Math.floor(x / 100)] + ' Hundred' + (x % 100 ? ' ' + two(x % 100) : '')
        : two(x);
  const parts = [];
  [
    [1e7, 'Crore'],
    [1e5, 'Lakh'],
    [1e3, 'Thousand'],
  ].forEach(([d, name]) => {
    const q = Math.floor(n / d);
    if (q) parts.push(three(q) + ' ' + name);
    n %= d;
  });
  if (n) parts.push(three(n));
  return parts.join(' ') + ' Rupees Only';
}

// ---------- payments ----------
const PAY_METHODS = ['Bank transfer (NEFT/RTGS/IMPS)', 'UPI', 'Cheque', 'Cash', 'Card', 'Other'];
const invPayable = (i) => invoiceCalc(i).payable;
function invPaid(i) {
  if (!(i.payments || []).length) return i.status === 'Paid' ? invPayable(i) : 0;
  return r2(i.payments.reduce((s, p) => s + p.amount, 0));
}
const invBalance = (i) => Math.max(0, r2(invPayable(i) - invPaid(i)));
function invDueDate(i) {
  if (i.dueDate) return i.dueDate;
  const t = String(i.terms || ''),
    n = /receipt|immediate/i.test(t) ? 0 : (t.match(/(\d+)/) || [0, 30])[1],
    base = new Date(i.sentAt || i.generatedAt || Date.now());
  return new Date(base.getTime() + n * 864e5).toISOString().slice(0, 10);
}
const invIsOpen = (i) => ['Submitted to client', 'Partially paid'].includes(i.status);
const invOverdueDays = (i) =>
  invIsOpen(i) && invBalance(i) > 0 ? Math.max(0, -days(invDueDate(i))) : 0;
const invStatusChip = (i) => {
  const od = invOverdueDays(i);
  return i.status === 'Paid'
    ? '<span class="chip ok">Paid</span>'
    : od
      ? `<span class="chip" style="background:var(--err);color:#fff">Overdue ${od}d</span>`
      : i.status === 'Partially paid'
        ? '<span class="chip wr">Partially paid</span>'
        : `<span class="chip">${E(i.status)}</span>`;
};
function openPaymentForm(id) {
  const i = S.invoices.find((x) => x.id === id);
  if (!i) return;
  if (!canManageBilling()) return toast('Only Admin and CEO can record payments');
  if (!invIsOpen(i))
    return toast(
      i.status === 'Paid'
        ? 'This invoice is already paid'
        : 'Submit the invoice to the client first'
    );
  $('#modal').innerHTML =
    `<div class="fixed inset-0 z-40 grid place-items-center p-4" style="background:rgba(0,0,0,.5)"><form class="card p-5 w-full max-w-md max-h-full overflow-auto space-y-3" onsubmit="recordPayment(event,'${E(id)}')"><h2 class="text-lg font-bold">Record payment — ${E(i.invoiceNo)}</h2>` +
    `<div class="p-3 rounded text-sm" style="background:var(--hov)">Invoice total <b>${M(invPayable(i))}</b> · Received <b>${M(invPaid(i))}</b> · Balance due <b>${M(invBalance(i))}</b></div>` +
    `<label class="block">Amount received (₹) *<input class="inp" name="amount" type="number" min="1" max="${invBalance(i)}" step="0.01" required value="${invBalance(i)}"></label>` +
    `<label class="block">Date received *<input class="inp" name="date" type="date" required value="${D(0)}" max="${D(0)}"></label>` +
    `<label class="block">Method<select class="inp" name="method">${PAY_METHODS.map((m) => `<option>${m}</option>`).join('')}</select></label>` +
    `<label class="block">Reference (UTR / cheque no.)<input class="inp" name="ref"></label>` +
    `<label class="block">Note<input class="inp" name="note"></label>` +
    `<div class="flex justify-end gap-2"><button type="button" class="btn" onclick="$('#modal').innerHTML=''">Cancel</button><button class="btn btn-p">Record payment</button></div></form></div>`;
  $('#modal [name=amount]').focus();
}
function recordPayment(e, id) {
  e.preventDefault();
  const i = S.invoices.find((x) => x.id === id),
    v = Object.fromEntries(new FormData(e.target)),
    amt = r2(v.amount);
  if (!i || !canManageBilling() || !invIsOpen(i)) return;
  if (!(amt > 0)) return toast('Enter the amount received');
  if (amt > invBalance(i) + 0.001)
    return toast(`Amount is more than the balance due (${M(invBalance(i))})`);
  if (!v.date || v.date > D(0)) return toast('Payment date cannot be in the future');
  i.gst = i.gst || liveGst(i); // freeze the tax figures once money is received
  if (!(i.payments || []).length && i.status === 'Paid') i.payments = [];
  i.payments = [
    ...(i.payments || []),
    {
      id: 'pay' + Date.now().toString(36),
      amount: amt,
      date: v.date,
      method: v.method,
      ref: (v.ref || '').trim(),
      note: (v.note || '').trim(),
      by: roleNow().name,
      at: Date.now(),
    },
  ];
  const left = invBalance(i);
  i.status = left <= 0.5 ? 'Paid' : 'Partially paid';
  logOpp(
    i.opp,
    'sync',
    `Payment of ${M(amt)} recorded on ${i.invoiceNo} by ${roleNow().name}${left > 0.5 ? ` · balance ${M(left)}` : ' · paid in full'}`
  );
  if (i.status === 'Paid') {
    i.paidAt = Date.now();
    const q = S.quotes.find((x) => x.no === i.quoteNo);
    if (q) q.status = 'Paid';
    const o = S.opps.find((x) => x.id == i.opp);
    if (o && !(o.stage === 5 && !o.lost))
      queuePopup({ kind: 'bill-paidfull', inv: i.id, toRole: 'admin', by: S.authUser });
  }
  $('#modal').innerHTML = '';
  save();
  if (i.status === 'Paid') setTimeout(() => showBillPopup({ kind: 'bill-paidfull', inv: i.id }), 0);
  toast(i.status === 'Paid' ? 'Paid in full' : `Payment recorded · balance ${M(left)}`);
  render();
}
function deletePayment(id, pid) {
  const i = S.invoices.find((x) => x.id === id);
  if (!i || !canManageBilling() || !confirm('Remove this payment entry?')) return;
  const o = S.opps.find((x) => x.id == i.opp);
  if (o && o.stage === 5 && !o.lost) return toast('The deal is already Closed Won');
  i.payments = (i.payments || []).filter((p) => p.id !== pid);
  i.status = !i.payments.length
    ? 'Submitted to client'
    : invBalance(i) <= 0.5
      ? 'Paid'
      : 'Partially paid';
  if (i.status !== 'Paid') {
    delete i.paidAt;
    const q = S.quotes.find((x) => x.no === i.quoteNo);
    if (q && q.status === 'Paid') q.status = 'Sent to client';
  }
  logOpp(i.opp, 'sync', `A payment entry was removed from ${i.invoiceNo} by ${roleNow().name}`);
  save();
  render();
}
// the old "Mark as paid" now records the full balance
markInvoicePaid = function (id) {
  const i = S.invoices.find((x) => x.id === id);
  if (!i) return;
  openPaymentForm(id);
};
const sendInvoiceBeforeBilling = sendInvoice;
sendInvoice = function (id) {
  const i = S.invoices.find((x) => x.id === id);
  if (i && !i.gst) {
    i.gst = liveGst(i); // tax details are fixed once the invoice goes to the client
    i.dueDate = undefined;
  }
  sendInvoiceBeforeBilling.apply(this, arguments);
  if (i) {
    i.dueDate = invDueDate(i);
    save();
  }
};

// ---------- Close Won prompt ----------
function showBillPopup(p) {
  const i = S.invoices.find((x) => x.id === p.inv),
    o = i && S.opps.find((x) => x.id == i.opp);
  if (!i && p.kind !== 'bill-overdue') return;
  if (p.kind === 'bill-paidfull')
    return showPopup({
      tone: 'ok',
      icon: 'paid',
      title: `${E(i.invoiceNo)} is paid in full`,
      lines: [
        `${E(i.account)} has paid ${M(invPayable(i))}.`,
        o ? `Mark <b>${E(o.name)}</b> as Closed Won?` : '',
      ],
      actions:
        o && !(o.stage === 5 && !o.lost)
          ? [{ label: 'Mark Closed Won', js: `openClosedWon(S.opps.find(x=>x.id==${o.id}))` }]
          : [],
    });
  if (p.kind === 'bill-overdue') {
    const list = S.invoices
      .filter((x) => invOverdueDays(x) > 0)
      .sort((a, b) => invOverdueDays(b) - invOverdueDays(a));
    return showPopup({
      tone: 'err',
      icon: 'schedule',
      title: `${list.length} overdue invoice${list.length === 1 ? '' : 's'}`,
      lines: list
        .slice(0, 5)
        .map(
          (x) =>
            `<b>${E(x.invoiceNo)}</b> · ${E(x.account)} · ${M(invBalance(x))} · ${invOverdueDays(x)} days late`
        )
        .concat(list.length > 5 ? [`and ${list.length - 5} more`] : []),
      actions: [{ label: 'View overdue', js: `S.invFilter='overdue';nav('invoices')` }],
    });
  }
}
// One overdue digest per person per day.
function queueOverdueDigest() {
  if (!S.authUser || !canSeeInvoices()) return;
  const k = S.authUser + '|' + D(0);
  S.overdueSeen = S.overdueSeen || {};
  if (S.overdueSeen[k] || !S.invoices.some((x) => invOverdueDays(x) > 0)) return;
  S.overdueSeen[k] = 1;
  queuePopup({ kind: 'bill-overdue', toUser: S.authUser, id_: k });
  save();
  setTimeout(showNextPopup, 0);
}
// Safety net: an invoice paid in full whose deal is still open reminds Admin / CEO on the deal and invoice pages.
const needsCloseWon = (i) => {
  const o = S.opps.find((x) => x.id == i.opp);
  return i.status === 'Paid' && o && !(o.stage === 5 && !o.lost) && canManageBilling();
};

// ---------- reminders ----------
function reminderText(i) {
  const c = companyInfo(),
    od = invOverdueDays(i);
  return `Hello,\n\nThis is a friendly reminder that invoice ${i.invoiceNo} for ${i.account} ${od ? `was due on ${fd(invDueDate(i))} and is now ${od} day${od === 1 ? '' : 's'} overdue` : `is due on ${fd(invDueDate(i))}`}.\n\nInvoice total: ${M(invPayable(i))}\nReceived: ${M(invPaid(i))}\nBalance due: ${M(invBalance(i))}\n\nKindly arrange the payment at the earliest.${c.bank ? '\n\nBank details:\n' + c.bank : ''}\n\nThank you,\n${roleNow().name}\n${c.name || ''}`;
}
function openReminder(id) {
  const i = S.invoices.find((x) => x.id === id);
  if (!i || !canManageBilling()) return toast('Only Admin and CEO can send reminders');
  const q = S.quotes.find((x) => x.no === i.quoteNo) || {},
    ch = S.sendChan === 'whatsapp' ? 'whatsapp' : 'email';
  $('#modal').innerHTML =
    `<div class="fixed inset-0 z-40 grid place-items-center p-4" style="background:rgba(0,0,0,.5)"><form class="card p-5 w-full max-w-lg max-h-full overflow-auto space-y-3" onsubmit="sendReminder(event,'${E(id)}')"><h2 class="text-lg font-bold">Payment reminder — ${E(i.invoiceNo)}</h2>` +
    `<div class="flex gap-2"><button type="button" class="btn ${ch === 'email' ? 'btn-p' : ''}" onclick="S.sendChan='email';openReminder('${E(id)}')"><span class="ms">mail</span>Email</button><button type="button" class="btn ${ch === 'whatsapp' ? 'btn-p' : ''}" onclick="S.sendChan='whatsapp';openReminder('${E(id)}')"><span class="ms">chat</span>WhatsApp</button></div><input type="hidden" name="chan" value="${ch}">` +
    (ch === 'email'
      ? `<label class="block">To (email) *<input class="inp" type="email" name="to" required value="${E(q.toEmail || '')}"></label><label class="block">Subject<input class="inp" name="subject" value="${E(`Payment reminder – ${i.invoiceNo}`)}"></label>`
      : `<label class="block">WhatsApp number *<input class="inp" type="tel" name="to" required value="${E(q.toPhone || '')}"></label>`) +
    `<label class="block">Message<textarea class="inp" name="msg" rows="9">${E(reminderText(i))}</textarea></label>` +
    `<div class="flex justify-end gap-2"><button type="button" class="btn" onclick="$('#modal').innerHTML=''">Cancel</button><button class="btn btn-p">${ch === 'email' ? 'Open email' : 'Open WhatsApp'}</button></div></form></div>`;
}
function sendReminder(e, id) {
  e.preventDefault();
  const i = S.invoices.find((x) => x.id === id),
    v = Object.fromEntries(new FormData(e.target)),
    to = (v.to || '').trim();
  if (!i || !to) return;
  if (v.chan === 'email' && !/^\S+@\S+\.\S+$/.test(to)) return toast('Enter a valid email address');
  if (v.chan === 'whatsapp' && phoneDigits(to).length < 11)
    return toast('Enter the number with country code');
  const url =
    v.chan === 'email'
      ? `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(v.subject || '')}&body=${encodeURIComponent(v.msg || '')}`
      : `https://wa.me/${phoneDigits(to)}?text=${encodeURIComponent(v.msg || '')}`;
  i.reminders = [
    ...(i.reminders || []),
    { channel: v.chan, to, at: Date.now(), by: roleNow().name },
  ];
  logOpp(
    i.opp,
    v.chan === 'email' ? 'mail' : 'sync',
    `Payment reminder for ${i.invoiceNo} sent to ${to} (${roleNow().name})`
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
  toast('Reminder ready to send');
  render();
}
const lastReminder = (i) => (i.reminders || []).slice(-1)[0];
const reminderDue = (i) =>
  invOverdueDays(i) > 0 &&
  (!lastReminder(i) || Date.now() - lastReminder(i).at > companyInfo().reminderEveryDays * 864e5);

// notifications: overdue and due-soon invoices
const allNotificationItemsBeforeBilling = allNotificationItems;
allNotificationItems = function () {
  const items = allNotificationItemsBeforeBilling.apply(this, arguments);
  if (!canSeeInvoices()) return items;
  const extra = [];
  S.invoices.forEach((i) => {
    if (!invIsOpen(i)) {
      if (needsCloseWon(i))
        extra.push({
          icon: 'paid',
          text: `${i.invoiceNo} is paid – close the deal`,
          sub: E(i.account),
          go: `openInvoice('${E(i.id)}')`,
        });
      return;
    }
    const od = invOverdueDays(i),
      left = days(invDueDate(i));
    if (od)
      extra.push({
        icon: 'schedule',
        text: `${i.invoiceNo} is ${od} day${od === 1 ? '' : 's'} overdue`,
        sub: `${E(i.account)} · balance ${M(invBalance(i))}`,
        go: `openInvoice('${E(i.id)}')`,
      });
    else if (left <= 3)
      extra.push({
        icon: 'event',
        text: `${i.invoiceNo} is due ${left === 0 ? 'today' : 'in ' + left + ' days'}`,
        sub: `${E(i.account)} · balance ${M(invBalance(i))}`,
        go: `openInvoice('${E(i.id)}')`,
      });
  });
  return extra.concat(items);
};
const renderBeforeBilling = render;
render = function () {
  renderBeforeBilling.apply(this, arguments);
  queueOverdueDigest();
};

// ---------- invoice pages ----------
V.invoices = () => {
  const all = S.invoices.filter(
      (i) => S.role !== 'rep' || visibleOpps().some((o) => o.id == i.opp)
    ),
    f = S.invFilter || 'all',
    open = all.filter(invIsOpen),
    od = all.filter((i) => invOverdueDays(i) > 0),
    pass = {
      all: () => true,
      unpaid: (i) => i.status !== 'Paid',
      overdue: (i) => invOverdueDays(i) > 0,
      paid: (i) => i.status === 'Paid',
    },
    list = all.filter(pass[f] || pass.all),
    tile = (label, val, sub = '') =>
      `<div class="card p-3 flex-1 min-w-[150px]"><div class="mut text-xs">${label}</div><div class="text-xl font-bold">${val}</div><div class="mut text-xs">${sub}</div></div>`,
    chip = (k, l) =>
      `<button class="btn ${f === k ? 'btn-p' : ''}" onclick="S.invFilter='${k}';render()">${l}</button>`;
  return (
    `<h1 class="text-xl font-bold mb-3">Invoices</h1><div class="flex gap-3 flex-wrap mb-3">${tile('Outstanding', M(open.reduce((s, i) => s + invBalance(i), 0)), open.length + ' open invoices')}${tile('Overdue', `<span style="color:var(--err)">${M(od.reduce((s, i) => s + invBalance(i), 0))}</span>`, od.length + ' invoices')}${tile('Received', M(all.reduce((s, i) => s + invPaid(i), 0)))}</div>` +
    `<div class="flex gap-2 flex-wrap mb-3">${chip('all', 'All')}${chip('unpaid', 'Unpaid')}${chip('overdue', 'Overdue')}${chip('paid', 'Paid')}</div>` +
    table(
      ['Invoice no.', 'Quotation no.', 'Customer', 'Total', 'Paid', 'Balance', 'Due', 'Status'],
      list
        .map(
          (i) =>
            `<tr class="r" onclick="openInvoice('${i.id}')"><td><b>${i.invoiceNo}</b></td><td>${i.quoteNo}</td><td>${E(i.account)}</td><td>${M(invPayable(i))}</td><td>${M(invPaid(i))}</td><td><b>${M(invBalance(i))}</b></td><td>${invIsOpen(i) ? fd(invDueDate(i)) : '–'}</td><td>${invStatusChip(i)}</td></tr>`
        )
        .join('')
    )
  );
};
V['invoice-detail'] = () => {
  const i = S.invoices.find((x) => x.id === S.currentInvoice);
  if (!i) return V.invoices();
  const c = invoiceCalc(i),
    admin = canManageBilling(),
    od = invOverdueDays(i),
    last = lastReminder(i);
  const pays = (i.payments || []).length
    ? `<table class="w-full text-sm"><thead><tr><th class="text-left">Date</th><th class="text-left">Method</th><th class="text-left">Reference</th><th class="text-right">Amount</th><th class="text-left">By</th><th></th></tr></thead><tbody>${i.payments.map((p) => `<tr><td>${fd(p.date)}</td><td>${E(p.method)}</td><td>${E(p.ref || '–')}</td><td class="text-right"><b>${M(p.amount)}</b></td><td>${E(p.by)}</td><td>${admin ? `<button class="btn" aria-label="Remove payment" onclick="deletePayment('${E(i.id)}','${E(p.id)}')"><span class="ms">delete</span></button>` : ''}</td></tr>`).join('')}</tbody></table>`
    : i.status === 'Paid'
      ? '<p class="mut">Marked as paid.</p>'
      : '<p class="mut">No payments recorded yet.</p>';
  return (
    `<div class="mut cursor-pointer mb-2" onclick="nav('invoices')">‹ Back to invoices</div><div class="card p-5"><div class="flex gap-3 flex-wrap items-start"><div style="flex:1 1 220px"><h1 class="text-xl font-bold">Invoice ${E(i.invoiceNo)} ${invStatusChip(i)}</h1><p class="mut">From quotation ${E(i.quoteNo)} · Terms ${E(i.terms)}${invIsOpen(i) || i.status === 'Paid' ? ' · Due ' + fd(invDueDate(i)) : ''}</p></div><div class="flex gap-2 flex-wrap"><button class="btn" onclick="openInvoiceSheet('${E(i.id)}')"><span class="ms">description</span>View GST invoice</button><button class="btn" onclick="printInvoice('${E(i.id)}')"><span class="ms">picture_as_pdf</span>Download PDF</button></div></div>` +
    (needsCloseWon(i)
      ? `<div class="qt-banner ok mt-3"><span class="ms">paid</span><div><b>Paid in full</b><div>Close the deal once the payment has cleared.</div></div><button class="btn btn-p" onclick="openClosedWon(S.opps.find(x=>x.id==${i.opp}))">Mark Closed Won</button></div>`
      : '') +
    (od
      ? `<div class="qt-banner wr mt-3"><span class="ms">schedule</span><div><b>${od} day${od === 1 ? '' : 's'} overdue</b><div>${last ? `Last reminder ${ago(last.at)} to ${E(last.to)}` : 'No reminder sent yet'}</div></div>${admin ? `<button class="btn btn-p" onclick="openReminder('${E(i.id)}')">Send reminder</button>` : ''}</div>`
      : '') +
    `<div class="mt-4"><b>${E(i.account)}</b><div class="mut">${E(i.opportunity)}</div></div><div class="overflow-x-auto">${billLinesTable(i.items, !!i.showDiscount)}</div>` +
    `<div class="grid sm:grid-cols-2 gap-4 mt-3"><div>${invoiceTermsBlock(i)}</div><div class="text-sm"><div class="flex justify-between"><span>Taxable value</span><span>${M(c.taxable)}</span></div>${c.g.intra ? `<div class="flex justify-between"><span>CGST</span><span>${M(c.cgst)}</span></div><div class="flex justify-between"><span>SGST</span><span>${M(c.sgst)}</span></div>` : `<div class="flex justify-between"><span>IGST</span><span>${M(c.igst)}</span></div>`}<div class="flex justify-between text-lg font-bold mt-1"><span>Grand total</span><span>${M(c.payable)}</span></div><div class="flex justify-between"><span>Received</span><span>${M(invPaid(i))}</span></div><div class="flex justify-between text-lg font-bold" style="color:${invBalance(i) ? 'var(--err)' : 'var(--ok)'}"><span>Balance due</span><span>${M(invBalance(i))}</span></div></div></div>` +
    `<div class="mt-4"><b>Payments</b><div class="overflow-x-auto">${pays}</div></div>` +
    `<div class="flex justify-end gap-2 mt-4 flex-wrap">${!invIsOpen(i) && i.status !== 'Paid' ? `<button class="btn btn-p" onclick="sendInvoice('${E(i.id)}')">Submit to client</button>` : ''}${admin && invIsOpen(i) ? `<button class="btn btn-p" onclick="openPaymentForm('${E(i.id)}')"><span class="ms">add_card</span>Record payment</button>` : ''}${admin && invIsOpen(i) ? `<button class="btn" onclick="openReminder('${E(i.id)}')"><span class="ms">notifications_active</span>Send reminder</button>` : ''}</div></div>`
  );
};

// ---------- the printable GST invoice ----------
function invoiceSheetHtml(i) {
  const c = invoiceCalc(i),
    g = c.g,
    co = g.company,
    cu = g.customer,
    tax = g.enabled,
    intra = g.intra,
    th = (t, r) => `<th class="${r ? 'text-right' : 'text-left'}">${t}</th>`,
    head = [
      '#',
      'Description',
      tax ? 'HSN/SAC' : '',
      'Qty',
      'Rate',
      'Disc %',
      'Taxable',
      ...(tax ? (intra ? ['CGST', 'SGST'] : ['IGST']) : []),
      'Amount',
    ].filter((x, k) => x !== '' || k === 0);
  const rows = c.lines
    .map(
      (l, k) =>
        `<tr><td>${k + 1}</td><td>${E(l.it.n)}<div class="mut text-xs">${E(l.it.c)}</div></td>${tax ? `<td>${E(l.hsn || '–')}</td>` : ''}<td class="text-right">${l.it.q}</td><td class="text-right">${M(l.it.p)}</td><td class="text-right">${l.it.d || 0}%</td><td class="text-right">${M(l.taxable)}</td>${tax ? (intra ? `<td class="text-right">${M(l.cgst)}<div class="mut text-xs">${l.rate / 2}%</div></td><td class="text-right">${M(l.sgst)}<div class="mut text-xs">${l.rate / 2}%</div></td>` : `<td class="text-right">${M(l.igst)}<div class="mut text-xs">${l.rate}%</div></td>`) : ''}<td class="text-right"><b>${M(l.amount)}</b></td></tr>`
    )
    .join('');
  const sumRows = c.summary
    .map(
      (s) =>
        `<tr><td>${E(s.hsn || '–')}</td><td class="text-right">${M(s.taxable)}</td><td class="text-right">${s.rate}%</td><td class="text-right">${M(s.cgst + s.sgst + s.igst)}</td></tr>`
    )
    .join('');
  const addr = (t) => `<div style="white-space:pre-wrap">${E(t || '–')}</div>`;
  return (
    `<div class="inv-sheet text-sm"><div class="flex justify-between gap-3 flex-wrap"><div><div class="text-xl font-bold">${E(co.name || 'Your company')}</div>${addr(co.address)}${co.gstin ? `<div>GSTIN: <b>${E(co.gstin)}</b></div>` : ''}${co.pan ? `<div>PAN: ${E(co.pan)}</div>` : ''}${co.state ? `<div>State: ${E(co.state)}</div>` : ''}${co.email || co.phone ? `<div>${E(co.email || '')} ${E(co.phone || '')}</div>` : ''}</div>` +
    `<div class="text-right"><div class="text-xl font-bold">${tax ? 'TAX INVOICE' : 'INVOICE'}</div><div>No: <b>${E(i.invoiceNo)}</b></div><div>Date: ${fd(new Date(i.sentAt || i.generatedAt || Date.now()).toISOString().slice(0, 10))}</div><div>Due: ${fd(invDueDate(i))}</div><div class="mut">Quotation ${E(i.quoteNo)}</div></div></div>` +
    `<div class="grid sm:grid-cols-2 gap-3 mt-3"><div><div class="mut text-xs">Bill to</div><b>${E(i.account)}</b>${addr(cu.address)}${cu.gstin ? `<div>GSTIN: <b>${E(cu.gstin)}</b></div>` : ''}</div><div><div class="mut text-xs">Ship to</div>${addr(cu.shipping || cu.address)}${tax ? `<div class="mt-1">Place of supply: <b>${E(cu.state || co.state || '–')}</b> (${intra ? 'intra-state: CGST + SGST' : 'inter-state: IGST'})</div>` : ''}</div></div>` +
    `<div class="overflow-x-auto mt-3"><table class="w-full inv-table"><thead><tr>${head.map((h, k) => th(h, k > 2)).join('')}</tr></thead><tbody>${rows}</tbody></table></div>` +
    `<div class="grid sm:grid-cols-2 gap-4 mt-3"><div>${tax ? `<table class="w-full text-xs"><thead><tr><th class="text-left">HSN/SAC</th><th class="text-right">Taxable</th><th class="text-right">Rate</th><th class="text-right">Tax</th></tr></thead><tbody>${sumRows}</tbody></table>` : ''}</div><div><div class="flex justify-between"><span>Taxable value</span><span>${M(c.taxable)}</span></div>${tax ? (intra ? `<div class="flex justify-between"><span>CGST</span><span>${M(c.cgst)}</span></div><div class="flex justify-between"><span>SGST</span><span>${M(c.sgst)}</span></div>` : `<div class="flex justify-between"><span>IGST</span><span>${M(c.igst)}</span></div>`) : ''}${c.roundOff ? `<div class="flex justify-between"><span>Round off</span><span>${c.roundOff > 0 ? '+' : '−'}₹${Math.abs(c.roundOff).toFixed(2)}</span></div>` : ''}<div class="flex justify-between text-lg font-bold" style="border-top:1px solid var(--bd);margin-top:4px;padding-top:4px"><span>Total</span><span>${M(c.payable)}</span></div>${invPaid(i) ? `<div class="flex justify-between"><span>Received</span><span>${M(invPaid(i))}</span></div><div class="flex justify-between font-bold"><span>Balance due</span><span>${M(invBalance(i))}</span></div>` : ''}</div></div>` +
    `<div class="mt-2"><span class="mut">Amount in words:</span> <b>${rupeesInWords(c.payable)}</b></div>` +
    (co.bank ? `<div class="mt-3"><b>Bank details</b>${addr(co.bank)}</div>` : '') +
    `<div class="mt-3"><b>Terms &amp; conditions</b><div style="white-space:pre-wrap" class="text-xs">${E(i.tnc || effectiveTnc(S.quotes.find((q) => q.no === i.quoteNo) || {}))}</div></div>` +
    `<div class="flex justify-between mt-6 text-xs"><span class="mut">This is a computer generated invoice.</span><span style="text-align:center">For ${E(co.name || 'the company')}<br><br><br>Authorised signatory</span></div></div>`
  );
}
function openInvoiceSheet(id) {
  const i = S.invoices.find((x) => x.id === id);
  if (!i) return;
  if (!companyInfo().name) toast('Add your company & GSTIN in Settings → Company & GST');
  $('#modal').innerHTML =
    `<div class="fixed inset-0 z-40 grid place-items-center p-4" style="background:rgba(0,0,0,.5)"><div class="card p-6 w-full max-w-4xl max-h-full overflow-auto">${invoiceSheetHtml(i)}<div class="flex justify-end gap-2 mt-4 no-print"><button class="btn" onclick="$('#modal').innerHTML=''">Close</button><button class="btn btn-p" onclick="printInvoice('${E(id)}',true)"><span class="ms">picture_as_pdf</span>Download PDF</button></div></div></div>`;
}
// Opens the invoice and the browser's print dialog, with the file name set to the invoice number
// (choose "Save as PDF" as the printer).
function printInvoice(id, already) {
  const i = S.invoices.find((x) => x.id === id);
  if (!i) return;
  if (!already) openInvoiceSheet(id);
  const t = document.title;
  document.title = i.invoiceNo;
  const back = () => {
    document.title = t;
    removeEventListener('afterprint', back);
  };
  addEventListener('afterprint', back);
  window.print();
}
