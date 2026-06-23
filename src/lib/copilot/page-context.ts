import { getDashboardPageTitle } from "@/lib/dashboard-nav";

const PAGE_HINTS: Record<string, string> = {
  "/dashboard":
    "Komuta merkezi: pipeline, aktivite, FSBO ve imar sinyalleri. Özet ve hızlı aksiyon öner.",
  "/customers":
    "Müşteri listesi ve profiller. Takip tarihi, bütçe ve açık fırsatlar bağlamında konuş.",
  "/portfolios":
    "Yetkili portföyler. Eksik bilgi, fiyat ve yetki süresi konularında yardım et.",
  "/deals":
    "Fırsat pipeline ve kanban. Aşama riski, takip ve kapanış önerileri ver.",
  "/sesli-crm":
    "Sesli CRM kayıtları. Transkript özeti ve müşteri eşleştirme; doğrudan CRM mutation yapma.",
  "/calendar":
    "Ajanda ve saha randevuları. Randevu planlama öner; kesin kayıt için kullanıcıyı forma yönlendir.",
  "/fsbo-radar": "FSBO fırsat takibi. İlan değerlendirme ve fırsata çevirme öner.",
  "/imar-radari":
    "İmar ve parsel sinyalleri. Resmi teyit gerektiğini vurgula; kesin imar hükmü verme.",
  "/billing": "Abonelik ve paket bilgisi. Ödeme işlemi yapma; fatura sayfasına yönlendir.",
  "/account": "Hesap ve ofis ayarları. Kişisel bilgi ve güvenlik konularında rehberlik et.",
  "/ofis-operasyonu":
    "Broker ofis operasyonu: atamalar, danışman metrikleri ve geciken işler.",
};

export type ParselAiPageContext = {
  pathname: string;
  pageTitle: string;
  hint: string;
};

export function resolveParselAiPageContext(pathname: string): ParselAiPageContext {
  const pageTitle = getDashboardPageTitle(pathname);
  const hint =
    Object.entries(PAGE_HINTS).find(([prefix]) =>
      pathname === prefix || pathname.startsWith(`${prefix}/`),
    )?.[1] ??
    "Genel panel bağlamı. Yalnızca oturumdaki kullanıcının verilerine dayan.";

  return { pathname, pageTitle, hint };
}

export function buildParselAiPageContextSection(context: ParselAiPageContext): string {
  return `AKTİF SAYFA BAĞLAMI:
- Rota: ${context.pathname}
- Başlık: ${context.pageTitle}
- Odak: ${context.hint}`;
}
