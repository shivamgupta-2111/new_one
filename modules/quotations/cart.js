// Product cart on the quote: pick several products with quantities, review the cart, then add it all to the quote.

S.cart = S.cart || {};
const cartCount = () => Object.values(S.cart).reduce((a, n) => a + n, 0);
const cartTotal = () =>
  Object.entries(S.cart).reduce((a, [c, n]) => a + ((S.products.find((p) => p.code === c) || {}).listPrice || 0) * n, 0);

const quoteLinesCardBeforeCart = quoteLinesCard;
quoteLinesCard = function () {
  let html = quoteLinesCardBeforeCart.apply(this, arguments);
  const mark = '<button class="btn qt-tool" onclick="calculateQuotePricing()"';
  if (html.includes(mark))
    html = html.replace(
      mark,
      `<button class="btn qt-tool" onclick="openCart()"><span class="ms">shopping_cart</span>Cart${cartCount() ? ` <span class="chip ok">${cartCount()}</span>` : ''}</button>` + mark
    );
  return html;
};
function openCart() {
  const q = S.qd;
  if (!q || !['Draft', 'Rejected'].includes(q.status)) return toast('Open a draft quote to use the cart');
  const term = (S.cartQ || '').toLowerCase(),
    prods = S.products.filter((p) => p.active !== false && (!term || (p.name + ' ' + p.code).toLowerCase().includes(term))),
    rows = prods
      .map(
        (p) =>
          `<div class="flex items-center gap-2 py-2" style="border-bottom:1px solid var(--bd)"><div class="flex-1 min-w-0"><b>${E(p.name)}</b><div class="mut text-xs">${E(p.code)} · ${M(p.listPrice)}</div></div><button class="btn" aria-label="Less" onclick="cartSet('${E(p.code)}',${(S.cart[p.code] || 0) - 1})">−</button><input class="inp" style="width:64px;text-align:center" type="number" min="0" value="${S.cart[p.code] || 0}" aria-label="Quantity of ${E(p.name)}" onchange="cartSet('${E(p.code)}',this.value)"><button class="btn" aria-label="More" onclick="cartSet('${E(p.code)}',${(S.cart[p.code] || 0) + 1})">+</button></div>`
      )
      .join('') || '<p class="mut py-3">No products match.</p>',
    lines = Object.entries(S.cart)
      .map(([c, n]) => {
        const p = S.products.find((x) => x.code === c);
        return p ? `<div class="flex justify-between gap-2 text-sm py-1"><span>${n} × ${E(p.name)}</span><span>${M(p.listPrice * n)}</span></div>` : '';
      })
      .join('');
  $('#modal').innerHTML =
    `<div class="fixed inset-0 z-40 grid place-items-center p-4" style="background:rgba(0,0,0,.5)"><div class="card p-5 w-full max-w-2xl max-h-full overflow-auto"><div class="flex items-center gap-2"><span class="ms" style="color:var(--pr)">shopping_cart</span><h2 class="text-lg font-bold flex-1">Cart for ${E(q.no)}</h2><button class="btn" aria-label="Close" onclick="$('#modal').innerHTML=''"><span class="ms">close</span></button></div>` +
    `<input class="inp mt-3" type="search" placeholder="Search products" value="${E(S.cartQ || '')}" oninput="S.cartQ=this.value;openCart();const i=$('#modal input[type=search]');i.focus();i.setSelectionRange(i.value.length,i.value.length)">` +
    `<div class="mt-2" style="max-height:34vh;overflow:auto">${rows}</div>` +
    `<div class="mt-3 p-3 rounded" style="background:var(--hov)"><b>In your cart (${cartCount()})</b>${lines || '<div class="mut text-sm">Nothing yet. Use + to add products.</div>'}<div class="flex justify-between font-bold mt-1"><span>Cart total (list price)</span><span>${M(cartTotal())}</span></div></div>` +
    `<div class="flex justify-end gap-2 mt-3 flex-wrap"><button class="btn" ${cartCount() ? '' : 'disabled'} onclick="cartClear()">Empty cart</button><button class="btn btn-p" ${cartCount() ? '' : 'disabled'} onclick="cartToQuote()"><span class="ms">add_shopping_cart</span>Add to quote</button></div></div></div>`;
}
function cartSet(code, n) {
  n = Math.max(0, Math.floor(+n || 0));
  if (n) S.cart[code] = n;
  else delete S.cart[code];
  save();
  openCart();
}
function cartClear() {
  S.cart = {};
  save();
  openCart();
}
function cartToQuote() {
  const q = S.qd;
  if (!q || !['Draft', 'Rejected'].includes(q.status) || !cartCount()) return;
  let n = 0;
  Object.entries(S.cart).forEach(([c, qty]) => {
    const p = S.products.find((x) => x.code === c);
    if (!p) return;
    const ex = q.items.find((i) => i.c === c && !i.bundle);
    if (ex) ex.q += qty;
    else q.items.push({ n: p.name, c: p.code, p: p.listPrice, q: qty, d: 0 });
    n += qty;
  });
  S.cart = {};
  S.cartQ = '';
  $('#modal').innerHTML = '';
  save();
  toast(`${n} item${n === 1 ? '' : 's'} added to the quote`);
  render();
}
