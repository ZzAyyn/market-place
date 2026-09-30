import { Link, Route, Routes } from "react-router";
import { DesignPage } from "./DesignPage.tsx";

export function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/design" element={<DesignPage />} />
    </Routes>
  );
}

function Home() {
  return (
    <main className="min-h-screen bg-background px-8 py-10 font-sans text-foreground">
      <h1 className="text-3xl">Marketplace</h1>
      <p className="mt-2 text-muted">The storefront shell is running.</p>
      <p className="mt-6 text-sm">
        <Link to="/design" className="underline">
          View the design tokens
        </Link>
      </p>
    </main>
  );
}
