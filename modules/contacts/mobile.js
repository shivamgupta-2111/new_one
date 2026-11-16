// Edit a contact's mobile number.




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
