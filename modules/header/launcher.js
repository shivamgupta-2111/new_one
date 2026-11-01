// App launcher and favourites.

// Header: app launcher, favourites, settings, help, theme and keyboard shortcut
const APP_ICONS = {
  home: 'home',
  leads: 'person_search',
  accounts: 'domain',
  contacts: 'contacts',
  opps: 'handshake',
  quotes: 'request_quote',
  products: 'inventory_2',
  approvals: 'approval',
  invoices: 'receipt_long',
  users: 'group',
  settings: 'settings',
};
const APP_LABELS = {
  home: 'Home',
  leads: 'Leads',
  accounts: 'Accounts',
  contacts: 'Contacts',
  opps: 'Opportunities',
  quotes: 'Quotes',
  products: 'Products',
  approvals: 'Approvals',
  invoices: 'Invoices',
  users: 'User accounts',
  settings: 'Settings',
};
const appsForRole = () =>
  S.role === 'rep'
    ? ['home', 'leads', 'accounts', 'contacts', 'opps', 'quotes', 'invoices', 'settings']
    : [
        'home',
        'leads',
        'accounts',
        'contacts',
        'opps',
        'quotes',
        'products',
        'approvals',
        'invoices',
        'users',
        'settings',
      ];
const panelTitle = (t) =>
  `<div class="p-3 font-bold" style="border-bottom:1px solid var(--bd)">${t}</div>`;

function toggleAppLauncher() {
  openPanel(
    'app-launcher',
    panelTitle('App Launcher') +
      `<div class="p-2" style="display:grid;grid-template-columns:repeat(3,1fr);gap:4px">${appsForRole()
        .map(
          (k) =>
            `<button class="hdr-item" onclick="closePanels();nav('${k}')"><span class="ms">${APP_ICONS[k]}</span><span>${APP_LABELS[k]}</span></button>`
        )
        .join('')}</div>`,
    'left'
  );
}
function toggleFavorites() {
  const fav = visibleOpps().filter((o) => o.fol);
  openPanel(
    'favorites',
    panelTitle('Favorites') +
      (fav
        .map(
          (o) =>
            `<div class="flex gap-3 p-3 cursor-pointer hdr-row" style="border-bottom:1px solid var(--bd)" onclick="closePanels();nav('opp-detail',${o.id})"><span class="ms" style="color:var(--warn)">star</span><div><div class="font-semibold">${E(o.name)}</div><small class="mut">${E(o.account)} · ${M(o.amount)}</small></div></div>`
        )
        .join('') ||
        '<p class="mut p-4">No favorites yet. Choose <b>Follow</b> on an opportunity to add it here.</p>')
  );
}
