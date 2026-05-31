import { NextResponse } from "next/server";

import { formatTkgmAlan, queryTkgmParsel } from "@/lib/tkgm/client";

interface TkgmRequestBody {
  il?: string;
  ilce?: string;
  mahalle?: string;
  ada?: string;
  parsel?: string;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as TkgmRequestBody;

    const il = body.il?.trim() ?? "";
    const ilce = body.ilce?.trim() ?? "";
    const mahalle = body.mahalle?.trim() ?? "";
    const ada = body.ada?.trim() ?? "";
    const parsel = body.parsel?.trim() ?? "";

    if (!il || !ilce || !mahalle || !ada || !parsel) {
      return NextResponse.json({
        success: false,
        message:
          "TKGM sorgusu için il, ilçe, mahalle, ada ve parsel bilgisi zorunludur. Manuel giriş gerekli.",
      });
    }

    const result = await queryTkgmParsel({ il, ilce, mahalle, ada, parsel });

    if (!result) {
      return NextResponse.json({
        success: false,
        message:
          "TKGM servisi yanıt vermedi veya parsel bulunamadı. Manuel giriş gerekli.",
      });
    }

    return NextResponse.json({
      success: true,
      m2: result.m2,
      koordinatlar: result.koordinatlar,
      alan_metin: `${formatTkgmAlan(result.m2)} m²`,
      nitelik: result.nitelik ?? null,
    });
  } catch (error) {
    console.error("[POST /api/tkgm]", error);

    return NextResponse.json({
      success: false,
      message: "TKGM servisine erişilemedi. Manuel giriş gerekli.",
    });
  }
}
