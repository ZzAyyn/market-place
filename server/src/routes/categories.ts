import { Router } from "express";
import { prisma } from "../db.js";
import { uniqueSlug } from "../slug.js";
import { createCategorySchema } from "../validation/categoryBody.js";

async function categorySlugTaken(candidate: string): Promise<boolean> {
  const existing = await prisma.category.findUnique({
    where: { slug: candidate },
  });
  return existing !== null;
}

export const categoriesRouter = Router();

categoriesRouter.get("/", async (_req, res) => {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
  });

  res.json({
    data: categories,
    meta: { total: categories.length },
  });
});

categoriesRouter.post("/", async (req, res) => {
  const body = createCategorySchema.parse(req.body);
  const slug = await uniqueSlug(body.name, categorySlugTaken);

  const category = await prisma.category.create({
    data: {
      name: body.name,
      slug,
    },
  });

  res.status(201).json({ data: category });
});
