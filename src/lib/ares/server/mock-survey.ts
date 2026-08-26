import "server-only";

import type {
  ForeignAggregate,
  OwnAccessPoint,
  OwnClient,
  SurveyEvent,
  SurveySnapshot,
} from "../types";

/**
 * A representative survey source for dev / bring-up, so the whole console runs
 * with no radio and no live ares-service stream (mirrors shodan's mock adapter).
 *
 * It models the operator's OWN network — a couple of own APs on the configured
 * SSID, a handful of own clients — plus a foreign AGGREGATE that drifts, and an
 * occasional rogue: a foreign BSSID broadcasting an own SSID. Note what it does
 * NOT model: any per-device foreign identity. There is nowhere in this source, or
 * in the contract it emits, to hang a browsable neighbour list.
 */

const OWN_SSID = "Experimental Neutron";

const OWN_APS: OwnAccessPoint[] = [
  {
    bssid: "aa:bb:cc:dd:ee:f0",
    ssid: OWN_SSID,
    channel: 6,
    band: "2.4GHz",
    security: "wpa3",
    signalDbm: -41,
    clientCount: 3,
    firstSeen: "2026-08-26T09:00:00.000Z",
    lastSeen: "2026-08-26T09:00:00.000Z",
  },
  {
    bssid: "aa:bb:cc:dd:ee:f1",
    ssid: OWN_SSID,
    channel: 149,
    band: "5GHz",
    security: "wpa3",
    signalDbm: -58,
    clientCount: 1,
    firstSeen: "2026-08-26T09:00:00.000Z",
    lastSeen: "2026-08-26T09:00:00.000Z",
  },
];

const OWN_CLIENTS: OwnClient[] = [
  { mac: "de:ad:be:ef:00:01", bssid: "aa:bb:cc:dd:ee:f0", signalDbm: -47, lastSeen: "" },
  { mac: "de:ad:be:ef:00:02", bssid: "aa:bb:cc:dd:ee:f0", signalDbm: -60, lastSeen: "" },
  { mac: "de:ad:be:ef:00:03", bssid: "aa:bb:cc:dd:ee:f0", signalDbm: -72, lastSeen: "" },
  { mac: "de:ad:be:ef:00:04", bssid: "aa:bb:cc:dd:ee:f1", signalDbm: -55, lastSeen: "" },
];

function jitter(dbm: number): number {
  return Math.max(-90, Math.min(-30, dbm + Math.round((Math.random() - 0.5) * 6)));
}

export class MockSurveySource {
  private aps = OWN_APS.map((ap) => ({ ...ap }));
  private clients = OWN_CLIENTS.map((c) => ({ ...c }));
  private foreign: ForeignAggregate = { apCount: 14, clientCount: 31, spoofingOwnSsid: [] };
  private ticks = 0;

  private now(): string {
    // A fixed base plus tick seconds keeps timestamps monotonic and readable
    // without depending on wall-clock in tests that drive tick() directly.
    return new Date(Date.parse("2026-08-26T09:00:00.000Z") + this.ticks * 1000).toISOString();
  }

  snapshot(): SurveySnapshot {
    const at = this.now();
    return {
      type: "snapshot",
      at,
      ownAps: this.aps.map((ap) => ({ ...ap, lastSeen: at })),
      ownClients: this.clients.map((c) => ({ ...c, lastSeen: at })),
      foreign: { ...this.foreign, spoofingOwnSsid: [...this.foreign.spoofingOwnSsid] },
    };
  }

  /** Advance the model one step and emit the resulting deltas. */
  tick(): SurveyEvent[] {
    this.ticks += 1;
    const at = this.now();
    const events: SurveyEvent[] = [];

    // Own AP signal drifts.
    for (const ap of this.aps) {
      ap.signalDbm = jitter(ap.signalDbm ?? -50);
      ap.lastSeen = at;
      events.push({ type: "own.ap.upsert", ap: { ...ap } });
    }

    // An own client drifts / re-associates.
    const client = this.clients[this.ticks % this.clients.length];
    client.signalDbm = jitter(client.signalDbm ?? -55);
    client.lastSeen = at;
    events.push({ type: "own.client.upsert", client: { ...client } });

    // Foreign aggregate drifts; every ~5th tick a rogue appears/clears — the one
    // foreign detail we surface, because it is an attack on us.
    this.foreign = {
      apCount: Math.max(0, this.foreign.apCount + (Math.random() < 0.5 ? -1 : 1)),
      clientCount: Math.max(0, this.foreign.clientCount + Math.round((Math.random() - 0.5) * 4)),
      spoofingOwnSsid: this.ticks % 5 === 0 ? [OWN_SSID] : [],
    };
    events.push({ type: "foreign.update", foreign: { ...this.foreign } });

    return events;
  }
}
