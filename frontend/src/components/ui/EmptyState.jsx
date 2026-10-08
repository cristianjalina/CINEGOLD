export default function EmptyState({ title = 'No hay información disponible', message = 'Cuando existan datos reales, se mostrarán aquí.' }) {
  return (
    <div className="rounded-3xl border border-line bg-surface p-8 text-center">
      <p className="text-lg font-bold uppercase tracking-wider text-white">{title}</p>
      <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-cinemaMuted">{message}</p>
    </div>
  );
}
