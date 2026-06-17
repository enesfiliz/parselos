"use client";

import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Plus,
} from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent } from "react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { isDemoDataEnabledClient } from "@/lib/demo-mode";
import { MOCK_CLIENTS } from "@/lib/data/mock-clients";
import {
  APPOINTMENT_TYPE_META,
  MOCK_PORTFOLIO_OPTIONS,
  type AppointmentType,
  type CalendarAppointment,
  buildAppointmentReminderUrl,
  buildCalendarGrid,
  countWeekAppointments,
  createMockAppointments,
  formatMonthYear,
  formatSelectedDayLabel,
  parseDateKey,
  toDateKey,
} from "@/lib/calendar/appointments";
import { cn } from "@/lib/utils";

const FIELD_LABEL = "mb-1.5 block text-xs font-medium text-muted-foreground";
const FIELD_INPUT =
  "w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground transition-all focus:border-[#b38c56] focus:outline-none focus:ring-1 focus:ring-[#b38c56]";

function dotColorForTypes(types: AppointmentType[]) {
  if (types.includes("deed")) return "bg-emerald-400";
  if (types.includes("showing")) return "bg-parsel-gold";
  if (types.includes("meeting")) return "bg-sky-400";
  return "bg-white/30";
}

function EventCard({ event }: { event: CalendarAppointment }) {
  const meta = APPOINTMENT_TYPE_META[event.type];

  return (
    <article className="group flex flex-col gap-3 rounded-xl border border-border/50 bg-parsel-panel p-3 transition-all hover:border-border hover:shadow-lg md:flex-row md:items-center md:justify-between md:p-4">
      <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
        <div className="flex shrink-0 items-center gap-3">
          <span className="text-xl font-bold tabular-nums tracking-tight text-foreground/90 md:text-2xl">
            {event.time}
          </span>
          <span className="hidden h-10 w-px bg-foreground/10 sm:block" />
          <span
            className={cn(
              "rounded-md px-2 py-1 text-[11px] font-medium md:text-[10px]",
              meta.badgeClass,
            )}
          >
            {meta.label}
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-foreground/90">
            {event.clientName}
          </p>
          <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-muted-foreground">
            <MapPin className="h-3 w-3 shrink-0" strokeWidth={1.75} />
            {event.propertyTitle}
          </p>
        </div>
      </div>

      <a
        href={buildAppointmentReminderUrl(event)}
        target="_blank"
        rel="noopener noreferrer"
        title="Müşteriye Hatırlat"
        className="flex h-9 w-full shrink-0 items-center justify-center gap-2 rounded-lg border border-border text-xs text-emerald-400/80 transition-colors hover:bg-foreground/5 md:ml-3 md:w-9 md:opacity-0 md:group-hover:opacity-100"
      >
        <span className="md:hidden">Hatırlat</span>
        <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden>
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
          <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.126 1.528 5.867L0 24l6.335-1.662A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.006-1.378l-.358-.214-3.757.986 1.004-3.66-.233-.375A9.818 9.818 0 1112 21.818z" />
        </svg>
      </a>
    </article>
  );
}

