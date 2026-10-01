import type { Product } from "../api/products.ts";
import { ProductCard } from "./ProductCard.tsx";
import { ProductCardSkeleton } from "./ProductCardSkeleton.tsx";

const skeletonCount = 8;

const gridClassName = "grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4";

type ProductGridProps = {
  products: Product[] | undefined;
  isPending: boolean;
  isError: boolean;
  errorMessage: string | undefined;
  isNoMatch: boolean;
  noMatchMessage: string;
  onClearFilters: () => void;
};

export function ProductGrid({
  products,
  isPending,
  isError,
  errorMessage,
  isNoMatch,
  noMatchMessage,
  onClearFilters,
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
    return (
      <p className="text-destructive" role="alert">
        {errorMessage ?? "Could not load products."}
      </p>
    );
  }

  if (isNoMatch) {
    return (
      <div>
        <p className="text-foreground">{noMatchMessage}</p>
        <button
          type="button"
          onClick={onClearFilters}
          className="mt-4 rounded border border-border px-3 py-2 text-sm"
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
