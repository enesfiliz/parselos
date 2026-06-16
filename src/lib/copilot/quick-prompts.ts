export type QuickPrompt = {
  label: string;
  prompt: string;
};

export const COPILOT_QUICK_PROMPTS: QuickPrompt[] = [
  {
    label: "Takip özeti",
    prompt:
      "Bugünkü müşteri takiplerimi, bekleyen görüşmeleri ve öncelikli aksiyonları kısa bir operasyon özeti olarak çıkar.",
  },
  {
    label: "Portföy öner",
    prompt:
      "Son görüştüğüm müşteri profiline uygun aktif portföy eşleştirmesi öner; kriterleri ve gerekçeyi maddeler halinde yaz.",
  },
  {
    label: "İmar yorumu",
    prompt:
      "Paylaştığım imar/parsel kaydını yorumla; resmi kaynaktan teyit edilmesi gereken noktaları ayrı belirt.",
  },
  {
    label: "Saha notu",
    prompt:
      "Saha görüşmesinden çıkan notları CRM formatında müşteri adı, bütçe, bölge, mülk tipi ve takip aksiyonlarına dönüştür.",
  },
  {
    label: "İlan metni",
    prompt: "Belirttiğim bölge ve mülk için satılık ilan metni taslağı hazırla.",
  },
  {
    label: "Portföy özeti",
    prompt: "Aktif yetkili portföylerimin kısa özetini çıkar.",
  },
];

export const COPILOT_TRUST_NOTE =
  "İmar ve hukuki bilgiler işlem öncesi resmi kaynaklardan teyit edilmelidir.";
