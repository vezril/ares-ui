import "server-only";

/**
 * Server-side upstream configuration for the BFF. Every value is RUNTIME env
 * (chart values), never `NEXT_PUBLIC_*` — the browser must not learn these URLs,
 * and never needs to: it only calls same-origin `/api/ares/*`.
 *
 * `import "server-only"` makes importing this from a client component a build
 * error — the guard that keeps the BFF boundary honest.
 */

function normalize(url: string): string {
  return url.replace(/\/+$/, "");
}

/**
 * The Ares service — `/health` and (later) the survey stream.
 *
 * ares-service is a CLI today with no HTTP surface, so there is nothing to reach
 * yet: the health probe renders "Down" (honest), and the survey stream is served
 * from the in-process mock source below until the service grows an SSE endpoint.
 * When it does, this endpoint is where the stream route will proxy it.
 */
export function aresEndpoint(): string {
  return normalize(process.env.ARES_ENDPOINT ?? "http://localhost:8087");
}

/**
 * Whether to use the built-in mock survey source instead of a live Ares stream.
 * Defaults ON until ares-service exposes the stream — flip via ARES_LIVE_STREAM=1
 * once it does. Keeps the whole console runnable now (mirrors shodan's mock
 * adapter: the full stack runs on a dev host with no radio).
 */
export function mockSurveyEnabled(): boolean {
  return process.env.ARES_LIVE_STREAM !== "1";
}
