import { Suspense } from "react";

import { CalendarView } from "@/components/features/calendar/CalendarView";

export default function CalendarPage() {
  return (
    <Suspense fallback={null}>
      <CalendarView />
    </Suspense>
  );
}
