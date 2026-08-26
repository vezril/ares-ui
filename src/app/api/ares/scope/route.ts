import { NextResponse } from "next/server";

import { mockSurveyEnabled } from "@/lib/ares/server/config";
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
  // Live path not yet wired; report an empty, honest scope rather than inventing.
  const body: ScopeResponse = { ownSsids: [], ownBssidCount: 0, activeEnabled: false };
  return NextResponse.json(body);
}
