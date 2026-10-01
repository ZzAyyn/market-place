import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { apiGet } from "./client.ts";

const categoryListSchema = z.object({
  data: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      slug: z.string(),
    }),
  ),
  meta: z.object({
    total: z.number().int(),
  }),
});

export type Category = z.infer<typeof categoryListSchema>["data"][number];

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: () => apiGet("/api/categories", categoryListSchema),
  });
}
