// App state S: load/save, current record, toast, hash navigation and table helper.

function load() {
  try {
    return JSON.parse(localStorage.getItem(KEY));
  } catch (e) {
    return null;
  }
}
function save() {
  try {
    const data = { ...S };
    delete data.authUser;
    localStorage.setItem(KEY, JSON.stringify(data));
    if (S.authUser) sessionStorage.setItem('sc-auth-user', S.authUser);
    else sessionStorage.removeItem('sc-auth-user');
  } catch (e) {}
}
let S = load() || seed();
try {
  S.authUser = sessionStorage.getItem('sc-auth-user') || null;
} catch (e) {
  S.authUser = null;
}
const cur = () => S.opps.find((o) => o.id == S.cur),
  prob = (o) => (o.lost ? 0 : PR[o.stage]);
function toast(m) {
  const t = $('#toast');
  t.innerHTML = `<div class="card px-4 py-2 shadow-lg font-semibold" style="background:var(--tx);color:var(--bg)">${m}</div>`;
  clearTimeout(toast.t);
  toast.t = setTimeout(() => (t.innerHTML = ''), 2600);
}
function nav(v, id) {
  if (id) S.cur = id;
  save();
  if (location.hash === '#' + v) render();
  else location.hash = v;
}
const chipC = (o) => (o.stage == 5 ? 'ok' : days(o.close) <= 3 ? 'wr' : '');
function table(h, rows) {
  return `<div class="card overflow-x-auto"><table><thead><tr>${h.map((x) => `<th>${x}</th>`).join('')}</tr></thead><tbody>${rows || `<tr><td colspan="9" class="mut">Nothing here yet. Use New to add the first record.</td></tr>`}</tbody></table></div>`;
}
