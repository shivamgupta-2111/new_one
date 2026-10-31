export default function EmptyState({ title = 'Nothing here yet', description = 'Add a record to get started', action }) {
  return <div className="rounded-lg border border-dashed border-slate-300 p-8 text-center"><h3 className="font-semibold">{title}</h3><p className="mt-1 text-sm text-slate-500">{description}</p>{action ? <div className="mt-4">{action}</div> : null}</div>;
}
