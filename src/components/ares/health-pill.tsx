"use client";

import { useQuery } from "@tanstack/react-query";

import { api, keys } from "@/lib/ares/client";
import { cn } from "@/lib/utils";

/**
 * Live Ares service health indicator, pinned to the sidebar bottom. Polled and
 * always TEXT-labelled ("Live" / "Down" / "Checking…") — status is never
 * color-only (ux-standards §5). The label hides on the narrow icon rail, where
 * the dot plus its tooltip carry the meaning.
 *
 * ares-service is a CLI today with no /health, so this reads "Down" honestly
 * until the service grows an HTTP surface — the survey console still runs off the
 * mock stream regardless.
 */
export function HealthPill() {
  const { data, isError, isLoading } = useQuery({
    queryKey: keys.health,
    queryFn: api.health,
    refetchInterval: 15_000,
  });

  const up = data?.state === "up" && !isError;
  const label = isLoading ? "Checking…" : up ? "Live" : "Down";
  const dot = isLoading
    ? "bg-status-unknown animate-pulse"
    : up
      ? "bg-status-up"
      : "bg-status-down";

  const title = isLoading
    ? "Checking Ares health…"
    : data?.health
      ? `${data.health.service} ${data.health.status}${data.health.version ? ` · v${data.health.version}` : ""}`
      : `Unreachable at ${data?.endpoint ?? "the configured endpoint"}${data?.error ? ` — ${data.error}` : ""}`;

  return (
    <span
      className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-card px-2.5 py-1 text-xs font-medium text-muted-foreground sm:justify-start sm:px-3"
      title={title}
    >
      <span className={cn("size-2 shrink-0 rounded-full", dot)} />
      <span className="hidden items-baseline gap-1.5 sm:inline-flex">
        {label}
        {up && data?.health?.version ? (
          <span className="text-muted-foreground/70">v{data.health.version}</span>
        ) : null}
      </span>
    </span>
  );
}
