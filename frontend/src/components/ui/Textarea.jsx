export default function Textarea({ label, id, className = '', ...props }) {
  return (
    <label className="block text-left">
      {label ? <span className="mb-2 block text-sm font-medium text-cinemaMuted">{label}</span> : null}
      <textarea
        id={id}
        className={`h-40 w-full resize-none rounded-xl border border-line bg-field px-4 py-3 text-white placeholder:text-zinc-700 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold ${className}`}
        {...props}
      />
    </label>
  );
}
