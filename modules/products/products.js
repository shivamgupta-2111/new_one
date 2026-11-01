// Product form and save (min <= list <= max price rule).

function openProductForm(code = '') {
  if (S.role === 'rep') return toast('Only Admin and CEO can manage products');
  const p = S.products.find((x) => x.code === code) || {};
  $('#modal').innerHTML =
    `<div class="fixed inset-0 z-40 grid place-items-center p-4" style="background:rgba(0,0,0,.5)"><form class="card p-5 w-full max-w-md space-y-3" onsubmit="saveProduct(event,'${code}')"><h2 class="text-lg font-bold">${code ? 'Edit product' : 'New product'}</h2><label class="block">Product name<input name="name" class="inp" required value="${E(p.name || '')}"></label><label class="block">Product code<input name="code" class="inp" required value="${E(p.code || '')}"></label><label class="block">List price (₹)<input name="listPrice" type="number" min="0.01" step="0.01" class="inp" required value="${p.listPrice ?? ''}"></label><label class="block">Minimum selling price (₹)<input name="minPrice" type="number" min="0.01" step="0.01" class="inp" required value="${p.minPrice ?? ''}"></label><label class="block">Maximum selling price (₹)<input name="maxPrice" type="number" min="0.01" step="0.01" class="inp" required value="${p.maxPrice ?? ''}"></label><label class="block">Status<select name="active" class="inp"><option value="yes" ${p.active !== false ? 'selected' : ''}>Active</option><option value="no" ${p.active === false ? 'selected' : ''}>Inactive</option></select></label><div class="flex justify-end gap-2"><button type="button" class="btn" onclick="$('#modal').innerHTML=''">Cancel</button><button class="btn btn-p">Save product</button></div></form></div>`;
}
function saveProduct(e, oldCode) {
  e.preventDefault();
  const v = Object.fromEntries(new FormData(e.target)),
    p = {
      id: v.code,
      code: v.code,
      name: v.name,
      listPrice: +v.listPrice,
      minPrice: +v.minPrice,
      maxPrice: +v.maxPrice,
      active: v.active === 'yes',
    };
  if (!(p.minPrice > 0 && p.minPrice <= p.listPrice && p.listPrice <= p.maxPrice))
    return toast('Prices must satisfy minimum ≤ list ≤ maximum');
  const dup = S.products.find((x) => x.code === p.code && x.code !== oldCode);
  if (dup) return toast('Product code already exists');
  const ix = S.products.findIndex((x) => x.code === oldCode);
  if (ix >= 0) S.products[ix] = p;
  else S.products.push(p);
  $('#modal').innerHTML = '';
  save();
  toast('Product saved');
  render();
}
