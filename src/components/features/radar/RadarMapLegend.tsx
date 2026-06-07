import { INTELLIGENCE_WMS_LAYERS } from "@/lib/radar/wms-services";

const LEGEND_COLORS: Record<string, { stroke: string; fill: string }> = {
  "fay-hatlari": { stroke: "#ef4444", fill: "transparent" },
  "sit-alani-sinirlari": { stroke: "#166534", fill: "#14532d" },
  "konut-imar": { stroke: "#f97316", fill: "#fde047" },
  "ticari-imar": { stroke: "#1d4ed8", fill: "#7dd3fc" },
  "tarim-alanlari": { stroke: "#166534", fill: "#86efac" },
};

export function RadarMapLegend() {
  return (
    <aside className="pointer-events-auto absolute right-4 bottom-4 z-10 origin-bottom-right scale-90">
      <div className="w-52 rounded-xl border border-border bg-parsel-panel/75 p-3 shadow-xl backdrop-blur-md">
        <p className="mb-2 text-[9px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          WMS Lejant
        </p>
        <ul className="space-y-2">
          {INTELLIGENCE_WMS_LAYERS.map((layer) => {
            const colors = LEGEND_COLORS[layer.id];
            const isLine = layer.id === "fay-hatlari";

            return (
              <li key={layer.id} className="flex items-center gap-2">
                <span
                  className="shrink-0 rounded-sm border"
                  style={{
                    width: isLine ? 20 : 12,
                    height: isLine ? 2 : 12,
                    backgroundColor: isLine ? colors.stroke : colors.fill,
                    borderColor: colors.stroke,
                    opacity: 0.9,
                  }}
                  aria-hidden
                />
                <span className="text-[11px] text-muted-foreground">{layer.label}</span>
              </li>
            );
          })}
        </ul>
      </div>
    </aside>
  );
}
