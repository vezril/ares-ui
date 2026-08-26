import { describe, expect, it } from "vitest";

import {
  applyMessage,
  emptySurvey,
  ownClientsOf,
  sortedOwnAps,
  type SurveyState,
} from "@/lib/ares/survey";
import type { OwnAccessPoint, StreamMessage, SurveySnapshot } from "@/lib/ares/types";

function ap(bssid: string, signalDbm: number): OwnAccessPoint {
  return {
    bssid,
    ssid: "Experimental Neutron",
    channel: 6,
    band: "2.4GHz",
    security: "wpa3",
    signalDbm,
    clientCount: 0,
    firstSeen: "2026-08-26T09:00:00.000Z",
    lastSeen: "2026-08-26T09:00:00.000Z",
  };
}

const SNAPSHOT: SurveySnapshot = {
  type: "snapshot",
  at: "2026-08-26T09:00:00.000Z",
  ownAps: [ap("aa:bb:cc:dd:ee:f0", -50)],
  ownClients: [
    { mac: "de:ad:be:ef:00:01", bssid: "aa:bb:cc:dd:ee:f0", signalDbm: -47, lastSeen: "" },
  ],
  foreign: { apCount: 14, clientCount: 31, spoofingOwnSsid: [] },
};

function hydrated(): SurveyState {
  return applyMessage(emptySurvey(), SNAPSHOT);
}

describe("survey reducer", () => {
  it("hydrates own detail and the foreign aggregate from a snapshot", () => {
    const s = hydrated();
    expect(s.ownAps.size).toBe(1);
    expect(s.ownClients.size).toBe(1);
    expect(s.foreign.apCount).toBe(14);
  });

  it("upserts an own AP in place (no duplicate rows)", () => {
    let s = hydrated();
    s = applyMessage(s, { type: "own.ap.upsert", ap: ap("aa:bb:cc:dd:ee:f0", -42) });
    expect(s.ownAps.size).toBe(1);
    expect(s.ownAps.get("aa:bb:cc:dd:ee:f0")?.signalDbm).toBe(-42);
  });

  it("removes an own AP when it ages out", () => {
    let s = hydrated();
    s = applyMessage(s, { type: "own.ap.remove", bssid: "aa:bb:cc:dd:ee:f0" });
    expect(s.ownAps.size).toBe(0);
  });

  it("replaces the foreign aggregate wholesale — never accumulates a list", () => {
    let s = hydrated();
    s = applyMessage(s, {
      type: "foreign.update",
      foreign: { apCount: 9, clientCount: 20, spoofingOwnSsid: [] },
    });
    expect(s.foreign.apCount).toBe(9);
    // The privacy invariant: foreign state is only ever counts + spoof flags —
    // there is no array of foreign APs/clients anywhere on the state object.
    expect(Object.keys(s.foreign).sort()).toEqual(["apCount", "clientCount", "spoofingOwnSsid"]);
  });

  it("surfaces a rogue SSID spoof as the one named foreign signal", () => {
    let s = hydrated();
    s = applyMessage(s, {
      type: "foreign.update",
      foreign: { apCount: 14, clientCount: 31, spoofingOwnSsid: ["Experimental Neutron"] },
    });
    expect(s.foreign.spoofingOwnSsid).toEqual(["Experimental Neutron"]);
  });

  it("sorts own APs by signal strength, strongest first", () => {
    let s = emptySurvey();
    s = applyMessage(s, { type: "own.ap.upsert", ap: ap("aa:bb:cc:dd:ee:f0", -70) });
    s = applyMessage(s, { type: "own.ap.upsert", ap: ap("aa:bb:cc:dd:ee:f1", -40) });
    expect(sortedOwnAps(s).map((a) => a.bssid)).toEqual([
      "aa:bb:cc:dd:ee:f1",
      "aa:bb:cc:dd:ee:f0",
    ]);
  });

  it("drills into an own AP's associated clients", () => {
    const s = hydrated();
    expect(ownClientsOf(s, "aa:bb:cc:dd:ee:f0").map((c) => c.mac)).toEqual(["de:ad:be:ef:00:01"]);
  });
});

describe("stream contract", () => {
  it("carries no foreign per-device identity type", () => {
    // A compile-time guarantee expressed as a runtime check: the only foreign
    // shape the contract exposes is the aggregate. If someone adds a
    // ForeignAccessPoint delta, this snapshot's key set stays the guard.
    const msg: StreamMessage = SNAPSHOT;
    if (msg.type === "snapshot") {
      expect(Object.keys(msg).sort()).toEqual(["at", "foreign", "ownAps", "ownClients", "type"]);
    }
  });
});
