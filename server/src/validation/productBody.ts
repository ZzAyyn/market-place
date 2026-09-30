import { z } from "zod";
import { slugFromName } from "../slug.js";

const nameField = z
  .string()
  .trim()
  .min(1)
  .refine((value) => {
    try {
      slugFromName(value);
      return true;
    } catch {
      return false;
    }
  }, "Name must include a letter or number");

const descriptionField = z.string().trim().min(1);
const priceCentsField = z.number().int().positive();
const stockField = z.number().int().nonnegative();
const categoryIdField = z.string().trim().min(1);

export const createProductSchema = z.strictObject({
  name: nameField,
  description: descriptionField,
  priceCents: priceCentsField,
  stock: stockField.default(0),
  imageUrl: z.url().optional(),
  categoryId: categoryIdField,
});

export const updateProductSchema = z
  .strictObject({
    name: nameField.optional(),
    description: descriptionField.optional(),
    priceCents: priceCentsField.optional(),
    stock: stockField.optional(),
    imageUrl: z.url().nullable().optional(),
    categoryId: categoryIdField.optional(),
  })
  .refine((body) => Object.keys(body).length > 0, {
    message: "Provide at least one field to update",
  });

export type CreateProductBody = z.infer<typeof createProductSchema>;
export type UpdateProductBody = z.infer<typeof updateProductSchema>;
