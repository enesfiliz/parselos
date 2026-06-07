import type { AuthorizedPortfolioItem } from "@/lib/portfolios/portfolio-types";

export function buildPortfolioOwnerReportMessage(item: {
  title: string;
  showingsCount: number;
  offersCount: number;
}): string {
  return (
    `Merhaba, ${item.title} portföyünüz için haftalık durum raporu:\n` +
    `👀 Bu hafta ${item.showingsCount} potansiyel alıcıya yer gösterimi yapıldı.\n` +
    `📝 Şu an masada ${item.offersCount} adet değerlendirilen teklif var.\n` +
    `Süreci titizlikle takip ediyorum, gelişmelerden haberdar edeceğim. İyi günler dilerim.`
  );
}

function normalizeWhatsAppPhone(phone?: string | null): string | null {
  if (!phone?.trim()) return null;

  const digits = phone.replace(/\D/g, "");
  if (digits.length < 10) return null;

  if (digits.startsWith("90") && digits.length >= 12) return digits;
  if (digits.startsWith("0")) return `90${digits.slice(1)}`;
  if (digits.length === 10) return `90${digits}`;

  return digits.startsWith("90") ? digits : `90${digits}`;
}

export function buildPortfolioOwnerWhatsAppUrl(
  item: Pick<
    AuthorizedPortfolioItem,
    "title" | "showingsCount" | "offersCount" | "ownerPhone"
  >,
): string {
  const text = encodeURIComponent(buildPortfolioOwnerReportMessage(item));
  const phone = normalizeWhatsAppPhone(item.ownerPhone);

  if (phone) {
    return `https://wa.me/${phone}?text=${text}`;
  }

  return `https://wa.me/?text=${text}`;
}
