import { Link } from "react-router";

type HeaderProps = {
  query: string;
  onQueryChange: (query: string) => void;
};

export function Header({ query, onQueryChange }: HeaderProps) {
  return (
    <header className="sticky top-0 z-10 border-b border-border bg-background">
      <div className="flex items-center gap-4 px-6 py-3">
        <h1 className="shrink-0 text-xl">
          <Link to="/">Marketplace</Link>
        </h1>
        <input
          type="search"
          value={query}
          onChange={(event) => {
            onQueryChange(event.target.value);
          }}
          placeholder="Search products"
          aria-label="Search products"
          className="min-w-0 flex-1 rounded border border-border bg-background px-3 py-2 text-sm"
        />
        <Link to="/admin" className="shrink-0 text-sm">
          Admin
        </Link>
      </div>
    </header>
  );
}
