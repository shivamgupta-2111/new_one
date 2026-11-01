// Portal-specific navigation and record access.

// Portal-specific navigation and record access.
const originalNav = nav;
nav = function (v, id) {
  if (id) S.cur = id;
  if (S.role === 'rep' && v === 'opp-detail' && cur() && cur().owner !== roleNow().owner) {
    toast('This opportunity is outside your portal access');
    return;
  }
  if (S.role === 'rep' && ['approvals', 'products'].includes(v))
    return toast('This section is not available in the Rep portal');
  originalNav(v, id);
};
const originalRender = render;
render = function () {
  let v = location.hash.slice(1) || 'home';
  if (S.role === 'rep' && ['approvals', 'products'].includes(v)) location.hash = '#home';
  if (S.role === 'rep' && v === 'opp-detail' && cur() && cur().owner !== roleNow().owner)
    location.hash = '#home';
  originalRender();
  v = location.hash.slice(1) || 'home';
  const n = document.querySelector('#nav');
  if (n) {
    const links =
      S.role === 'rep'
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
          ];
    n.innerHTML =
      links
        .map(
          ([k, l]) =>
            `<a href="#${k}" class="px-3 py-2 font-semibold whitespace-nowrap" style="${v === k || (v === 'quote' && k === 'quotes') || (v === 'invoice-detail' && k === 'invoices') || (v === 'opp-detail' && k === 'opps') ? 'border-bottom:3px solid var(--pr);color:var(--pr)' : 'color:var(--mut)'}">${l}${k === 'approvals' && S.quotes.filter((q) => q.status.startsWith('Pending')).length ? ` <span class="chip wr">${S.quotes.filter((q) => q.status.startsWith('Pending')).length}</span>` : ''}</a>`
        )
        .join('') +
      '<span class="flex-1"></span><a href="#home" class="px-3 py-2 mut" onclick="if(confirm(\'Reset all demo data?\')){localStorage.removeItem(KEY);location.reload()}">Reset demo</a>';
  }
  const sw = document.querySelector('#role-switch');
  if (sw) sw.value = S.role;
};
// Upgrade existing approved quotes and register the enhanced route renderer.
S.quotes.forEach((q) => {
  if (q.status === 'In Review') q.status = 'Pending Admin Approval';
  if (q.status === 'Approved' && !q.invoiceId) newInvoice(q);
});
addEventListener('hashchange', render);