function NewAppointmentModal({
  open,
  onOpenChange,
  defaultDate,
  onCreate,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultDate: string;
  onCreate: (appointment: CalendarAppointment) => void;
}) {
  const [clientId, setClientId] = useState(MOCK_CLIENTS[0]?.id ?? "");
  const [propertyId, setPropertyId] = useState(MOCK_PORTFOLIO_OPTIONS[0]?.id ?? "");
  const [date, setDate] = useState(defaultDate);
  const [time, setTime] = useState("14:00");
  const [type, setType] = useState<AppointmentType>("showing");

  useEffect(() => {
    if (open) queueMicrotask(() => setDate(defaultDate));
  }, [open, defaultDate]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const client = MOCK_CLIENTS.find((item) => item.id === clientId);
    const property = MOCK_PORTFOLIO_OPTIONS.find((item) => item.id === propertyId);
    if (!client || !property) return;

    onCreate({
      id: `apt-${Date.now()}`,
      date,
      time,
      type,
      clientName: client.adSoyad,
      clientPhone: client.telefon?.replace(/\D/g, "") ?? "",
      propertyTitle: property.title,
    });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-border bg-parsel-panel text-foreground sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-foreground/90">Yeni Randevu</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="apt-client" className={FIELD_LABEL}>
              Müşteri
            </label>
            <select
              id="apt-client"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              className={FIELD_INPUT}
            >
              {MOCK_CLIENTS.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.adSoyad}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="apt-property" className={FIELD_LABEL}>
              İlgili Fırsat / Portföy
            </label>
            <select
              id="apt-property"
              value={propertyId}
              onChange={(e) => setPropertyId(e.target.value)}
              className={FIELD_INPUT}
            >
              {MOCK_PORTFOLIO_OPTIONS.map((property) => (
                <option key={property.id} value={property.id}>
                  {property.title}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="apt-date" className={FIELD_LABEL}>
                Tarih
              </label>
              <input
                id="apt-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={FIELD_INPUT}
                required
              />
            </div>
            <div>
              <label htmlFor="apt-time" className={FIELD_LABEL}>
                Saat
              </label>
              <input
                id="apt-time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className={FIELD_INPUT}
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="apt-type" className={FIELD_LABEL}>
              Randevu Türü
            </label>
            <select
              id="apt-type"
              value={type}
              onChange={(e) => setType(e.target.value as AppointmentType)}
              className={FIELD_INPUT}
            >
              <option value="showing">Yer Gösterme</option>
              <option value="deed">Tapu İşlemi</option>
              <option value="meeting">Müşteri Toplantısı</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-parsel-gold px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-[#9a784a]"
          >
            Randevuyu Kaydet
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function CalendarView() {
  const today = useMemo(() => new Date(), []);
  const todayKey = toDateKey(today);

  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState(todayKey);
  const [appointments, setAppointments] = useState<CalendarAppointment[]>(() =>
    isDemoDataEnabledClient() ? createMockAppointments() : [],
  );
  const [modalOpen, setModalOpen] = useState(false);

  const grid = useMemo(
    () => buildCalendarGrid(viewYear, viewMonth),
    [viewYear, viewMonth],
  );

  const appointmentsByDate = useMemo(() => {
    const map = new Map<string, CalendarAppointment[]>();
    for (const item of appointments) {
      const bucket = map.get(item.date) ?? [];
      bucket.push(item);
      map.set(item.date, bucket);
    }
    for (const bucket of map.values()) {
      bucket.sort((a, b) => a.time.localeCompare(b.time));
    }
    return map;
  }, [appointments]);

  const selectedEvents = appointmentsByDate.get(selectedDate) ?? [];
  const weekTotal = countWeekAppointments(appointments, parseDateKey(selectedDate));

  function shiftMonth(delta: number) {
    const next = new Date(viewYear, viewMonth + delta, 1);
    setViewYear(next.getFullYear());
    setViewMonth(next.getMonth());
  }

  function handleCreate(appointment: CalendarAppointment) {
    setAppointments((current) => [...current, appointment]);
    setSelectedDate(appointment.date);
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="mb-4 flex flex-col gap-4 border-b border-border/50 pb-4 md:mb-6 md:pb-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-parsel-gold">
            <CalendarDays className="h-4 w-4" strokeWidth={1.75} />
            <span className="text-[11px] font-semibold uppercase tracking-[0.2em] md:text-[10px]">
              Saha Operasyonları
            </span>
          </div>
          <h1 className="font-outfit text-xl font-semibold tracking-tight text-foreground/90 md:text-2xl">
            Saha Operasyonları ve Ajanda
          </h1>
        </div>

        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-parsel-gold px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-[#9a784a] lg:w-auto lg:self-auto"
        >
          <Plus className="h-4 w-4" strokeWidth={2} />
          Yeni Randevu
        </button>
      </header>

      <div className="grid grid-cols-1 gap-4 md:gap-6 lg:grid-cols-12">
        <aside className="h-fit rounded-2xl border border-border/50 bg-parsel-panel p-4 md:p-6 lg:col-span-4">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold capitalize text-foreground/90">
              {formatMonthYear(viewYear, viewMonth)}
            </h2>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => shiftMonth(-1)}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:border-white/20 hover:text-foreground/80"
                aria-label="Önceki ay"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => shiftMonth(1)}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:border-white/20 hover:text-foreground/80"
                aria-label="Sonraki ay"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1.5">
            {grid.weekdays.map((day) => (
              <div
                key={day}
                className="pb-1 text-center text-[11px] font-medium uppercase tracking-wider text-foreground/35 md:text-[10px]"
              >
                {day}
              </div>
            ))}

            {grid.cells.map((cell, index) => {
              if (!cell.date || !cell.key) {
                return (
                  <div
                    key={`empty-${index}`}
                    className="aspect-square rounded-lg bg-transparent"
                  />
                );
              }

              const dayEvents = appointmentsByDate.get(cell.key) ?? [];
              const isSelected = cell.key === selectedDate;
              const isToday = cell.key === todayKey;

              return (
                <button
                  key={cell.key}
                  type="button"
                  onClick={() => {
                    if (cell.key) setSelectedDate(cell.key);
                  }}
                  className={cn(
                    "relative flex aspect-square flex-col items-center justify-center rounded-lg border text-sm transition-all",
                    isSelected
                      ? "border-[#b38c56]/50 bg-parsel-gold/10 text-[#d4b07a]"
                      : "border-transparent bg-background text-foreground/70 hover:border-border",
                    isToday && !isSelected && "ring-1 ring-white/15",
                  )}
                >
                  <span className="font-medium tabular-nums">
                    {cell.date.getDate()}
                  </span>
                  {dayEvents.length > 0 ? (
                    <span className="mt-1 flex gap-0.5">
                      {Array.from(
                        new Set(dayEvents.map((event) => event.type)),
                      )
                        .slice(0, 3)
                        .map((type) => (
                          <span
                            key={type}
                            className={cn(
                              "h-1.5 w-1.5 rounded-full",
                              dotColorForTypes([type]),
                            )}
                          />
                        ))}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>

          <p className="mt-5 rounded-xl border border-border/50 bg-background px-4 py-3 text-center text-xs text-muted-foreground">
            Bu Haftaki Toplam Randevu:{" "}
            <span className="font-semibold text-parsel-gold">{weekTotal}</span>
          </p>
        </aside>

        <section className="flex flex-col gap-4 lg:col-span-8">
          <div className="rounded-xl border border-border/50 bg-parsel-panel px-5 py-4">
            <h2 className="text-sm font-semibold text-foreground/90">
              {formatSelectedDayLabel(selectedDate)}
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              {selectedEvents.length} randevu planlandı
            </p>
          </div>

          {selectedEvents.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-parsel-panel px-6 py-16 text-center">
              <p className="text-sm text-foreground/45">
                Bu gün için planlanmış randevu yok.
              </p>
              <button
                type="button"
                onClick={() => setModalOpen(true)}
                className="mt-4 text-xs font-medium text-parsel-gold hover:text-[#d4b07a]"
              >
                + Yeni randevu ekle
              </button>
            </div>
          ) : (
            selectedEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))
          )}
        </section>
      </div>

      <NewAppointmentModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        defaultDate={selectedDate}
        onCreate={handleCreate}
      />
    </div>
  );
}
