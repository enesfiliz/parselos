import { Radio } from "lucide-react";

import { IntelligenceRadarMapLoader } from "@/components/features/radar/IntelligenceRadarMapLoader";

export default function RadarPage() {
  return (
    <div className="space-y-5">
      <header>
        <div className="mb-2 flex items-center gap-2 text-parsel-gold">
          <Radio className="size-4" strokeWidth={1.5} />
          <span className="text-xs font-semibold uppercase tracking-[0.2em]">
            Enterprise Istihbarat
          </span>
        </div>
        <h1 className="font-outfit text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          İstihbarat Radarı
        </h1>
        <p className="mt-1 max-w-2xl text-sm font-normal text-muted-foreground">
          Mapbox dark-v11 üzerinde TUCBS ve MTA WMS katmanları — veri doğrudan
          devlet servislerinden proxy üzerinden yüklenir.
        </p>
      </header>

      <IntelligenceRadarMapLoader />
    </div>
  );
}
