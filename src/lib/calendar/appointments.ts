export type AppointmentType = "showing" | "deed" | "meeting";

export type CalendarAppointment = {
  id: string;
  date: string;
  time: string;
  type: AppointmentType;
  clientName: string;
  clientPhone: string;
  propertyTitle: string;
  dealId?: string;
};

export const APPOINTMENT_TYPE_META: Record<
  AppointmentType,
  { label: string; badgeClass: string }
> = {
  showing: {
    label: "Yer Gösterme",
    badgeClass: "bg-parsel-gold/10 text-[#d4b07a] border border-[#b38c56]/20",
  },
  deed: {
    label: "Tapu İşlemi",
    badgeClass: "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20",
  },
  meeting: {
    label: "Müşteri Toplantısı",
    badgeClass: "bg-sky-500/10 text-sky-300 border border-sky-500/20",
  },
};

const TR_WEEKDAYS = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"] as const;

export function toDateKey(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function parseDateKey(key: string) {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function formatSelectedDayLabel(key: string) {
  return new Intl.DateTimeFormat("tr-TR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(parseDateKey(key));
}

export function formatMonthYear(year: number, month: number) {
  return new Intl.DateTimeFormat("tr-TR", {
    month: "long",
    year: "numeric",
  }).format(new Date(year, month, 1));
}

export function buildCalendarGrid(year: number, month: number) {
  const firstOfMonth = new Date(year, month, 1);
  const mondayOffset = (firstOfMonth.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: Array<{ date: Date | null; key: string | null }> = [];

  for (let i = 0; i < 35; i++) {
    const dayNumber = i - mondayOffset + 1;
    if (dayNumber < 1 || dayNumber > daysInMonth) {
      cells.push({ date: null, key: null });
      continue;
    }
    const date = new Date(year, month, dayNumber);
    cells.push({ date, key: toDateKey(date) });
  }

  return { weekdays: TR_WEEKDAYS, cells };
}

export function getWeekRange(date: Date) {
  const day = date.getDay();
  const mondayDiff = day === 0 ? -6 : 1 - day;
  const start = new Date(date);
  start.setDate(date.getDate() + mondayDiff);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);

  return { start, end };
}

export function countWeekAppointments(
  appointments: CalendarAppointment[],
  reference: Date,
) {
  const { start, end } = getWeekRange(reference);
  return appointments.filter((item) => {
    const date = parseDateKey(item.date);
    return date >= start && date <= end;
  }).length;
}

function offsetDate(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return toDateKey(date);
}

export function createMockAppointments(): CalendarAppointment[] {
  return [
    {
      id: "apt-1",
      date: offsetDate(0),
      time: "10:30",
      type: "meeting",
      clientName: "Ahmet Yılmaz",
      clientPhone: "905321234567",
      propertyTitle: "Gölcük Merkez 3+1 Daire",
      dealId: "mock-deal-001",
    },
    {
      id: "apt-2",
      date: offsetDate(0),
      time: "14:30",
      type: "showing",
      clientName: "Elif Demirtaş",
      clientPhone: "905329876543",
      propertyTitle: "İzmit 3+1 Daire Gösterimi",
      dealId: "mock-deal-002",
    },
    {
      id: "apt-3",
      date: offsetDate(1),
      time: "11:00",
      type: "deed",
      clientName: "Murat Kaya",
      clientPhone: "905551112233",
      propertyTitle: "Başiskele Sahil 3+1 Tapu İşlemi",
      dealId: "mock-deal-003",
    },
    {
      id: "apt-4",
      date: offsetDate(2),
      time: "16:00",
      type: "showing",
      clientName: "Selin Demir",
      clientPhone: "905339876543",
      propertyTitle: "Gebze 2+1 Kiralık Daire",
    },
    {
      id: "apt-5",
      date: offsetDate(3),
      time: "09:30",
      type: "meeting",
      clientName: "Caner Aktaş",
      clientPhone: "905447778899",
      propertyTitle: "Yatırım portföyü değerlendirme",
    },
    {
      id: "apt-6",
      date: offsetDate(4),
      time: "13:15",
      type: "showing",
      clientName: "Zeynep Arslan",
      clientPhone: "905366554433",
      propertyTitle: "Gölcük Oluklu İmarlı Arsa",
    },
    {
      id: "apt-7",
      date: offsetDate(5),
      time: "15:45",
      type: "deed",
      clientName: "Burak Öztürk",
      clientPhone: "905378901234",
      propertyTitle: "İzmit Sanayi Ticari Parsel",
    },
    {
      id: "apt-8",
      date: offsetDate(6),
      time: "12:00",
      type: "showing",
      clientName: "Deniz Yıldız",
      clientPhone: "905391234567",
      propertyTitle: "Kartepe Villa Gösterimi",
    },
  ];
}

export function buildAppointmentReminderUrl(item: CalendarAppointment) {
  const dayLabel = formatSelectedDayLabel(item.date);
  const message = encodeURIComponent(
    `Merhaba ${item.clientName}, ${dayLabel} saat ${item.time} randevunuzu hatırlatmak isterim. ` +
      `${item.propertyTitle} — görüşmede görüşmek üzere.`,
  );
  const phone = item.clientPhone.replace(/\D/g, "");
  if (phone.length >= 10) {
    const normalized = phone.startsWith("90") ? phone : `90${phone.replace(/^0/, "")}`;
    return `https://wa.me/${normalized}?text=${message}`;
  }
  return `https://wa.me/?text=${message}`;
}

export const MOCK_PORTFOLIO_OPTIONS = [
  { id: "mock-prop-001", title: "Gölcük Merkez 3+1 Daire" },
  { id: "mock-prop-002", title: "Moda Deniz Manzaralı 3+1" },
  { id: "mock-prop-003", title: "İzmit 3+1 Daire" },
  { id: "mock-prop-004", title: "Başiskele Sahil 3+1 Sıfır Daire" },
  { id: "mock-prop-005", title: "Gölcük Oluklu İmarlı Arsa" },
];
