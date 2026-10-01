import type { ProductSort } from "../api/products.ts";

const options: { value: ProductSort; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: low to high" },
  { value: "price_desc", label: "Price: high to low" },
];

type SortSelectProps = {
  sort: ProductSort;
  onSortChange: (sort: ProductSort) => void;
};

export function SortSelect({ sort, onSortChange }: SortSelectProps) {
  return (
    <label className="flex items-center gap-2 text-sm text-muted">
      Sort
      <select
        value={sort}
        onChange={(event) => {
          const value = event.target.value;
          if (value === "newest" || value === "price_asc" || value === "price_desc") {
            onSortChange(value);
          }
        }}
        className="rounded border border-border bg-background px-3 py-2 text-sm text-foreground"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
