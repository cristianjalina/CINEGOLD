export default function Input({ label, id, className = '', ...props }) {
  return (
    <label className="block text-left">
      {label ? <span className="mb-2 block text-sm font-medium text-cinemaMuted">{label}</span> : null}
      <input
        id={id}
        className={`h-14 w-full rounded-xl border border-line bg-field px-4 text-white placeholder:text-zinc-700 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold ${className}`}
        {...props}
      />
    </label>
  );
}
