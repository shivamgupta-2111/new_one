const TONES = { success: 'bg-emerald-50 text-emerald-700', warning: 'bg-amber-50 text-amber-700', danger: 'bg-red-50 text-red-700', info: 'bg-blue-50 text-blue-700', neutral: 'bg-slate-100 text-slate-700' };
export default function StatusBadge({ status, tone = 'neutral' }) {
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${TONES[tone] || TONES.neutral}`}>{status}</span>;
}
