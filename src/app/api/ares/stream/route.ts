import { aresEndpoint, mockSurveyEnabled } from "@/lib/ares/server/config";
import { MockSurveySource } from "@/lib/ares/server/mock-survey";
import type { StreamMessage } from "@/lib/ares/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * `GET /api/ares/stream` — the live survey as Server-Sent Events: one snapshot
 * on connect, then `SurveyEvent` deltas.
 *
 * Today it is fed by the in-process mock survey source, so the console runs with
 * no radio and no live service. When ares-service exposes its own stream, this
 * flips to proxying `${aresEndpoint()}/stream` (gated on ARES_LIVE_STREAM=1); the
 * browser code and the wire contract are unchanged across that swap — the whole
 * point of the BFF seam.
 */
export async function GET(request: Request): Promise<Response> {
  if (!mockSurveyEnabled()) {
    // Live path (ares-service SSE) — not wired until the service exposes it.
    return new Response(
      `event: error\ndata: ${JSON.stringify({
        message: `live survey stream not yet available at ${aresEndpoint()}/stream`,
      })}\n\n`,
      { status: 501, headers: { "content-type": "text/event-stream" } }
    );
  }

  const source = new MockSurveySource();
  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const send = (msg: StreamMessage) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(msg)}\n\n`));
      };

      send(source.snapshot());
      const interval = setInterval(() => {
        for (const event of source.tick()) send(event);
      }, 1500);

      // Tear down when the client disconnects, so the timer never leaks.
      request.signal.addEventListener("abort", () => {
        clearInterval(interval);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      "content-type": "text/event-stream",
      "cache-control": "no-cache, no-transform",
      connection: "keep-alive",
    },
  });
}
