"use client";

import { CalendarClock } from "lucide-react";

import {
  formatAppointmentWhisper,
  getUpcomingAppointmentForDeal,
  isAppointmentToday,
} from "@/lib/calendar/deal-appointments";
import { cn } from "@/lib/utils";

type DealAppointmentWhisperProps = {
  dealId: string;
  className?: string;
};

export function DealAppointmentWhisper({
  dealId,
  className,
}: DealAppointmentWhisperProps) {
  const upcoming = getUpcomingAppointmentForDeal(dealId);
  if (!upcoming) return null;

  const isToday = isAppointmentToday(upcoming);

  return (
    <p
      className={cn(
        "mt-2 flex w-full min-w-0 items-center gap-1.5 text-[11px] font-medium tracking-wide",
        isToday ? "text-red-400/90" : "text-amber-400/90",
        className,
      )}
    >
      <CalendarClock
        className={cn(
          "h-3 w-3 shrink-0",
          isToday ? "text-red-400/80" : "text-amber-400/80",
        )}
        strokeWidth={1.75}
      />
      <span className="min-w-0 flex-1 truncate leading-snug">
        {formatAppointmentWhisper(upcoming)}
      </span>
    </p>
  );
}
