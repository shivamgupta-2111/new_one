export default function PageHeader({ title, description, actions }) {
  return <div className="mb-6 flex flex-wrap items-start justify-between gap-4"><div><h1 className="text-2xl font-bold tracking-tight">{title}</h1>{description ? <p className="mt-1 text-sm text-slate-500">{description}</p> : null}</div>{actions ? <div className="flex gap-2">{actions}</div> : null}</div>;
}
