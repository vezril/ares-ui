import { NextResponse } from "next/server";

import { aresEndpoint, mockSurveyEnabled } from "@/lib/ares/server/config";
import { MOCK_POSTURE } from "@/lib/ares/server/mock-posture";
import { describeError, timedFetch } from "@/lib/ares/server/upstream";
import type { PostureItem } from "@/lib/ares/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * `GET /api/ares/posture` — the per-own-AP self-assessment for the Posture board.
 * Mock set with ARES_LIVE_STREAM unset; otherwise proxies the service's
 * `/posture`. Unreachable → empty list (the page shows a designed empty state).
 */
export async function GET() {
  if (mockSurveyEnabled()) return NextResponse.json(MOCK_POSTURE);
  try {
    const resp = await timedFetch(`${aresEndpoint()}/posture`);
    if (resp.ok) return NextResponse.json((await resp.json()) as PostureItem[]);
  } catch (e) {
    void describeError(e);
  }
  return NextResponse.json([] as PostureItem[]);
}
