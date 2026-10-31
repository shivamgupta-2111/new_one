export default function MetricCard({ label, value, change, icon }) {
  return <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center justify-between text-sm text-slate-500"><span>{label}</span>{icon ? <span aria-hidden="true">{icon}</span> : null}</div><p className="mt-3 text-2xl font-bold text-slate-900">{value}</p>{change ? <p className="mt-1 text-xs text-slate-500">{change}</p> : null}</article>;
}
