import "server-only";

import { aresEndpoint } from "./config";
import type { ServiceHealth } from "../types";

/**
 * Server-only upstream access for the BFF. Every outbound call is made here from
 * the Node runtime — the browser never reaches a backend directly, so there is
 * no CORS surface and nothing to expose. Every fetch is timeout-bounded so a hung
 * upstream degrades one card rather than wedging the route handler.
 */

const TIMEOUT_MS = 5_000;

export async function timedFetch(url: string, init?: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    return await fetch(url, { ...init, cache: "no-store", signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

/** A readable one-liner for whatever went wrong, for a designed error state. */
export function describeError(e: unknown): string {
  if (e instanceof Error) {
    if (e.name === "AbortError") return `no response within ${TIMEOUT_MS / 1000}s`;
    const cause = (e as { cause?: { code?: string } }).cause;
    if (cause?.code) return `${e.message} (${cause.code})`;
    return e.message;
  }
  return String(e);
}

/**
 * GET the Ares service's `/health`. A 503 body is still parsed — DOWN is data.
 * Throws only when there is no JSON body at all (unreachable), which the health
 * route turns into a labelled "Down" rather than a 500.
 */
export async function fetchAresHealth(): Promise<ServiceHealth> {
  const res = await timedFetch(`${aresEndpoint()}/health`);
  const body = (await res.json().catch(() => null)) as ServiceHealth | null;
  if (body) return body;
  throw new Error(`Ares /health returned ${res.status} with no JSON body`);
}
