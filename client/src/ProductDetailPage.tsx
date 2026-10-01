import { Link, useParams } from "react-router";
import { ApiError } from "./api/client.ts";
import { useProduct, type ProductDetail } from "./api/products.ts";
import { ProductDetailSkeleton } from "./components/ProductDetailSkeleton.tsx";
import { formatPrice } from "./formatPrice.ts";

function BackToShop() {
  return (
    <Link to="/" className="inline-block text-sm underline">
      Back to the shop
    </Link>
  );
}

function ProductNotFound() {
  return (
    <div>
      <h1 className="text-3xl">Product not found</h1>
      <p className="mt-3 text-muted">No product exists at this address.</p>
      <div className="mt-4">
        <BackToShop />
      </div>
    </div>
  );
}

function ProductLoadError({ message }: { message: string }) {
  return (
    <div>
      <p className="text-destructive" role="alert">
        {message}
      </p>
      <div className="mt-4">
        <BackToShop />
      </div>
    </div>
  );
}

function ProductDetail({ product }: { product: ProductDetail }) {
  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
      <div className="aspect-square overflow-hidden rounded bg-subtle">
        {product.imageUrl !== null ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-full w-full object-cover"
          />
        ) : null}
      </div>
      <div>
        <h1 className="text-3xl">{product.name}</h1>
        <p className="mt-3 text-sm text-muted">{product.category.name}</p>
        <p className="mt-3 text-base">{formatPrice(product.priceCents)}</p>
        <p className="mt-3 text-sm text-muted">
          {product.stock === 0 ? "Out of stock" : `${product.stock} in stock`}
        </p>
        <p className="mt-6 max-w-prose text-base">{product.description}</p>
        <div className="mt-8">
          <BackToShop />
        </div>
      </div>
    </div>
  );
}

export function ProductDetailPage() {
  const { slug } = useParams();
  const productQuery = useProduct(slug);
  const product = productQuery.data?.data;

  let content;

  if (slug === undefined || slug.length === 0) {
    content = <ProductNotFound />;
  } else if (productQuery.isPending) {
    content = <ProductDetailSkeleton />;
  } else if (productQuery.error instanceof ApiError && productQuery.error.status === 404) {
    content = <ProductNotFound />;
  } else if (productQuery.isError || product === undefined) {
    const message =
      productQuery.error instanceof Error
        ? productQuery.error.message
        : "Could not load this product.";
    content = <ProductLoadError message={message} />;
  } else {
    content = <ProductDetail product={product} />;
  }

  return <main className="px-6 py-8">{content}</main>;
}
