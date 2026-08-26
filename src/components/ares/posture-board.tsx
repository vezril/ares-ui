"use client";

import { useQuery } from "@tanstack/react-query";
import { ShieldCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState, ErrorState, PanelSkeleton } from "@/components/ares/states";
import { api, keys } from "@/lib/ares/client";
import type { PassphraseStatus, PostureItem, SecurityGrade } from "@/lib/ares/types";
import { cn } from "@/lib/utils";

const GRADE_VARIANT: Record<SecurityGrade, "up" | "warn" | "down"> = {
  good: "up",
  fair: "warn",
  weak: "down",
};

const PASS_VARIANT: Record<PassphraseStatus, "up" | "warn" | "down" | "muted"> = {
  held: "up",
  untested: "muted",
  weak: "down",
};

const PASS_LABEL: Record<PassphraseStatus, string> = {
  held: "held audit",
  untested: "not audited",
  weak: "weak — change it",
};

/**
 * The own-network posture board — one card per own AP, worst posture first.
 * Reads the same-origin BFF (mock or the live service /posture). Every status is
 * text-labelled, never colour-only (ux-standards §5).
 */
export function PostureBoard() {
  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: keys.posture,
    queryFn: api.posture,
    refetchInterval: 15_000,
  });

  if (isLoading) return <PanelSkeleton rows={2} />;
  if (isError) {
    return (
      <ErrorState
        title="Couldn't load posture"
        detail={error instanceof Error ? error.message : "The posture endpoint did not respond."}
        onRetry={() => void refetch()}
        retrying={isFetching}
      />
    );
  }
  const items = data ?? [];
  if (items.length === 0) {
    return (
      <EmptyState title="No own APs to assess" icon={<ShieldCheck className="size-5" />}>
        Posture is built from your own APs on the survey plus their audit findings. Pin your
        own_bssids and run a survey, and each AP&apos;s assessment appears here.
      </EmptyState>
    );
  }
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {items.map((p) => (
        <PostureCard key={p.bssid} item={p} />
      ))}
    </div>
  );
}

function PostureCard({ item }: { item: PostureItem }) {
  const attention = item.passphraseStatus === "weak" || item.rogueSpoof;
  return (
    <Card className={cn(attention && "border-status-down/40")}>
      <CardContent className="space-y-3 py-3">
        <div className="flex items-baseline justify-between gap-2">
          <span className="truncate text-sm font-medium">
            {item.ssid ?? <span className="text-muted-foreground italic">&lt;hidden&gt;</span>}
          </span>
          <span className="shrink-0 font-mono text-[11px] text-muted-foreground">{item.bssid}</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <Badge variant={GRADE_VARIANT[item.securityGrade]}>
            {item.security.toUpperCase()} · {item.securityGrade}
          </Badge>
          <Badge variant={PASS_VARIANT[item.passphraseStatus]}>
            passphrase: {PASS_LABEL[item.passphraseStatus]}
          </Badge>
          {item.rogueSpoof ? <Badge variant="down">rogue spoof detected</Badge> : null}
        </div>
        <div className="text-[11px] text-muted-foreground">
          ch {item.channel ?? "—"} · {item.band ?? "—"}
        </div>
      </CardContent>
    </Card>
  );
}
