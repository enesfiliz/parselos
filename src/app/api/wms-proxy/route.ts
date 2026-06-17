import { NextResponse } from "next/server";

import {
  INTELLIGENCE_WMS_LAYERS,
  WMS_UPSTREAM_BASE,
  type WmsServiceId,
} from "@/lib/radar/wms-services";

const ALLOWED_SERVICES = new Set<WmsServiceId>(["amd", "abi"]);
const MAX_TILE_SIZE = 1024;
const MIN_TILE_SIZE = 64;
const WEB_MERCATOR_LIMIT = 20_037_508.342789244;

function isServiceId(value: string | null): value is WmsServiceId {
  return value !== null && ALLOWED_SERVICES.has(value as WmsServiceId);
}

function isAllowedLayer(service: WmsServiceId, layers: string) {
  return INTELLIGENCE_WMS_LAYERS.some(
    (layer) => layer.service === service && layer.layers === layers,
  );
}

function parseTileSize(value: string) {
  const size = Number(value);
  if (!Number.isInteger(size) || size < MIN_TILE_SIZE || size > MAX_TILE_SIZE) {
    return null;
  }
  return String(size);
}

function isValidWebMercatorBbox(parts: number[]) {
  const [minX, minY, maxX, maxY] = parts;
  return (
    minX < maxX &&
    minY < maxY &&
    parts.every(
      (value) =>
        Number.isFinite(value) &&
        value >= -WEB_MERCATOR_LIMIT &&
        value <= WEB_MERCATOR_LIMIT,
    )
  );
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

  if (!isAllowedLayer(service, layers)) {
    return NextResponse.json(
      { error: "Desteklenmeyen katman." },
      { status: 400 },
    );
  }

  const bboxParts = bbox.split(",").map((part) => Number(part.trim()));
  if (bboxParts.length !== 4 || !isValidWebMercatorBbox(bboxParts)) {
    return NextResponse.json({ error: "Geçersiz bbox." }, { status: 400 });
  }

  const tileWidth = parseTileSize(width);
  const tileHeight = parseTileSize(height);
  if (!tileWidth || !tileHeight) {
    return NextResponse.json(
      { error: "Geçersiz görüntü boyutu." },
      { status: 400 },
    );
  }

  const upstreamBase = WMS_UPSTREAM_BASE[service];
  const upstreamUrl = new URL(upstreamBase);
  upstreamUrl.searchParams.set("SERVICE", "WMS");
  upstreamUrl.searchParams.set("VERSION", "1.3.0");
  upstreamUrl.searchParams.set("REQUEST", "GetMap");
  upstreamUrl.searchParams.set("LAYERS", layers);
  upstreamUrl.searchParams.set("CRS", "EPSG:3857");
  upstreamUrl.searchParams.set("BBOX", bbox);
  upstreamUrl.searchParams.set("WIDTH", tileWidth);
  upstreamUrl.searchParams.set("HEIGHT", tileHeight);
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
