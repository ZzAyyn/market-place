export function ProductDetailSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-label="Loading product"
      className="grid grid-cols-1 gap-8 md:grid-cols-2"
    >
      <div aria-hidden="true" className="aspect-square animate-pulse rounded bg-subtle" />
      <div aria-hidden="true">
        <div className="h-9 w-2/3 animate-pulse rounded bg-subtle" />
        <div className="mt-3 h-5 w-1/4 animate-pulse rounded bg-subtle" />
        <div className="mt-3 h-5 w-1/5 animate-pulse rounded bg-subtle" />
        <div className="mt-3 h-5 w-1/3 animate-pulse rounded bg-subtle" />
        <div className="mt-6 h-24 animate-pulse rounded bg-subtle" />
      </div>
    </div>
  );
}
