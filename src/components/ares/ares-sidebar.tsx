"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Radar, ShieldCheck, TriangleAlert } from "lucide-react";

import { HealthPill } from "./health-pill";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/", label: "Survey", icon: Radar },
  { href: "/posture", label: "Posture", icon: ShieldCheck },
  { href: "/findings", label: "Findings", icon: TriangleAlert },
];

/**
 * Persistent left sidebar — the constellation console chrome (ux-standards §5):
 * the Ares god-mark top-left, a vertical nav, and the live health pill pinned to
 * the bottom. Collapses to an icon-only rail below `sm`. No top-nav layouts.
 */
export function AresSidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 z-20 flex h-dvh w-16 shrink-0 flex-col border-r border-sidebar-border bg-sidebar/60 backdrop-blur sm:w-60">
      {/* Brand — god-mark top-left (the mark is the only logo; no wordmark). */}
      <Link href="/" className="flex items-center gap-3 px-3 py-4 sm:px-4" aria-label="Ares — home">
        {/*
          ares.png is keyed onto the theme ground (#06060F ≈ --background) and is
          NOT transparent. Framing it on bg-background makes the keyed ground
          vanish; on the card-colored sidebar it would show as a black tile.
          Never composite this mark on a surface color.
        */}
        <span className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-md bg-background">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/ares.png" alt="Ares" width={36} height={36} className="size-full" />
        </span>
        <span className="hidden text-lg font-semibold tracking-tight sm:inline">Ares</span>
      </Link>

      <nav className="flex-1 space-y-1 px-2 sm:px-3" aria-label="Ares views">
        {TABS.map((tab) => {
          const active = pathname === tab.href;
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              title={tab.label}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center justify-center gap-3 rounded-md px-2.5 py-2 text-sm font-medium transition-colors sm:justify-start sm:px-3",
                active
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
              )}
            >
              {/* The active tab is marked by the accent on the ICON only — a
                  restrained signature, not a crimson-filled row. */}
              <Icon className={cn("size-4 shrink-0", active && "text-primary")} />
              <span className="hidden sm:inline">{tab.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Health, pinned to the bottom */}
      <div className="border-t border-sidebar-border p-3">
        <HealthPill />
      </div>
    </aside>
  );
}
