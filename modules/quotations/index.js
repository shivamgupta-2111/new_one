/** Quotation totals, discounts and lifecycle helpers. */
export function calculateQuotation(items = [], discountPercent = 0, taxPercent = 0) {
  const subtotal = items.reduce((sum, item) => sum + Number(item.quantity || 0) * Number(item.unitPrice || 0), 0);
  const discount = subtotal * Math.min(100, Math.max(0, Number(discountPercent) || 0)) / 100;
  const taxable = subtotal - discount;
  const tax = taxable * Math.max(0, Number(taxPercent) || 0) / 100;
  return { subtotal, discount, taxable, tax, total: taxable + tax };
}
export function validateQuotation(items = []) {
  if (!items.length) return { valid: false, error: 'Add at least one line item' };
  if (items.some((i) => !(Number(i.quantity) > 0) || !(Number(i.unitPrice) >= 0))) return { valid: false, error: 'Each item needs a positive quantity and non-negative price' };
  return { valid: true, error: null };
}
export function submitQuotation(quotation) { return { ...quotation, status: 'Pending Approval', submittedAt: new Date().toISOString() }; }
