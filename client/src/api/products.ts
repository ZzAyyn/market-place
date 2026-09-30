import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { apiGet } from "./client.ts";

const categorySchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
});

const productSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  priceCents: z.number().int(),
  imageUrl: z.string().nullable(),
  category: categorySchema,
});

const productListSchema = z.object({
  data: z.array(productSchema),
  meta: z.object({
    total: z.number().int(),
    page: z.number().int(),
    pageSize: z.number().int(),
  }),
});

export type Product = z.infer<typeof productSchema>;

const productListParams = { pageSize: 50 };

export function useProducts() {
  return useQuery({
    queryKey: ["products", productListParams],
    queryFn: () => {
      const params = new URLSearchParams({
        pageSize: String(productListParams.pageSize),
      });
      return apiGet(`/api/products?${params.toString()}`, productListSchema);
    },
  });
}
