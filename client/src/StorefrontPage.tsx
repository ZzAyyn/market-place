import { useProducts } from "./api/products.ts";
import { Header } from "./components/Header.tsx";
import { ProductGrid } from "./components/ProductGrid.tsx";

export function StorefrontPage() {
  const products = useProducts();
  const errorMessage = products.error instanceof Error ? products.error.message : undefined;

  return (
    <>
      <Header />
      <main className="px-6 py-8">
        <ProductGrid
          products={products.data?.data}
          isPending={products.isPending}
          isError={products.isError}
          errorMessage={errorMessage}
        />
      </main>
    </>
  );
}
