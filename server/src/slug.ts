export function slugFromName(name: string): string {
  const slug = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  if (slug.length === 0) {
    throw new Error(`Cannot build a slug from "${name}"`);
  }

  return slug;
}

export async function uniqueSlug(
  name: string,
  isTaken: (slug: string) => Promise<boolean>,
): Promise<string> {
  const base = slugFromName(name);

  if (!(await isTaken(base))) {
    return base;
  }

  let suffix = 2;

  while (await isTaken(`${base}-${suffix}`)) {
    suffix += 1;
  }

  return `${base}-${suffix}`;
}
