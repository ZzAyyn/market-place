import { Router } from "express";
import { prisma } from "../db.js";
import { uniqueSlug } from "../slug.js";
import { createProductSchema, updateProductSchema } from "../validation/productBody.js";
import { productListQuerySchema } from "../validation/productListQuery.js";

const sortOrder = {
  newest: { createdAt: "desc" as const },
  price_asc: { priceCents: "asc" as const },
  price_desc: { priceCents: "desc" as const },
};

const productInclude = { category: true } as const;

function singleParam(value: string | string[]): string {
  if (typeof value !== "string") {
    throw new Error("Route parameter must be a single segment");
  }
  return value;
}

async function productSlugTaken(candidate: string): Promise<boolean> {
  const existing = await prisma.product.findUnique({
    where: { slug: candidate },
  });
  return existing !== null;
}

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
      include: productInclude,
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

productsRouter.get("/slug/:slug", async (req, res) => {
  const product = await prisma.product.findUniqueOrThrow({
    where: { slug: singleParam(req.params.slug) },
    include: productInclude,
  });

  res.json({ data: product });
});

productsRouter.get("/:id", async (req, res) => {
  const product = await prisma.product.findUniqueOrThrow({
    where: { id: singleParam(req.params.id) },
    include: productInclude,
  });

  res.json({ data: product });
});

productsRouter.post("/", async (req, res) => {
  const body = createProductSchema.parse(req.body);
  const slug = await uniqueSlug(body.name, productSlugTaken);

  const product = await prisma.product.create({
    data: {
      name: body.name,
      slug,
      description: body.description,
      priceCents: body.priceCents,
      stock: body.stock,
      imageUrl: body.imageUrl,
      categoryId: body.categoryId,
    },
    include: productInclude,
  });

  res.status(201).json({ data: product });
});

productsRouter.patch("/:id", async (req, res) => {
  const body = updateProductSchema.parse(req.body);

  const product = await prisma.product.update({
    where: { id: singleParam(req.params.id) },
    data: body,
    include: productInclude,
  });

  res.json({ data: product });
});

productsRouter.delete("/:id", async (req, res) => {
  await prisma.product.delete({
    where: { id: singleParam(req.params.id) },
  });

  res.status(204).send();
});
