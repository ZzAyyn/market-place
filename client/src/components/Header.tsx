import { Link } from "react-router";

type HeaderProps = {
  query: string;
  onQueryChange: (query: string) => void;
};

export function Header({ query, onQueryChange }: HeaderProps) {
  return (
    <header className="sticky top-0 z-10 border-b border-border bg-background">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-6 gap-y-4 px-6 py-5 md:grid-cols-[auto_minmax(0,1fr)_auto] md:px-10 md:py-6 lg:px-16">
        <h1 className="truncate text-2xl">
          <Link to="/">Marketplace</Link>
        </h1>
        <Link to="/admin" className="text-sm md:col-start-3">
          Admin
        </Link>
        <input
          type="search"
          value={query}
          onChange={(event) => {
            onQueryChange(event.target.value);
          }}
          placeholder="Search products"
          aria-label="Search products"
          className="col-span-2 min-w-0 rounded border border-border bg-background px-4 py-3 text-sm md:col-span-1 md:col-start-2 md:row-start-1"
        />
      </div>
    </header>
  );
}
