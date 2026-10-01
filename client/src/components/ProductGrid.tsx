import type { Product } from "../api/products.ts";
import { LoadError } from "./LoadError.tsx";
import { ProductCard } from "./ProductCard.tsx";
import { ProductCardSkeleton } from "./ProductCardSkeleton.tsx";

const skeletonCount = 8;

const gridClassName =
  "grid grid-cols-1 gap-y-12 md:grid-cols-2 md:gap-x-10 md:gap-y-14 lg:grid-cols-4 lg:gap-x-12";

type ProductGridProps = {
  products: Product[] | undefined;
  isPending: boolean;
  isError: boolean;
  isNoMatch: boolean;
  noMatchMessage: string;
  onClearFilters: () => void;
  onRetry: () => void;
};

export function ProductGrid({
  products,
  isPending,
  isError,
  isNoMatch,
  noMatchMessage,
  onClearFilters,
  onRetry,
}: ProductGridProps) {
  if (isPending) {
    return (
      <ul aria-busy="true" aria-label="Loading products" className={gridClassName}>
        {Array.from({ length: skeletonCount }, (_, index) => (
          <li key={index}>
            <ProductCardSkeleton />
          </li>
        ))}
      </ul>
    );
  }

  if (isError) {
    return <LoadError message="Could not load products." onRetry={onRetry} />;
  }

  if (isNoMatch) {
    return (
      <div>
        <p className="text-foreground">{noMatchMessage}</p>
        <button
          type="button"
          onClick={onClearFilters}
          className="mt-5 rounded border border-border px-4 py-2 text-sm"
        >
          Clear filters
        </button>
      </div>
    );
  }

  if (products === undefined || products.length === 0) {
    return <p className="text-muted">No products yet.</p>;
  }

  return (
    <ul className={gridClassName}>
      {products.map((product) => (
        <li key={product.id}>
          <ProductCard product={product} />
        </li>
      ))}
    </ul>
  );
}
