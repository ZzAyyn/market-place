# Marketplace

A small shop for browsing products, with an admin screen to create, edit, and delete them.

## Light mode

![Shop in light mode](docs/Marketplace%20Light%20Storefront.png)

![Admin in light mode](docs/Marketplace%20Light%20AdminPage.png)

## Dark mode

![Shop in dark mode](docs/Marketplace%20Dark%20Storefront.png)

![Admin in dark mode](docs/Marketplace%20Dark%20AdminPage.png)

## Quick start

Postgres runs in Docker. The app is two processes: the API in `server`, and the Vite app in `client`.

From the repository root:

```bash
docker compose up -d
```

That starts Postgres 16. The container still listens on port 5432. Compose publishes that port on the host as **5433**.

Host port 5433 is deliberate. A Postgres install on the machine often already occupies 5432. Mapping the host side to 5433 means this database can run beside that install. Inside the container the port stays 5432, so the connection string on your machine is the only place that says 5433.

### Server

```bash
cd server
```

macOS and Linux:

```bash
cp .env.example .env
npm install
npm run db:generate
npm run db:migrate
npm run seed
npm run dev
```

Windows (PowerShell), same steps with `copy` instead of `cp`:

```powershell
copy .env.example .env
npm install
npm run db:generate
npm run db:migrate
npm run seed
npm run dev
```

`.env.example` matches the Compose user, password, database name, and host port 5433. Copy it rather than inventing a URL.

