"use client";

import { Radar, ShieldAlert, Users, Wifi, WifiOff } from "lucide-react";
import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ares/states";
import { BASE } from "@/lib/ares/client";
import {
  applyMessage,
  emptySurvey,
  ownClientsOf,
  sortedOwnAps,
  type SurveyState,
} from "@/lib/ares/survey";
import type { StreamMessage } from "@/lib/ares/types";
import { cn } from "@/lib/utils";

type ConnState = "connecting" | "live" | "error";

/**
 * The live survey cockpit. Adapted from the shodan recon-table, but privacy-
 * shaped for Ares: own APs get a full detail table + client drill-in; foreign RF
 * is a single aggregate card (counts, never a browsable list); a foreign AP
 * broadcasting an own SSID raises a rogue banner. The wire contract carries no
 * foreign identities, so there is nothing here that could become a neighbour
 * surveillance board.
 */
export function SurveyConsole() {
  const [survey, setSurvey] = useState<SurveyState>(emptySurvey);
  const [selected, setSelected] = useState<string | null>(null);
  const [conn, setConn] = useState<ConnState>("connecting");

  useEffect(() => {
    const source = new EventSource(`${BASE}/stream`);
    source.onopen = () => setConn("live");
    source.onerror = () => setConn("error");
    source.onmessage = (event) => {
      const msg = JSON.parse(event.data) as StreamMessage;
      setSurvey((prev) => applyMessage(prev, msg));
    };
    return () => source.close();
  }, []);

  const aps = sortedOwnAps(survey);
  const selectedAp = selected ? survey.ownAps.get(selected) : undefined;
  const foreign = survey.foreign;

  return (
    <div className="space-y-4">
      <ConnBar conn={conn} apCount={aps.length} />

      {foreign.spoofingOwnSsid.length > 0 ? (
        <RogueBanner ssids={foreign.spoofingOwnSsid} />
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Own access points</CardTitle>
          <CardDescription>
            Your network only — detail is kept for BSSIDs on the own-scope allowlist. Select a
            row to drill into its associated clients.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {aps.length === 0 ? (
            <EmptyState title="No own APs yet" icon={<Radar className="size-5" />}>
              {conn === "error"
                ? "The survey stream dropped. Own APs appear here once it reconnects."
                : "Waiting for the survey sweep. Own APs matching your scope will appear here."}
            </EmptyState>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs text-muted-foreground">
                    <th className="py-2 pr-3 font-medium">SSID</th>
                    <th className="py-2 pr-3 font-medium">BSSID</th>
                    <th className="py-2 pr-3 font-medium">Ch</th>
                    <th className="py-2 pr-3 font-medium">Band</th>
                    <th className="py-2 pr-3 font-medium">Security</th>
                    <th className="py-2 pr-3 text-right font-medium">Signal</th>
                    <th className="py-2 pr-3 text-right font-medium">Clients</th>
                  </tr>
                </thead>
                <tbody>
                  {aps.map((ap) => {
                    const isSel = ap.bssid === selected;
                    return (
                      <tr
                        key={ap.bssid}
                        onClick={() => setSelected(isSel ? null : ap.bssid)}
                        className={cn(
                          "cursor-pointer border-b border-border/50 transition-colors hover:bg-accent/40",
                          isSel && "bg-accent/60"
                        )}
                      >
                        <td className="py-2 pr-3">
                          {ap.ssid ?? <span className="text-muted-foreground italic">&lt;hidden&gt;</span>}
                        </td>
                        <td className="py-2 pr-3 font-mono text-xs">{ap.bssid}</td>
                        <td className="py-2 pr-3">{ap.channel ?? "—"}</td>
                        <td className="py-2 pr-3">{ap.band ?? "—"}</td>
                        <td className="py-2 pr-3">
                          <SecurityBadge security={ap.security} />
                        </td>
                        <td className="py-2 pr-3 text-right tabular-nums">
                          {ap.signalDbm ?? "—"} dBm
                        </td>
                        <td className="py-2 pr-3 text-right tabular-nums">{ap.clientCount}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedAp ? (
        <ClientPanel
          bssid={selectedAp.bssid}
          label={selectedAp.ssid ?? "<hidden>"}
          clients={ownClientsOf(survey, selectedAp.bssid)}
        />
      ) : null}

      <ForeignAggregateCard apCount={foreign.apCount} clientCount={foreign.clientCount} />
    </div>
  );
}

function ConnBar({ conn, apCount }: { conn: ConnState; apCount: number }) {
  const map = {
    connecting: { icon: Wifi, text: "Connecting…", cls: "text-status-warn" },
    live: { icon: Wifi, text: "Live", cls: "text-status-up" },
    error: { icon: WifiOff, text: "Stream lost", cls: "text-status-down" },
  } as const;
  const { icon: Icon, text, cls } = map[conn];
  return (
    <div className="flex items-center gap-2 text-sm" role="status">
      <Icon className={cn("size-4", cls)} aria-hidden />
      <span className={cls}>{text}</span>
      <span className="text-muted-foreground">
        — {apCount} own AP{apCount === 1 ? "" : "s"}
      </span>
    </div>
  );
}

function RogueBanner({ ssids }: { ssids: string[] }) {
  return (
    <Card className="border-status-down/50 glow-down">
      <CardContent className="flex items-start gap-3">
        <ShieldAlert className="mt-0.5 size-5 shrink-0 text-status-down" aria-hidden />
        <div className="space-y-1">
          <p className="text-sm font-semibold text-foreground">
            Rogue AP — a foreign radio is broadcasting your SSID
          </p>
          <p className="text-xs leading-relaxed text-muted-foreground">
            {ssids.map((s) => `“${s}”`).join(", ")} is being advertised by a BSSID that is not on
            your own-scope allowlist. This is the one foreign signal Ares surfaces, because it is an
            attack on your network — possible evil-twin or spoof.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function ForeignAggregateCard({ apCount, clientCount }: { apCount: number; clientCount: number }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Foreign RF (aggregate)</CardTitle>
        <CardDescription>
          Everything not on your scope — counts only. Third-party APs and devices are never tracked
          individually; there is no per-device list here by design.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex gap-8">
        <Stat icon={<Radar className="size-4" />} label="Foreign APs" value={apCount} />
        <Stat icon={<Users className="size-4" />} label="Foreign clients" value={clientCount} />
      </CardContent>
    </Card>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        {icon}
        {label}
      </div>
      <div className="text-2xl font-semibold tabular-nums">{value}</div>
    </div>
  );
}

function ClientPanel({
  bssid,
  label,
  clients,
}: {
  bssid: string;
  label: string;
  clients: ReturnType<typeof ownClientsOf>;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Clients of {label}</CardTitle>
        <CardDescription className="font-mono">
          {bssid} — {clients.length} own client{clients.length === 1 ? "" : "s"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {clients.length === 0 ? (
          <p className="text-sm text-muted-foreground">No associated own clients.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted-foreground">
                <th className="py-2 pr-3 font-medium">Client MAC</th>
                <th className="py-2 pr-3 text-right font-medium">Signal</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((c) => (
                <tr key={c.mac} className="border-b border-border/50">
                  <td className="py-2 pr-3 font-mono text-xs">{c.mac}</td>
                  <td className="py-2 pr-3 text-right tabular-nums">{c.signalDbm ?? "—"} dBm</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </CardContent>
    </Card>
  );
}

function SecurityBadge({ security }: { security: string }) {
  const open = security === "open";
  const weak = security === "wep" || security === "wpa";
  return (
    <Badge variant={open ? "down" : weak ? "warn" : "muted"}>{security.toUpperCase()}</Badge>
  );
}
