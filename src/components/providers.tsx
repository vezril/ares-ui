"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";

import { TooltipProvider } from "@/components/ui/tooltip";

/**
 * Client-side providers: TanStack Query (which drives the polled reads — health,
 * scope) and the Radix tooltip provider used by the console chrome. The live
 * survey is a raw EventSource, not a query. One client component, so the root
 * layout stays a server component.
 *
 * `retry: 1` keeps a transient in-cluster blip from immediately painting an
 * error state, while still failing fast enough that a real outage is visible.
 */
export function Providers({ children }: { children: ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { retry: 1, staleTime: 5_000, refetchOnWindowFocus: false },
        },
      })
  );
  return (
    <QueryClientProvider client={client}>
      <TooltipProvider delayDuration={200}>{children}</TooltipProvider>
    </QueryClientProvider>
  );
}
