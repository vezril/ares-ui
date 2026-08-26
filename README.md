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

Seeded 2026-08-26 — UI is a later slice; the passive service comes first.
