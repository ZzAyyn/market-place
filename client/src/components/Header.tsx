import { Link } from "react-router";

export function Header() {
  return (
    <header className="sticky top-0 z-10 border-b border-border bg-background">
      <div className="flex items-center justify-between px-6 py-3">
        <h1 className="text-xl">
          <Link to="/">Marketplace</Link>
        </h1>
        <Link to="/admin" className="text-sm">
          Admin
        </Link>
      </div>
    </header>
  );
}
