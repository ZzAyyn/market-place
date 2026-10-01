import type { UseFormSetError } from "react-hook-form";
import { z } from "zod";
import { ApiError } from "./api/client.ts";
import type { ProductWriteBody } from "./api/products.ts";

const rufiyaaPattern = /^(?:0|[1-9]\d*)(?:\.\d{1,2})?$/;
const stockPattern = /^(?:0|[1-9]\d*)$/;

export function rufiyaaToCents(value: string): number {
  const [wholePart, fractionPart = ""] = value.split(".");
  const fraction = `${fractionPart}00`.slice(0, 2);
  return Number(wholePart) * 100 + Number(fraction);
}

export function centsToRufiyaa(cents: number): string {
  const whole = Math.trunc(cents / 100);
  const fraction = Math.abs(cents % 100);
  return `${whole}.${String(fraction).padStart(2, "0")}`;
}

function isPositiveRufiyaa(value: string): boolean {
  return rufiyaaPattern.test(value) && rufiyaaToCents(value) > 0;
}

function isOptionalUrl(value: string): boolean {
  return value.length === 0 || z.url().safeParse(value).success;
}

export const productFormSchema = z.object({
  name: z.string().trim().min(1, "Enter a name"),
  description: z.string().trim().min(1, "Enter a description"),
  price: z.string().trim().refine(isPositiveRufiyaa, "Enter a price greater than 0, such as 12.50"),
  stock: z.string().trim().regex(stockPattern, "Enter a whole number of 0 or more"),
  imageUrl: z.string().trim().refine(isOptionalUrl, "Enter a valid image URL"),
  categoryId: z.string().trim().min(1, "Choose a category"),
});

export type ProductFormValues = z.infer<typeof productFormSchema>;

const serverFieldToInput = {
  name: "name",
  description: "description",
  priceCents: "price",
  stock: "stock",
  imageUrl: "imageUrl",
  categoryId: "categoryId",
} as const satisfies Record<string, keyof ProductFormValues>;

export function toProductWriteBody(
  values: ProductFormValues,
  mode: "create" | "edit",
): ProductWriteBody {
  const body: ProductWriteBody = {
    name: values.name,
    description: values.description,
    priceCents: rufiyaaToCents(values.price),
    stock: Number(values.stock),
    categoryId: values.categoryId,
  };

  if (values.imageUrl.length > 0) {
    body.imageUrl = values.imageUrl;
  } else if (mode === "edit") {
    body.imageUrl = null;
  }

  return body;
}

export function applyServerFieldErrors(
  error: unknown,
  setError: UseFormSetError<ProductFormValues>,
): string | undefined {
  if (!(error instanceof ApiError) || error.fields === undefined) {
    return error instanceof ApiError ? error.message : "Could not save this product.";
  }

  let mapped = false;
  let unmapped = false;

  for (const [field, message] of Object.entries(error.fields)) {
    const input = serverFieldToInput[field as keyof typeof serverFieldToInput];
    if (input === undefined) {
      unmapped = true;
      continue;
    }
    setError(input, { message });
    mapped = true;
  }

  if (!mapped || unmapped) {
    return error.message;
  }

  return undefined;
}
