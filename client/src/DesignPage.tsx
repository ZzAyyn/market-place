import { Link } from "react-router";

const swatches = [
  { name: "Background", token: "--background", className: "bg-background" },
  { name: "Foreground", token: "--foreground", className: "bg-foreground" },
  { name: "Accent", token: "--accent", className: "bg-accent" },
  { name: "Accent text", token: "--accent-foreground", className: "bg-accent-foreground" },
  { name: "Subtle", token: "--subtle", className: "bg-subtle" },
  { name: "Border", token: "--border", className: "bg-border" },
  { name: "Muted", token: "--muted", className: "bg-muted" },
  { name: "Destructive", token: "--destructive", className: "bg-destructive" },
  {
    name: "Destructive text",
    token: "--destructive-foreground",
    className: "bg-destructive-foreground",
  },
  { name: "Destructive subtle", token: "--destructive-subtle", className: "bg-destructive-subtle" },
];

export function DesignPage() {
  return (
    <main className="min-h-screen bg-background px-8 py-10 text-foreground">
      <p className="text-sm text-muted">
        <Link to="/" className="underline">
          Back
        </Link>
      </p>
      <h1 className="mt-6 text-5xl">Design tokens</h1>
      <p className="mt-3 max-w-xl text-base text-muted">
        Fraunces for headings and product names. Inter for interface text.
      </p>

      <section className="mt-12">
        <h2 className="text-3xl">Type</h2>
        <div className="mt-6 space-y-4">
          <p className="font-display text-5xl">Page title</p>
          <p className="font-display text-3xl">Section heading</p>
          <p className="font-display text-xl">Stoneware mug</p>
          <p className="text-base">Body copy for descriptions and form help.</p>
          <p className="text-sm text-muted">Secondary text, such as stock and category.</p>
          <p className="text-xs font-medium uppercase tracking-wide text-muted">Label</p>
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-3xl">Palette</h2>
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-5">
          {swatches.map((swatch) => (
            <div key={swatch.token}>
              <div className={`h-16 border border-border ${swatch.className} rounded`} />
              <p className="mt-2 text-sm">{swatch.name}</p>
              <p className="text-xs text-muted">{swatch.token}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-3xl">Card</h2>
        <article className="mt-6 max-w-sm rounded border border-border bg-subtle p-5">
          <div className="h-36 rounded bg-background" />
          <h3 className="mt-4 text-xl">Stoneware mug</h3>
          <p className="mt-1 text-sm text-muted">Ceramics</p>
          <p className="mt-3 text-base">$25.00</p>
          <button
            type="button"
            className="mt-4 rounded bg-accent px-4 py-2 text-sm font-medium text-accent-foreground"
          >
            Add to bag
          </button>
          <p className="mt-4 rounded bg-destructive-subtle px-3 py-2 text-sm text-destructive">
            Only 2 left in stock.
          </p>
        </article>
      </section>
    </main>
  );
}
