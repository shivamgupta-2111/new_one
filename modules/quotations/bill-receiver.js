// Bill receiver: the person at the client company who receives the quotation and the bill.
// The rep fills it on the quote; it prints on the quotation and on the invoice made from it.

function billReceiverOf(q) {
  if (!q) return null;
  const b = q.billTo || {};
  if (String(b.name || '').trim()) return b;
  return null;
}

// Invoice: its own copy first, then the quote it came from.
function invoiceBillReceiver(i) {
  if (i && i.billTo && String(i.billTo.name || '').trim()) return i.billTo;
  return billReceiverOf(S.quotes.find((q) => q.no === (i && i.quoteNo)));
}

function billReceiverHtml(r, label) {
  if (!r) return '';
  const contact = [r.phone, r.email].filter((x) => String(x || '').trim());
  return (
    `<div class="bill-attn">${label === '' ? '' : `<div class="mut text-xs">${label || 'Kind attention (bill receiver)'}</div>`}` +
    `<b>${E(r.name)}</b>${r.designation ? `<span>, ${E(r.designation)}</span>` : ''}` +
    (r.department ? `<div>${E(r.department)}</div>` : '') +
    (contact.length ? `<div>${contact.map(E).join(' · ')}</div>` : '') +
    `</div>`
  );
}

// Starting values for the form: what is saved, else the quote's contact.
function billReceiverDraft(d) {
  const b = (d && d.billTo) || {},
    pf = String((d && d.preparedFor) || '');
  return {
    name: b.name ?? pf.replace(/\s*\(.*\)\s*$/, ''),
    designation: b.designation ?? ((pf.match(/\((.*)\)\s*$/) || [])[1] || ''),
    department: b.department ?? '',
    phone: b.phone ?? ((d && d.toPhone) || ''),
    email: b.email ?? ((d && d.toEmail) || ''),
  };
}

// Pop-up the rep uses to fill or change the bill receiver on a quote.
function openBillReceiver() {
  const d = S.qd || {},
    r = billReceiverDraft(d),
    f = (label, name, type, ph) =>
      `<label class="block text-sm">${label}<input class="inp" ${type ? `type="${type}"` : ''} name="${name}" value="${E(r[name] || '')}" placeholder="${ph || ''}"></label>`;
  $('#modal').innerHTML =
    `<div class="fixed inset-0 z-40 grid place-items-center p-4" style="background:rgba(0,0,0,.5)"><form class="card p-6 w-full max-w-lg space-y-3" onsubmit="saveBillReceiver(event)">` +
    `<div class="flex justify-between items-center"><h3 class="text-lg font-bold">Bill receiver</h3><button type="button" class="btn" onclick="$('#modal').innerHTML=''">✕</button></div>` +
    `<p class="text-sm mut">The person at ${E((S.opps.find((o) => o.id == d.opp) || {}).account || 'the client')} who receives this quotation and the invoice. Printed as “Kind attention”.</p>` +
    f('Name *', 'name', '', 'e.g. Priya Sharma') +
    f('Designation', 'designation', '', 'e.g. Accounts Manager') +
    f('Department', 'department', '', 'e.g. Finance') +
    `<div class="grid sm:grid-cols-2 gap-3">${f('Phone', 'phone', 'tel', '+91 98765 43210')}${f('Email', 'email', 'email', 'accounts@company.com')}</div>` +
    `<div class="flex justify-end gap-2"><button type="button" class="btn" onclick="$('#modal').innerHTML=''">Cancel</button><button class="btn btn-p">Save</button></div></form></div>`;
  const first = $('#modal input[name="name"]');
  if (first) first.focus();
}

function saveBillReceiver(e) {
  e.preventDefault();
  const v = Object.fromEntries(new FormData(e.target)),
    r = {};
  ['name', 'designation', 'department', 'phone', 'email'].forEach(
    (k) => (r[k] = String(v[k] || '').trim())
  );
  if (!r.name) return toast('Enter the name of the person receiving the bill');
  const q = S.qd;
  if (!q) return;
  q.billTo = r;
  const stored = S.quotes.find((x) => x.no === q.no);
  if (stored && stored !== q) stored.billTo = clone(r);
  // An invoice that has not gone to the client yet picks up the new name too.
  const inv = S.invoices.find((i) => i.quoteNo === q.no);
  if (inv && !inv.sentAt) inv.billTo = clone(r);
  storeQuote(q);
  if (!save()) return;
  $('#modal').innerHTML = '';
  toast('Bill receiver saved');
  render();
}

// Values from the New Quote form fields (billName, billDesignation, ...).
function billReceiverFromForm(v) {
  const r = {
    name: String(v.billName || '').trim(),
    designation: String(v.billDesignation || '').trim(),
    department: String(v.billDepartment || '').trim(),
    phone: String(v.billPhone || '').trim(),
    email: String(v.billEmail || '').trim(),
  };
  return r.name ? r : undefined;
}

// The name is not a price, so it can still change after approval — until the invoice goes out.
function canEditBillReceiver(q) {
  if (!q) return false;
  const o = S.opps.find((x) => x.id == q.opp);
  if (o && typeof canEditOpp === 'function' && !canEditOpp(o)) return false;
  const inv = S.invoices.find((i) => i.quoteNo === q.no);
  return !(inv && inv.sentAt) && q.status !== 'Paid';
}
