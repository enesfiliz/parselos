export type ParselAiWorkType =
  | "individual"
  | "broker_owner"
  | "land_parcel"
  | "residential_commercial";

export type ParselAiPortfolioFocus =
  | "land"
  | "residential"
  | "commercial"
  | "field"
  | "mixed";

export type ParselAiCustomerType =
  | "investor"
  | "buyer"
  | "seller"
  | "tenant"
  | "corporate";

export type ParselAiPrimaryGoal =
  | "follow_up"
  | "matching"
  | "zoning_tracking"
  | "office_performance"
  | "listing_content";

export type ParselAiTone = "concise" | "detailed" | "sales" | "corporate";

export type ParselAiDailyUse =
  | "client_summary"
  | "portfolio_analysis"
  | "zoning_tracking"
  | "advisor_performance";

export type ParselAiProfile = {
  version: 1;
  onboardingCompleted: boolean;
  completedAt: string | null;
  workType: ParselAiWorkType | null;
  region: string;
  portfolioFocus: ParselAiPortfolioFocus[];
  customerTypes: ParselAiCustomerType[];
  primaryGoal: ParselAiPrimaryGoal | null;
  tone: ParselAiTone | null;
  dailyUse: ParselAiDailyUse[];
};

const PARSEL_AI_PROFILE_STORAGE_BASE = "parsel-ai-profile";

export const EMPTY_PARSEL_AI_PROFILE: ParselAiProfile = {
  version: 1,
  onboardingCompleted: false,
  completedAt: null,
  workType: null,
  region: "",
  portfolioFocus: [],
  customerTypes: [],
  primaryGoal: null,
  tone: null,
  dailyUse: [],
};

export const PARSEL_AI_WORK_TYPE_OPTIONS: {
  value: ParselAiWorkType;
  label: string;
  description: string;
}[] = [
  {
    value: "individual",
    label: "Bireysel danışman",
    description: "Saha ve müşteri takibini tek başına yönetiyorum.",
  },
  {
    value: "broker_owner",
    label: "Broker / ofis sahibi",
    description: "Ekip, portföy ve ofis performansını koordine ediyorum.",
  },
  {
    value: "land_parcel",
    label: "Arsa / parsel uzmanı",
    description: "İmar, tapu ve parsel odaklı çalışıyorum.",
  },
  {
    value: "residential_commercial",
    label: "Konut / ticari portföy",
    description: "Konut ve ticari portföy eşleştirmesi yapıyorum.",
  },
];

export const PARSEL_AI_PORTFOLIO_FOCUS_OPTIONS: {
  value: ParselAiPortfolioFocus;
  label: string;
}[] = [
  { value: "land", label: "Arsa" },
  { value: "residential", label: "Konut" },
  { value: "commercial", label: "Ticari" },
  { value: "field", label: "Tarla" },
  { value: "mixed", label: "Karma" },
];

export const PARSEL_AI_CUSTOMER_TYPE_OPTIONS: {
  value: ParselAiCustomerType;
  label: string;
}[] = [
  { value: "investor", label: "Yatırımcı" },
  { value: "buyer", label: "Alıcı" },
  { value: "seller", label: "Satıcı" },
  { value: "tenant", label: "Kiracı" },
  { value: "corporate", label: "Kurumsal" },
];

export const PARSEL_AI_PRIMARY_GOAL_OPTIONS: {
  value: ParselAiPrimaryGoal;
  label: string;
  description: string;
}[] = [
  {
    value: "follow_up",
    label: "Daha düzenli takip",
    description: "Müşteri ve görüşme hatırlatmalarını netleştirmek.",
  },
  {
    value: "matching",
    label: "Daha iyi portföy eşleştirme",
    description: "Doğru müşteriye doğru portföyü önermek.",
  },
  {
    value: "zoning_tracking",
    label: "İmar / parsel takibi",
    description: "İmar ve parsel kayıtlarını yorumlamak.",
  },
  {
    value: "office_performance",
    label: "Ofis performansı",
    description: "Ekip ve pipeline görünürlüğünü artırmak.",
  },
  {
    value: "listing_content",
    label: "Sosyal medya / ilan metni",
    description: "İlan ve iletişim metinlerini hızlandırmak.",
  },
];

