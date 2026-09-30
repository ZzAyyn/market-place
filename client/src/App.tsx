import { Route, Routes } from "react-router";
import { DesignPage } from "./DesignPage.tsx";
import { StorefrontPage } from "./StorefrontPage.tsx";

export function App() {
  return (
    <Routes>
      <Route path="/" element={<StorefrontPage />} />
      <Route path="/design" element={<DesignPage />} />
    </Routes>
  );
}
