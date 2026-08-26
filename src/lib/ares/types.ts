/**
 * The Ares service ↔ console wire contract — adapted from the shodan cockpit's
 * contract, but bent to Ares' privacy model.
 *
 * The load-bearing difference from shodan: **there is no ForeignAccessPoint /
 * ForeignClient type.** Own-scope observations carry full detail; everything
 * foreign collapses to aggregate counts + rogue-spoof flags in
 * `ForeignAggregate`. The UI *cannot* render a browsable neighbour list because
 * the contract never carries one — the "no neighbourhood surveillance board"
 * rule (ares-ui README) enforced in the type system, not just the styling.
 *
 * On connect the service sends one `SurveySnapshot`, then incremental
 * `SurveyEvent` deltas over SSE. The console consumes these; the same shapes are
 * mirrored by ares-service's Python models (AccessPoint/Client/Finding).
 */

export type Band = "2.4GHz" | "5GHz" | "6GHz";

export type Security = "open" | "wep" | "wpa" | "wpa2" | "wpa3" | "unknown";

/** An access point on the operator's OWN network — full detail is retained. */
export interface OwnAccessPoint {
  /** BSSID (the AP radio's MAC) — the stable key for upserts. */
  bssid: string;
  /** Network name; null for a hidden SSID. */
  ssid: string | null;
  channel: number | null;
  band: Band | null;
  security: Security;
  /** Signal strength in dBm (negative, e.g. -42). */
  signalDbm: number | null;
  /** Own clients currently observed associated with this AP. */
  clientCount: number;
  /** ISO 8601 timestamps. */
  firstSeen: string;
  lastSeen: string;
}

/** A client (station) on the operator's OWN network. */
export interface OwnClient {
  /** Station MAC — the stable key for upserts. */
  mac: string;
  /** Own BSSID this station is associated with, or null if only probing. */
  bssid: string | null;
  signalDbm: number | null;
  lastSeen: string;
}

/**
 * Everything the survey keeps about foreign (third-party) RF: counts, never
 * identities. `spoofingOwnSsid` is the one exception where a foreign SSID is
 * named — a foreign AP broadcasting a name we own is an attack on us (rogue /
 * evil-twin), not a neighbour to be catalogued.
 */
export interface ForeignAggregate {
  apCount: number;
  clientCount: number;
  /** Own SSIDs currently seen broadcast by a foreign BSSID (rogue candidates). */
  spoofingOwnSsid: string[];
}

/** Sent once when a client connects, before any deltas. */
export interface SurveySnapshot {
  type: "snapshot";
  at: string;
  ownAps: OwnAccessPoint[];
  ownClients: OwnClient[];
  foreign: ForeignAggregate;
}

/**
 * Incremental deltas after the snapshot. Own APs/clients upsert-or-remove in
 * place (keyed by bssid/mac); foreign only ever arrives as a fresh aggregate.
 */
export type SurveyEvent =
  | { type: "own.ap.upsert"; ap: OwnAccessPoint }
  | { type: "own.ap.remove"; bssid: string }
  | { type: "own.client.upsert"; client: OwnClient }
  | { type: "own.client.remove"; mac: string }
  | { type: "foreign.update"; foreign: ForeignAggregate };

export type StreamMessage = SurveySnapshot | SurveyEvent;

export function isSnapshot(msg: StreamMessage): msg is SurveySnapshot {
  return msg.type === "snapshot";
}

// --- health (mirrors the sibling consoles' BFF health shape) ------------------

export type HealthState = "up" | "down";

export interface ServiceHealth {
  service: string;
  status: "UP" | "DOWN";
  version?: string | null;
}

export interface HealthResponse {
  state: HealthState;
  health: ServiceHealth | null;
  error: string | null;
  endpoint: string;
}

// --- scope (read-only view of the service's own-network allowlist) ------------

export interface ScopeResponse {
  ownSsids: string[];
  ownBssidCount: number;
  activeEnabled: boolean;
}

// --- findings (the security.wifi.finding events, for the board) ---------------

export type Severity = "info" | "low" | "medium" | "high" | "critical";

export interface Finding {
  id: string;
  /** ISO 8601. */
  at: string;
  /** e.g. rogue_ap, passphrase_weak, deauth_test_completed. */
  kind: string;
  severity: Severity;
  summary: string;
  bssid?: string | null;
  /** Apollo content-address of an associated capture — never the blob itself,
   *  and never a secret. */
  captureRef?: string | null;
}
