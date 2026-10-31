/** Authentication helpers for demo/local sessions. Replace with a server session provider in production. */
export const SESSION_KEY = 'sc-session';
export const DEMO_USERS = [
  { username: 'ceo', password: 'ceo123', role: 'ceo', name: 'CEO' },
  { username: 'admin', password: 'admin123', role: 'admin', name: 'Administrator' },
  { username: 'rep', password: 'rep123', role: 'rep', name: 'Sales Representative' },
];
export function authenticate(username, password, users = DEMO_USERS) {
  const user = users.find((item) => item.username === username && item.password === password && item.active !== false);
  return user ? { id: user.id ?? user.username, username: user.username, name: user.name, role: user.role } : null;
}
export function isValidRole(role) { return ['rep', 'admin', 'ceo'].includes(role); }
export function canAccessRole(user, allowedRoles = []) { return Boolean(user && allowedRoles.includes(user.role)); }
