import { prisma } from "./db.js";
import { uniqueSlug } from "./slug.js";

const categories = [
  { name: "Ceramics" },
  { name: "Textiles" },
  { name: "Kitchen" },
  { name: "Lighting" },
  { name: "Stationery" },
];

const products = [
  {
    name: "Stoneware Mug",
    description:
      "A sturdy everyday mug with a satin glaze that stays comfortable in the hand. It holds twelve ounces, enough for coffee without feeling oversized.",
    priceCents: 1800,
    stock: 24,
    imageUrl:
      "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&w=1200&q=80",
    categoryName: "Ceramics",
  },
  {
    name: "Speckled Serving Bowl",
    description:
      "A wide bowl thrown for salads, fruit, or a shared side. The speckled glaze hides everyday wear and looks at home on a bare table.",
    priceCents: 3400,
    stock: 11,
    imageUrl:
      "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=1200&q=80",
    categoryName: "Ceramics",
  },
  {
    name: "Linen Tea Towel",
    description:
      "A loosely woven linen towel that dries quickly beside the sink. It softens after a few washes and hangs flat without stiff folds.",
    priceCents: 1600,
    stock: 40,
    imageUrl:
      "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=1200&q=80",
    categoryName: "Textiles",
  },
  {
    name: "Wool Throw Blanket",
    description:
      "A heavy wool throw for the end of a sofa or the foot of a bed. The dense weave holds warmth without slipping off the arm.",
    priceCents: 12900,
    stock: 5,
    imageUrl:
      "https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&w=1200&q=80",
    categoryName: "Textiles",
  },
  {
    name: "Oak Cutting Board",
    description:
      "An end-grain oak board with a juice groove and a handle cutout. Mineral oil keeps the surface from drying out between uses.",
    priceCents: 5400,
    stock: 14,
    imageUrl:
      "https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?auto=format&fit=crop&w=1200&q=80",
    categoryName: "Kitchen",
  },
  {
    name: "Enameled Dutch Oven",
    description:
      "A five-quart pot for stews, bread, and long braises. The enamel lets you brown on the stove and then move the pot into the oven.",
    priceCents: 9800,
    stock: 7,
    imageUrl:
      "https://images.unsplash.com/photo-1585515320310-259814833e62?auto=format&fit=crop&w=1200&q=80",
    categoryName: "Kitchen",
  },
  {
    name: "Glass Storage Jar",
    description:
      "A clear jar with a clamp lid for flour, grains, or tea. The wide mouth makes it easy to scoop without tipping the jar.",
    priceCents: 2200,
    stock: 28,
    imageUrl:
      "https://images.unsplash.com/photo-1600369672770-985fd30004eb?auto=format&fit=crop&w=1200&q=80",
    categoryName: "Kitchen",
  },
  {
    name: "Brass Desk Lamp",
    description:
      "A small brass lamp with a warm bulb for a desk or bedside table. The arm tilts so the light stays on the page, not in your eyes.",
    priceCents: 14500,
    stock: 4,
    imageUrl:
      "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=1200&q=80",
    categoryName: "Lighting",
  },
  {
    name: "Paper Shade Pendant",
    description:
      "A paper shade that softens a single bulb over a table. It hangs from a short cord and casts an even light without a harsh pool.",
    priceCents: 7600,
    stock: 9,
    imageUrl:
      "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=1200&q=80",
    categoryName: "Lighting",
  },
  {
    name: "Clothbound Notebook",
    description:
      "A lay-flat notebook with thick paper that takes fountain-pen ink. The cloth cover bends without cracking at the spine.",
    priceCents: 1850,
    stock: 42,
    imageUrl:
      "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=1200&q=80",
    categoryName: "Stationery",
  },
  {
    name: "Walnut Pencil Set",
    description:
      "A box of six cedar pencils with a walnut case that stays on the desk. The graphite is firm enough for sketching and notes.",
    priceCents: 1400,
    stock: 33,
    imageUrl:
      "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&w=1200&q=80",
    categoryName: "Stationery",
  },
  {
    name: "Glass Ink Bottle",
    description:
      "A small bottle of black ink with a wide base so it does not tip. The color stays dark on everyday paper without feathering.",
    priceCents: 1200,
    stock: 0,
    imageUrl:
      "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1200&q=80",
    categoryName: "Stationery",
  },
];

async function seed(): Promise<void> {
  await prisma.$transaction(async (tx) => {
    const categoryIds = new Map<string, string>();

    for (const category of categories) {
      const slug = await uniqueSlug(category.name, async (candidate) => {
        const existing = await tx.category.findUnique({
          where: { slug: candidate },
        });
        return existing !== null && existing.name !== category.name;
      });

      const saved = await tx.category.upsert({
        where: { slug },
        update: { name: category.name },
        create: { name: category.name, slug },
      });

      categoryIds.set(category.name, saved.id);
    }

    for (const product of products) {
      const categoryId = categoryIds.get(product.categoryName);

      if (categoryId === undefined) {
        throw new Error(`Unknown category "${product.categoryName}"`);
      }

      const slug = await uniqueSlug(product.name, async (candidate) => {
        const existing = await tx.product.findUnique({
          where: { slug: candidate },
        });
        return existing !== null && existing.name !== product.name;
      });

      await tx.product.upsert({
        where: { slug },
        update: {
          name: product.name,
          description: product.description,
          priceCents: product.priceCents,
          stock: product.stock,
          imageUrl: product.imageUrl,
          categoryId,
        },
        create: {
          name: product.name,
          slug,
          description: product.description,
          priceCents: product.priceCents,
          stock: product.stock,
          imageUrl: product.imageUrl,
          categoryId,
        },
      });
    }
  });

  const categoryCount = await prisma.category.count();
  const productCount = await prisma.product.count();

  console.log(`Categories: ${categoryCount}`);
  console.log(`Products: ${productCount}`);
}

seed()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
