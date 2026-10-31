/** User administration and role-assignment rules. */
export const USER_ROLES = ['rep', 'admin', 'ceo'];
export function validateUser(user) {
  const errors = {};
  if (!user?.name?.trim()) errors.name = 'Name is required';
  if (!user?.username?.trim()) errors.username = 'Username is required';
  if (!USER_ROLES.includes(user?.role)) errors.role = 'Select a valid role';
  return { valid: Object.keys(errors).length === 0, errors };
}
export function createUser(input, existing = []) {
  const result = validateUser(input);
  if (!result.valid) return { user: null, errors: result.errors };
  if (existing.some((u) => u.username.toLowerCase() === input.username.trim().toLowerCase()))
    return { user: null, errors: { username: 'Username already exists' } };
  return { user: { ...input, id: input.id ?? crypto.randomUUID(), active: input.active !== false }, errors: {} };
}
export function setUserActive(users, id, active) {
  return users.map((user) => user.id === id ? { ...user, active: Boolean(active) } : user);
}
