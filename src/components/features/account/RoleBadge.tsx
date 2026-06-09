import {
  AGENT_ROLE_BADGE_CLASS,
  AGENT_ROLE_LABELS,
  AGENT_ROLE_SHORT,
  LICENSE_STATUS_BADGE_CLASS,
  LICENSE_STATUS_LABELS,
  PLAN_BADGE_CLASS,
  PLAN_LABELS,
} from "@/lib/account/labels";
import { cn } from "@/lib/utils";
import type { AgentRoleType, LicenseVerificationStatus, TenantPlanType } from "@prisma/client";

export function RoleBadge({
  role,
  compact = false,
  className,
}: {
  role: AgentRoleType;
  compact?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold tracking-wide",
        AGENT_ROLE_BADGE_CLASS[role],
        className,
      )}
    >
      {compact ? AGENT_ROLE_SHORT[role] : AGENT_ROLE_LABELS[role]}
    </span>
  );
}

export function LicenseBadge({
  status,
  className,
}: {
  status: LicenseVerificationStatus;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold",
        LICENSE_STATUS_BADGE_CLASS[status],
        className,
      )}
    >
      {LICENSE_STATUS_LABELS[status]}
    </span>
  );
}

export function PlanBadge({
  plan,
  className,
}: {
  plan: TenantPlanType;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold",
        PLAN_BADGE_CLASS[plan],
        className,
      )}
    >
      {PLAN_LABELS[plan]} Plan
    </span>
  );
}
