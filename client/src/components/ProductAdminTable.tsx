import type { Product } from "../api/products.ts";
import { formatPrice } from "../formatPrice.ts";

const skeletonRowCount = 8;

const cellClassName = "px-3 py-5 align-middle";
const headerClassName = `${cellClassName} text-left text-xs font-medium tracking-wide text-muted uppercase`;

function ProductThumb({ imageUrl }: { imageUrl: string | null }) {
  return (
    <div className="size-12 overflow-hidden rounded bg-subtle">
      {imageUrl !== null ? (
        <img src={imageUrl} alt="" className="h-full w-full object-cover" loading="lazy" />
      ) : null}
    </div>
  );
}

function ProductAdminActions({
  product,
  onEdit,
  onDelete,
}: {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}) {
  return (
    <div className="flex gap-4">
      <button type="button" onClick={() => onEdit(product)} className="text-sm underline">
        Edit
      </button>
      <button
        type="button"
        onClick={() => onDelete(product)}
        className="text-sm text-destructive underline"
      >
        Delete
      </button>
    </div>
  );
}

function ProductAdminCardSkeleton() {
  return (
    <li aria-hidden="true" className="flex gap-5 border-b border-border pb-6">
      <div className="size-12 shrink-0 animate-pulse rounded bg-subtle" />
      <div className="flex-1">
        <div className="h-6 w-40 animate-pulse rounded bg-subtle" />
        <div className="mt-3 h-4 w-24 animate-pulse rounded bg-subtle" />
        <div className="mt-3 h-4 w-32 animate-pulse rounded bg-subtle" />
      </div>
    </li>
  );
}

function ProductAdminCard({
  product,
  onEdit,
  onDelete,
}: {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}) {
  return (
    <li className="flex gap-5 border-b border-border pb-6">
      <div className="shrink-0">
        <ProductThumb imageUrl={product.imageUrl} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-display text-lg">{product.name}</p>
        <p className="mt-2 text-sm text-muted">{product.category.name}</p>
        <p className="mt-3 text-sm">
          {formatPrice(product.priceCents)}
          <span className="text-muted"> · {product.stock} in stock</span>
        </p>
        <div className="mt-4">
          <ProductAdminActions product={product} onEdit={onEdit} onDelete={onDelete} />
        </div>
      </div>
    </li>
  );
}

function ProductAdminRowSkeleton() {
  return (
    <tr aria-hidden="true" className="border-b border-border">
      <td className={cellClassName}>
        <div className="size-12 animate-pulse rounded bg-subtle" />
      </td>
      <td className={cellClassName}>
        <div className="h-5 w-40 max-w-full animate-pulse rounded bg-subtle" />
      </td>
      <td className={cellClassName}>
        <div className="h-5 w-24 max-w-full animate-pulse rounded bg-subtle" />
      </td>
      <td className={cellClassName}>
        <div className="h-5 w-16 max-w-full animate-pulse rounded bg-subtle" />
      </td>
      <td className={cellClassName}>
        <div className="h-5 w-8 animate-pulse rounded bg-subtle" />
      </td>
      <td className={cellClassName}>
        <div className="h-5 w-24 animate-pulse rounded bg-subtle" />
      </td>
    </tr>
  );
}

function ProductAdminRow({
  product,
  onEdit,
  onDelete,
}: {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}) {
  return (
    <tr className="border-b border-border">
      <td className={cellClassName}>
        <ProductThumb imageUrl={product.imageUrl} />
      </td>
      <td className={cellClassName}>
        <span className="block truncate font-display text-base">{product.name}</span>
      </td>
      <td className={`${cellClassName} truncate text-sm text-muted`}>{product.category.name}</td>
      <td className={`${cellClassName} text-sm whitespace-nowrap`}>
        {formatPrice(product.priceCents)}
      </td>
      <td className={`${cellClassName} text-sm`}>{product.stock}</td>
      <td className={cellClassName}>
        <ProductAdminActions product={product} onEdit={onEdit} onDelete={onDelete} />
      </td>
    </tr>
  );
}

type ProductAdminTableProps = {
  products: Product[] | undefined;
  isPending: boolean;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
};

export function ProductAdminTable({
  products,
  isPending,
  onEdit,
  onDelete,
}: ProductAdminTableProps) {
  return (
    <>
      <ul className="flex flex-col gap-6 md:hidden">
        {isPending
          ? Array.from({ length: skeletonRowCount }, (_, index) => (
              <ProductAdminCardSkeleton key={index} />
            ))
          : products?.map((product) => (
              <ProductAdminCard
                key={product.id}
                product={product}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
      </ul>
      <div className="hidden md:block">
        <table className="w-full table-fixed border-collapse text-left">
          <caption className="sr-only">Products</caption>
          <colgroup>
            <col className="w-20" />
            <col />
            <col className="w-24" />
            <col className="w-24" />
            <col className="w-20" />
            <col className="w-28" />
          </colgroup>
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
              : products?.map((product) => (
                  <ProductAdminRow
                    key={product.id}
                    product={product}
                    onEdit={onEdit}
                    onDelete={onDelete}
                  />
                ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
