export default function Badge({ children }) {
  return (
    <span className="inline-flex rounded-md border border-gold px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-gold">
      {children}
    </span>
  );
}
