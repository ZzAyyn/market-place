import { Link } from "react-router";
import { useTheme } from "../ThemeProvider.tsx";
import { ThemeToggle } from "./ThemeToggle.tsx";

type HeaderProps = {
  query: string;
  onQueryChange: (query: string) => void;
};

export function Header({ query, onQueryChange }: HeaderProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <header
      className={
        isDark
          ? "sticky top-0 z-10 border-b border-header-foreground/20 bg-header text-header-foreground"
          : "sticky top-0 z-10 border-b border-border bg-background text-foreground"
      }
    >
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-6 gap-y-4 px-6 py-5 md:grid-cols-[auto_minmax(0,1fr)_auto] md:px-10 md:py-6 lg:px-16">
        <h1 className="truncate text-2xl">
          <Link to="/" className={isDark ? "text-header-foreground" : "text-header"}>
            Marketplace
          </Link>
        </h1>
        <div className="flex items-center gap-4 md:col-start-3">
          <Link to="/admin" className={isDark ? "text-sm text-header-muted" : "text-sm"}>
            Admin
          </Link>
          <ThemeToggle />
        </div>
        <input
          type="search"
          value={query}
          onChange={(event) => {
            onQueryChange(event.target.value);
          }}
          placeholder="Search products"
          aria-label="Search products"
          className={
            isDark
              ? "scheme-dark col-span-2 min-w-0 rounded border border-header-foreground/30 bg-header-foreground/10 px-4 py-3 text-sm text-header-foreground placeholder:text-header-muted md:col-span-1 md:col-start-2 md:row-start-1"
              : "col-span-2 min-w-0 rounded border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted md:col-span-1 md:col-start-2 md:row-start-1"
          }
        />
      </div>
    </header>
  );
}
