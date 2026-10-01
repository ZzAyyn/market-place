import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { ApiError, apiGet } from "./client.ts";

const productSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  priceCents: z.number().int(),
  stock: z.number().int(),
  imageUrl: z.string().nullable(),
  category: z.object({
    id: z.string(),
    name: z.string(),
    slug: z.string(),
  }),
});

const productListSchema = z.object({
  data: z.array(productSchema),
  meta: z.object({
    total: z.number().int(),
    page: z.number().int(),
    pageSize: z.number().int(),
  }),
});

const productDetailSchema = productSchema.extend({
  description: z.string(),
});

const productDetailResponseSchema = z.object({
  data: productDetailSchema,
});

export type Product = z.infer<typeof productSchema>;
export type ProductDetail = z.infer<typeof productDetailSchema>;
export type ProductList = z.infer<typeof productListSchema>;

export const productSorts = ["newest", "price_asc", "price_desc"] as const;
export type ProductSort = (typeof productSorts)[number];

export const productPageSize = 8;
export const adminProductPageSize = 20;

export type ProductListParams = {
  q: string;
  category: string | undefined;
  sort: ProductSort;
  page: number;
  pageSize?: number;
};

export function useProducts(params: ProductListParams) {
  const query = {
    q: params.q.length === 0 ? undefined : params.q,
    category: params.category,
    sort: params.sort,
    page: params.page,
    pageSize: params.pageSize ?? productPageSize,
  };

  return useQuery({
    queryKey: ["products", query],
    queryFn: () => {
      const search = new URLSearchParams();
      if (query.q !== undefined) {
        search.set("q", query.q);
      }
      if (query.category !== undefined) {
        search.set("category", query.category);
      }
      search.set("sort", query.sort);
      search.set("page", String(query.page));
      search.set("pageSize", String(query.pageSize));
      return apiGet(`/api/products?${search.toString()}`, productListSchema);
    },
  });
}

export function useProduct(slug: string | undefined) {
  return useQuery({
    queryKey: ["products", "slug", slug],
    enabled: slug !== undefined && slug.length > 0,
    retry: (failureCount, error) => {
      if (error instanceof ApiError && error.status === 404) {
        return false;
      }
      return failureCount < 3;
    },
    queryFn: () => {
      if (slug === undefined || slug.length === 0) {
        throw new Error("Missing product slug");
      }
      return apiGet(
        `/api/products/slug/${encodeURIComponent(slug)}`,
        productDetailResponseSchema,
      );
    },
  });
}
