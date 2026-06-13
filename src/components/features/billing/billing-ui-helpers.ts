import type { TenantStatus } from "@/lib/account/types";
import { STATUS_LABELS } from "@/lib/account/labels";

export const METRIC_CARD =
  "parsel-surface flex min-h-[88px] flex-col justify-between rounded-2xl border border-border/60 bg-parsel-panel p-4 shadow-parsel-sm";

export function getSubscriptionStatusBadge(status: TenantStatus) {
  switch (status) {
    case "ACTIVE":
      return {
        label: STATUS_LABELS.ACTIVE,
        className: "border-primary/25 bg-primary/10 text-primary",
      };
    case "TRIAL":
      return {
        label: STATUS_LABELS.TRIAL,
        className: "border-parsel-gold/30 bg-parsel-gold/10 text-parsel-gold",
      };
    case "PAST_DUE":
      return {
        label: STATUS_LABELS.PAST_DUE,
        className: "border-destructive/30 bg-destructive/10 text-destructive",
      };
    case "PENDING":
      return {
        label: STATUS_LABELS.PENDING,
        className: "border-border/60 bg-parsel-elevated text-muted-foreground",
      };
    case "CANCELLED":
      return {
        label: STATUS_LABELS.CANCELLED,
        className: "border-border/60 bg-parsel-sunken text-muted-foreground",
      };
    default:
      return {
        label: STATUS_LABELS[status],
        className: "border-border/60 bg-parsel-elevated text-muted-foreground",
      };
  }
}
