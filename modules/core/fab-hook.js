// Shows the Back to top button only inside the signed-in CRM (not on the login screen or the client pages).
function syncFab() {
  mountFab();
  const f = document.getElementById('crm-fab');
  if (!f) return;
  const hidden = !S.authUser || clientRoute();
  f.style.display = hidden ? 'none' : '';
  updateFab();
}
const renderBeforeFab = render;
render = function () {
  const r = renderBeforeFab.apply(this, arguments);
  syncFab();
  return r;
};
addEventListener('hashchange', () => setTimeout(syncFab, 0));
syncFab();
