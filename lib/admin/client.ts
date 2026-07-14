/**
 * Admin client HTTP helper. Adds the CSRF-defense header and credentials so
 * the server-side RBAC/audit/rate-limit guards function, and normalizes errors.
 */
"use client";

export class AdminApiError extends Error {
  constructor(public status: number, message: string, public details?: Record<string, unknown>) {
    super(message);
  }
}

export async function adminFetch<T = any>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const res = await fetch(path, {
    ...options,
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
      "x-requested-with": "titan-admin",
      ...(options.headers ?? {}),
    },
  });
  if (!res.ok) {
    let message = "Request failed";
    let details: Record<string, unknown> | undefined;
    try {
      const data = await res.json();
      message = data.error ?? message;
      details = data.details;
    } catch {
      /* ignore */
    }
    throw new AdminApiError(res.status, message, details);
  }
  return res.json() as Promise<T>;
}

export function useAdminApi() {
  return {
    get: <T = any>(path: string) => adminFetch<T>(path, { method: "GET" }),
    post: <T = any>(path: string, body?: unknown) => adminFetch<T>(path, { method: "POST", body: body ? JSON.stringify(body) : undefined }),
    patch: <T = any>(path: string, body?: unknown) => adminFetch<T>(path, { method: "PATCH", body: body ? JSON.stringify(body) : undefined }),
    del: <T = any>(path: string) => adminFetch<T>(path, { method: "DELETE" }),
  };
}
