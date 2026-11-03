// Price book: configurable volume tiers (global, with optional per-product override), bundles,
// and minimum / maximum selling price per product. Admin and CEO manage it in Settings → Price book.

const DEFAULT_TIERS = [
  { min: 2, pct: 5 },
  { min: 4, pct: 10 },
];
function priceBook() {
  const st = S.settings || (S.settings = {});
  if (!st.priceBook) st.priceBook = { tiers: DEFAULT_TIERS.map((t) => ({ ...t })), bundles: [] };
  if (!st.priceBook.tiers) st.priceBook.tiers = DEFAULT_TIERS.map((t) => ({ ...t }));
  if (!st.priceBook.bundles) st.priceBook.bundles = [];
  return st.priceBook;
}
const canManagePriceBook = () => ['admin', 'ceo'].includes(S.role);
const cleanTiers = (arr) =>
  (arr || [])
    .map((t) => ({ min: Math.floor(+t.min), pct: Math.round(+t.pct * 10) / 10 }))
    .filter((t) => t.min >= 2 && t.pct >= 0 && t.pct <= 100)
    .sort((a, b) => a.min - b.min);
function tiersFor(code) {
  const p = S.products.find((x) => x.code === code);
  return p && p.tiers && p.tiers.length ? cleanTiers(p.tiers) : cleanTiers(priceBook().tiers);
}
function tierPct(code, qty) {
  let pct = 0;
  tiersFor(code).forEach((t) => {
    if (qty >= t.min) pct = t.pct;
  });
  return pct;
}
// the biggest discount that still keeps the unit price at or above the product's minimum price
function maxDiscountFor(code, listPrice) {
  const p = S.products.find((x) => x.code === code);
  if (!p || !p.minPrice || !listPrice) return 100;
  return Math.max(0, Math.floor((1 - p.minPrice / listPrice) * 1000) / 10);
}

// Replaces the fixed 5% / 10% tiers.
applyTieredDiscount = function () {
  if (!canGiveDiscount()) return toast('Only Admin and CEO can give discounts');
  let capped = 0;
  S.qd.items.forEach((i) => {
    if (i.bundle) return; // bundle lines keep their bundle price
    const want = tierPct(i.c, i.q),
      cap = maxDiscountFor(i.c, i.p);
    i.d = Math.min(want, cap);
    if (want > cap) capped++;
  });
  toast('Volume tiers applied' + (capped ? ` · ${capped} line(s) held at the minimum price` : ''));
  render();
};

function addQuoteBundle(id) {
  const b = priceBook().bundles.find((x) => x.id === id);
  if (!b || !S.qd) return;
  b.items.forEach((bi) => {
    const p = S.products.find((x) => x.code === bi.c);
    if (!p) return;
    const pct = Math.min(+b.pct || 0, maxDiscountFor(p.code, p.listPrice)),
      ex = S.qd.items.find((i) => i.c === p.code && i.bundle === b.name);
    if (ex) ex.q += bi.q;
    else S.qd.items.push({ n: p.name, c: p.code, p: p.listPrice, q: bi.q, d: pct, bundle: b.name });
  });
  toast(`Bundle “${b.name}” added`);
  render();
}
const quoteLinesCardBeforePB = quoteLinesCard;
quoteLinesCard = function (q) {
  let html = quoteLinesCardBeforePB.apply(this, arguments);
  const bundles = priceBook().bundles.filter((b) => b.active !== false);
  if (bundles.length && html.includes('onclick="calculateQuotePricing()"'))
    html = html.replace(
      '<button class="btn qt-tool" onclick="calculateQuotePricing()"',
      `<select class="btn qt-tool" aria-label="Add bundle" onchange="addQuoteBundle(this.value);this.value=''"><option value="">+ Add Bundle</option>${bundles.map((b) => `<option value="${E(b.id)}">${E(b.name)} (${b.pct}% off)</option>`).join('')}</select><button class="btn qt-tool" onclick="calculateQuotePricing()"`
    );
  return html;
};
const quoteLineRowsBeforePB = quoteLineRows;
quoteLineRows = function () {
  const q = arguments[0];
  let html = quoteLineRowsBeforePB.apply(this, arguments);
  // tag bundle lines under the product name
  q.items.forEach((i) => {
    if (i.bundle)
      html = html.replace(
        `<b class="qt-link">${E(i.n)}</b>`,
        `<b class="qt-link">${E(i.n)}</b> <span class="chip">Bundle: ${E(i.bundle)}</span>`
      );
  });
  return html;
};

