"use client";

import { useQuery } from "@tanstack/react-query";
import { Inbox, ShieldAlert } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState, ErrorState, PanelSkeleton } from "@/components/ares/states";
import { api, keys } from "@/lib/ares/client";
import type { Finding, Severity } from "@/lib/ares/types";
import { cn } from "@/lib/utils";

const RANK: Record<Severity, number> = { critical: 4, high: 3, medium: 2, low: 1, info: 0 };

const SEVERITY_VARIANT: Record<Severity, "down" | "warn" | "muted"> = {
  critical: "down",
  high: "down",
  medium: "warn",
  low: "muted",
  info: "muted",
};

/**
 * The severity-ranked findings board. Reads the same-origin BFF (mock or the live
 * service's /findings). Findings are sorted by severity, then newest-first — a
 * rogue AP or weak passphrase rises to the top. captureRef is shown as an Apollo
 * address chip, never fetched into the browser (it may reference raw RF data).
 */
export function FindingsBoard() {
  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: keys.findings,
    queryFn: api.findings,
    refetchInterval: 10_000,
  });

  if (isLoading) return <PanelSkeleton rows={4} />;
  if (isError) {
    return (
      <ErrorState
        title="Couldn't load findings"
        detail={error instanceof Error ? error.message : "The findings endpoint did not respond."}
        onRetry={() => void refetch()}
        retrying={isFetching}
      />
    );
  }

  const findings = [...(data ?? [])].sort(
    (a, b) => RANK[b.severity] - RANK[a.severity] || b.at.localeCompare(a.at)
  );

  if (findings.length === 0) {
    return (
      <EmptyState title="No findings yet" icon={<Inbox className="size-5" />}>
        Findings appear here as the service emits them — a rogue AP, a weak own passphrase, a
        completed active test. Nothing has been raised yet.
      </EmptyState>
    );
  }

  return (
    <div className="space-y-2">
      {findings.map((f) => (
        <FindingRow key={f.id} finding={f} />
      ))}
    </div>
  );
}

function FindingRow({ finding }: { finding: Finding }) {
  const severe = finding.severity === "high" || finding.severity === "critical";
  return (
    <Card className={cn(severe && "border-status-down/40")}>
      <CardContent className="flex items-start gap-3 py-3">
        <ShieldAlert
          className={cn("mt-0.5 size-4 shrink-0", severe ? "text-status-down" : "text-muted-foreground")}
          aria-hidden
        />
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={SEVERITY_VARIANT[finding.severity]}>{finding.severity.toUpperCase()}</Badge>
            <span className="font-mono text-xs text-muted-foreground">{finding.kind}</span>
            <span className="ml-auto text-[11px] tabular-nums text-muted-foreground/70">
              {new Date(finding.at).toLocaleString()}
            </span>
          </div>
          <p className="text-sm text-foreground">{finding.summary}</p>
          <div className="flex flex-wrap gap-3 text-[11px] text-muted-foreground">
            {finding.bssid ? <span className="font-mono">{finding.bssid}</span> : null}
            {finding.captureRef ? (
              <span className="font-mono" title="Apollo capture reference">
                capture: {finding.captureRef}
              </span>
            ) : null}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