export const PARSEL_AI_TONE_OPTIONS: {
  value: ParselAiTone;
  label: string;
  description: string;
}[] = [
  { value: "concise", label: "Kısa ve net", description: "Özet, aksiyon odaklı yanıtlar." },
  {
    value: "detailed",
    label: "Detaylı analiz",
    description: "Bağlam ve gerekçe ile derinlemesine yanıtlar.",
  },
  {
    value: "sales",
    label: "Satış odaklı",
    description: "İkna ve kapanış diline yakın öneriler.",
  },
  {
    value: "corporate",
    label: "Kurumsal",
    description: "Resmi, düzenli ve ofis disiplinine uygun dil.",
  },
];

export const PARSEL_AI_DAILY_USE_OPTIONS: {
  value: ParselAiDailyUse;
  label: string;
}[] = [
  { value: "client_summary", label: "Müşteri takip özeti" },
  { value: "portfolio_analysis", label: "Portföy analizi" },
  { value: "zoning_tracking", label: "İmar takibi" },
  { value: "advisor_performance", label: "Danışman performansı" },
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

export function normalizeParselAiProfile(raw: unknown): ParselAiProfile {
  if (!isRecord(raw)) return { ...EMPTY_PARSEL_AI_PROFILE };

  return {
    version: 1,
    onboardingCompleted: raw.onboardingCompleted === true,
    completedAt:
      typeof raw.completedAt === "string" ? raw.completedAt : null,
    workType:
      raw.workType === "individual" ||
      raw.workType === "broker_owner" ||
      raw.workType === "land_parcel" ||
      raw.workType === "residential_commercial"
        ? raw.workType
        : null,
    region: typeof raw.region === "string" ? raw.region.trim() : "",
    portfolioFocus: asStringArray(raw.portfolioFocus).filter((item) =>
      PARSEL_AI_PORTFOLIO_FOCUS_OPTIONS.some((opt) => opt.value === item),
    ) as ParselAiPortfolioFocus[],
    customerTypes: asStringArray(raw.customerTypes).filter((item) =>
      PARSEL_AI_CUSTOMER_TYPE_OPTIONS.some((opt) => opt.value === item),
    ) as ParselAiCustomerType[],
    primaryGoal:
      raw.primaryGoal === "follow_up" ||
      raw.primaryGoal === "matching" ||
      raw.primaryGoal === "zoning_tracking" ||
      raw.primaryGoal === "office_performance" ||
      raw.primaryGoal === "listing_content"
        ? raw.primaryGoal
        : null,
    tone:
      raw.tone === "concise" ||
      raw.tone === "detailed" ||
      raw.tone === "sales" ||
      raw.tone === "corporate"
        ? raw.tone
        : null,
    dailyUse: asStringArray(raw.dailyUse).filter((item) =>
      PARSEL_AI_DAILY_USE_OPTIONS.some((opt) => opt.value === item),
    ) as ParselAiDailyUse[],
  };
}

export function getParselAiProfileStorageKey(userId?: string | null) {
  const scope = userId?.trim() || "anonymous";
  return `${PARSEL_AI_PROFILE_STORAGE_BASE}:${scope}`;
}

/** @deprecated Use getParselAiProfileStorageKey */
export const getParselAiStorageKey = getParselAiProfileStorageKey;

export function getParselAiProfile(userId?: string | null): ParselAiProfile {
  return loadParselAiProfile(userId);
}

export function loadParselAiProfile(userId?: string | null): ParselAiProfile {
  if (typeof window === "undefined") return { ...EMPTY_PARSEL_AI_PROFILE };

  try {
    const raw = window.localStorage.getItem(getParselAiProfileStorageKey(userId));
    if (!raw) return { ...EMPTY_PARSEL_AI_PROFILE };
    return normalizeParselAiProfile(JSON.parse(raw));
  } catch {
    return { ...EMPTY_PARSEL_AI_PROFILE };
  }
}

export function saveParselAiProfile(
  profile: ParselAiProfile,
  userId?: string | null,
) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(
    getParselAiProfileStorageKey(userId),
    JSON.stringify(profile),
  );
}

export function clearParselAiProfile(userId?: string | null) {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(getParselAiProfileStorageKey(userId));
}

