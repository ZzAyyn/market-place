import type { Product } from "../api/products.ts";
import { formatPrice } from "../formatPrice.ts";

export function ProductCard({ product }: { product: Product }) {
  return (
    <article>
      <div className="aspect-square overflow-hidden rounded bg-subtle">
        {product.imageUrl !== null ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : null}
      </div>
      <h2 className="mt-3 truncate text-lg">{product.name}</h2>
      <p className="mt-1 truncate text-sm text-muted">{product.category.name}</p>
      <p className="mt-2 text-sm">{formatPrice(product.priceCents)}</p>
    </article>
  );
}
