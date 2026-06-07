import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams.get("q")?.trim();

  if (!query || query.length < 2) {
    return NextResponse.json(
      { error: "En az 2 karakter girin." },
      { status: 400 },
    );
  }

  try {
    const params = new URLSearchParams({
      format: "json",
      q: query,
      countrycodes: "tr",
      limit: "6",
      addressdetails: "1",
    });

    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?${params.toString()}`,
      {
        headers: {
          "User-Agent": "ParselOS/1.0 (imar-radar geocoding)",
          Accept: "application/json",
        },
        next: { revalidate: 3600 },
      },
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: "Konum servisi yanıt vermedi." },
        { status: 502 },
      );
    }

    const results = (await response.json()) as {
      lat: string;
      lon: string;
      display_name: string;
      type?: string;
    }[];

    return NextResponse.json({
      data: results.map((item) => ({
        lat: Number(item.lat),
        lng: Number(item.lon),
        label: item.display_name,
        type: item.type ?? null,
      })),
    });
  } catch (error) {
    console.error("[GET /api/geocode]", error);
    return NextResponse.json(
      { error: "Konum aranırken bir hata oluştu." },
      { status: 500 },
    );
  }
}
