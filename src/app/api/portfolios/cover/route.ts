import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { ensureCurrentAgent } from "@/lib/auth/agent";
import {
  isAllowedCoverMime,
  storePortfolioCoverImage,
} from "@/lib/portfolios/upload-cover";

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Oturum gerekli." }, { status: 401 });
    }

    const agent = await ensureCurrentAgent();
    if (!agent) {
      return NextResponse.json({ error: "Danışman kaydı bulunamadı." }, { status: 401 });
    }

    const formData = await req.formData();
    const image = formData.get("image");

    if (!(image instanceof File) || image.size === 0) {
      return NextResponse.json(
        { error: "Geçerli bir görsel dosyası gönderilmedi." },
        { status: 400 },
      );
    }

    const mimeType = image.type || "image/jpeg";
    if (!isAllowedCoverMime(mimeType)) {
      return NextResponse.json(
        { error: "Desteklenmeyen format. JPG, PNG veya WEBP yükleyin." },
        { status: 400 },
      );
    }

    const buffer = Buffer.from(await image.arrayBuffer());
    const url = await storePortfolioCoverImage(
      { buffer, mimeType, size: image.size },
      agent.id,
    );

    return NextResponse.json({ url });
  } catch (error) {
    console.error("[POST /api/portfolios/cover]", error);
    const message =
      error instanceof Error
        ? error.message
        : "Görsel yüklenirken beklenmeyen bir hata oluştu.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
