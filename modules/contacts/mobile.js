// Contacts with mobile number: list, form and edit.

// Extend contact creation and display with mobile number.
V.contacts = () =>
  `<div class="flex items-center mb-3"><h1 class="text-xl font-bold flex-1">Contacts</h1><button class="btn btn-p" onclick="openContactForm()">New contact</button></div>` +
  table(
    ['Name', 'Title', 'Account', 'Email', 'Mobile'],
    S.contacts
      .map(
        (c) =>
          `<tr><td><b>${E(c[0])}</b></td><td>${E(c[1])}</td><td>${E(c[2])}</td><td><a style="color:var(--pr)" href="mailto:${E(c[3])}">${E(c[3])}</a></td><td><a style="color:var(--pr)" href="tel:${E(c[4])}">${E(c[4] || '—')}</a></td></tr>`
      )
      .join('')
  );
function openContactForm() {
  $('#modal').innerHTML =
    `<div class="fixed inset-0 z-40 grid place-items-center p-4" style="background:rgba(0,0,0,.5)"><form class="card p-5 w-full max-w-md space-y-3" onsubmit="saveContact(event)"><h2 class="text-lg font-bold">New contact</h2>${[
      ['name', 'Full name'],
      ['title', 'Job title'],
      ['account', 'Account'],
      ['email', 'Email'],
      ['mobile', 'Mobile number'],
    ]
      .map(
        ([n, l]) =>
          `<label class="block">${l}<input class="inp" name="${n}" ${n === 'email' ? 'type="email"' : ''} ${n === 'mobile' ? 'type="tel"' : ''} required></label>`
      )
      .join(
        ''
      )}<div class="flex justify-end gap-2"><button type="button" class="btn" onclick="$('#modal').innerHTML=''">Cancel</button><button class="btn btn-p">Save</button></div></form></div>`;
}
function saveContact(e) {
  e.preventDefault();
  const v = Object.fromEntries(new FormData(e.target));
  S.contacts.push([v.name, v.title, v.account, v.email, v.mobile]);
  $('#modal').innerHTML = '';
  save();
  toast('Contact added');
  render();
}
function editContactMobile(name) {
  const c = S.contacts.find((x) => x[0] === name);
  if (!c) return;
  $('#modal').innerHTML =
    `<div class="fixed inset-0 z-40 grid place-items-center p-4" style="background:rgba(0,0,0,.5)"><form class="card p-5 w-full max-w-md space-y-3" onsubmit="saveContactMobile(event,'${E(name)}')"><h2 class="text-lg font-bold">Contact mobile number</h2><label class="block">Mobile number<input class="inp" name="mobile" type="tel" value="${E(c[4] || '')}" placeholder="+91 98765 43210" required></label><div class="flex justify-end gap-2"><button type="button" class="btn" onclick="$('#modal').innerHTML=''">Cancel</button><button class="btn btn-p">Save</button></div></form></div>`;
}
function saveContactMobile(e, name) {
  e.preventDefault();
  const c = S.contacts.find((x) => x[0] === name);
  if (c) {
    c[4] = new FormData(e.target).get('mobile');
    save();
    $('#modal').innerHTML = '';
    toast('Mobile number saved');
    render();
  }
}
