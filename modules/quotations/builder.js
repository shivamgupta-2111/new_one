// Quote line items: payment terms, defaults, line rows, pricing, adding and changing products.


const PAYMENT_TERMS = ['Net 30', 'Net 45', 'Net 60', 'Due on receipt'];


// Defaults shown in the form until the user edits a field.
function quoteDefaults(q, o) {
  const contact = S.contacts.find((c) => c[2] === o.account);
  return {
    name: q.name ?? `${q.no} - ${o.name}`,
    preparedFor: q.preparedFor ?? (contact ? `${contact[0]} (${contact[1]})` : ''),
    // Billing and shipping addresses fill in from the account until the user edits them.
    address: q.address ?? ((S.accountInfo || {})[o.account] || {}).address ?? '',
    shipping: q.shipping ?? ((S.accountInfo || {})[o.account] || {}).shipping ?? '',
    primary: q.primary !== false,
  };
}

function quoteLineRows(q, locked, withActions) {
  return q.items
    .map((i, k) => {
      const net = i.p * (1 - i.d / 100);
      const saved = (i.p * i.q * i.d) / 100;
      const discountCell = withActions
        ? `<input class="inp qt-num" type="number" min="0" max="100" step="0.1" value="${i.d}" ${locked ? 'disabled' : ''} title="${canGiveDiscount() ? '' : 'Your discount goes to Admin / CEO for approval'}" aria-label="Discount percent" onchange="changeQuoteItem(${k},'d',this.value)"><span class="qt-sub">${i.d ? `−${M(saved)}` : ''}</span>`
        : `${i.d}%`;
      const qtyCell = withActions
        ? `<input class="inp qt-num" type="number" min="1" value="${i.q}" ${locked ? 'disabled' : ''} aria-label="Quantity" onchange="changeQuoteItem(${k},'q',this.value)">`
        : i.q;
      const removeCell = withActions
        ? `<td class="qt-r">${locked ? '' : `<button class="qt-del" title="Remove" aria-label="Remove line" onclick="removeQuoteItem(${k})"><span class="ms">delete</span></button>`}</td>`
        : '';
      return `<tr><td><b class="qt-link">${E(i.n)}</b></td><td class="qt-code">${E(i.c)}</td><td class="qt-r">${M(withActions || q.showDiscount ? i.p : net)}</td><td class="qt-r">${qtyCell}</td>${withActions || q.showDiscount ? `<td class="qt-r">${discountCell}</td>` : ''}<td class="qt-r"><b>${M(net * i.q)}</b></td>${removeCell}</tr>`;
    })
    .join('');
}

function quoteLinesCard(q, locked, withActions) {
  const head = (
    withActions || q.showDiscount
      ? ['Product Name', 'Code', 'List Price', 'Qty', 'Discount %', 'Total Price']
      : ['Product Name', 'Code', 'Unit Price', 'Qty', 'Total Price']
  )
    .map((h, n) => `<th class="${n > 1 ? 'qt-r' : ''}">${h}</th>`)
    .concat(withActions ? ['<th class="qt-r">Actions</th>'] : [])
    .join('');
  const products = S.products
    .filter((p) => p.active !== false)
    .map((p) => `<option value="${E(p.code)}">${E(p.name)} · ${M(p.listPrice)}</option>`)
    .join('');
  const tools =
    withActions && !locked
      ? `<select class="btn qt-tool" aria-label="Add products" onchange="addQuoteProduct(this.value);this.value=''"><option value="">+ Add Products</option>${products}</select>${canGiveDiscount() ? '<button class="btn qt-tool" onclick="applyTieredDiscount()"><span class="ms">percent</span>Apply Tiered Discount</button>' : ''}<button class="btn qt-tool" onclick="calculateQuotePricing()"><span class="ms">sync</span>Calculate Pricing</button>`
      : '';
  return `<section class="qt-section"><div class="qt-section-head"><span class="ms">inventory_2</span><b>Line Items &amp; Product Bundling</b><span class="chip ok">${q.items.length} ${q.items.length === 1 ? 'Item' : 'Items'}</span><span class="flex-1"></span>${tools}</div><div class="overflow-x-auto"><table class="qt-table"><thead><tr>${head}</tr></thead><tbody>${quoteLineRows(q, locked, withActions)}</tbody></table></div></section>`;
}




function removeQuoteItem(k) {
  S.qd.items.splice(k, 1);
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
