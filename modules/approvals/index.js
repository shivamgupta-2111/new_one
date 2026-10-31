/** Discount approval routing and decision audit helpers. */
export function requiredApprover(discountPercent) {
  const discount = Number(discountPercent) || 0;
  if (discount <= 5) return 'admin';
  if (discount <= 15) return 'ceo';
  return 'ceo';
}
export function canApprove(userRole, discountPercent) {
  const required = requiredApprover(discountPercent);
  return userRole === 'ceo' || (userRole === 'admin' && required === 'admin');
}
export function recordDecision(request, decision, actor, note = '') {
  if (!['Approved', 'Rejected'].includes(decision)) throw new Error('Decision must be Approved or Rejected');
  return { ...request, status: decision, decisionBy: actor, decisionNote: note, decidedAt: new Date().toISOString() };
}
