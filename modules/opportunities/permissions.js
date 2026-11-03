// Who may create opportunities: Admin, CEO and Senior Reps. Regular reps cannot.
// "Senior rep" is a rep account with senior = true: same portal and data access, plus permission to add opportunities.

function isSeniorRep(u) {
  return !!u && u.role === 'rep' && u.senior === true;
}
function roleTitle(u) {
  return isSeniorRep(u) ? 'SENIOR REP' : String((u && u.role) || '').toUpperCase();
}
// Admin, CEO and Senior Reps get the extra rights below; regular reps do not.
function hasSeniorRights() {
  if (['admin', 'ceo'].includes(S.role)) return true;
  return isSeniorRep((S.users || []).find((u) => u.id === S.authUser));
}
function canAddOpportunity() {
  return hasSeniorRights();
}
function canEditOwner() {
  return hasSeniorRights(); // change an opportunity's assigned rep
}
function canEditAddress() {
  return hasSeniorRights(); // account address and shipping address
}
// Invoices are for Admin and CEO only. A Senior Rep's extra rights are just: add opportunities,
// edit account addresses and reassign opportunities to any rep (plus seeing all teams).
function canSeeInvoices() {
  return !S.authUser || ['admin', 'ceo'].includes(S.role);
}
const NO_ADD_OPP_MSG = 'Only Admin, CEO and Senior Reps can add opportunities';

// One-time demo data: Dan Mills (login dan / rep123) is a Senior Rep; everyone else stays a regular rep.
if (!S.seniorSeeded) {
  const dan = (S.users || []).find((u) => u.username === 'dan' && u.role === 'rep');
  if (dan && dan.senior == null) dan.senior = true;
  S.seniorSeeded = true;
  save();
}

// Block every path that creates an opportunity.
const modalBeforePermissions = modal;
modal = function (k) {
  if (k === 'opp' && !canAddOpportunity()) return toast(NO_ADD_OPP_MSG);
  return modalBeforePermissions.apply(this, arguments);
};
const saveOpportunityBeforePermissions = saveOpportunityExtended;
saveOpportunityExtended = function (e) {
  if (!canAddOpportunity()) {
    e.preventDefault();
    $('#modal').innerHTML = '';
    return toast(NO_ADD_OPP_MSG);
  }
  return saveOpportunityBeforePermissions.apply(this, arguments);
};
const convertBeforePermissions = convert; // lead -> opportunity also creates one
convert = function () {
  if (!canAddOpportunity()) return toast(NO_ADD_OPP_MSG);
  return convertBeforePermissions.apply(this, arguments);
};

// Admin / CEO can promote a rep to Senior Rep, or take it away again.
function toggleSeniorRep(id) {
  const u = S.users.find((x) => x.id === id);
  if (!['admin', 'ceo'].includes(S.role) || !u || u.role !== 'rep')
    return toast('You do not have permission to change this account');
  u.senior = !isSeniorRep(u);
  save();
  toast(u.name + (u.senior ? ' is now a Senior Rep' : ' is now a regular Rep'));
  render();
}

// Invoices are hidden from regular reps: routes, the open action, nav links and invoice columns.
const navBeforeInvoiceGuard = nav;
nav = function (v) {
  if (['invoices', 'invoice-detail'].includes(v) && !canSeeInvoices())
    return toast('Invoices are not available for your role');
  return navBeforeInvoiceGuard.apply(this, arguments);
};
const openInvoiceBeforeGuard = openInvoice;
openInvoice = function () {
  if (!canSeeInvoices()) return toast('Invoices are not available for your role');
  return openInvoiceBeforeGuard.apply(this, arguments);
};
function hideInvoiceUi() {
  if (canSeeInvoices()) return;
  document.querySelectorAll('#nav a[href="#invoices"]').forEach((a) => a.remove());
  document.querySelectorAll('#app table').forEach((t) => {
    const th = [...t.querySelectorAll('th')].find((h) =>
      /^invoice( no\.)?$/i.test(h.textContent.trim())
    );
    if (!th) return;
    const i = th.cellIndex;
    t.querySelectorAll('tr').forEach((r) => r.cells[i] && r.cells[i].remove());
  });
}
const renderBeforeInvoiceGuard = render;
render = function () {
  if (['invoices', 'invoice-detail'].includes(location.hash.slice(1)) && !canSeeInvoices())
    location.hash = '#home';
  renderBeforeInvoiceGuard.apply(this, arguments);
  hideInvoiceUi();
};

// The app's hashchange listeners hold older copies of render(), so after a real navigation (clicking a nav link)
// the invoice clean-up, redirect and approval pop-ups are re-applied here.
['invoices', 'invoice-detail'].forEach((k) => {
  const base = V[k];
  V[k] = function () {
    return canSeeInvoices()
      ? base.apply(this, arguments)
      : '<div class="card p-4"><b>Not available</b><p class="mut mt-1">Invoices are not available for your role.</p></div>';
  };
});
addEventListener('hashchange', () => {
  if (['invoices', 'invoice-detail'].includes(location.hash.slice(1)) && !canSeeInvoices())
    return (location.hash = '#home');
  hideInvoiceUi();
  showNextPopup();
});

// Activity text mentions invoice numbers; people who cannot see invoices only see "invoice".
function hideInvoiceRefs(text) {
  return canSeeInvoices()
    ? text
    : String(text)
        .replace(/invoice\s+INV-[\w-]+/gi, 'invoice')
        .replace(/INV-[\w-]+/g, 'invoice');
}
