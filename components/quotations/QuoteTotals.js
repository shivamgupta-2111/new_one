import { calculateQuotation } from '@/modules/quotations';
import { formatINR } from '@/lib/currency';
export default function QuoteTotals({ items, discountPercent = 0, taxPercent = 0 }) {
  const totals = calculateQuotation(items, discountPercent, taxPercent);
  return <dl className="ml-auto grid max-w-xs grid-cols-2 gap-x-8 gap-y-2 text-sm"><dt>Subtotal</dt><dd className="text-right">{formatINR(totals.subtotal)}</dd><dt>Discount</dt><dd className="text-right">−{formatINR(totals.discount)}</dd><dt>Tax</dt><dd className="text-right">{formatINR(totals.tax)}</dd><dt className="border-t pt-2 font-bold">Total</dt><dd className="border-t pt-2 text-right font-bold">{formatINR(totals.total)}</dd></dl>;
}
