/** Customer account domain helpers. */
export function validateAccount(account) {
  const errors = {};
  if (!account?.name?.trim()) errors.name = 'Account name is required';
  if (account?.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(account.email)) errors.email = 'Enter a valid email';
  return { valid: !Object.keys(errors).length, errors };
}
export function accountHealth(account) {
  if (account?.status === 'At Risk' || Number(account?.overdueInvoices) > 0) return 'At Risk';
  if (account?.status === 'Inactive') return 'Inactive';
  return 'Healthy';
}
export function searchAccounts(accounts, query = '') {
  const q = query.trim().toLowerCase();
  return accounts.filter((a) => !q || [a.name, a.email, a.industry, a.owner].some((v) => String(v ?? '').toLowerCase().includes(q)));
}
