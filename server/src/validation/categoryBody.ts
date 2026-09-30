import { z } from "zod";
import { slugFromName } from "../slug.js";

export const createCategorySchema = z.strictObject({
  name: z
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
    }, "Name must include a letter or number"),
});

export type CreateCategoryBody = z.infer<typeof createCategorySchema>;
