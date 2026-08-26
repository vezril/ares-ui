/**
 * The survey reducer — applies a stream message to the console's survey state.
 *
 * Pure and framework-free so it is unit-tested without React. It is the client
 * mirror of ares-service's `build_survey`: own APs/clients are held in keyed
 * maps (detail retained), and foreign is a single aggregate that is only ever
 * *replaced*, never accumulated into a list. There is deliberately no path here
 * that turns foreign RF into per-device rows.
 */

import type {
  ForeignAggregate,
  OwnAccessPoint,
  OwnClient,
  StreamMessage,
} from "./types";
import { isSnapshot } from "./types";

export interface SurveyState {
  ownAps: Map<string, OwnAccessPoint>;
  ownClients: Map<string, OwnClient>;
  foreign: ForeignAggregate;
}

export const EMPTY_FOREIGN: ForeignAggregate = {
  apCount: 0,
  clientCount: 0,
  spoofingOwnSsid: [],
};

export function emptySurvey(): SurveyState {
  return { ownAps: new Map(), ownClients: new Map(), foreign: { ...EMPTY_FOREIGN } };
}

/** Apply one stream message, returning a new state (immutable update). */
export function applyMessage(state: SurveyState, msg: StreamMessage): SurveyState {
  if (isSnapshot(msg)) {
    return {
      ownAps: new Map(msg.ownAps.map((ap) => [ap.bssid, ap])),
      ownClients: new Map(msg.ownClients.map((c) => [c.mac, c])),
      foreign: msg.foreign,
    };
  }
  switch (msg.type) {
    case "own.ap.upsert": {
      const ownAps = new Map(state.ownAps).set(msg.ap.bssid, msg.ap);
      return { ...state, ownAps };
    }
    case "own.ap.remove": {
      const ownAps = new Map(state.ownAps);
      ownAps.delete(msg.bssid);
      return { ...state, ownAps };
    }
    case "own.client.upsert": {
      const ownClients = new Map(state.ownClients).set(msg.client.mac, msg.client);
      return { ...state, ownClients };
    }
    case "own.client.remove": {
      const ownClients = new Map(state.ownClients);
      ownClients.delete(msg.mac);
      return { ...state, ownClients };
    }
    case "foreign.update":
      // Foreign is replaced wholesale — counts in, never identities accumulated.
      return { ...state, foreign: msg.foreign };
  }
}

/** Own APs, strongest signal first (nulls last) — the table's display order. */
export function sortedOwnAps(state: SurveyState): OwnAccessPoint[] {
  return [...state.ownAps.values()].sort(
    (a, b) => (b.signalDbm ?? -Infinity) - (a.signalDbm ?? -Infinity)
  );
}

/** Own clients associated with a given own BSSID, strongest signal first. */
export function ownClientsOf(state: SurveyState, bssid: string): OwnClient[] {
  return [...state.ownClients.values()]
    .filter((c) => c.bssid === bssid)
    .sort((a, b) => (b.signalDbm ?? -Infinity) - (a.signalDbm ?? -Infinity));
}
