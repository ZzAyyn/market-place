import type { ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import { Prisma } from "../../generated/prisma/client.js";

function fieldsFromZod(error: ZodError): Record<string, string> {
  const fields: Record<string, string> = {};

  for (const issue of error.issues) {
    const name = issue.path.map(String).join(".") || "body";
    if (fields[name] === undefined) {
      fields[name] = issue.message;
    }
  }

  return fields;
}

function constraintLabels(meta: Record<string, unknown> | undefined): string[] {
  const target = meta?.target;

  if (Array.isArray(target)) {
    return target.filter((item): item is string => typeof item === "string");
  }

  if (typeof target === "string") {
    return [target];
  }

  const adapter = meta?.driverAdapterError;
  if (typeof adapter !== "object" || adapter === null || !("cause" in adapter)) {
    return [];
  }

  const cause: unknown = adapter.cause;
  if (typeof cause !== "object" || cause === null || !("constraint" in cause)) {
    return [];
  }

  const constraint: unknown = cause.constraint;
  if (typeof constraint !== "object" || constraint === null || !("index" in constraint)) {
    return [];
  }

  return typeof constraint.index === "string" ? [constraint.index] : [];
}

function fieldFromLabel(label: string): string | undefined {
  if (label === "slug" || label.endsWith("_slug_key")) {
    return "slug";
  }

  if (label === "categoryId" || label.includes("categoryId")) {
    return "categoryId";
  }

  return undefined;
}

function namedField(meta: Record<string, unknown> | undefined): string | undefined {
  for (const label of constraintLabels(meta)) {
    const field = fieldFromLabel(label);
    if (field !== undefined) {
      return field;
    }
  }

  return undefined;
}

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof ZodError) {
    res.status(400).json({
      error: {
        message: "Validation failed",
        fields: fieldsFromZod(error),
      },
    });
    return;
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      const field = namedField(error.meta);
      res.status(409).json({
        error: {
          message: "That value is already in use",
          ...(field ? { fields: { [field]: "Already in use" } } : {}),
        },
      });
      return;
    }

    if (error.code === "P2003") {
      const field = namedField(error.meta);
      res.status(400).json({
        error: {
          message: "Related record does not exist",
          ...(field === "categoryId" ? { fields: { categoryId: "No category with that id" } } : {}),
        },
      });
      return;
    }

    if (error.code === "P2025") {
      const model = typeof error.meta?.modelName === "string" ? error.meta.modelName : "Record";
      res.status(404).json({
        error: { message: `${model} not found` },
      });
      return;
    }
  }

  console.error(error);
  res.status(500).json({
    error: { message: "Internal server error" },
  });
};
