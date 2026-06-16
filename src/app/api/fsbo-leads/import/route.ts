import { NextResponse } from "next/server";

import { requireCurrentAgent } from "@/lib/auth/agent";
import { FSBO_AUTO_IMPORT_DISABLED_MESSAGE } from "@/lib/fsbo/fsbo-tracking";

export async function POST() {
  try {
    await requireCurrentAgent();
  } catch (error) {
    if (error instanceof Error && error.message.includes("Oturum")) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    return NextResponse.json({ error: "Yetkisiz istek." }, { status: 401 });
  }

  return NextResponse.json(
    {
      success: false,
      disabled: true,
      imported: 0,
      failed: 0,
      error: FSBO_AUTO_IMPORT_DISABLED_MESSAGE,
      manualEndpoint: "/api/fsbo-leads/manual",
    },
    { status: 410 },
  );
}
