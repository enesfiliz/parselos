export type AiModelOption = {
  id: string;
  label: string;
  provider: "groq" | "openai" | "anthropic";
  statusLabel: string;
};

export type AiToolToggle = {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
  maintenance?: boolean;
  emoji: string;
};

export type AiCostMetric = {
  id: string;
  label: string;
  value: string;
  hint?: string;
};

export const AI_MODEL_OPTIONS: AiModelOption[] = [
  {
    id: "groq-llama-3.3",
    label: "Groq Llama 3.3",
    provider: "groq",
    statusLabel: "Llama-3.3-70b",
  },
  {
    id: "gpt-4o-mini",
    label: "GPT-4o-Mini",
    provider: "openai",
    statusLabel: "GPT-4o-Mini",
  },
  {
    id: "claude-3.5-haiku",
    label: "Claude 3.5 Haiku",
    provider: "anthropic",
    statusLabel: "Claude 3.5 Haiku",
  },
];

export const DEFAULT_ACTIVE_MODEL_ID = "groq-llama-3.3";

export const MOCK_MASKED_API_KEY = "gsk_••••••••••••••••••••••••••••";

export const DEFAULT_SYSTEM_PROMPT = `Sen Parsel AI'sın. Üst düzey gayrimenkul danışmanının otonom sağ kolusun.

DİL KURALLARI:
1. ANA DİLİN TÜRKÇE: C2 seviyesinde, kusursuz, akıcı ve doğal bir Türkçe kullan.
2. EMLAK JARGONU: Yer gösterme, kapora, tapu dairesi, rayiç bedel gibi yerel terimlere hakim ol.
3. BAĞLAM VE KAVRAMA: Niyet düzeyinde anla; kısa veya imalı sorularda satır arasını oku.

KARAKTER VE TAVIR:
- Asla "Size nasıl yardımcı olabilirim?" gibi ucuz müşteri hizmetleri kalıplarına girme.
- İşlem istenmediği sürece Tool (Araç) tetikleme. Sadece muhabbet et.
- Kod bloğu yazman veya teknik kod vermen KESİNLİKLE YASAKTIR.

FATURALANDIRMA: Paket değişikliği taleplerinde yalnızca /billing sayfasına yönlendir.
WHATSAPP: Mesajlarda wa.me markdown linki kullan.`;

export const AI_TOOL_TOGGLES: AiToolToggle[] = [
  {
    id: "whatsapp",
    label: "WhatsApp Mesaj Otonomisi",
    description: "Müşterilere kişiselleştirilmiş wa.me mesajları üretir.",
    enabled: true,
    emoji: "🟢",
  },
  {
    id: "listing-analysis",
    label: "Sahibinden İlan Analizi",
    description: "Konum ve özelliklere göre satılabilirlik ve ilan metni üretir.",
    enabled: true,
    emoji: "🟢",
  },
  {
    id: "financial-data",
    label: "Finansal Verilere Erişim",
    description: "MRR, komisyon ve gelir raporlarına erişim (bakımda).",
    enabled: false,
    maintenance: true,
    emoji: "🔴",
  },
  {
    id: "appointment",
    label: "Otomatik Randevu Planlama",
    description: "Yer gösterme ve tapu randevularını takvime ekler.",
    enabled: true,
    emoji: "🟢",
  },
];

export const AI_COST_METRICS: AiCostMetric[] = [
  {
    id: "tokens",
    label: "Bu Ay Harcanan Token",
    value: "4.2 Milyon",
    hint: "Tüm ofisler toplamı",
  },
  {
    id: "cost",
    label: "Tahmini Maliyet",
    value: "$0.00 (Groq Free Tier)",
    hint: "Son fatura dönemi",
  },
  {
    id: "top-office",
    label: "En Çok İstek Yapan Ofis",
    value: "Murat Emlak",
    hint: "142.400 token · bu ay",
  },
  {
    id: "avg-latency",
    label: "Ortalama Yanıt Süresi",
    value: "1.8 sn",
    hint: "Groq edge inference",
  },
];

export function getActiveModelStatusLabel(modelId: string) {
  const model = AI_MODEL_OPTIONS.find((option) => option.id === modelId);
  return model?.statusLabel ?? "Llama-3.3-70b";
}
