# ares-ui

**Ares' wireless-survey & findings console** — the later UI slice of the Ares wireless pentest
platform (`ares-service`). God-marked crimson, behind the Authelia gate like every constellation
console.

> Design source of truth: **`~/Code/codex/docs/ares-wireless-pentest.md`**. Service seed:
> `~/Code/ares-service`. Read both before building.

## What it shows (v1 sketch)

- **Live survey** — nearby APs (SSID/BSSID/channel/signal/security), client associations, own
  vs. foreign clearly separated. This is the Pineapple's recon view, done honestly.
- **Own-network posture** — my APs' channel/security/passphrase-audit status; rogue-AP alerts
  (someone spoofing my SSID).
- **Findings board** — severity-ranked `security.wifi.finding` events, links to the Apollo
  capture blob, links to the fix.
- **Active tier (if/when it exists)** — behind an explicit, obvious own-BSSID-allowlist gate;
  the UI must make "this radiates to everything in range" impossible to miss.

## Privacy is a UI responsibility here

Because passive capture inevitably *sees* third-party devices, the UI must **not** turn into a
neighborhood surveillance board. Foreign BSSIDs/clients: aggregate counts and rogue-spoof
detection only, never a browsable per-device tracking log. Own-scope gets the detail. This is
the `docs/ux-standards.md` visual-honesty rule applied to RF: show what's real, don't build
what shouldn't exist.

## Conventions

`UX-STANDARDS.md` + `UI-PLAYBOOK.md` in this folder are the copied-in binding standards (dark-
only, per-god accent — Ares = crimson; same build/deploy conventions as the other consoles).
Deploys are the Codex session's. Owner/coordination per `codex/docs/session-coordination.md`.

## Development

Next.js 16 + React 19 + Tailwind v4, same stack as the sibling consoles. Node 22+.

```bash
npm install
npm run dev            # http://localhost:3000
npm run lint && npm run typecheck && npm test && npm run build
```

The **survey cockpit runs with no radio and no live service**: the BFF's
`/api/ares/stream` is fed by an in-process mock survey source (`ARES_LIVE_STREAM`
unset), so `npm run dev` shows live own-APs, client drill-in, foreign aggregate,
and an intermittent rogue-AP alert out of the box. When ares-service exposes an
SSE endpoint, flip `ARES_LIVE_STREAM=1` and the browser code + wire contract are
unchanged — that's the BFF seam.

Layout: `src/lib/ares/types.ts` (the wire contract — **no foreign per-device
type exists**, the privacy rule in the type system) · `src/lib/ares/survey.ts`
(the reducer, unit-tested) · `src/lib/ares/server/` (BFF config + mock source,
`server-only`) · `src/app/api/ares/*` (health, stream/SSE, scope route handlers)
· `src/components/ares/survey-console.tsx` (the cockpit, adapted from the
deprecated shodan console) · `src/app/globals.css` (crimson accent over the
dionysus base). Chart in `deploy/charts/ares-ui`; CI (eslint, tsc, vitest, build,
helm) in `.github/workflows`.

Started 2026-08-26 from the shodan cockpit (which Calvin is deprecating), restyled
to the constellation crimson/dark standard and re-shaped to Ares' privacy model.
Survey is live (mock-backed); Posture and Findings are honest empty-state stubs
until ares-service emits that data.
