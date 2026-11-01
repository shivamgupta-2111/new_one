// Render wrapper that gates pages behind login and portal.

const priorRenderWithPortals = render;
render = function () {
  if (!S.authUser) {
    showLogin();
    return;
  }
  const user = S.users.find((u) => u.id === S.authUser);
  if (!user || user.active === false) {
    S.authUser = null;
    showLogin();
    return;
  }
  S.role = user.role;
  S.mine = user.role === 'rep';
  const h = document.querySelector('header');
  if (h) h.style.display = '';
  $('#app').className = 'p-3 md:p-4 max-w-[1500px] mx-auto';
  priorRenderWithPortals();
  const navEl = $('#nav');
  if (navEl) {
    const isRep = user.role === 'rep',
      links = isRep
        ? [
            ['home', 'Home'],
            ['leads', 'Leads'],
            ['accounts', 'Accounts'],
            ['contacts', 'Contacts'],
            ['opps', 'Opportunities'],
            ['quotes', 'Quotes'],
            ['invoices', 'Invoices'],
          ]
        : [
            ['home', 'Home'],
            ['leads', 'Leads'],
            ['accounts', 'Accounts'],
            ['contacts', 'Contacts'],
            ['opps', 'Opportunities'],
            ['quotes', 'Quotes'],
            ['products', 'Products'],
            ['approvals', 'Approvals'],
            ['invoices', 'Invoices'],
            ['users', 'User accounts'],
          ];
    let v = location.hash.slice(1) || 'home';
    navEl.innerHTML =
      links
        .map(
          ([k, l]) =>
            `<a href="#${k}" class="px-3 py-2 font-semibold whitespace-nowrap" style="${v === k || (v === 'quote' && k === 'quotes') || (v === 'invoice-detail' && k === 'invoices') || (v === 'opp-detail' && k === 'opps') ? 'border-bottom:3px solid var(--pr);color:var(--pr)' : 'color:var(--mut)'}">${l}</a>`
        )
        .join('') +
      `<span class="flex-1"></span><span class="mut self-center px-2">${E(user.name)} · ${user.role.toUpperCase()}</span><a href="#" class="px-3 py-2 mut" onclick="logoutUser();return false">Sign out</a>`;
  }
  const sw = $('#role-switch');
  if (sw) sw.style.display = 'none';
};
