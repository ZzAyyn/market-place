import { z } from "zod";

export class ApiError extends Error {
  readonly status: number;
  readonly fields: Record<string, string> | undefined;

  constructor(message: string, status: number, fields?: Record<string, string>) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.fields = fields;
  }
}

function apiBase(): string {
  const value = import.meta.env.VITE_API_URL;

  if (value.length === 0) {
    throw new Error("VITE_API_URL must be set in client/.env");
  }

  return value;
}

function apiUrl(path: string): string {
  const base = apiBase();
  const origin = base.endsWith("/") ? base : `${base}/`;
  return new URL(path.replace(/^\//, ""), origin).toString();
}

const errorBodySchema = z.object({
  error: z.object({
    message: z.string(),
    fields: z.record(z.string(), z.string()).optional(),
  }),
});

async function errorFromResponse(response: Response): Promise<ApiError> {
  try {
    const parsed = errorBodySchema.safeParse(await response.json());
    if (parsed.success) {
      return new ApiError(parsed.data.error.message, response.status, parsed.data.error.fields);
    }
  } catch {
    // The body was empty or not JSON.
  }

  return new ApiError(`Request failed (${response.status})`, response.status);
}

export async function apiGet<T>(path: string, schema: z.ZodType<T>): Promise<T> {
  const response = await fetch(apiUrl(path));

  if (!response.ok) {
    throw await errorFromResponse(response);
  }

  return schema.parse(await response.json());
}

export async function apiSend<T>(
  method: "POST" | "PATCH",
  path: string,
  body: unknown,
  schema: z.ZodType<T>,
): Promise<T> {
  const response = await fetch(apiUrl(path), {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw await errorFromResponse(response);
  }

  return schema.parse(await response.json());
}
