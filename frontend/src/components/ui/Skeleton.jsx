export function SkeletonBlock({ className = '' }) {
  return <div className={`animate-pulse rounded-2xl bg-line ${className}`} />;
}

export function MovieGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <SkeletonBlock key={index} className="aspect-[2/3]" />
      ))}
    </div>
  );
}
