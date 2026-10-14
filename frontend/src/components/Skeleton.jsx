// Grey pulsing boxes shown while data loads
export function Skeleton({ className = "" }) {
  return <div className={`animate-pulse rounded-2xl bg-sand/60 ${className}`} aria-hidden="true" />;
}

export function ListingCardSkeleton() {
  return (
    <div role="status" aria-label="Loading">
      <Skeleton className="aspect-[4/5] w-full" />
      <Skeleton className="mt-3 h-4 w-3/4" />
      <Skeleton className="mt-2 h-3 w-1/2" />
    </div>
  );
}

export function ListingGridSkeleton({ count = 6, className = "grid gap-6 sm:grid-cols-2 lg:grid-cols-3" }) {
  return (
    <div className={className}>
      {Array.from({ length: count }).map((_, i) => (
        <ListingCardSkeleton key={i} />
      ))}
    </div>
  );
}
