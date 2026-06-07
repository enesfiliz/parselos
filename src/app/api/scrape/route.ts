import { NextResponse } from "next/server";

import {
  isSupportedListingUrl,
  scrapeListingUrl,
} from "@/lib/scrape/listing-scraper";
import type { ScrapeRequestBody } from "@/lib/types/scrape";

function isValidHttpUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ScrapeRequestBody;
    const url = body.url?.trim();

    if (!url) {
      return NextResponse.json(
        { error: "url parametresi zorunludur." },
        { status: 400 },
      );
    }

    if (!isValidHttpUrl(url)) {
      return NextResponse.json(
        { error: "Geçerli bir http/https URL girin." },
        { status: 400 },
      );
    }

    if (!isSupportedListingUrl(url)) {
      return NextResponse.json(
        {
          error:
            "Desteklenen platformlar: Sahibinden, Emlakjet veya Hepsiemlak.",
        },
        { status: 400 },
      );
    }

    const result = await scrapeListingUrl(url);

    if (!result.title || !result.price) {
      return NextResponse.json(
        { error: "Veriler çekilemedi, linki kontrol edin." },
        { status: 422 },
      );
    }

    return NextResponse.json({
      title: result.title,
      price: result.price,
      location: result.location,
      m2: result.m2,
      url: result.url,
      source: result.source,
      mocked: result.mocked,
    });
  } catch (error) {
    console.error("[POST /api/scrape]", error);

    return NextResponse.json(
      { error: "Veriler çekilemedi, linki kontrol edin." },
      { status: 500 },
    );
  }
}
