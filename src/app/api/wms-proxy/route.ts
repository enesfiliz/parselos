import { NextResponse } from "next/server";

import {
  WMS_UPSTREAM_BASE,
  type WmsServiceId,
} from "@/lib/radar/wms-services";

const ALLOWED_SERVICES = new Set<WmsServiceId>(["amd", "abi"]);

function isServiceId(value: string | null): value is WmsServiceId {
  return value !== null && ALLOWED_SERVICES.has(value as WmsServiceId);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const service = searchParams.get("service");
  const layers = searchParams.get("layers");
  const bbox = searchParams.get("bbox");
  const width = searchParams.get("width") ?? "256";
  const height = searchParams.get("height") ?? "256";

  if (!isServiceId(service) || !layers || !bbox) {
    return NextResponse.json(
      { error: "service, layers ve bbox zorunludur." },
      { status: 400 },
    );
  }

  const bboxParts = bbox.split(",").map((part) => Number(part.trim()));
  if (bboxParts.length !== 4 || bboxParts.some((value) => Number.isNaN(value))) {
    return NextResponse.json({ error: "Geçersiz bbox." }, { status: 400 });
  }

  const upstreamBase = WMS_UPSTREAM_BASE[service];
  const upstreamUrl = new URL(upstreamBase);
  upstreamUrl.searchParams.set("SERVICE", "WMS");
  upstreamUrl.searchParams.set("VERSION", "1.3.0");
  upstreamUrl.searchParams.set("REQUEST", "GetMap");
  upstreamUrl.searchParams.set("LAYERS", layers);
  upstreamUrl.searchParams.set("CRS", "EPSG:3857");
  upstreamUrl.searchParams.set("BBOX", bbox);
  upstreamUrl.searchParams.set("WIDTH", width);
  upstreamUrl.searchParams.set("HEIGHT", height);
  upstreamUrl.searchParams.set("FORMAT", "image/png");
  upstreamUrl.searchParams.set("STYLES", "");
  upstreamUrl.searchParams.set("TRANSPARENT", "TRUE");

  try {
    const upstream = await fetch(upstreamUrl.toString(), {
      headers: {
        Accept: "image/png,image/*",
        "User-Agent": "ParselOS-WMS-Proxy/1.0 (+https://parselos.local)",
      },
      signal: AbortSignal.timeout(20000),
      next: { revalidate: 3600 },
    });

    if (!upstream.ok) {
      return NextResponse.json(
        { error: `WMS kaynağı yanıt vermedi (${upstream.status}).` },
        { status: 502 },
      );
    }

    const contentType = upstream.headers.get("content-type") ?? "";
    if (!contentType.includes("image/png")) {
      const body = await upstream.text();
      console.error("[wms-proxy] non-image response", body.slice(0, 300));
      return NextResponse.json(
        { error: "WMS katmanı görüntü döndürmedi." },
        { status: 502 },
      );
    }

    const image = await upstream.arrayBuffer();

    return new NextResponse(image, {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
      },
    });
  } catch (error) {
    console.error("[wms-proxy]", error);
    return NextResponse.json(
      { error: "WMS proxy isteği başarısız." },
      { status: 502 },
    );
  }
}
