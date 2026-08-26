import { NextResponse } from "next/server";

import { aresEndpoint, mockSurveyEnabled } from "@/lib/ares/server/config";
import { MOCK_FINDINGS } from "@/lib/ares/server/mock-findings";
import { describeError, timedFetch } from "@/lib/ares/server/upstream";
import type { Finding } from "@/lib/ares/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * `GET /api/ares/findings` — the severity-ranked security.wifi.finding events for
 * the board. Mock set with ARES_LIVE_STREAM unset; otherwise proxies the Ares
 * service's `/findings`. Unreachable returns an empty list (the page shows a
 * designed empty/error state, and the health pill already signals "Down").
 */
export async function GET() {
  if (mockSurveyEnabled()) return NextResponse.json(MOCK_FINDINGS);
  try {
    const resp = await timedFetch(`${aresEndpoint()}/findings`);
    if (resp.ok) return NextResponse.json((await resp.json()) as Finding[]);
  } catch (e) {
    void describeError(e);
  }
  return NextResponse.json([] as Finding[]);
}
