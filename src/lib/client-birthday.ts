export type BirthdayInfo = {
  daysUntil: number;
  isWithinWeek: boolean;
  isToday: boolean;
  age: number;
  nextBirthdayLabel: string;
};

function startOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

/** Sonraki doğum gününe kalan gün sayısı ve yaş bilgisi */
export function getBirthdayInfo(birthDateIso: string, now = new Date()): BirthdayInfo {
  const birth = new Date(birthDateIso);
  const today = startOfDay(now);

  let next = new Date(
    today.getFullYear(),
    birth.getMonth(),
    birth.getDate(),
  );
  next = startOfDay(next);

  if (next < today) {
    next = new Date(
      today.getFullYear() + 1,
      birth.getMonth(),
      birth.getDate(),
    );
    next = startOfDay(next);
  }

  const msPerDay = 1000 * 60 * 60 * 24;
  const daysUntil = Math.round((next.getTime() - today.getTime()) / msPerDay);

  let age = today.getFullYear() - birth.getFullYear();
  const hadBirthdayThisYear =
    today.getMonth() > birth.getMonth() ||
    (today.getMonth() === birth.getMonth() && today.getDate() >= birth.getDate());
  if (!hadBirthdayThisYear) {
    age -= 1;
  }
  if (daysUntil === 0) {
    age = today.getFullYear() - birth.getFullYear();
  }

  const nextBirthdayLabel = new Intl.DateTimeFormat("tr-TR", {
    day: "numeric",
    month: "short",
  }).format(next);

  const isToday = daysUntil === 0;
  const isWithinWeek = isToday || (daysUntil > 0 && daysUntil < 7);

  return {
    daysUntil,
    isWithinWeek,
    isToday,
    age: Math.max(0, age),
    nextBirthdayLabel,
  };
}

export function getInitials(adSoyad: string) {
  const parts = adSoyad.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}
