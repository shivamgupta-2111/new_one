export default function SectionCard({ title, description, actions, children }) {
  return <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><div className="mb-4 flex items-start justify-between gap-3"><div>{title ? <h2 className="font-semibold">{title}</h2> : null}{description ? <p className="mt-1 text-sm text-slate-500">{description}</p> : null}</div>{actions}</div>{children}</section>;
}
