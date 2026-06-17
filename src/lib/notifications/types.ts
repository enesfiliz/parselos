export type NotificationKind = "urgent" | "intelligence" | "opportunity";

export type AppNotification = {
  id: string;
  kind: NotificationKind;
  title: string;
  message: string;
  timeAgo: string;
  read: boolean;
  dismissed: boolean;
  href: string | null;
  createdAt: string;
};

export type NotificationSeed = {
  type: string;
  priority?: "low" | "normal" | "high";
  kind: NotificationKind;
  title: string;
  message: string;
  href?: string | null;
  dedupeKey: string;
};
