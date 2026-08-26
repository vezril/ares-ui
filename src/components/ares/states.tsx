"use client";

import { AlertTriangle, Inbox, RotateCw } from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/**
 * The three designed non-data states every view uses (ux-standards §5):
 * skeletons for first paint (never a layout-shifting spinner), an error state
 * that says what failed and keeps retry visible, and an empty state that says
 * what is empty and why — including the honest case where no data source for a
 * thing exists at all.
 */

/** First-paint skeleton: reserves the panel's real height so nothing jumps. */
export function PanelSkeleton({ rows = 3, className }: { rows?: number; className?: string }) {
  return (
    <div className={cn("space-y-2", className)} aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading…</span>
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-9 w-full" />
      ))}
    </div>
  );
}

/**
 * A grid of stat-tile skeletons, sized to match the real tiles. `columns` must
 * track the grid the page actually renders, or the layout jumps when the data
 * arrives. Class names are written out because Tailwind cannot see interpolated
 * ones.
 */
export function StatSkeletonGrid({ count = 4, columns = 4 }: { count?: number; columns?: 4 | 5 }) {
  return (
    <div
      className={cn(
        "grid gap-3 sm:grid-cols-2",
        columns === 5 ? "lg:grid-cols-3 xl:grid-cols-5" : "lg:grid-cols-4"
      )}
      aria-busy="true"
    >
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className="h-[5.5rem] w-full" />
      ))}
    </div>
  );
}

/**
 * Something failed. Says what, where it was reaching, and keeps the retry
 * affordance visible — an error the operator can act on, not a dead panel.
 */
export function ErrorState({
  title,
  detail,
  endpoint,
  onRetry,
  retrying = false,
}: {
  title: string;
  detail: string;
  endpoint?: string;
  onRetry?: () => void;
  retrying?: boolean;
}) {
  return (
    <Card className="border-status-down/40">
      <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex gap-3">
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-status-down" aria-hidden />
          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground">{title}</p>
            <p className="text-xs leading-relaxed text-muted-foreground">{detail}</p>
            {endpoint ? (
              <p className="font-mono text-[11px] text-muted-foreground/70">{endpoint}</p>
            ) : null}
          </div>
        </div>
        {onRetry ? (
          <Button variant="outline" size="sm" onClick={onRetry} disabled={retrying}>
            <RotateCw className={cn("size-4", retrying && "animate-spin")} aria-hidden />
            {retrying ? "Retrying…" : "Retry"}
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}

/**
 * Nothing to show — and an explanation of why. Used both for "the survey is
 * quiet" and for the harder, more honest case: a view whose data source is a
 * later slice of Ares that does not exist yet. Never a blank panel, and never
 * invented numbers.
 */
export function EmptyState({
  title,
  children,
  icon,
}: {
  title: string;
  children: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-border px-6 py-8 text-center">
      <span className="text-muted-foreground" aria-hidden>
        {icon ?? <Inbox className="size-5" />}
      </span>
      <p className="text-sm font-medium text-foreground">{title}</p>
      <p className="max-w-prose text-xs leading-relaxed text-muted-foreground">{children}</p>
    </div>
  );
}

/**
 * A visible "refreshing" marker for background refetches. Async state is stated,
 * never silent (a long-standing convention in these consoles) — but it sits
 * beside the data rather than replacing it, so a poll never blanks the screen.
 */
export function SyncBadge({ active, label = "Refreshing…" }: { active: boolean; label?: string }) {
  if (!active) return null;
  return (
    <span
      className="inline-flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground"
      role="status"
    >
      <RotateCw className="size-3 animate-spin" aria-hidden />
      {label}
    </span>
  );
}
