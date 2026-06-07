export type QuickPrompt = {
  label: string;
  prompt: string;
};

export const COPILOT_QUICK_PROMPTS: QuickPrompt[] = [
  {
    label: "İlan metni",
    prompt: "Oluklu bölgesinde 500 m² arsa için satılık ilan metni yaz.",
  },
  {
    label: "Portföy özeti",
    prompt: "Aktif yetkili portföylerimin kısa özetini çıkar.",
  },
  {
    label: "Randevular",
    prompt: "Bugünkü tapu randevularım neler?",
  },
];
