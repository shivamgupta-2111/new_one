// User list and create-user form.

V.users = () => {
  const u = S.users.filter((x) => x.active !== false);
  return (
    `<div class="flex items-center mb-3"><div class="flex-1"><h1 class="text-xl font-bold">User accounts</h1><p class="mut">Manage portal access and team accounts</p></div><button class="btn btn-p" onclick="openUserForm()">Create account</button></div>` +
    table(
      ['Name', 'Username', 'Role', 'Owner code', 'Status'],
      u
        .map(
          (x) =>
            `<tr><td><b>${E(x.name)}</b></td><td>${E(x.username)}</td><td>${x.role.toUpperCase()}</td><td>${E(x.ownerCode || '—')}</td><td><span class="chip ok">Active</span></td></tr>`
        )
        .join('')
    ) +
    `<p class="mut mt-3">Admins can create Rep accounts. CEOs can create Admin and Rep accounts.</p>`
  );
};
function openUserForm() {
  const role = S.role,
    allowed = role === 'ceo' ? ['admin', 'rep'] : role === 'admin' ? ['rep'] : [];
  if (!allowed.length) return toast('You do not have permission to create accounts');
  $('#modal').innerHTML =
    `<div class="fixed inset-0 z-40 grid place-items-center p-4" style="background:rgba(0,0,0,.5)"><form class="card p-5 w-full max-w-md space-y-3" onsubmit="createUser(event)"><h2 class="text-lg font-bold">Create user account</h2>
 <label class="block">Full name<input class="inp mt-1" name="name" required></label>
 <label class="block">Username<input class="inp mt-1" name="username" required></label>
 <label class="block">Temporary password<input class="inp mt-1" name="password" type="password" minlength="8" required></label>
 <label class="block">Portal role<select class="inp mt-1" name="role">${allowed.map((r) => `<option value="${r}">${r === 'admin' ? 'Admin' : 'Rep'}</option>`).join('')}</select></label>
 <div class="mut text-xs">${role === 'ceo' ? 'CEO can create Admin and Rep accounts.' : 'Admin can create Rep accounts only.'}</div>
 <div class="flex justify-end gap-2"><button type="button" class="btn" onclick="$('#modal').innerHTML=''">Cancel</button><button class="btn btn-p">Create account</button></div></form></div>`;
}
function createUser(e) {
  e.preventDefault();
  const v = Object.fromEntries(new FormData(e.target)),
    allowed = S.role === 'ceo' ? ['admin', 'rep'] : S.role === 'admin' ? ['rep'] : [];
  if (!allowed.includes(v.role)) return toast('Not authorised to create this role');
  if (S.users.some((u) => u.username.toLowerCase() === v.username.trim().toLowerCase()))
    return toast('Username already exists');
  const id = 'u-' + Date.now(),
    ownerCode = 'U' + (S.users.length + 1);
  S.users.push({
    id,
    name: v.name.trim(),
    username: v.username.trim(),
    password: v.password,
    role: v.role,
    ownerCode,
    active: true,
  });
  OWN[ownerCode] = v.name.trim();
  $('#modal').innerHTML = '';
  save();
  toast(v.role.toUpperCase() + ' account created');
  render();
}
