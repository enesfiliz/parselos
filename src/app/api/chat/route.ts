import { auth } from "@clerk/nextjs/server";
import { createGroq } from "@ai-sdk/groq";
import {
  convertToModelMessages,
  stepCountIs,
  streamText,
  tool,
  type UIMessage,
} from "ai";
import { z } from "zod";

import { getAgentForClerkUserId } from "@/lib/auth/agent";
import { isProFeaturePlan } from "@/lib/billing/plans";
import { getTenantPlanForClerkUser } from "@/lib/billing/tenant";
import {
  analyzePropertyForAgent,
  generateWhatsAppMessageForAgent,
  getPortfolioSummaryForAgent,
  getSubscriptionInfoForAgent,
  scheduleAppointmentForAgent,
} from "@/lib/copilot/copilot-tool-handlers";

export const maxDuration = 30;

const SYSTEM_PROMPT = `Sen Parsel AI'sın. Üst düzey gayrimenkul danışmanı Enes'in otonom sağ kolusun.
DİL KURALLARI (ÇOK ÖNEMLİ):
1. ANA DİLİN TÜRKÇE: C2 seviyesinde, kusursuz, akıcı ve doğal bir Türkçe kullanacaksın. Asla İngilizceden çevrilmiş gibi duran yapay ve robotik cümleler kurma.
2. EMLAK JARGONU: 'Yer gösterme, kapora, tapu dairesi, rayiç bedel, krediye uygunluk' gibi Türkiye emlak sektörünün yerel terimlerine tamamen hakimsin ve bunları doğal bir şekilde kullanırsın.
3. BAĞLAM VE KAVRAMA: Enes'in ne demek istediğini sadece kelime düzeyinde değil, niyet düzeyinde anla. Eğer kısa veya imalı bir şey söylerse, satır arasını oku. Zeki bir insan gibi tepki ver.

KARAKTER VE TAVIR:
- Asla 'Size nasıl yardımcı olabilirim?', 'Bir yapay zeka olarak...' gibi ezberlenmiş, ucuz müşteri hizmetleri kalıplarına girme.
- Enes sana gündelik bir şey sorarsa, kısa, zekice ve doğal bir Türkçe ile yanıt ver. (Örn: 'Bugün piyasa durgun, ne yapacağız?' sorusuna 'O zaman biz de bekleyen portföyleri elden geçiririz. Kimi arayalım?' gibi gerçekçi bir cevap ver).
- İşlem istenmediği sürece Tool (Araç) tetiklemeye kalkma. Sadece muhabbet et.
- Kod bloğu (\`\`\`) yazman veya teknik kodlar vermen KESİNLİKLE YASAKTIR.`;

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
});

function proFeatureBlocked(feature: "whatsapp" | "listing-analysis") {
  const label =
    feature === "whatsapp" ? "WhatsApp Otonomisi" : "AI İlan Analizi";

  return {
    success: false,
    requiresUpgrade: true,
    billingPath: "/billing",
    message: `${label} Pro veya Premium paket gerektirir.`,
    markdown: `${label} için paket yükseltmeniz gerekiyor. [Paketi Yükselt](/billing)`,
  };
}

