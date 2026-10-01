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
    <label className="flex w-full min-w-0 items-center gap-3 text-sm text-muted md:w-auto">
      Sort
      <select
        value={sort}
        onChange={(event) => {
          const value = event.target.value;
          if (value === "newest" || value === "price_asc" || value === "price_desc") {
            onSortChange(value);
          }
        }}
        className="min-w-0 flex-1 rounded border border-border bg-background px-4 py-2.5 text-sm text-foreground md:flex-none"
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
