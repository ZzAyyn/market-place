import { useState } from "react";
import { Link, useSearchParams } from "react-router";
import { adminProductPageSize, useDeleteProduct, useProducts, type Product } from "./api/products.ts";
import { Pagination } from "./components/Pagination.tsx";
import { LoadError } from "./components/LoadError.tsx";
import { ProductAdminTable } from "./components/ProductAdminTable.tsx";
import { ProductDeleteDialog } from "./components/ProductDeleteDialog.tsx";
import { ProductFormDrawer } from "./components/ProductFormDrawer.tsx";

type ProductEditor = { mode: "closed" } | { mode: "create" } | { mode: "edit"; productId: string };

function readPage(value: string | null): number {
  const page = Number(value);
  if (!Number.isInteger(page) || page < 1) {
    return 1;
  }
  return page;
}

export function AdminPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [editor, setEditor] = useState<ProductEditor>({ mode: "closed" });
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const removeProduct = useDeleteProduct();
  const page = readPage(searchParams.get("page"));

  function confirmDelete(): void {
    if (productToDelete === null) {
      return;
    }

    const product = productToDelete;
    setProductToDelete(null);
    removeProduct.mutate({ id: product.id, name: product.name });
  }

  function selectPage(nextPage: number): void {
    setSearchParams((current) => {
      const next = new URLSearchParams(current);
      if (nextPage <= 1) {
        next.delete("page");
      } else {
        next.set("page", String(nextPage));
      }
      return next;
    });
  }

  const products = useProducts({
    q: "",
    category: undefined,
    sort: "newest",
    page,
    pageSize: adminProductPageSize,
  });

  const list = products.data?.data;
  const total = products.data?.meta.total ?? 0;
  const pageCount = Math.ceil(total / adminProductPageSize);

  let content = (
    <>
      <ProductAdminTable
        products={list}
        isPending={products.isPending}
        onEdit={(product: Product) => setEditor({ mode: "edit", productId: product.id })}
        onDelete={setProductToDelete}
      />
      <Pagination page={page} pageCount={pageCount} onPageChange={selectPage} />
    </>
  );

  if (products.isError) {
    content = (
      <LoadError
        message="Could not load products."
        onRetry={() => {
          void products.refetch();
        }}
      />
    );
  } else if (!products.isPending && total === 0) {
    content = <p className="text-muted">No products yet.</p>;
  }

  return (
    <>
      <header className="sticky top-0 z-10 border-b border-border bg-background">
        <div className="flex items-center justify-between gap-6 px-6 py-5 md:px-10 md:py-6 lg:px-16">
          <h1 className="min-w-0 truncate text-2xl">
            <Link to="/">Marketplace</Link>
          </h1>
          <button
            type="button"
            onClick={() => setEditor({ mode: "create" })}
            className="shrink-0 rounded bg-accent px-5 py-2.5 text-sm font-medium text-accent-foreground"
          >
            New product
          </button>
        </div>
      </header>
      <main className="px-6 py-12 md:px-10 md:py-16 lg:px-16">{content}</main>
      {editor.mode !== "closed" ? (
        <ProductFormDrawer
          productId={editor.mode === "edit" ? editor.productId : undefined}
          onClose={() => setEditor({ mode: "closed" })}
        />
      ) : null}
      {productToDelete !== null ? (
        <ProductDeleteDialog
          productName={productToDelete.name}
          onCancel={() => setProductToDelete(null)}
          onConfirm={confirmDelete}
        />
      ) : null}
    </>
  );
}
