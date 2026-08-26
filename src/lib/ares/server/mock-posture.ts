import "server-only";

import type { PostureItem } from "../types";

/**
 * Representative own-network posture for dev, so the board renders with no live
 * service — the console mirror of ares-service's fused /posture (survey facts +
 * findings). Weakest posture first.
 */
export const MOCK_POSTURE: PostureItem[] = [
  {
    bssid: "aa:bb:cc:dd:ee:f0",
    ssid: "Experimental Neutron",
    channel: 6,
    band: "2.4GHz",
    security: "wpa3",
    securityGrade: "good",
    passphraseStatus: "weak",
    rogueSpoof: true,
  },
  {
    bssid: "aa:bb:cc:dd:ee:f1",
    ssid: "Experimental Neutron",
    channel: 149,
    band: "5GHz",
    security: "wpa3",
    securityGrade: "good",
    passphraseStatus: "untested",
    rogueSpoof: true,
  },
];
