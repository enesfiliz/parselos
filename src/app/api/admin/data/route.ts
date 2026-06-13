import { auth } from "@clerk/nextjs/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import {
  ADMIN_SESSION_COOKIE,
  verifyAdminSessionToken,
} from "@/lib/admin/admin-auth";
import {
  fetchLiveAdminMetrics,
  fetchLiveAdminSubscribers,
  fetchLiveRecentAgents,
} from "@/lib/admin/live-data";

async function assertAdminApiAccess() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Oturum gerekli." }, { status: 401 });
  }

  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  if (!verifyAdminSessionToken(token)) {
    return NextResponse.json({ error: "Admin oturumu gerekli." }, { status: 403 });
  }

  return null;
}

export async function GET(request: Request) {
  const denied = await assertAdminApiAccess();
  if (denied) return denied;

  const { searchParams } = new URL(request.url);
  const view = searchParams.get("view") ?? "subscribers";

  try {
    if (view === "metrics") {
      const [metrics, recent] = await Promise.all([
        fetchLiveAdminMetrics(),
        fetchLiveRecentAgents(),
      ]);
      return NextResponse.json({ metrics, recent });
    }

    const subscribers = await fetchLiveAdminSubscribers();
    return NextResponse.json({ subscribers });
  } catch (error) {
    console.error("[GET /api/admin/data]", error);
    return NextResponse.json(
      { error: "Admin verileri yüklenemedi." },
      { status: 500 },
    );
  }
}
