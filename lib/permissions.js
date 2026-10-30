/** Role capability map used as a starting point for server-side authorization. */
export const ROLE_PERMISSIONS = {
  rep: ["opportunities:read-own", "quotations:create", "invoices:read-own"],
  admin: ["opportunities:read-team", "quotations:approve-up-to-5", "users:create-rep"],
  ceo: ["opportunities:read-all", "quotations:approve-any", "users:create-admin", "users:create-rep"],
};

export function hasPermission(role, permission) {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}
