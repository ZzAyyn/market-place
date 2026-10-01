import { Link, useSearchParams } from "react-router";
import { adminProductPageSize, useProducts } from "./api/products.ts";
import { Pagination } from "./components/Pagination.tsx";
import { ProductAdminTable } from "./components/ProductAdminTable.tsx";

function readPage(value: string | null): number {
  const page = Number(value);
  if (!Number.isInteger(page) || page < 1) {
    return 1;
  }
  return page;
}

export function AdminPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = readPage(searchParams.get("page"));

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
  const errorMessage = products.error instanceof Error ? products.error.message : undefined;

  let content = (
    <>
      <ProductAdminTable products={list} isPending={products.isPending} />
      <Pagination page={page} pageCount={pageCount} onPageChange={selectPage} />
    </>
  );

  if (products.isError) {
    content = (
      <p className="text-destructive" role="alert">
        {errorMessage ?? "Could not load products."}
      </p>
    );
  } else if (!products.isPending && total === 0) {
    content = <p className="text-muted">No products yet.</p>;
  }

  return (
    <>
      <header className="sticky top-0 z-10 border-b border-border bg-background">
        <div className="flex items-center justify-between gap-4 px-6 py-3">
          <h1 className="text-xl">
            <Link to="/">Marketplace</Link>
          </h1>
          <button
            type="button"
            className="rounded bg-accent px-4 py-2 text-sm font-medium text-accent-foreground"
          >
            New product
          </button>
        </div>
      </header>
      <main className="px-6 py-8">{content}</main>
    </>
  );
}
