export function ProductCardSkeleton() {
  return (
    <div aria-hidden="true">
      <div className="aspect-square animate-pulse rounded bg-subtle" />
      <div className="mt-4 h-7 animate-pulse rounded bg-subtle" />
      <div className="mt-2 h-5 w-1/3 animate-pulse rounded bg-subtle" />
      <div className="mt-3 h-5 w-1/4 animate-pulse rounded bg-subtle" />
    </div>
  );
}
