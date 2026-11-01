// Product catalogue view.

V.products = () =>
  S.role === 'rep'
    ? '<p class="mut">Product catalogue is managed by Admin and CEO.</p>'
    : `<div class="flex items-center mb-3"><h1 class="text-xl font-bold flex-1">Products</h1><button class="btn btn-p" onclick="openProductForm()">New product</button></div><p class="mut mb-3">Set list, minimum and maximum selling prices. A discounted unit price below minimum always requires CEO approval.</p>` +
      table(
        ['Product', 'Code', 'List price', 'Minimum price', 'Maximum price', 'Status', ''],
        S.products
          .map(
            (p) =>
              `<tr><td><b>${E(p.name)}</b></td><td>${E(p.code)}</td><td>${M(p.listPrice)}</td><td>${M(p.minPrice)}</td><td>${M(p.maxPrice)}</td><td>${p.active ? 'Active' : 'Inactive'}</td><td><button class="btn" onclick="openProductForm('${p.code}')">Edit</button></td></tr>`
          )
          .join('')
      );
