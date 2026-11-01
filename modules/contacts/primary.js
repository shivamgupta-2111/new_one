// Contacts page with designation, email and primary-contact flag.

// Contacts page: designation, email, contact number and primary-contact flag (c[5]).
V.contacts = () =>
  `<div class="flex items-center mb-3"><h1 class="text-xl font-bold flex-1">Contacts</h1><button class="btn btn-p" onclick="openContactForm()">New contact</button></div>` +
  table(
    ['Name', 'Designation', 'Account', 'Email', 'Contact number', ''],
    S.contacts
      .map(
        (c, i) =>
          `<tr><td><b>${E(c[0])}</b> ${c[5] ? '<span class="chip">Primary</span>' : ''}</td><td>${E(c[1])}</td><td>${E(c[2])}</td><td><a style="color:var(--pr)" href="mailto:${E(c[3])}">${E(c[3])}</a></td><td><a style="color:var(--pr)" href="tel:${E(c[4])}">${E(c[4] || '—')}</a></td><td class="text-right whitespace-nowrap"><button class="btn" onclick="openContactEditor(${i})">Edit</button> <button class="btn" style="color:var(--err)" onclick="deleteContact(${i})">Delete</button></td></tr>`
      )
      .join('')
  );
function contactFormHtml(c, submit, title, saveLabel) {
  const val = (k) => E((c && c[k]) || '');
  return `<div class="fixed inset-0 z-40 grid place-items-center p-4" style="background:rgba(0,0,0,.5)"><form class="card p-5 w-full max-w-lg max-h-full overflow-auto" onsubmit="${submit}"><h2 class="text-lg font-bold mb-3">${title}</h2><div class="grid sm:grid-cols-2 gap-3"><label class="block sm:col-span-2">Full name *<input class="inp" name="name" value="${val(0)}" required></label><label class="block">Designation *<input class="inp" name="title" value="${val(1)}" placeholder="e.g. Chief Operating Officer" required></label><label class="block">Account *<input class="inp" name="account" value="${val(2)}" list="acct-list" required><datalist id="acct-list">${knownAccounts()
    .map((a) => `<option value="${E(a)}">`)
    .join(
      ''
    )}</datalist></label><label class="block">Email *<input class="inp" name="email" type="email" value="${val(3)}" required></label><label class="block">Contact number *<input class="inp" name="mobile" type="tel" value="${val(4)}" placeholder="+91 98765 43210" required></label><label class="flex items-center gap-2 sm:col-span-2"><input type="checkbox" name="primary" ${c && c[5] ? 'checked' : ''}> Primary contact for this account</label></div><div class="flex justify-end gap-2 mt-4"><button type="button" class="btn" onclick="$('#modal').innerHTML=''">Cancel</button><button class="btn btn-p">${saveLabel}</button></div></form></div>`;
}
// Only one primary contact per account.
function applyPrimaryContact(index) {
  const mine = S.contacts[index];
  if (!mine[5]) return;
  S.contacts.forEach((c, i) => {
    if (i !== index && String(c[2]).toLowerCase() === String(mine[2]).toLowerCase()) c[5] = false;
  });
}
function openContactForm() {
  $('#modal').innerHTML = contactFormHtml(null, 'saveContact(event)', 'New contact', 'Save');
  $('#modal input').focus();
}
function saveContact(e) {
  e.preventDefault();
  const v = Object.fromEntries(new FormData(e.target));
  S.contacts.push([
    v.name.trim(),
    v.title.trim(),
    v.account.trim(),
    v.email.trim(),
    v.mobile.trim(),
    !!v.primary,
  ]);
  applyPrimaryContact(S.contacts.length - 1);
  $('#modal').innerHTML = '';
  save();
  toast('Contact added');
  render();
}
function openContactEditor(i) {
  const c = S.contacts[i];
  if (!c) return;
  $('#modal').innerHTML = contactFormHtml(
    c,
    `saveContactEdit(event,${i})`,
    'Edit contact',
    'Save changes'
  );
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
    !!v.primary,
  ];
  applyPrimaryContact(i);
  $('#modal').innerHTML = '';
  save();
  toast('Contact updated');
  render();
}
