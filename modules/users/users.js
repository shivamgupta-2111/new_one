// Create-user form.


// teamId is optional: pass it to open the form already set to "Rep" on that team.
function openUserForm(teamId = '') {
  const role = S.role,
    allowed =
      role === 'ceo'
        ? ['admin', 'rep', 'senior_rep']
        : role === 'admin'
          ? ['rep', 'senior_rep']
          : [];
  if (!allowed.length) return toast('You do not have permission to create accounts');
  $('#modal').innerHTML =
    `<div class="fixed inset-0 z-40 grid place-items-center p-4" style="background:rgba(0,0,0,.5)"><form class="card p-5 w-full max-w-md space-y-3" onsubmit="createUser(event)"><h2 class="text-lg font-bold">Create user account</h2>
 <label class="block">Full name<input class="inp mt-1" name="name" required></label>
 <label class="block">Username<input class="inp mt-1" name="username" required></label>
 <label class="block">Temporary password<input class="inp mt-1" name="password" type="password" minlength="8" required></label>
 <label class="block">Portal role<select class="inp mt-1" name="role">${(teamId ? ['rep', 'senior_rep'] : allowed).map((r) => `<option value="${r}">${r === 'admin' ? 'Admin' : r === 'senior_rep' ? 'Senior Rep' : 'Rep'}</option>`).join('')}</select></label>
 <label class="block">Team (reps only)<select class="inp mt-1" name="teamId"><option value="">Unassigned</option>${S.teams.map((t) => `<option value="${t.id}" ${t.id === teamId ? 'selected' : ''}>${E(t.name)}</option>`).join('')}</select></label>
 <div class="mut text-xs">${role === 'ceo' ? 'CEO can create Admin and Rep accounts.' : 'Admin can create Rep accounts only.'}</div>
 <div class="flex justify-end gap-2"><button type="button" class="btn" onclick="$('#modal').innerHTML=''">Cancel</button><button class="btn btn-p">Create account</button></div></form></div>`;
}
function createUser(e) {
  e.preventDefault();
  const v = Object.fromEntries(new FormData(e.target)),
    allowed =
      S.role === 'ceo'
        ? ['admin', 'rep', 'senior_rep']
        : S.role === 'admin'
          ? ['rep', 'senior_rep']
          : [];
  if (!allowed.includes(v.role)) return toast('Not authorised to create this role');
  const senior = v.role === 'senior_rep';
  if (senior) v.role = 'rep';
  if (S.users.some((u) => u.username.toLowerCase() === v.username.trim().toLowerCase()))
    return toast('Username already exists');
  const id = 'u-' + Date.now();
  let ownerCode = 'U' + (S.users.length + 1);
  while (S.users.some((u) => u.ownerCode === ownerCode)) ownerCode += 'x';
  const user = {
    id,
    name: v.name.trim(),
    username: v.username.trim(),
    password: v.password,
    role: v.role,
    ownerCode,
    active: true,
  };
  if (v.role === 'rep') {
    user.teamId = v.teamId || null;
    user.teamLocked = true;
    user.senior = senior;
    user.target = DEFAULT_TARGET;
  }
  S.users.push(user);
  OWN[ownerCode] = v.name.trim();
  $('#modal').innerHTML = '';
  save();
  toast(v.role.toUpperCase() + ' account created');
  render();
}
