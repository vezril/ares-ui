import { NextResponse } from "next/server";

import { aresEndpoint, mockSurveyEnabled } from "@/lib/ares/server/config";
import { describeError, timedFetch } from "@/lib/ares/server/upstream";
import type { ScopeResponse } from "@/lib/ares/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * `GET /api/ares/scope` — a read-only view of the service's own-network scope
 * (SSID handles, how many BSSIDs are pinned, whether the active tier is on).
 *
 * The console never *sets* scope — pinning an own-BSSID allowlist is a
 * deliberate operator act at the service (`ares scope discover` → confirm), not
 * a click in a browser. This is read-only by design.
 *
 * Served from the mock while ares-service has no HTTP surface; will read the
 * service's scope endpoint once it exists.
 */
export async function GET() {
  if (mockSurveyEnabled()) {
    const body: ScopeResponse = {
      ownSsids: ["Experimental Neutron"],
      ownBssidCount: 2,
      activeEnabled: false,
    };
    return NextResponse.json(body);
  }
  // Live: read the service's own /scope (same ScopeResponse shape). Unreachable
  // reports an empty, honest scope rather than inventing one.
  try {
    const resp = await timedFetch(`${aresEndpoint()}/scope`);
    if (resp.ok) return NextResponse.json((await resp.json()) as ScopeResponse);
  } catch (e) {
    // fall through to the empty scope; the health pill already signals "Down".
    void describeError(e);
  }
  const empty: ScopeResponse = { ownSsids: [], ownBssidCount: 0, activeEnabled: false };
  return NextResponse.json(empty);
}
