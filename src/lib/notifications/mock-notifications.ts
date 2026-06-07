export type NotificationKind = "urgent" | "intelligence" | "opportunity";

export type AppNotification = {
  id: string;
  kind: NotificationKind;
  message: string;
  timeAgo: string;
  read: boolean;
  href: string;
};

export const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: "notif-001",
    kind: "urgent",
    message: "Bugün 14:30'daki Tapu İşlemine 2 saat kaldı.",
    timeAgo: "10 dk önce",
    read: false,
    href: "/calendar",
  },
  {
    id: "notif-002",
    kind: "intelligence",
    message: "Bilecik Söğüt 126 Ada 58 Parsel için yeni askı durumu!",
    timeAgo: "45 dk önce",
    read: false,
    href: "/imar-radari",
  },
  {
    id: "notif-003",
    kind: "opportunity",
    message: "Murat Bey için yeni yer gösterme belgesi yüklendi.",
    timeAgo: "2 saat önce",
    read: false,
    href: "/deals",
  },
  {
    id: "notif-004",
    kind: "urgent",
    message: "Yarın 09:00 yer gösterme randevusu — Kadıköy 14/2 parsel.",
    timeAgo: "5 saat önce",
    read: true,
    href: "/calendar",
  },
  {
    id: "notif-005",
    kind: "intelligence",
    message: "FSBO Radarı: Gölcük bölgesinde 3 yeni satılık ilan eşleşmesi.",
    timeAgo: "Dün",
    read: true,
    href: "/fsbo-radar",
  },
  {
    id: "notif-006",
    kind: "opportunity",
    message: "mock-deal-002 aşaması 'Teklif' kolonuna taşındı.",
    timeAgo: "Dün",
    read: true,
    href: "/deals",
  },
];
