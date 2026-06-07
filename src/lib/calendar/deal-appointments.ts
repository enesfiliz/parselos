import {
  APPOINTMENT_TYPE_META,
  type AppointmentType,
  type CalendarAppointment,
  createMockAppointments,
  parseDateKey,
  toDateKey,
} from "@/lib/calendar/appointments";

function offsetDate(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return toDateKey(date);
}

const DEAL_LINKED_APPOINTMENTS: CalendarAppointment[] = [
  {
    id: "apt-past-001",
    date: offsetDate(-5),
    time: "15:00",
    type: "showing",
    clientName: "Ahmet Yılmaz",
    clientPhone: "905321234567",
    propertyTitle: "Gölcük Merkez 3+1 Daire",
    dealId: "mock-deal-001",
  },
  {
    id: "apt-past-002",
    date: offsetDate(-2),
    time: "11:30",
    type: "meeting",
    clientName: "Elif Demirtaş",
    clientPhone: "905329876543",
    propertyTitle: "Moda Deniz Manzaralı 3+1",
    dealId: "mock-deal-002",
  },
  {
    id: "apt-future-004",
    date: offsetDate(2),
    time: "10:00",
    type: "showing",
    clientName: "Caner Yıldız",
    clientPhone: "905447778899",
    propertyTitle: "Kocaeli Ticari İmarlı Kupon Yer",
    dealId: "mock-deal-004",
  },
  {
    id: "apt-future-005",
    date: offsetDate(1),
    time: "16:30",
    type: "deed",
    clientName: "Murat Bey",
    clientPhone: "905551112233",
    propertyTitle: "Gölcük Oluklu İmarlı Arsa",
    dealId: "mock-deal-005",
  },
];

function appointmentTimestamp(item: CalendarAppointment) {
  const [hours, minutes] = item.time.split(":").map(Number);
  const date = parseDateKey(item.date);
  date.setHours(hours, minutes ?? 0, 0, 0);
  return date.getTime();
}

let cachedAppointments: CalendarAppointment[] | null = null;
let appointmentsByDealId: Map<string, CalendarAppointment[]> | null = null;

function mergeAppointments(): CalendarAppointment[] {
  const byId = new Map<string, CalendarAppointment>();
  for (const item of [...createMockAppointments(), ...DEAL_LINKED_APPOINTMENTS]) {
    byId.set(item.id, item);
  }
  return Array.from(byId.values());
}

function ensureAppointmentIndexes() {
  if (cachedAppointments && appointmentsByDealId) return;

  cachedAppointments = mergeAppointments();
  appointmentsByDealId = new Map();

  for (const item of cachedAppointments) {
    if (!item.dealId) continue;
    const list = appointmentsByDealId.get(item.dealId) ?? [];
    list.push(item);
    appointmentsByDealId.set(item.dealId, list);
  }

  for (const list of appointmentsByDealId.values()) {
    list.sort((a, b) => appointmentTimestamp(a) - appointmentTimestamp(b));
  }
}

export function getAllDealAppointments(): CalendarAppointment[] {
  ensureAppointmentIndexes();
  return cachedAppointments ?? [];
}

export function getAppointmentsForDeal(dealId: string): CalendarAppointment[] {
  ensureAppointmentIndexes();
  return appointmentsByDealId?.get(dealId) ?? [];
}

export function getUpcomingAppointmentForDeal(
  dealId: string,
  reference = new Date(),
): CalendarAppointment | null {
  const todayKey = toDateKey(reference);
  const nowTs = reference.getTime();

  const upcoming = getAppointmentsForDeal(dealId).filter((item) => {
    if (item.date > todayKey) return true;
    if (item.date < todayKey) return false;
    return appointmentTimestamp(item) >= nowTs;
  });

  if (upcoming.length === 0) return null;

  return upcoming.sort((a, b) => appointmentTimestamp(a) - appointmentTimestamp(b))[0];
}

export function isAppointmentToday(
  item: CalendarAppointment,
  reference = new Date(),
): boolean {
  return item.date === toDateKey(reference);
}

export function formatAppointmentRelativeDay(
  dateKey: string,
  reference = new Date(),
): string {
  const todayKey = toDateKey(reference);
  if (dateKey === todayKey) return "Bugün";

  const tomorrow = new Date(reference);
  tomorrow.setDate(reference.getDate() + 1);
  if (dateKey === toDateKey(tomorrow)) return "Yarın";

  const label = new Intl.DateTimeFormat("tr-TR", {
    weekday: "long",
  }).format(parseDateKey(dateKey));

  return label.charAt(0).toLocaleUpperCase("tr-TR") + label.slice(1);
}

export function formatAppointmentTypeLabel(type: AppointmentType): string {
  const label = APPOINTMENT_TYPE_META[type].label;
  if (type === "showing") return "Yer Gösterimi";
  return label;
}

export function formatAppointmentWhisper(
  item: CalendarAppointment,
  reference = new Date(),
): string {
  const day = formatAppointmentRelativeDay(item.date, reference);
  const typeLabel = formatAppointmentTypeLabel(item.type);
  return `${day} ${item.time} - ${typeLabel}`;
}

export function formatAppointmentTimelineLabel(
  item: CalendarAppointment,
  reference = new Date(),
): string {
  const day = formatAppointmentRelativeDay(item.date, reference);
  return `${day} · ${item.time} · ${formatAppointmentTypeLabel(item.type)}`;
}

export function isAppointmentPast(
  item: CalendarAppointment,
  reference = new Date(),
): boolean {
  return appointmentTimestamp(item) < reference.getTime();
}