`prisma7.config.ts` is the Prisma 7 config. The CLI looks for `prisma.config.ts` unless `--config` points at this file. `generate` writes the client into `server/generated/prisma`, which is not committed. `migrate dev` applies `server/prisma/migrations`. `npm run seed` loads five categories and twelve products, and it is safe to run again. The API listens on [http://localhost:3000](http://localhost:3000). [http://localhost:3000/health](http://localhost:3000/health) returns `{ "status": "ok" }`.

### Client

In another terminal, from the repository root:

```bash
cd client
```

macOS and Linux:

```bash
cp .env.example .env
npm install
npm run dev
```

Windows (PowerShell):

```powershell
copy .env.example .env
npm install
npm run dev
```

`VITE_API_URL` must be `http://localhost:3000`. The shop is [http://localhost:5173](http://localhost:5173). Admin is [http://localhost:5173/admin](http://localhost:5173/admin).

## Stack

| Layer | Choice |
| --- | --- |
| Client | React 19, Vite, TypeScript, Tailwind CSS 4 |
| Client data and forms | TanStack Query, React Router, react-hook-form, Zod, sonner |
| Server | Node.js, Express 5, TypeScript, Zod |
| Database | PostgreSQL 16 in Docker Compose |
| ORM | Prisma 7, with the `pg` driver adapter |
| Money | Integer cents in the database, rufiyaa only at display |

## API reference

Base URL: `http://localhost:3000`. Lists return `{ data, meta }`. One record returns `{ data }`. Failures return `{ error: { message, fields? } }`.

| Method | Path | What it does |
| --- | --- | --- |
| `GET` | `/health` | Liveness check. `200` and `{ "status": "ok" }`. |
| `GET` | `/api/categories` | Every category, ordered by name. |
| `POST` | `/api/categories` | Create a category from `{ name }`. `201`. The slug is generated from the name. |
| `GET` | `/api/products` | A page of products. Filters and sort are query parameters. |
| `GET` | `/api/products/slug/:slug` | One product by slug. `404` when the slug does not exist. |
| `GET` | `/api/products/:id` | One product by id. `404` when the id does not exist. |
| `POST` | `/api/products` | Create a product. `201`. |
| `PATCH` | `/api/products/:id` | Update the fields you send. `404` when the id does not exist. |
| `DELETE` | `/api/products/:id` | Delete a product. `204` with an empty body. `404` when the id does not exist. |

`GET /api/products` query parameters:

| Parameter | Meaning |
| --- | --- |
| `q` | Optional. Case-insensitive match on name or description. |
| `category` | Optional category slug. |
| `sort` | `newest` (default), `price_asc`, or `price_desc`. |
| `page` | Page number, default `1`. |
| `pageSize` | Page size, default `12`, maximum `50`. The shop asks for `8`. Admin asks for `20`. |

Create body: `name`, `description`, `priceCents` (positive integer), `stock` (integer, default `0`), `categoryId`, and an optional `imageUrl`. The server builds the slug from the name. If that slug is already taken, it appends `-2`, then `-3`, and so on. Update accepts those same fields, all optional, and needs at least one. The update body has no slug, so renaming a product leaves its address alone. Send `imageUrl: null` on update to clear the picture. Extra keys are rejected.

Validation failures are `400` with `fields` keyed by input name. A duplicate slug is `409`. A missing category on create or update is `400`. An unknown product on read, update, or delete is `404`.

The client checks the JSON it receives as well. A list must be `{ data, meta }` and a single product must be `{ data }`. A shape the client does not expect fails in the browser instead of rendering a guess.

## Schema summary

**Category.** `id` (cuid), `name`, unique `slug`, `createdAt`. A category has many products. Deleting a category that still has products is rejected (`onDelete: Restrict`).

**Product.** `id` (cuid), `name`, unique `slug`, `description`, `priceCents` (integer cents), optional `imageUrl`, `stock` (default `0`), `categoryId`, `createdAt`, `updatedAt`. `categoryId` is indexed.

Prices are stored as cents. `1850` is displayed as Rf 18.50. The API never sends a formatted price string.

Categories can be created through the API. The admin screen does not. It only lets you pick a category that already exists, which is what the seed loads.

## Layout

```text
market-place/
  docker-compose.yml          Postgres 16, host port 5433
  client/                     React shop
    index.html                theme is set here before React paints
    src/App.tsx               routes
    src/StorefrontPage.tsx    shop: search, category, sort, pages
    src/ProductDetailPage.tsx one product, by slug
    src/AdminPage.tsx         list, create, edit, delete
    src/api/                  fetch, Zod response checks, query hooks
    src/components/           one piece of UI per file
  server/
    prisma7.config.ts         Prisma 7 config (not the default filename)
    prisma/schema.prisma
    prisma/migrations/
    src/app.ts                Express app and the error handler
    src/routes/               products and categories
    src/validation/           Zod for query strings and bodies
    src/db.ts                 Prisma client
    src/seed.ts
    generated/prisma/         generated client, not committed
```

## Pages

| Address | What you see |
| --- | --- |
| `/` | Product grid. Search, category chips, and sort live in the query string, so a refresh keeps them. |
| `/products/:slug` | One product. A missing slug is its own "not found" page. A failed request offers retry. |
| `/admin` | Product table on a wide screen, cards on a phone. New and Edit open a side panel. Delete asks first. |

The shop shows eight products per page. Admin shows twenty. Search waits 300ms after you stop typing, then writes `q` into the address and drops back to page 1. Changing category or sort also drops back to page 1.

Light and dark are a toggle in the header. The choice is saved in `localStorage` under the key `theme`. The first visit with nothing saved follows the operating system, and that automatic choice is not written until you toggle.

## UI and UX

The shop list has four states. While the request is in flight, a skeleton stands in for the grid. A failed load shows an error and a retry button. A search or category that matches nothing shows that message and a button to clear the filters. A catalog with no products and no filters says there are no products yet.

The skeletons match the size of the real cards, the product page, and the admin rows, so the layout does not jump when the data arrives.

Search, category, and sort live in the URL. Search waits 300ms after you stop typing before it writes `q`. Delete removes the row immediately and puts it back if the request fails. When the server returns field errors, those messages land on the matching inputs, so a `priceCents` error shows on the price field.

The create and edit drawer and the delete dialog trap focus while they are open. Keyboard focus draws a ring. On a phone the admin list is cards. From the `md` width up it is a table.

Type and color live as tokens in `client/src/index.css`. Poppins (400, 500, and 600) is both the heading face and the body face, and headings use weight 500. Colors are CSS variables, and Tailwind reads those variables, so components do not hard-code hex values.

## Technical decisions

**Two apps, two validation copies.** The shop and the API are separate projects. The browser reads `VITE_API_URL` and calls the API directly. Zod rules are written again on the client, not imported from `server/`. A shared package would mean a third project, and the form does not speak the API's shape anyway: the form uses text (`"12.50"`, `"4"`) and the API uses numbers (`priceCents`, `stock`). `rufiyaaToCents` turns the price field into cents before the request. On a 400, field names are mapped back onto the inputs (`priceCents` becomes the price field). The other option was one schema shared by both sides. That only works if both sides accept the same JSON.

**Integer cents.** `1850` cannot drift the way `18.5` can in floating point. `formatPrice` divides by 100 and formats with `Intl.NumberFormat("en-MV", { currency: "MVR" })`, which prints the rufiyaa sign. Formatting happens only in the browser. The conversion splits on the decimal point for the same reason: `16.50 * 100` evaluates to `1649.9999...` in floating point, which fails the server's integer check, so `rufiyaaToCents` parses the two parts and returns `1650`.

**Slugs stay stable.** The server derives the slug from the name on create: lower case, runs of characters that are not letters or numbers become a single hyphen, and a name with no letter or number is rejected. `uniqueSlug` checks the database and adds a numeric suffix when the base slug is taken. Edit does not recalculate it. A renamed product keeps the old `/products/:slug` link. The seed upserts by slug, and a row with the same name counts as the same record, so running `npm run seed` again updates those rows.

**One error path.** Route handlers parse with Zod and call Prisma. They do not catch. `findUniqueOrThrow`, `update`, and `delete` throw when the row is missing, and the error middleware turns that (`P2025`) into 404. Zod becomes 400 with `fields`. A unique-constraint clash (`P2002`) becomes 409. A foreign key to a missing category (`P2003`) becomes 400 on `categoryId`. Anything else is 500 and the real error is logged on the server. The other option was a `try/catch` in every route, which would repeat the same status mapping.

**PATCH, and the body must be exact.** An update sends only the fields that changed, and `strictObject` rejects keys the schema does not list. An empty object is rejected too. PUT would have required the client to resend the whole product.

**The address bar is the shop's state.** `q`, `category`, `sort`, and `page` are query parameters. Defaults are omitted (`newest` and page 1 do not appear in the URL). List results are ordered by the sort, then by `id`, so two products with the same timestamp or the same price do not swap places between requests. TanStack Query stores each list under `["products", query]`, a slug page under `["products", "slug", slug]`, and an admin edit under `["products", "id", id]`. After create, update, or delete, invalidating `["products"]` refreshes all of those, because that prefix matches every key that starts the same way.

**Delete removes the row before the response, then puts it back if the request fails.** The dialog closes, then the mutation runs. `onMutate` cancels product queries that are already in flight, copies every `["products"]` cache entry, and drops the row from list caches that contain it, lowering `total` by one. A product-detail cache is not a list, so it is left as it is. `onError` writes that copy back and shows an error toast. `onSuccess` shows "Deleted {name}." `onSettled` always invalidates, so the screen ends on what the server actually has. `retry: false` means a failed delete is not sent again. The other option was to wait for 204 before removing the row. That is simpler, and the row stays on screen until the response. The snapshot exists so a failed request cannot leave the row missing if a later refetch also fails and the cache is never overwritten.

**The theme is set before React runs.** A script in `client/index.html` reads `localStorage` and, if that is empty or unreadable, `prefers-color-scheme`. It sets `data-theme` on `<html>` before the body paints, so the first frame is already light or dark. Toggling writes the attribute and then `localStorage`. If storage throws, the attribute still changes for this visit. Dark mode uses its own page colors. The header uses those dark colors only while dark mode is on. In light mode the bar is the cream page background, and the wordmark uses the dark brown header token.

**Postgres on 5433, Prisma through a config file.** The container still uses 5432. The host mapping is 5433 so a local Postgres on 5432 can stay running. Prisma 7 reads `prisma7.config.ts` only when the CLI is given `--config`. The generated client is written to `server/generated/prisma` and gitignored. The client uses the `pg` driver adapter. `npm run dev` loads `.env` via `tsx --env-file=.env`.

**No accounts.** The brief does not require authentication. Create, edit, and delete are open, and `cors()` allows any origin. That is fine for a local demo. It is the first thing to close if this were deployed.

## What I'd do next

- Add authentication before the admin screen and the write routes. Create, edit, and delete are open to anyone who can reach the API.
- Add tests for Zod validation, the product list filters, and delete when the request fails after the row has already left the cache.
- Accept an uploaded image instead of a pasted URL, and store the file with the app.
- Search is `ILIKE '%term%'`, which can't use a B-tree index because of the leading wildcard, so it's a sequential scan. At catalog scale, move to Postgres full-text search with a GIN index on a `tsvector` column, or `pg_trgm` for substring matching.
- Unknown client routes render an empty shell rather than a not-found page.
