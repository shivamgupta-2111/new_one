/** Invoice numbering, GST calculation and payment status helpers. */
export function nextInvoiceNumber(existing = [], year = new Date().getFullYear()) {
  const prefix = `INV-${year}-`;
  const max = existing.map((x) => String(x.number || '')).filter((n) => n.startsWith(prefix)).map((n) => Number(n.slice(prefix.length)) || 0).reduce((a, b) => Math.max(a, b), 0);
  return `${prefix}${String(max + 1).padStart(4, '0')}`;
}
export function calculateGST(amount, rate = 18, interstate = false) {
  const taxable = Math.max(0, Number(amount) || 0), tax = taxable * Math.max(0, Number(rate) || 0) / 100;
  return interstate ? { igst: tax, cgst: 0, sgst: 0, total: taxable + tax } : { igst: 0, cgst: tax / 2, sgst: tax / 2, total: taxable + tax };
}
export function paymentStatus(invoice) {
  if (Number(invoice.paidAmount) >= Number(invoice.total)) return 'Paid';
  if (Number(invoice.paidAmount) > 0) return 'Partially Paid';
  return new Date(invoice.dueDate) < new Date() ? 'Overdue' : 'Unpaid';
}
