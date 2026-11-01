// Activate / deactivate users and reset passwords.

// User administration: activate / deactivate and reset password
const manageableRoles = () =>
  S.role === 'ceo' ? ['admin', 'rep'] : S.role === 'admin' ? ['rep'] : [];
V.users = () =>
  `<div class="flex items-center mb-3"><div class="flex-1"><h1 class="text-xl font-bold">User accounts</h1><p class="mut">Manage portal access and team accounts</p></div><button class="btn btn-p" onclick="openUserForm()">Create account</button></div>` +
  table(
    ['Name', 'Username', 'Role', 'Owner code', 'Status', ''],
    S.users
      .map((x) => {
        const can = manageableRoles().includes(x.role) && x.id !== S.authUser,
          on = x.active !== false;
        return `<tr><td><b>${E(x.name)}</b></td><td>${E(x.username)}</td><td>${x.role.toUpperCase()}</td><td>${E(x.ownerCode || '—')}</td><td><span class="chip ${on ? 'ok' : 'wr'}">${on ? 'Active' : 'Inactive'}</span></td><td class="text-right whitespace-nowrap">${can ? `<button class="btn" onclick="openResetPassword('${x.id}')">Reset password</button> <button class="btn" onclick="toggleUserActive('${x.id}')">${on ? 'Deactivate' : 'Activate'}</button>` : ''}</td></tr>`;
      })
      .join('')
  ) +
  `<p class="mut mt-3">Admins can manage Rep accounts. CEOs can manage Admin and Rep accounts.</p>`;
function toggleUserActive(id) {
  const u = S.users.find((x) => x.id === id);
  if (!u || !manageableRoles().includes(u.role) || u.id === S.authUser)
    return toast('You do not have permission to change this account');
  u.active = u.active === false;
  save();
  toast(u.name + (u.active ? ' activated' : ' deactivated'));
  render();
}
function openResetPassword(id) {
  const u = S.users.find((x) => x.id === id);
  if (!u || !manageableRoles().includes(u.role))
    return toast('You do not have permission to reset this password');
  $('#modal').innerHTML =
    `<div class="fixed inset-0 z-40 grid place-items-center p-4" style="background:rgba(0,0,0,.5)"><form class="card p-5 w-full max-w-md space-y-3" onsubmit="saveResetPassword(event,'${id}')"><h2 class="text-lg font-bold">Reset password</h2><p class="mut">Set a new temporary password for ${E(u.name)}.</p><label class="block">New password<input class="inp mt-1" name="password" type="password" minlength="8" required></label><div class="flex justify-end gap-2"><button type="button" class="btn" onclick="$('#modal').innerHTML=''">Cancel</button><button class="btn btn-p">Reset password</button></div></form></div>`;
}
function saveResetPassword(e, id) {
  e.preventDefault();
  const u = S.users.find((x) => x.id === id);
  if (!u || !manageableRoles().includes(u.role)) return toast('Not authorised');
  u.password = new FormData(e.target).get('password');
  $('#modal').innerHTML = '';
  save();
  toast('Password reset for ' + u.name);
}
