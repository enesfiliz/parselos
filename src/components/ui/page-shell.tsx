import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type PageShellProps = {
  children: ReactNode;
  className?: string;
  /** Default max width matches dashboard shell inner container */
  maxWidth?: "default" | "wide" | "full";
};

export function PageShell({
  children,
  className,
  maxWidth = "default",
}: PageShellProps) {
  return (
    <div
      className={cn(
        "min-h-full w-full",
        maxWidth === "default" && "max-w-6xl",
        maxWidth === "wide" && "max-w-[1600px]",
        maxWidth === "full" && "max-w-none",
        className,
      )}
    >
      {children}
    </div>
  );
}

type PageHeaderProps = {
  eyebrow?: string;
  eyebrowIcon?: LucideIcon;
  title: string;
  titleAddon?: ReactNode;
  description?: string;
  actions?: ReactNode;
  className?: string;
};

export function PageHeader({
  eyebrow,
  eyebrowIcon: EyebrowIcon,
  title,
  titleAddon,
  description,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <header
      className={cn(
        "parsel-page-hero flex flex-col gap-5 p-5 sm:p-6 lg:flex-row lg:items-end lg:justify-between",
        className,
      )}
    >
      <div className="min-w-0">
        {eyebrow ? (
          <div className="mb-2 flex items-center gap-2 text-primary">
            {EyebrowIcon ? (
              <EyebrowIcon className="h-4 w-4 shrink-0" strokeWidth={1.75} />
            ) : null}
            <span className="parsel-section-label text-primary">{eyebrow}</span>
          </div>
        ) : null}
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="parsel-page-title text-foreground">{title}</h1>
          {titleAddon}
        </div>
        {description ? (
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex w-full shrink-0 flex-wrap items-center gap-2 lg:w-auto lg:justify-end">
          {actions}
        </div>
      ) : null}
    </header>
  );
}

type SectionHeaderProps = {
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
};

export function SectionHeader({
  title,
  description,
  actions,
  className,
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between",
        className,
      )}
    >
      <div className="min-w-0">
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
        {description ? (
          <p className="mt-1 text-xs text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
    </div>
  );
}

type EmptyStateProps = {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
};

export function EmptyState({
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "parsel-surface rounded-2xl border border-dashed border-border/60 bg-parsel-panel px-6 py-16 text-center shadow-parsel-sm",
        className,
      )}
    >
      <p className="text-sm font-medium text-foreground/80">{title}</p>
      {description ? (
        <p className="mx-auto mt-2 max-w-md text-xs leading-relaxed text-muted-foreground">
          {description}
        </p>
      ) : null}
      {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
    </div>
  );
}
