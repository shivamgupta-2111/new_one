// 4-step quote builder: pricing, line items, terms and preview.

// ---------------------------------------------------------------------------
// Quote builder (4-step layout: details & pricing → line items → terms → preview)
// ---------------------------------------------------------------------------
const QUOTE_STEPS = [
  'Quote Details & Pricing',
  'Line Items & Discounts',
  'Terms & Approvals',
  'Preview & Send',
];
const PAYMENT_TERMS = ['Net 30', 'Net 45', 'Net 60', 'Due on receipt'];
// Highest blended discount each role can approve on their own (CEO is unlimited).
const ROLE_DISCOUNT_LIMIT = { rep: 2, admin: 5, ceo: null };

// Defaults shown in the form until the user edits a field.
function quoteDefaults(q, o) {
  const contact = S.contacts.find((c) => c[2] === o.account);
  return {
    name: q.name ?? `${q.no} - ${o.name}`,
    preparedFor: q.preparedFor ?? (contact ? `${contact[0]} (${contact[1]})` : ''),
    address: q.address ?? '',
    primary: q.primary !== false,
  };
}

function quoteLineRows(q, locked, withActions) {
  return q.items
    .map((i, k) => {
      const net = i.p * (1 - i.d / 100);
      const saved = (i.p * i.q * i.d) / 100;
      const discountCell = withActions
        ? `<input class="inp qt-num" type="number" min="0" max="100" step="0.1" value="${i.d}" ${locked ? 'disabled' : ''} aria-label="Discount percent" onchange="changeQuoteItem(${k},'d',this.value)"><span class="qt-sub">${i.d ? `−${M(saved)}` : ''}</span>`
        : `${i.d}%`;
      const qtyCell = withActions
        ? `<input class="inp qt-num" type="number" min="1" value="${i.q}" ${locked ? 'disabled' : ''} aria-label="Quantity" onchange="changeQuoteItem(${k},'q',this.value)">`
        : i.q;
      const removeCell = withActions
        ? `<td class="qt-r">${locked ? '' : `<button class="qt-del" title="Remove" aria-label="Remove line" onclick="removeQuoteItem(${k})"><span class="ms">delete</span></button>`}</td>`
        : '';
      return `<tr><td><b class="qt-link">${E(i.n)}</b></td><td class="qt-code">${E(i.c)}</td><td class="qt-r">${M(i.p)}</td><td class="qt-r">${qtyCell}</td><td class="qt-r">${discountCell}</td><td class="qt-r"><b>${M(net * i.q)}</b></td>${removeCell}</tr>`;
    })
    .join('');
}

function quoteLinesCard(q, locked, withActions) {
  const head = ['Product Name', 'Code', 'List Price', 'Qty', 'Discount %', 'Total Price']
    .map((h, n) => `<th class="${n > 1 ? 'qt-r' : ''}">${h}</th>`)
    .concat(withActions ? ['<th class="qt-r">Actions</th>'] : [])
    .join('');
  const products = S.products
    .filter((p) => p.active !== false)
    .map((p) => `<option value="${E(p.code)}">${E(p.name)} · ${M(p.listPrice)}</option>`)
    .join('');
  const tools =
    withActions && !locked
      ? `<select class="btn qt-tool" aria-label="Add products" onchange="addQuoteProduct(this.value);this.value=''"><option value="">+ Add Products</option>${products}</select><button class="btn qt-tool" onclick="applyTieredDiscount()"><span class="ms">percent</span>Apply Tiered Discount</button><button class="btn qt-tool" onclick="calculateQuotePricing()"><span class="ms">sync</span>Calculate Pricing</button>`
      : '';
  return `<section class="qt-section"><div class="qt-section-head"><span class="ms">inventory_2</span><b>Line Items &amp; Product Bundling</b><span class="chip ok">${q.items.length} ${q.items.length === 1 ? 'Item' : 'Items'}</span><span class="flex-1"></span>${tools}</div><div class="overflow-x-auto"><table class="qt-table"><thead><tr>${head}</tr></thead><tbody>${quoteLineRows(q, locked, withActions)}</tbody></table></div></section>`;
}

