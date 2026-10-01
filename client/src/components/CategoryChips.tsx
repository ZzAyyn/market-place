import type { Category } from "../api/categories.ts";

type CategoryChipsProps = {
  categories: Category[] | undefined;
  activeSlug: string | undefined;
  onSelect: (slug: string | undefined) => void;
};

export function CategoryChips({ categories, activeSlug, onSelect }: CategoryChipsProps) {
  return (
    <div className="flex flex-wrap gap-3">
      <Chip label="All" active={activeSlug === undefined} onSelect={() => onSelect(undefined)} />
      {categories?.map((category) => (
        <Chip
          key={category.id}
          label={category.name}
          active={activeSlug === category.slug}
          onSelect={() => onSelect(category.slug)}
        />
      ))}
    </div>
  );
}

function Chip({ label, active, onSelect }: { label: string; active: boolean; onSelect: () => void }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onSelect}
      className={
        active
          ? "rounded bg-accent px-4 py-2 text-sm text-accent-foreground"
          : "rounded border border-border px-4 py-2 text-sm"
      }
    >
      {label}
    </button>
  );
}
