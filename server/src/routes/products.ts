import { Router } from "express";
import { prisma } from "../db.js";
import { productListQuerySchema } from "../validation/productListQuery.js";

const sortOrder = {
  newest: { createdAt: "desc" as const },
  price_asc: { priceCents: "asc" as const },
  price_desc: { priceCents: "desc" as const },
};

export const productsRouter = Router();

productsRouter.get("/", async (req, res) => {
  const query = productListQuerySchema.parse(req.query); // parse either throws or returns the object.
  const skip = (query.page - 1) * query.pageSize;

  const where = {
    ...(query.q
      ? {
          OR: [
            { name: { contains: query.q, mode: "insensitive" as const } },
            { description: { contains: query.q, mode: "insensitive" as const } },
          ],
        }
      : {}),
    ...(query.category ? { category: { slug: query.category } } : {}),
  };

  const [products, total] = await prisma.$transaction([
    prisma.product.findMany({
      where,
      orderBy: [sortOrder[query.sort], { id: "asc" }],
      skip,
      take: query.pageSize,
      include: { category: true },
    }),
    prisma.product.count({ where }),
  ]);

  res.json({
    data: products,
    meta: {
      total,
      page: query.page,
      pageSize: query.pageSize,
    },
  });
});
