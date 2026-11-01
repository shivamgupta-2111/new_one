// Router: renders the view for the current hash.

function render() {
  let v = location.hash.slice(1) || 'home';
  if (!V[v]) v = 'home';
  const act = v == 'opp-detail' || v == 'quote' ? 'opps' : v;
  $('#nav').innerHTML =
    [
      ['home', 'Home'],
      ['leads', 'Leads'],
      ['accounts', 'Accounts'],
      ['contacts', 'Contacts'],
      ['opps', 'Opportunities'],
      ['quotes', 'Quotes'],
      ['settings', 'Settings'],
    ]
      .map(
        (n) =>
          `<a href="#${n[0]}" class="px-3 py-2 font-semibold whitespace-nowrap" style="${act == n[0] ? 'border-bottom:3px solid var(--pr);color:var(--pr)' : 'color:var(--mut)'}">${n[1]}</a>`
      )
      .join('') +
    `<span class="flex-1"></span><a href="#home" class="px-3 py-2 mut" onclick="if(confirm('Reset all demo data?')){localStorage.removeItem(KEY);location.reload()}">Reset demo</a>`;
  $('#app').innerHTML = V[v]();
  const ed = $('[data-ed]');
  ed ? ed.focus() : scrollTo(0, 0);
}
addEventListener('hashchange', render);
// Later sections define more helpers; the final render() at the end of the file draws the page.
try {
  render();
} catch (e) {}
