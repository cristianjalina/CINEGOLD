export default function SectionTitle({ children, className = '' }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <span className="h-6 w-1 rounded-sm bg-gold" />
      <h2 className="text-2xl font-bold uppercase tracking-wider text-gold">{children}</h2>
    </div>
  );
}
