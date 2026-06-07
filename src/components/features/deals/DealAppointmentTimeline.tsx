"use client";

import {
  formatAppointmentTimelineLabel,
  getAppointmentsForDeal,
  isAppointmentPast,
} from "@/lib/calendar/deal-appointments";
import { cn } from "@/lib/utils";

type DealAppointmentTimelineProps = {
  dealId: string;
  className?: string;
};

export function DealAppointmentTimeline({
  dealId,
  className,
}: DealAppointmentTimelineProps) {
  const appointments = getAppointmentsForDeal(dealId);
  if (appointments.length === 0) return null;

  return (
    <section className={cn("rounded-2xl border border-border/50 bg-parsel-panel p-4", className)}>
      <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-foreground0">
        Yaklaşan Randevular
      </p>

      <ul className="space-y-3">
        {appointments.map((item) => {
          const past = isAppointmentPast(item);
          return (
            <li
              key={item.id}
              className="relative ml-2 border-l border-border pl-3"
            >
              <span
                className={cn(
                  "absolute -left-[3px] top-1.5 h-1.5 w-1.5 rounded-full",
                  past ? "bg-white/20" : "bg-amber-400/70",
                )}
              />
              <p
                className={cn(
                  "text-xs leading-snug",
                  past ? "text-muted-foreground" : "text-white/65",
                )}
              >
                {formatAppointmentTimelineLabel(item)}
              </p>
              <p className="mt-0.5 truncate text-[10px] text-muted-foreground">
                {item.propertyTitle}
              </p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
