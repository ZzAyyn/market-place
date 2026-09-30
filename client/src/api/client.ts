import { z } from "zod";

export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
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
  }),
});

async function messageFromResponse(response: Response): Promise<string> {
  try {
    const parsed = errorBodySchema.safeParse(await response.json());
    if (parsed.success) {
      return parsed.data.error.message;
    }
  } catch {
    // The body was empty or not JSON.
  }

  return `Request failed (${response.status})`;
}

export async function apiGet<T>(path: string, schema: z.ZodType<T>): Promise<T> {
  const response = await fetch(apiUrl(path));

  if (!response.ok) {
    throw new ApiError(await messageFromResponse(response), response.status);
  }

  return schema.parse(await response.json());
}
