import { z } from "zod";

const optionalText = z
  .string()
  .trim()
  .optional() // allows key to be missing or empty.
  .transform((value) => {
    if (value === undefined || value.length === 0) {
      return undefined;
    }
    return value;
  });

export const productListQuerySchema = z.object({
  // optionalText is reusable because it is used for both q and category.
  q: optionalText,
  category: optionalText.transform((value) => value?.toLowerCase()),

  // enum to restrict to these values.
  sort: z.enum(["newest", "price_asc", "price_desc"]).default("newest"),

  // coerce.number converts string to number as typescript does not.
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(50).default(12),
});

export type ProductListQuery = z.infer<typeof productListQuerySchema>;
