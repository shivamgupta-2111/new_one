// Contact edit and delete.

// Contacts: edit and delete
V.contacts = () =>
  `<div class="flex items-center mb-3"><h1 class="text-xl font-bold flex-1">Contacts</h1><button class="btn btn-p" onclick="openContactForm()">New contact</button></div>` +
  table(
    ['Name', 'Title', 'Account', 'Email', 'Mobile', ''],
    S.contacts
      .map(
        (c, i) =>
          `<tr><td><b>${E(c[0])}</b></td><td>${E(c[1])}</td><td>${E(c[2])}</td><td><a style="color:var(--pr)" href="mailto:${E(c[3])}">${E(c[3])}</a></td><td><a style="color:var(--pr)" href="tel:${E(c[4])}">${E(c[4] || '—')}</a></td><td class="text-right whitespace-nowrap"><button class="btn" onclick="openContactEditor(${i})">Edit</button> <button class="btn" style="color:var(--err)" onclick="deleteContact(${i})">Delete</button></td></tr>`
      )
      .join('')
  );
function openContactEditor(i) {
  const c = S.contacts[i];
  if (!c) return;
  $('#modal').innerHTML =
    `<div class="fixed inset-0 z-40 grid place-items-center p-4" style="background:rgba(0,0,0,.5)"><form class="card p-5 w-full max-w-md space-y-3" onsubmit="saveContactEdit(event,${i})"><h2 class="text-lg font-bold">Edit contact</h2>${[
      ['name', 'Full name', 0],
      ['title', 'Job title', 1],
      ['account', 'Account', 2],
      ['email', 'Email', 3],
      ['mobile', 'Mobile number', 4],
    ]
      .map(
        ([n, l, k]) =>
          `<label class="block">${l}<input class="inp" name="${n}" value="${E(c[k] || '')}" ${n === 'email' ? 'type="email"' : n === 'mobile' ? 'type="tel"' : ''} ${n === 'mobile' ? '' : 'required'}></label>`
      )
      .join(
        ''
      )}<div class="flex justify-end gap-2"><button type="button" class="btn" onclick="$('#modal').innerHTML=''">Cancel</button><button class="btn btn-p">Save changes</button></div></form></div>`;
}
function saveContactEdit(e, i) {
  e.preventDefault();
  const v = Object.fromEntries(new FormData(e.target));
  if (!S.contacts[i]) return;
  S.contacts[i] = [
    v.name.trim(),
    v.title.trim(),
    v.account.trim(),
    v.email.trim(),
    v.mobile.trim(),
  ];
  $('#modal').innerHTML = '';
  save();
  toast('Contact updated');
  render();
}
function deleteContact(i) {
  const c = S.contacts[i];
  if (!c || !confirm('Delete contact ' + c[0] + '?')) return;
  S.contacts.splice(i, 1);
  save();
  toast('Contact deleted');
  render();
}
