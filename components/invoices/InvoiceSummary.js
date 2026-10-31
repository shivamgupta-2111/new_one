import { formatINR } from '@/lib/currency';
import StatusBadge from '@/components/shared/StatusBadge';
export default function InvoiceSummary({ invoice }) {
  return <article className="rounded-lg border border-slate-200 bg-white p-4"><div className="flex items-start justify-between gap-3"><div><h3 className="font-semibold">{invoice.number}</h3><p className="text-sm text-slate-500">{invoice.customerName}</p></div><StatusBadge status={invoice.status} tone={invoice.status === 'Paid' ? 'success' : invoice.status === 'Overdue' ? 'danger' : 'warning'} /></div><p className="mt-4 text-xl font-bold">{formatINR(invoice.total)}</p><p className="mt-1 text-xs text-slate-500">Due {invoice.dueDate}</p></article>;
}
