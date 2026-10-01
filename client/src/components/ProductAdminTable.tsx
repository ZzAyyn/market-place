import type { Product } from "../api/products.ts";
import { formatPrice } from "../formatPrice.ts";

const skeletonRowCount = 8;

const cellClassName = "px-3 py-3 align-middle";
const headerClassName = `${cellClassName} text-left text-xs font-medium tracking-wide text-muted uppercase`;

function ProductAdminRowSkeleton() {
  return (
    <tr aria-hidden="true" className="border-b border-border">
      <td className={cellClassName}>
        <div className="size-12 animate-pulse rounded bg-subtle" />
      </td>
      <td className={cellClassName}>
        <div className="h-5 w-40 animate-pulse rounded bg-subtle" />
      </td>
      <td className={cellClassName}>
        <div className="h-5 w-24 animate-pulse rounded bg-subtle" />
      </td>
      <td className={cellClassName}>
        <div className="h-5 w-16 animate-pulse rounded bg-subtle" />
      </td>
      <td className={cellClassName}>
        <div className="h-5 w-8 animate-pulse rounded bg-subtle" />
      </td>
      <td className={cellClassName}>
        <div className="h-5 w-6 animate-pulse rounded bg-subtle" />
      </td>
    </tr>
  );
}

function ProductAdminRow({ product }: { product: Product }) {
  return (
    <tr className="border-b border-border">
      <td className={cellClassName}>
        <div className="size-12 overflow-hidden rounded bg-subtle">
          {product.imageUrl !== null ? (
            <img
              src={product.imageUrl}
              alt=""
              className="h-full w-full object-cover"
              loading="lazy"
            />
          ) : null}
        </div>
      </td>
      <td className={cellClassName}>
        <span className="block max-w-xs truncate font-display text-base">{product.name}</span>
      </td>
      <td className={`${cellClassName} text-sm text-muted`}>{product.category.name}</td>
      <td className={`${cellClassName} text-sm whitespace-nowrap`}>
        {formatPrice(product.priceCents)}
      </td>
      <td className={`${cellClassName} text-sm`}>{product.stock}</td>
      <td className={`${cellClassName} text-sm text-muted`}>—</td>
    </tr>
  );
}

type ProductAdminTableProps = {
  products: Product[] | undefined;
  isPending: boolean;
};

export function ProductAdminTable({ products, isPending }: ProductAdminTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-left">
        <caption className="sr-only">Products</caption>
        <thead>
          <tr className="border-b border-border">
            <th scope="col" className={`${cellClassName} text-left`}>
              <span className="sr-only">Image</span>
            </th>
            <th scope="col" className={headerClassName}>
              Name
            </th>
            <th scope="col" className={headerClassName}>
              Category
            </th>
            <th scope="col" className={headerClassName}>
              Price
            </th>
            <th scope="col" className={headerClassName}>
              Stock
            </th>
            <th scope="col" className={headerClassName}>
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {isPending
            ? Array.from({ length: skeletonRowCount }, (_, index) => (
                <ProductAdminRowSkeleton key={index} />
              ))
            : products?.map((product) => <ProductAdminRow key={product.id} product={product} />)}
        </tbody>
      </table>
    </div>
  );
}
