import "server-only";

import { randomUUID } from "crypto";

import { createSupabaseAdmin } from "@/lib/supabase";

const BUCKET = "portfolio-covers";
const MAX_INLINE_BYTES = 2 * 1024 * 1024;

const MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export function isAllowedCoverMime(mimeType: string) {
  return mimeType in MIME_TO_EXT;
}

export function coverExtensionFromMime(mimeType: string) {
  return MIME_TO_EXT[mimeType] ?? "jpg";
}

export async function storePortfolioCoverImage(
  file: { buffer: Buffer; mimeType: string; size: number },
  agentId: string,
): Promise<string> {
  if (!isAllowedCoverMime(file.mimeType)) {
    throw new Error("Desteklenmeyen format. JPG, PNG veya WEBP yükleyin.");
  }

  if (file.size > 5 * 1024 * 1024) {
    throw new Error("Görsel en fazla 5 MB olabilir.");
  }

  try {
    const supabase = createSupabaseAdmin();
    const extension = coverExtensionFromMime(file.mimeType);
    const objectPath = `${agentId}/${randomUUID()}.${extension}`;

    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(objectPath, file.buffer, {
        contentType: file.mimeType,
        upsert: false,
      });

    if (!error) {
      const { data } = supabase.storage.from(BUCKET).getPublicUrl(objectPath);
      return data.publicUrl;
    }

    console.warn("[storePortfolioCoverImage] Supabase upload failed:", error.message);
  } catch (error) {
    console.warn("[storePortfolioCoverImage] Supabase unavailable:", error);
  }

  if (file.size > MAX_INLINE_BYTES) {
    throw new Error(
      "Depolama servisi yapılandırılmamış. Görsel 2 MB altında olmalı veya Supabase bucket açılmalı.",
    );
  }

  const base64 = file.buffer.toString("base64");
  return `data:${file.mimeType};base64,${base64}`;
}
