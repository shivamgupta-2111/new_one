// Users seed, login screen, sign in and sign out.

// Authentication and role-based account administration (prototype/localStorage implementation).
S.users = S.users || [
  {
    id: 'u-ceo',
    name: 'Tony Stark',
    username: 'ceo',
    password: 'ceo123',
    role: 'ceo',
    ownerCode: 'TS',
    active: true,
  },
  {
    id: 'u-admin',
    name: 'Sara Chen',
    username: 'admin',
    password: 'admin123',
    role: 'admin',
    ownerCode: 'SC',
    active: true,
  },
  {
    id: 'u-rep',
    name: 'Alex Lee',
    username: 'rep',
    password: 'rep123',
    role: 'rep',
    ownerCode: 'AL',
    active: true,
  },
];
if (!S.users.some((u) => u.id === S.authUser)) S.authUser = null;
function showLogin() {
  const h = document.querySelector('header');
  if (h) h.style.display = 'none';
  const app = $('#app');
  if (!app) return;
  app.className = 'min-h-screen grid place-items-center p-4';
  app.innerHTML = `<div class="card w-full max-w-md p-6">
 <div class="flex items-center gap-2 mb-5"><span class="ms" style="color:var(--pr);font-size:34px">cloud</span><div><b class="text-xl">Ceph CRM</b><div class="mut text-xs">Sign in to your workspace</div></div></div>
 <h1 class="text-xl font-bold mb-1">Welcome back</h1><p class="mut mb-4">Enter your account details to continue.</p>
 <form class="space-y-3" onsubmit="loginUser(event)">
 <label class="block">Username<input class="inp mt-1" name="username" autocomplete="username" required></label>
 <label class="block">Password<input class="inp mt-1" name="password" type="password" autocomplete="current-password" required></label>
 <div id="login-error" class="text-sm" style="color:var(--err)"></div>
 <button class="btn btn-p w-full justify-center">Sign in</button></form>
 <div class="mt-4 p-3 rounded text-xs" style="background:var(--hov)"><b>Demo accounts</b><br>CEO: ceo / ceo123<br>Admin: admin / admin123<br>Rep: rep / rep123</div>
 <p class="mut text-xs mt-3">Prototype login only. Production requires secure server-side authentication.</p>
 </div>`;
}
function loginUser(e) {
  e.preventDefault();
  const v = Object.fromEntries(new FormData(e.target)),
    u = S.users.find(
      (x) =>
        x.username.toLowerCase() === v.username.trim().toLowerCase() &&
        x.password === v.password &&
        x.active !== false
    );
  if (!u) {
    $('#login-error').textContent = 'Invalid username or password.';
    return;
  }
  S.authUser = u.id;
  S.role = u.role;
  S.mine = u.role === 'rep';
  save();
  const h = document.querySelector('header');
  if (h) h.style.display = '';
  $('#app').className = 'p-3 md:p-4 max-w-[1500px] mx-auto';
  location.hash = '#home';
  render();
}
function logoutUser() {
  S.authUser = null;
  save();
  location.hash = '';
  render();
}