export function labelForWorkType(value: ParselAiWorkType | null) {
  return PARSEL_AI_WORK_TYPE_OPTIONS.find((item) => item.value === value)?.label ?? "—";
}

export function labelsForPortfolioFocus(values: ParselAiPortfolioFocus[]) {
  if (values.length === 0) return "—";
  return values
    .map(
      (value) =>
        PARSEL_AI_PORTFOLIO_FOCUS_OPTIONS.find((item) => item.value === value)
          ?.label ?? value,
    )
    .join(", ");
}

export function labelsForCustomerTypes(values: ParselAiCustomerType[]) {
  if (values.length === 0) return "—";
  return values
    .map(
      (value) =>
        PARSEL_AI_CUSTOMER_TYPE_OPTIONS.find((item) => item.value === value)
          ?.label ?? value,
    )
    .join(", ");
}

export function labelForPrimaryGoal(value: ParselAiPrimaryGoal | null) {
  return (
    PARSEL_AI_PRIMARY_GOAL_OPTIONS.find((item) => item.value === value)?.label ??
    "—"
  );
}

export function labelForTone(value: ParselAiTone | null) {
  return PARSEL_AI_TONE_OPTIONS.find((item) => item.value === value)?.label ?? "—";
}

export function labelsForDailyUse(values: ParselAiDailyUse[]) {
  if (values.length === 0) return "—";
  return values
    .map(
      (value) =>
        PARSEL_AI_DAILY_USE_OPTIONS.find((item) => item.value === value)?.label ??
        value,
    )
    .join(", ");
}

export function buildRecommendedQuickActions(profile: ParselAiProfile): {
  label: string;
  prompt: string;
}[] {
  const actions: { label: string; prompt: string }[] = [];

  const push = (label: string, prompt: string) => {
    if (!actions.some((item) => item.label === label)) {
      actions.push({ label, prompt });
    }
  };

  if (profile.dailyUse.includes("client_summary")) {
    push(
      "Bugünkü takiplerimi özetle",
      "Bugünkü müşteri takiplerimi, bekleyen görüşmeleri ve öncelikli aksiyonları kısa bir operasyon özeti olarak çıkar.",
    );
  }
  if (
    profile.dailyUse.includes("portfolio_analysis") ||
    profile.primaryGoal === "matching"
  ) {
    push(
      "Bu müşteriye uygun portföy öner",
      "Son görüştüğüm müşteri profiline uygun aktif portföy eşleştirmesi öner; kriterleri ve gerekçeyi maddeler halinde yaz.",
    );
  }
  if (
    profile.dailyUse.includes("zoning_tracking") ||
    profile.primaryGoal === "zoning_tracking" ||
    profile.portfolioFocus.includes("land")
  ) {
    push(
      "İmar kaydını yorumla",
      "Paylaştığım imar/parsel kaydını yorumla; resmi kaynaktan teyit edilmesi gereken noktaları ayrı belirt.",
    );
  }
  if (profile.dailyUse.includes("client_summary")) {
    push(
      "Saha görüşmesini CRM notuna çevir",
      "Saha görüşmesinden çıkan notları CRM formatında müşteri adı, bütçe, bölge, mülk tipi ve takip aksiyonlarına dönüştür.",
    );
  }

  if (actions.length < 4) {
    push(
      "Bugünkü takiplerimi özetle",
      "Bugünkü müşteri takiplerimi, bekleyen görüşmeleri ve öncelikli aksiyonları kısa bir operasyon özeti olarak çıkar.",
    );
    push(
      "Bu müşteriye uygun portföy öner",
      "Son görüştüğüm müşteri profiline uygun aktif portföy eşleştirmesi öner; kriterleri ve gerekçeyi maddeler halinde yaz.",
    );
    push(
      "İmar kaydını yorumla",
      "Paylaştığım imar/parsel kaydını yorumla; resmi kaynaktan teyit edilmesi gereken noktaları ayrı belirt.",
    );
    push(
      "Saha görüşmesini CRM notuna çevir",
      "Saha görüşmesinden çıkan notları CRM formatında müşteri adı, bütçe, bölge, mülk tipi ve takip aksiyonlarına dönüştür.",
    );
  }

  return actions.slice(0, 4);
}