function quoteSummaryRow(q, o, floor, route) {
  const subtotal = q.items.reduce((a, i) => a + i.p * i.q, 0);
  const discount = subtotal - quoteTotal(q);
  const limit = ROLE_DISCOUNT_LIMIT[S.role];
  const needsApproval = route.status !== 'Approved';
  const headline = floor.length
    ? 'CEO approval required'
    : needsApproval
      ? 'Approval Required'
      : 'Approval Not Required';
  const detail = floor.length
    ? 'At least one product is priced below its minimum selling price, so CEO approval is mandatory.'
    : needsApproval
      ? `Blended discount of ${quoteDiscount(q).toFixed(1)}% will be routed to ${E(route.approver)} for approval.`
      : `Total discount (${quoteDiscount(q).toFixed(1)}%) is within ${E(roleNow().name)}'s delegation authority.`;
  return `<div class="qt-bottom"><div class="qt-guide"><span class="qt-guide-icon"><span class="ms">auto_awesome</span></span><div><div class="qt-guide-title">Discount &amp; Pricing Guidance <span class="qt-badge">Insight</span></div><p><b>${headline}:</b> ${detail}</p><div class="qt-guide-stats"><span>Your limit: <b>${limit === null ? 'Unlimited' : limit.toFixed(1) + '%'}</b></span><span>Applied Blended Rate: <b>${quoteDiscount(q).toFixed(2)}%</b></span><span class="${floor.length ? 'qt-bad' : 'qt-good'}">Margin Protection: <b>${floor.length ? 'Below product minimum' : 'Verified'}</b></span></div></div></div><div class="qt-totals"><div class="qt-total-row"><span class="mut">Subtotal (List)</span><span>${M(subtotal)}</span></div><div class="qt-total-row"><span class="qt-link">Total Additional Discounts</span><span class="qt-link">${discount ? '−' : ''}${M(discount)}</span></div><div class="qt-total-row"><span class="mut">Estimated Tax / Surcharge</span><span>${M(0)}</span></div><div class="qt-total-row qt-grand"><b>Grand Total</b><b>${M(quoteTotal(q))}</b></div><small class="mut qt-r" style="display:block">All figures formatted in INR (₹)</small></div></div>`;
}

