import {
  classifyLeadPropertyType,
  evaluateFsboPriceInsight,
  type FsboPriceInsight,
} from "@/lib/deals/match-fsbo";
import type { FsboLeadData } from "@/lib/types/fsbo-lead";

export function getFsboLeadPriceInsight(lead: FsboLeadData): FsboPriceInsight {
  const kind = classifyLeadPropertyType(lead);
  return evaluateFsboPriceInsight(lead, kind);
}

export function getFsboLeadBadge(insight: FsboPriceInsight) {
  if (insight.kind === "below") {
    return {
      label: "Kupon İlan",
      className:
        "border-emerald-500/25 bg-emerald-500/10 text-emerald-400/90",
    };
  }
  if (insight.kind === "at") {
    return {
      label: "Piyasa Fiyatı",
      className: "border-border bg-white/[0.03] text-foreground/45",
    };
  }
  return null;
}
