const MINUTE = 60_000;
const HOUR = 3_600_000;
const DAY = 86_400_000;

export function formatNotificationTimeAgo(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";

  const diff = Date.now() - date.getTime();
  if (diff < MINUTE) return "Az önce";
  if (diff < HOUR) return `${Math.floor(diff / MINUTE)} dk önce`;
  if (diff < DAY) return `${Math.floor(diff / HOUR)} saat önce`;
  if (diff < DAY * 2) return "Dün";
  return date.toLocaleDateString("tr-TR", { day: "numeric", month: "short" });
}

export function priorityToKind(priority: string): "urgent" | "intelligence" | "opportunity" {
  if (priority === "high") return "urgent";
  if (priority === "low") return "intelligence";
  return "opportunity";
}
