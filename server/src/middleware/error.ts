import type { ErrorRequestHandler } from "express";
import { ZodError } from "zod";

function fieldsFromZod(error: ZodError): Record<string, string> {
  const fields: Record<string, string> = {};

  for (const issue of error.issues) {
    const name = issue.path.map(String).join(".") || "query";
    if (fields[name] === undefined) {
      fields[name] = issue.message;
    }
  }

  return fields;
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

  console.error(error);
  res.status(500).json({
    error: { message: "Internal server error" },
  });
};
