import type { ReactNode } from "react";

/** Consistent view heading: what this screen is, and what it is read from. */
export function PageHeader({
  title,
  children,
  aside,
}: {
  title: string;
  children: ReactNode;
  aside?: ReactNode;
}) {
  return (
    <header className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
      <div className="space-y-1">
        <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
        <p className="max-w-prose text-sm leading-relaxed text-muted-foreground">{children}</p>
      </div>
      {aside ? <div className="shrink-0">{aside}</div> : null}
    </header>
  );
}