// ---------- settings ----------
const SETTINGS_SECTIONS_BeforePB = SETTINGS_SECTIONS;
SETTINGS_SECTIONS = function () {
  const base = SETTINGS_SECTIONS_BeforePB.apply(this, arguments),
    ix = base.findIndex((s) => s[0] === 'limits');
  if (S.role !== 'rep' && !base.some((s) => s[0] === 'pricebook'))
    base.splice(ix < 0 ? base.length : ix, 0, ['pricebook', 'Price book', 'sell']);
  return base;
};
const tiersText = (arr) =>
  cleanTiers(arr)
    .map((t) => `${t.min}:${t.pct}`)
    .join(', ');
const parseTiersText = (s) =>
  cleanTiers(
    String(s || '')
      .split(/[,;\n]/)
      .map((x) => x.split(':'))
      .filter((a) => a.length === 2)
      .map(([m, p]) => ({ min: m, pct: p }))
  );
function pbTierRows() {
  const t = priceBook().tiers;
  return t
    .map(
      (r, k) =>
        `<tr><td><input class="inp" type="number" min="2" value="${r.min}" aria-label="From quantity" onchange="pbSetTier(${k},'min',this.value)"></td><td><input class="inp" type="number" min="0" max="100" step="0.1" value="${r.pct}" aria-label="Discount percent" onchange="pbSetTier(${k},'pct',this.value)"></td><td><button class="btn" onclick="pbDelTier(${k})" aria-label="Remove tier"><span class="ms">delete</span></button></td></tr>`
    )
    .join('');
}
function pbSetTier(k, f, v) {
  if (!canManagePriceBook()) return;
  const t = priceBook().tiers[k];
  if (!t) return;
  t[f] = +v;
  save();
  render();
}
function pbAddTier() {
  if (!canManagePriceBook()) return;
  const t = priceBook().tiers,
    last = t.length ? Math.max(...t.map((x) => +x.min || 0)) : 1;
  t.push({ min: last + 2, pct: 0 });
  save();
  render();
}
function pbDelTier(k) {
  if (!canManagePriceBook()) return;
  priceBook().tiers.splice(k, 1);
  save();
  render();
}
function pbSaveTiers() {
  if (!canManagePriceBook()) return;
  const pb = priceBook(),
    clean = cleanTiers(pb.tiers);
  if (clean.length !== pb.tiers.length)
    return toast('Each tier needs a quantity of 2 or more and a discount of 0–100%');
  const qs = clean.map((t) => t.min);
  if (new Set(qs).size !== qs.length) return toast('Two tiers cannot start at the same quantity');
  pb.tiers = clean;
  save();
  toast('Volume tiers saved');
  render();
}
function pbSetProduct(code, f, v) {
  if (!canManagePriceBook()) return;
  const p = S.products.find((x) => x.code === code);
  if (!p) return;
  const n = f === 'tiers' ? parseTiersText(v) : +v;
  const next = { ...p, [f]: n };
  if (
    f !== 'tiers' &&
    !(next.minPrice > 0 && next.minPrice <= next.listPrice && next.listPrice <= next.maxPrice)
  ) {
    toast('Prices must satisfy minimum ≤ list ≤ maximum');
    return render();
  }
  Object.assign(p, next);
  if (f === 'tiers' && !n.length) delete p.tiers;
  save();
  toast('Price book updated');
  render();
}
function openBundleForm(id = '') {
  if (!canManagePriceBook()) return toast('Only Admin and CEO can manage bundles');
  const b = priceBook().bundles.find((x) => x.id === id) || {},
    qty = (c) => (b.items || []).find((i) => i.c === c)?.q || 0;
  $('#modal').innerHTML =
    `<div class="fixed inset-0 z-40 grid place-items-center p-4" style="background:rgba(0,0,0,.5)"><form class="card p-5 w-full max-w-lg max-h-full overflow-auto space-y-3" onsubmit="saveBundle(event,'${E(id)}')"><h2 class="text-lg font-bold">${id ? 'Edit' : 'New'} bundle</h2>` +
    `<label class="block">Bundle name *<input class="inp" name="name" required value="${E(b.name || '')}"></label>` +
    `<label class="block">Bundle discount % *<input class="inp" name="pct" type="number" min="0" max="100" step="0.1" required value="${b.pct ?? 10}"></label>` +
    `<div><b>Products and quantity</b><div class="grid gap-1 mt-1">${S.products
      .filter((p) => p.active !== false)
      .map(
        (p) =>
          `<label class="flex items-center gap-2"><input class="inp" style="width:80px" type="number" min="0" name="q_${E(p.code)}" value="${qty(p.code)}"><span>${E(p.name)} <span class="mut text-xs">${E(p.code)} · ${M(p.listPrice)}</span></span></label>`
      )
      .join(
        ''
      )}</div><p class="mut text-xs">Leave the quantity at 0 to leave a product out.</p></div>` +
    `<label class="flex items-center gap-2"><input type="checkbox" name="active" ${b.active !== false ? 'checked' : ''}> Available on quotes</label>` +
    `<div class="flex justify-end gap-2"><button type="button" class="btn" onclick="$('#modal').innerHTML=''">Cancel</button><button class="btn btn-p">Save bundle</button></div></form></div>`;
}
function saveBundle(e, id) {
  e.preventDefault();
  if (!canManagePriceBook()) return;
  const fd_ = new FormData(e.target),
    name = (fd_.get('name') || '').trim(),
    pct = Math.round(+fd_.get('pct') * 10) / 10,
    items = S.products
      .map((p) => ({ c: p.code, q: Math.floor(+fd_.get('q_' + p.code) || 0) }))
      .filter((i) => i.q > 0);
  if (!name) return toast('Name the bundle');
  if (items.length < 2) return toast('A bundle needs at least two products');
  if (!(pct >= 0 && pct <= 100)) return toast('Discount must be 0–100%');
  const pb = priceBook();
  if (pb.bundles.some((b) => b.name.toLowerCase() === name.toLowerCase() && b.id !== id))
    return toast('A bundle with this name already exists');
  const rec = {
    id: id || 'b' + Date.now().toString(36),
    name,
    pct,
    items,
    active: !!fd_.get('active'),
  };
  const ix = pb.bundles.findIndex((b) => b.id === id);
  if (ix >= 0) pb.bundles[ix] = rec;
  else pb.bundles.push(rec);
  $('#modal').innerHTML = '';
  save();
  toast('Bundle saved');
  render();
}
function deleteBundle(id) {
  if (!canManagePriceBook()) return;
  const pb = priceBook();
  pb.bundles = pb.bundles.filter((b) => b.id !== id);
  save();
  render();
}
SETTINGS_PANELS.pricebook = function () {
  const ok = canManagePriceBook(),
    pb = priceBook(),
    dis = ok ? '' : 'disabled';
  const bundleList = pb.bundles.length
    ? pb.bundles
        .map((b) => {
          const list = b.items.reduce(
            (s, i) => s + ((S.products.find((p) => p.code === i.c) || {}).listPrice || 0) * i.q,
            0
          );
          return `<tr><td><b>${E(b.name)}</b>${b.active === false ? ' <span class="chip">Off</span>' : ''}</td><td>${b.items.map((i) => `${i.q}× ${E(i.c)}`).join(', ')}</td><td class="text-right">${b.pct}%</td><td class="text-right">${M(list * (1 - b.pct / 100))}</td><td class="text-right">${ok ? `<button class="btn" onclick="openBundleForm('${E(b.id)}')">Edit</button> <button class="btn" onclick="deleteBundle('${E(b.id)}')" aria-label="Delete bundle"><span class="ms">delete</span></button>` : ''}</td></tr>`;
        })
        .join('')
    : '<tr><td colspan="5" class="mut">No bundles yet</td></tr>';
  const prodRows = S.products
    .map(
      (p) =>
        `<tr><td><b>${E(p.name)}</b><div class="mut text-xs">${E(p.code)}</div></td><td><input class="inp" type="number" min="0.01" step="0.01" value="${p.minPrice}" ${dis} aria-label="Minimum price" onchange="pbSetProduct('${E(p.code)}','minPrice',this.value)"></td><td><input class="inp" type="number" min="0.01" step="0.01" value="${p.listPrice}" ${dis} aria-label="List price" onchange="pbSetProduct('${E(p.code)}','listPrice',this.value)"></td><td><input class="inp" type="number" min="0.01" step="0.01" value="${p.maxPrice}" ${dis} aria-label="Maximum price" onchange="pbSetProduct('${E(p.code)}','maxPrice',this.value)"></td><td><input class="inp" placeholder="uses global tiers" value="${E(tiersText(p.tiers))}" ${dis} aria-label="Product tiers" onchange="pbSetProduct('${E(p.code)}','tiers',this.value)"></td></tr>`
    )
    .join('');
  return (
    secHead('sell', 'Price book', 'Volume tiers, bundles and price limits used on every quote.') +
    (ok ? '' : '<p class="mut">Only Admin and CEO can change the price book.</p>') +
    `<h3 class="font-bold mt-2">Volume tiers (all products)</h3><p class="mut text-xs mb-2">Used by “Apply Tiered Discount”. A line gets the discount of the highest tier its quantity reaches, but never below the product's minimum price.</p><div class="overflow-x-auto"><table class="w-full"><thead><tr><th class="text-left">From quantity</th><th class="text-left">Discount %</th><th></th></tr></thead><tbody>${pbTierRows()}</tbody></table></div>${ok ? '<div class="flex gap-2 mt-2"><button class="btn" onclick="pbAddTier()"><span class="ms">add</span>Add tier</button><button class="btn btn-p" onclick="pbSaveTiers()">Save tiers</button></div>' : ''}` +
    `<h3 class="font-bold mt-5">Bundles</h3><div class="overflow-x-auto"><table class="w-full"><thead><tr><th class="text-left">Name</th><th class="text-left">Contents</th><th class="text-right">Discount</th><th class="text-right">Bundle price</th><th></th></tr></thead><tbody>${bundleList}</tbody></table></div>${ok ? '<button class="btn mt-2" onclick="openBundleForm()"><span class="ms">add</span>New bundle</button>' : ''}` +
    `<h3 class="font-bold mt-5">Price limits &amp; product tiers</h3><p class="mut text-xs mb-2">Minimum ≤ list ≤ maximum. Type tiers for one product as <code>quantity:percent</code>, e.g. <code>3:8, 10:15</code>. Leave empty to use the global tiers.</p><div class="overflow-x-auto"><table class="w-full"><thead><tr><th class="text-left">Product</th><th class="text-left">Min ₹</th><th class="text-left">List ₹</th><th class="text-left">Max ₹</th><th class="text-left">Tiers</th></tr></thead><tbody>${prodRows}</tbody></table></div>`
  );
};
