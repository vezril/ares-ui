import "server-only";

import type { Finding } from "../types";

/**
 * A representative severity-ranked findings set for dev, so the Findings board
 * renders with no live service — the console mirror of ares-service's seed set.
 * Newest first. Never carries a secret; captureRef is an Apollo address only.
 */
export const MOCK_FINDINGS: Finding[] = [
  {
    id: "f-001",
    at: "2026-08-26T09:00:40Z",
    kind: "rogue_ap",
    severity: "high",
    summary: "Foreign AP broadcasting own SSID 'Experimental Neutron'",
    bssid: "de:ad:de:ad:de:ad",
  },
  {
    id: "f-002",
    at: "2026-08-26T09:00:25Z",
    kind: "passphrase_weak",
    severity: "high",
    summary: "Own AP aa:bb:cc:dd:ee:f0 passphrase cracked with rockyou.txt",
    bssid: "aa:bb:cc:dd:ee:f0",
    captureRef: "sha256:9f2c…",
  },
  {
    id: "f-003",
    at: "2026-08-26T09:00:12Z",
    kind: "deauth_test_completed",
    severity: "medium",
    summary: "Deauth resilience test against own AP aa:bb:cc:dd:ee:f0",
    bssid: "aa:bb:cc:dd:ee:f0",
  },
  {
    id: "f-004",
    at: "2026-08-26T09:00:00Z",
    kind: "survey_completed",
    severity: "info",
    summary: "Survey: 2 own AP(s), 14 foreign",
  },
];