V.quote = () => {
  const q = S.qd,
    o = cur();
  if (!q || !o) return V.opps();
  const step = S.qstep || 1;
  const inv = q.invoiceId && S.invoices.find((i) => i.id === q.invoiceId);
  const locked = !['Draft', 'Rejected'].includes(q.status);
  const floor = belowProductFloor(q);
  const route = quoteRoute(q);
  const d = quoteDefaults(q, o);
  const dis = locked ? 'disabled' : '';

  const field = (label, control, required) =>
    `<label class="qt-field"><span>${label}${required ? ' <i class="qt-req">*</i>' : ''}</span>${control}</label>`;

  const infoCard = `<section class="qt-section"><div class="qt-section-head"><span class="ms">badge</span><b>Quote Information</b></div><div class="qt-grid">${field('Quote Name', `<input class="inp" value="${E(d.name)}" ${dis} onchange="S.qd.name=this.value">`, true)}<label class="qt-check"><input type="checkbox" ${d.primary ? 'checked' : ''} ${dis} onchange="S.qd.primary=this.checked"> Primary Quote (Syncs to Opportunity)</label>${field('Expiration Date', `<input type="date" class="inp" value="${q.exp}" ${dis} onchange="S.qd.exp=this.value">`)}${field('Status', q.status === 'Draft' ? quoteOtherSelect('label', QUOTE_STATUS_CHOICES, q.label || 'Draft', false) : `<select class="inp" disabled><option>${E(q.status)}</option></select>`)}${field('Prepared For', `<input class="inp" value="${E(d.preparedFor)}" ${dis} onchange="S.qd.preparedFor=this.value">`)}${field('Sales Rep / Owner', `<input class="inp" value="${E(ownerLabel(o.owner))}" disabled>`)}${field('Payment Terms', quoteOtherSelect('terms', PAYMENT_TERMS, q.terms, locked))}${field('Billing / Shipping Address', `<input class="inp" value="${E(d.address)}" placeholder="Street, city, state, PIN" ${dis} onchange="S.qd.address=this.value">`)}</div></section>`;

  const approvalCard = approvalSection(q, floor, locked);

  const previewCard = `<section class="qt-section"><div class="qt-section-head"><span class="ms">visibility</span><b>Preview</b></div><div class="qt-body"><p><b>${E(d.name)}</b></p><p class="mut">Prepared for ${E(d.preparedFor || '—')} · Expires ${fd(q.exp)} · ${E(q.terms)}</p>${d.address ? `<p class="mut">${E(d.address)}</p>` : ''}<p style="margin-top:8px"><b>Terms &amp; conditions</b></p><p style="white-space:pre-wrap">${q.tnc ? E(q.tnc) : '<span class="mut">None added.</span>'}</p></div></section>`;

  const body =
    step === 1
      ? infoCard + quoteLinesCard(q, locked, true) + quoteSummaryRow(q, o, floor, route)
      : step === 2
        ? quoteLinesCard(q, locked, true) + quoteSummaryRow(q, o, floor, route)
        : step === 3
          ? approvalCard + quoteSummaryRow(q, o, floor, route)
          : previewCard + quoteLinesCard(q, locked, false) + quoteSummaryRow(q, o, floor, route);

  const stepper = QUOTE_STEPS.map(
    (label, n) =>
      `<button class="qt-step ${n + 1 === step ? 'on' : ''} ${n + 1 < step ? 'done' : ''}" onclick="S.qstep=${n + 1};render()">${n + 1}. ${label}</button>`
  ).join('');

  const footer = `<div class="qt-foot">${locked ? '<span></span>' : `<button class="btn" onclick="saveQuoteDraft()">Save as Draft</button>`}<span class="flex-1"></span><button class="btn" onclick="nav('opp-detail')">Cancel</button><button class="btn" ${step === 1 ? 'disabled' : ''} onclick="S.qstep=${step - 1};render()">Back</button>${step < 4 ? `<button class="btn" onclick="S.qstep=${step + 1};render()">Next</button>` : ''}${canReview(q) ? `<button class="btn" style="color:var(--err)" onclick="rejectQuote('${E(q.no)}')">Reject</button><button class="btn btn-p" onclick="approveQuote('${E(q.no)}')">Approve</button>` : ''}${inv ? `<button class="btn btn-p" onclick="openInvoice('${inv.id}')">Open ${E(inv.invoiceNo)}</button>` : ''}${locked ? '' : `<button class="btn btn-p" onclick="submitQuote()">Save &amp; Generate PDF Quote<span class="ms">chevron_right</span></button>`}</div>`;

  return `<div class="qt-wrap card"><header class="qt-head"><span class="qt-head-icon"><span class="ms">description</span></span><div><h1>Generate Quote — ${E(o.name)}</h1><p>Primary Opportunity: <b>${E(o.name)}</b> &nbsp;|&nbsp; Account: <b>${E(o.account)}</b> &nbsp;|&nbsp; Stage: <b>${E(ST[o.stage] || '—')}</b></p></div></header><nav class="qt-steps">${stepper}</nav><div class="qt-content">${approvalBanner(q, inv)}${body}</div>${footer}</div>`;
};
function removeQuoteItem(k) {
  S.qd.items.splice(k, 1);
  render();
}
// Quantity tiers: 1 unit = 0%, 2–3 units = 5%, 4+ units = 10%.
function applyTieredDiscount() {
  S.qd.items.forEach((i) => {
    i.d = i.q >= 4 ? 10 : i.q >= 2 ? 5 : 0;
  });
  toast('Tiered discount applied');
  render();
}
function calculateQuotePricing() {
  toast('Pricing recalculated');
  render();
}
function addQuoteProduct(code) {
  const p = S.products.find((x) => x.code === code);
  if (!p) return;
  const x = S.qd.items.find((i) => i.c === code);
  if (x) x.q++;
  else S.qd.items.push({ n: p.name, c: p.code, p: p.listPrice, q: 1, d: 0 });
  render();
}
function changeQuoteItem(k, f, v) {
  const i = S.qd.items[k];
  i[f] = f === 'q' ? Math.max(1, Math.floor(+v || 1)) : Math.max(0, Math.min(100, +v || 0));
  render();
}
function saveQuoteDraft() {
  storeQuote(S.qd);
  save();
  toast('Draft saved');
  nav('opp-detail');
}
