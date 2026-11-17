// Delete a contact.




function deleteContact(i) {
  const c = S.contacts[i];
  if (!c || !confirm('Delete contact ' + c[0] + '?')) return;
  S.contacts.splice(i, 1);
  save();
  toast('Contact deleted');
  render();
}
