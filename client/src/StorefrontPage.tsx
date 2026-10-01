import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router";
import { useCategories } from "./api/categories.ts";
import { productPageSize, useProducts, type ProductSort } from "./api/products.ts";
import { CategoryChips } from "./components/CategoryChips.tsx";
import { Header } from "./components/Header.tsx";
import { LoadError } from "./components/LoadError.tsx";
import { Pagination } from "./components/Pagination.tsx";
import { ProductGrid } from "./components/ProductGrid.tsx";
import { SortSelect } from "./components/SortSelect.tsx";
import { useDebouncedValue } from "./hooks/useDebouncedValue.ts";

function readSort(value: string | null): ProductSort {
  if (value === "price_asc" || value === "price_desc") {
    return value;
  }
  return "newest";
}

function readPage(value: string | null): number {
  const page = Number(value);
  if (!Number.isInteger(page) || page < 1) {
    return 1;
  }
  return page;
}

function noMatchMessage(query: string, categoryName: string | undefined): string {
  if (query.length > 0 && categoryName !== undefined) {
    return `No products match "${query}" in ${categoryName}.`;
  }
  if (query.length > 0) {
    return `No products match "${query}".`;
  }
  if (categoryName !== undefined) {
    return `No products match ${categoryName}.`;
  }
  return "No products match these filters.";
}

export function StorefrontPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlQuery = searchParams.get("q") ?? "";
  const category = searchParams.get("category") ?? undefined;
  const sort = readSort(searchParams.get("sort"));
  const page = readPage(searchParams.get("page"));

  const [query, setQuery] = useState(urlQuery);
  const debouncedQuery = useDebouncedValue(query, 300);
  const [trackedUrlQuery, setTrackedUrlQuery] = useState(urlQuery);
  const seenDebouncedQuery = useRef(debouncedQuery);

  if (urlQuery !== trackedUrlQuery) {
    setTrackedUrlQuery(urlQuery);
    if (urlQuery !== debouncedQuery) {
      setQuery(urlQuery);
    }
  }

  useEffect(() => {
    if (seenDebouncedQuery.current === debouncedQuery) {
      return;
    }
    seenDebouncedQuery.current = debouncedQuery;
    if (debouncedQuery === urlQuery) {
      return;
    }

    setSearchParams((current) => {
      const next = new URLSearchParams(current);
      if (debouncedQuery.length === 0) {
        next.delete("q");
      } else {
        next.set("q", debouncedQuery);
      }
      next.delete("page");
      return next;
    });
  }, [debouncedQuery, urlQuery, setSearchParams]);

  function replaceParams(update: (params: URLSearchParams) => void): void {
    setSearchParams((current) => {
      const next = new URLSearchParams(current);
      update(next);
      return next;
    });
  }

  function selectCategory(slug: string | undefined): void {
    replaceParams((params) => {
      if (slug === undefined) {
        params.delete("category");
      } else {
        params.set("category", slug);
      }
      params.delete("page");
    });
  }

  function selectSort(nextSort: ProductSort): void {
    replaceParams((params) => {
      if (nextSort === "newest") {
        params.delete("sort");
      } else {
        params.set("sort", nextSort);
      }
      params.delete("page");
    });
  }

  function selectPage(nextPage: number): void {
    replaceParams((params) => {
      if (nextPage <= 1) {
        params.delete("page");
      } else {
        params.set("page", String(nextPage));
      }
    });
  }

  function clearFilters(): void {
    setQuery("");
    setSearchParams({});
  }

  const categories = useCategories();
  const products = useProducts({ q: urlQuery, category, sort, page });
  const categoryName = categories.data?.data.find((item) => item.slug === category)?.name ?? category;
  const hasFilter = urlQuery.length > 0 || category !== undefined;
  const list = products.data?.data;
  const total = products.data?.meta.total ?? 0;
  const isNoMatch = !products.isPending && !products.isError && list?.length === 0 && hasFilter;
  const pageCount = Math.ceil(total / productPageSize);

  return (
    <>
      <Header query={query} onQueryChange={setQuery} />
      <main className="px-6 py-12 md:px-10 md:py-16 lg:px-16">
        <div className="mb-12 flex flex-col gap-6 md:mb-16 md:flex-row md:items-center md:justify-between">
          {categories.isError ? (
            <LoadError
              message="Could not load categories."
              onRetry={() => {
                void categories.refetch();
              }}
            />
          ) : (
            <CategoryChips
              categories={categories.data?.data}
              activeSlug={category}
              onSelect={selectCategory}
            />
          )}
          <SortSelect sort={sort} onSortChange={selectSort} />
        </div>
        <ProductGrid
          products={list}
          isPending={products.isPending}
          isError={products.isError}
          isNoMatch={isNoMatch}
          noMatchMessage={noMatchMessage(urlQuery, categoryName)}
          onClearFilters={clearFilters}
          onRetry={() => {
            void products.refetch();
          }}
        />
        <Pagination page={page} pageCount={pageCount} onPageChange={selectPage} />
      </main>
    </>
  );
}
