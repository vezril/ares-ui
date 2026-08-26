import { NextResponse } from "next/server";

import { aresEndpoint } from "@/lib/ares/server/config";
import { describeError, fetchAresHealth } from "@/lib/ares/server/upstream";
import type { HealthResponse } from "@/lib/ares/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * `GET /api/ares/health` — the Ares service's own `/health`, via the BFF.
 *
 * Always answers 200: DOWN and unreachable are both *data* the health pill
 * renders with a label. ares-service is a CLI today with no HTTP surface, so
 * this honestly reports "Down" until the service grows a `/health` endpoint —
 * never a fake green.
 */
export async function GET() {
  const endpoint = aresEndpoint();
  try {
    const health = await fetchAresHealth();
    const body: HealthResponse = {
      state: health.status === "UP" ? "up" : "down",
      health,
      error: null,
      endpoint,
    };
    return NextResponse.json(body);
  } catch (e) {
    const body: HealthResponse = {
      state: "down",
      health: null,
      error: describeError(e),
      endpoint,
    };
    return NextResponse.json(body);
  }
}
