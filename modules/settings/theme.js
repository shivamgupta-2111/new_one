// Theme (System / Light / Dark), settings and help panels.

// Theme (System / Light / Dark), stored per browser
const getTheme = () => {
  try {
    return localStorage.getItem('sc-theme') || 'system';
  } catch (e) {
    return 'system';
  }
};
function applyTheme() {
  const t = getTheme(),
    r = document.documentElement;
  if (t === 'system') r.removeAttribute('data-theme');
  else r.setAttribute('data-theme', t);
}
function setTheme(t) {
  try {
    if (t === 'system') localStorage.removeItem('sc-theme');
    else localStorage.setItem('sc-theme', t);
  } catch (e) {}
  applyTheme();
  closePanels();
  toggleSettings();
}
applyTheme();

function toggleSettings() {
  closePanels();
  nav('settings');
}

function toggleHelp() {
  const row = (a, b) =>
    `<div class="flex justify-between gap-3 py-1"><span>${a}</span><span class="mut">${b}</span></div>`;
  openPanel(
    'help',
    panelTitle('Help') +
      `<div class="p-3"><div class="mut font-semibold mb-1">Keyboard shortcuts</div>${row('Search', 'Ctrl + K')}${row('Close dialogs and menus, go back', 'Esc')}${row('Switch opportunity tab', 'Alt + 1-9')}${row('Rename opportunity tab', 'F2')}</div><div class="p-3" style="border-top:1px solid var(--bd)"><div class="mut font-semibold mb-1">Quote to invoice</div><p>Open an opportunity and choose <b>Generate quote</b>. Submit it for approval; once approved, an invoice is generated that you can submit to the client and mark as paid.</p><p class="mut mt-2">Approval limits: Reps cannot discount · Admin ${adminDiscountLimit()}% · CEO unlimited. Prices below a product minimum always need CEO approval.</p></div>`
  );
}
addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && String(e.key).toLowerCase() === 'k' && S.authUser) {
    const g = $('#gs');
    if (g) {
      e.preventDefault();
      g.focus();
      g.select();
    }
  }
});
