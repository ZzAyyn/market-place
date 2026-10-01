import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { z } from "zod";
import { ApiError, apiDelete, apiGet, apiSend } from "./client.ts";
import { friendlyErrorMessage } from "../friendlyError.ts";

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

export type ProductWriteBody = {
  name: string;
  description: string;
  priceCents: number;
  stock: number;
  categoryId: string;
  imageUrl?: string | null;
};

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

export function useProductById(id: string | undefined) {
  return useQuery({
    queryKey: ["products", "id", id],
    enabled: id !== undefined && id.length > 0,
    queryFn: () => {
      if (id === undefined || id.length === 0) {
        throw new Error("Missing product id");
      }
      return apiGet(`/api/products/${encodeURIComponent(id)}`, productDetailResponseSchema);
    },
  });
}

export function createProduct(body: ProductWriteBody) {
  return apiSend("POST", "/api/products", body, productDetailResponseSchema);
}

export function updateProduct(id: string, body: ProductWriteBody) {
  return apiSend("PATCH", `/api/products/${encodeURIComponent(id)}`, body, productDetailResponseSchema);
}

function isProductList(value: unknown): value is ProductList {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  if (!("data" in value) || !("meta" in value) || !Array.isArray(value.data)) {
    return false;
  }

  const meta: unknown = value.meta;
  return typeof meta === "object" && meta !== null && "total" in meta && "page" in meta && "pageSize" in meta;
}

export function deleteProduct(id: string): Promise<void> {
  return apiDelete(`/api/products/${encodeURIComponent(id)}`);
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id }: { id: string; name: string }) => deleteProduct(id),
    retry: false,
    onMutate: async ({ id }) => {
      await queryClient.cancelQueries({ queryKey: ["products"] });
      const previous = queryClient.getQueriesData({ queryKey: ["products"] });

      queryClient.setQueriesData({ queryKey: ["products"] }, (current: unknown) => {
        if (!isProductList(current)) {
          return current;
        }

        const data = current.data.filter((product) => product.id !== id);
        if (data.length === current.data.length) {
          return current;
        }

        return {
          ...current,
          data,
          meta: {
            ...current.meta,
            total: Math.max(0, current.meta.total - 1),
          },
        };
      });

      return { previous };
    },
    onSuccess: (_data, { name }) => {
      toast.success(`Deleted ${name}.`);
    },
    onError: (error, _product, context) => {
      if (context !== undefined) {
        for (const [queryKey, data] of context.previous) {
          queryClient.setQueryData(queryKey, data);
        }
      }

      toast.error(friendlyErrorMessage(error, "Could not delete this product."));
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ["products"] });
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
