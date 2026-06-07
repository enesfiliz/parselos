import { verifyWebhook } from "@clerk/nextjs/webhooks";
import type { NextRequest } from "next/server";

import {
  assignOrphanRecordsToAgent,
  touchAgentActivity,
  upsertAgentFromClerk,
  type ClerkUserLike,
} from "@/lib/auth/agent";
import { getOrCreateTenantForAgent } from "@/lib/billing/tenant";

function isClerkUserPayload(data: unknown): data is ClerkUserLike {
  if (!data || typeof data !== "object") return false;
  return "id" in data && typeof (data as ClerkUserLike).id === "string";
}

export async function POST(request: NextRequest) {
  let event;

  try {
    event = await verifyWebhook(request);
  } catch (error) {
    console.error("[clerk-webhook] doğrulama başarısız:", error);
    return new Response("Webhook doğrulanamadı.", { status: 400 });
  }

  try {
    switch (event.type) {
      case "user.created":
      case "user.updated": {
        if (!isClerkUserPayload(event.data)) {
          break;
        }

        const agent = await upsertAgentFromClerk(event.data);
        await getOrCreateTenantForAgent(agent.id);

        if (event.type === "user.created") {
          await assignOrphanRecordsToAgent(agent.id);
        }
        break;
      }

      case "session.created": {
        const userId =
          typeof event.data === "object" &&
          event.data !== null &&
          "user_id" in event.data &&
          typeof event.data.user_id === "string"
            ? event.data.user_id
            : null;

        if (userId) {
          await touchAgentActivity(userId);
        }
        break;
      }

      default:
        break;
    }

    return new Response("OK", { status: 200 });
  } catch (error) {
    console.error("[clerk-webhook] işleme hatası:", event.type, error);
    return new Response("Webhook işlenemedi.", { status: 500 });
  }
}
