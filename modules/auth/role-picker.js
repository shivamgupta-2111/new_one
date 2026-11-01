// Portal picker added to the header.

// Preserve the prototype's opportunity detail UI and add clickable quote/invoice history.
// Add portal picker without changing the existing header layout.
const rolePicker = document.createElement('select');
rolePicker.id = 'role-switch';
rolePicker.className = 'inp';
rolePicker.style.width = 'auto';
rolePicker.style.maxWidth = '145px';
rolePicker.innerHTML =
  '<option value="rep">Rep portal</option><option value="admin">Admin portal</option><option value="ceo">CEO portal</option>';
rolePicker.value = S.role;
rolePicker.onchange = () => setRole(rolePicker.value);
const headerActions = document.querySelector('header .flex.items-center');
if (headerActions) {
  const avatar = headerActions.querySelector('span[title="Alex Lee"]');
  if (avatar) avatar.parentNode.insertBefore(rolePicker, avatar);
}
