/** Contact validation and account relationship helpers. */
export function validateContact(contact) {
  const errors = {};
  if (!contact?.name?.trim()) errors.name = 'Contact name is required';
  if (contact?.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email)) errors.email = 'Enter a valid email';
  if (contact?.mobile && !/^[+()\d\s-]{7,20}$/.test(contact.mobile)) errors.mobile = 'Enter a valid phone number';
  return { valid: !Object.keys(errors).length, errors };
}
export function contactsForAccount(contacts, accountId) { return contacts.filter((c) => c.accountId === accountId); }
