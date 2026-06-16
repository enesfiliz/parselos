import { NextResponse } from "next/server";

import { FSBO_AUTO_SYNC_DISABLED_MESSAGE } from "@/lib/fsbo/fsbo-tracking";

function isAuthorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) return false;

  const authHeader = request.headers.get("authorization");
  if (authHeader === `Bearer ${secret}`) return true;

  const headerSecret = request.headers.get("x-cron-secret");
  return headerSecret === secret;
}

function disabledResponse() {
  return NextResponse.json(
    {
      success: false,
      disabled: true,
      synced: 0,
      error: FSBO_AUTO_SYNC_DISABLED_MESSAGE,
      note: "Agent-scoped FSBO sync tasarlanana kadar kapalı.",
    },
    { status: 410 },
  );
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Yetkisiz istek." }, { status: 401 });
  }

  return disabledResponse();
}

export async function POST(request: Request) {
  return GET(request);
}
