import { aresEndpoint, mockSurveyEnabled } from "@/lib/ares/server/config";
import { MockSurveySource } from "@/lib/ares/server/mock-survey";
import { describeError } from "@/lib/ares/server/upstream";
import type { StreamMessage } from "@/lib/ares/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SSE_HEADERS = {
  "content-type": "text/event-stream",
  "cache-control": "no-cache, no-transform",
  connection: "keep-alive",
};

/**
 * `GET /api/ares/stream` — the live survey as Server-Sent Events: one snapshot
 * on connect, then `SurveyEvent` deltas.
 *
 * Two sources behind one seam. With ARES_LIVE_STREAM unset it is fed by the
 * in-process mock, so the console runs with no radio and no live service. With
 * ARES_LIVE_STREAM=1 it proxies `ares serve`'s `${aresEndpoint()}/stream`
 * byte-for-byte — the service emits the same wire contract, so the browser code
 * is unchanged across the swap. A no-timeout fetch (bounded only by the client's
 * disconnect) keeps the long-lived stream from being cut at 5s.
 */
export async function GET(request: Request): Promise<Response> {
  if (!mockSurveyEnabled()) return proxyUpstream(request);

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

  return new Response(stream, { headers: SSE_HEADERS });
}

/**
 * Proxy the Ares service's SSE stream straight through. Not `timedFetch` — that
 * aborts after 5s and would sever the live stream; the client's own disconnect
 * (`request.signal`) is the abort here. An unreachable service becomes one SSE
 * `error` event, so the cockpit shows "stream lost" rather than a dead fetch.
 */
async function proxyUpstream(request: Request): Promise<Response> {
  const upstream = `${aresEndpoint()}/stream`;
  try {
    const resp = await fetch(upstream, {
      cache: "no-store",
      signal: request.signal,
      headers: { accept: "text/event-stream" },
    });
    if (!resp.ok || !resp.body) {
      return sseError(`ares stream upstream returned ${resp.status} ${resp.statusText}`);
    }
    return new Response(resp.body, { headers: SSE_HEADERS });
  } catch (e) {
    return sseError(`ares stream unreachable at ${upstream}: ${describeError(e)}`);
  }
}

function sseError(message: string): Response {
  return new Response(`event: error\ndata: ${JSON.stringify({ message })}\n\n`, {
    status: 502,
    headers: SSE_HEADERS,
  });
}
