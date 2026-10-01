import { Route, Routes } from "react-router";
import { AdminPage } from "./AdminPage.tsx";
import { DesignPage } from "./DesignPage.tsx";
import { ProductDetailPage } from "./ProductDetailPage.tsx";
import { StorefrontPage } from "./StorefrontPage.tsx";

export function App() {
  return (
    <Routes>
      <Route path="/" element={<StorefrontPage />} />
      <Route path="/products/:slug" element={<ProductDetailPage />} />
      <Route path="/admin" element={<AdminPage />} />
      <Route path="/design" element={<DesignPage />} />
    </Routes>
  );
}
