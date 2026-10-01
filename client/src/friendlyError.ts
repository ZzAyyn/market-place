import { ApiError } from "./api/client.ts";

export function friendlyErrorMessage(error: unknown, fallback: string): string {
  if (
    error instanceof ApiError &&
    error.status < 500 &&
    !error.message.startsWith("Request failed")
  ) {
    return error.message;
  }

  return fallback;
}
