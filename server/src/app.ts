import cors from "cors";
import express from "express";
import { errorHandler } from "./middleware/error.js";
import { categoriesRouter } from "./routes/categories.js";
import { productsRouter } from "./routes/products.js";

export const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/products", productsRouter);
app.use("/api/categories", categoriesRouter);
app.use(errorHandler);
