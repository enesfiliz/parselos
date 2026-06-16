import { auth } from "@clerk/nextjs/server";
import { createGroq } from "@ai-sdk/groq";

import {
  AI_PROVIDER_MISSING_MESSAGE,
  getGroqApiKey,
  isGroqConfigured,
  logGroqConfigDebug,
} from "@/lib/ai/groq-env";
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
import { buildParselAiSystemPrompt } from "@/lib/copilot/parsel-ai-persona";
import { normalizeParselAiProfile } from "@/lib/copilot/parsel-ai-profile";

export const runtime = "nodejs";
export const maxDuration = 30;

function createGroqProvider() {
  const apiKey = getGroqApiKey();
  if (!apiKey) return null;
  return createGroq({ apiKey });
}

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

  if (!isGroqConfigured()) {
    logGroqConfigDebug("POST /api/chat");
    return new Response(JSON.stringify({ error: AI_PROVIDER_MISSING_MESSAGE }), {
      status: 503,
      headers: { "Content-Type": "application/json" },
    });
  }

  const groq = createGroqProvider();
  if (!groq) {
    logGroqConfigDebug("POST /api/chat");
    return new Response(JSON.stringify({ error: AI_PROVIDER_MISSING_MESSAGE }), {
      status: 503,
      headers: { "Content-Type": "application/json" },
    });
  }

  const agent = await getAgentForClerkUserId(userId);
  const agentId = agent?.id ?? userId;

  const body = (await req.json()) as {
    messages?: UIMessage[];
    parselAiProfile?: unknown;
  };
  const messages = Array.isArray(body.messages) ? body.messages : [];
  const parselAiProfile = normalizeParselAiProfile(body.parselAiProfile);

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
    system: buildParselAiSystemPrompt(parselAiProfile),
    messages: modelMessages,
    tools,
    stopWhen: stepCountIs(5),
  });

  return result.toUIMessageStreamResponse();
}
