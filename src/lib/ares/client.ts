import type { Finding, HealthResponse, ScopeResponse } from "./types";

/**
 * The browser's only data surface: the same-origin BFF. `NEXT_PUBLIC_*` is
 * inlined at BUILD time (a chart env for it is inert), so the Dockerfile bakes
 * the RELATIVE path `/api/ares` in the builder stage — which keeps the image
 * environment-agnostic. The fallback matches, so `npm run dev` behaves
 * identically without a .env.
 *
 * The live survey is consumed via `EventSource(\`${BASE}/stream\`)` directly in
 * the console component; polled reads (health, scope) go through here.
 */
export const BASE = process.env.NEXT_PUBLIC_ARES_API_BASE ?? "/api/ares";

async function json<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) {
    throw new Error(`${path} failed: ${res.status} ${res.statusText}`);
  }
  return (await res.json()) as T;
}

export const api = {
  health: () => json<HealthResponse>("/health"),
  scope: () => json<ScopeResponse>("/scope"),
  findings: () => json<Finding[]>("/findings"),
};

/** Query keys, centralised so refetches and invalidations cannot drift. */
export const keys = {
  health: ["ares", "health"] as const,
  scope: ["ares", "scope"] as const,
  findings: ["ares", "findings"] as const,
};