function buildCopilotTools(agentId: string, includeProTools: boolean) {
  return {
    getPortfolioSummary: tool({
      description:
        "Kullanıcının mevcut aktif portföylerini ve bekleyen anlaşmalarını (deals) özetler.",
      inputSchema: z.object({
        userId: z
          .string()
          .optional()
          .describe("İsteğe bağlı kullanıcı kimliği. Boş bırakılırsa oturumdaki kullanıcı kullanılır."),
      }),
      execute: async () => getPortfolioSummaryForAgent(agentId),
    }),

    manageSubscription: tool({
      description:
        "Kullanıcının mevcut abonelik paketini ve limitlerini gösterir. Paket yükseltme talebinde güvenli fatura sayfasına yönlendirir; paketi doğrudan değiştirmez.",
      inputSchema: z.object({
        wantsUpgrade: z
          .boolean()
          .optional()
          .describe(
            "Kullanıcı paket yükseltmek veya plan değiştirmek istiyorsa true.",
          ),
      }),
      execute: async ({ wantsUpgrade }) =>
        getSubscriptionInfoForAgent(agentId, wantsUpgrade),
    }),

    generateWhatsAppMessage: tool({
      description:
        "Müşterilere gönderilmek üzere profesyonel, ikna edici ve kişiselleştirilmiş bir WhatsApp mesajı hazırlar ve tıklanabilir bir wa.me linki oluşturur.",
      inputSchema: z.object({
        customerName: z.string().min(1).describe("Müşteri adı soyadı."),
        topic: z
          .string()
          .min(1)
          .describe(
            "Mesaj konusu; örn. randevu hatırlatması, yeni portföy sunumu, fiyat indirimi.",
          ),
        urgency: z
          .enum(["Normal", "Acil"])
          .describe("Mesaj aciliyeti: Normal veya Acil."),
      }),
      execute: async ({ customerName, topic, urgency }) => {
        if (!includeProTools) {
          return proFeatureBlocked("whatsapp");
        }
        return generateWhatsAppMessageForAgent(customerName, topic, urgency);
      },
    }),

    analyzeProperty: tool({
      description:
        "Belirli bir mülkün özelliklerine göre satılabilirlik analizi, rekabetçi fiyat önerisi ve Sahibinden'e yapıştırılabilir ilan metni oluşturur.",
      inputSchema: z.object({
        location: z
          .string()
          .min(1)
          .describe("Konum; örn. Bilecik Söğüt veya Kocaeli Gölcük."),
        propertyType: z
          .string()
          .min(1)
          .describe("Mülk türü; örn. Arsa veya Daire."),
        size: z.number().positive().describe("Metrekare (m²)."),
        keyFeatures: z
          .array(z.string())
          .min(1)
          .describe("Öne çıkan özellikler listesi."),
      }),
      execute: async ({ location, propertyType, size, keyFeatures }) => {
        if (!includeProTools) {
          return proFeatureBlocked("listing-analysis");
        }
        return analyzePropertyForAgent(location, propertyType, size, keyFeatures);
      },
    }),

    scheduleAppointment: tool({
      description: "Takvime yeni bir yer gösterme veya tapu randevusu ekler.",
      inputSchema: z.object({
        customerName: z.string().min(1).describe("Müşteri adı soyadı."),
        date: z
          .string()
          .min(1)
          .describe("Randevu tarihi (YYYY-MM-DD veya GG.AA.YYYY)."),
        appointmentType: z
          .string()
          .min(1)
          .describe(
            "Randevu türü: showing (yer gösterme), deed (tapu) veya meeting (toplantı).",
          ),
      }),
      execute: async ({ customerName, date, appointmentType }) =>
        scheduleAppointmentForAgent(
          agentId,
          customerName,
          date,
          appointmentType,
        ),
    }),
  };
}

export async function POST(req: Request) {
  const { userId } = await auth();

  if (!userId) {
    return new Response(JSON.stringify({ error: "Oturum gerekli." }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!process.env.GROQ_API_KEY) {
    return new Response(JSON.stringify({ error: "GROQ_API_KEY tanımlı değil." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const agent = await getAgentForClerkUserId(userId);
  const agentId = agent?.id ?? userId;

  const body = (await req.json()) as { messages?: UIMessage[] };
  const messages = Array.isArray(body.messages) ? body.messages : [];

  if (messages.length === 0) {
    return new Response(JSON.stringify({ error: "Mesaj geçmişi boş." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { planType } = await getTenantPlanForClerkUser(userId);
  const tools = buildCopilotTools(agentId, isProFeaturePlan(planType));
  const modelMessages = await convertToModelMessages(messages, {
    tools,
    ignoreIncompleteToolCalls: true,
  });

  const result = streamText({
    model: groq("llama-3.3-70b-versatile"),
    system: SYSTEM_PROMPT,
    messages: modelMessages,
    tools,
    stopWhen: stepCountIs(5),
  });

  return result.toUIMessageStreamResponse();
}
