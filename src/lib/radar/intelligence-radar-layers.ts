import {
  Building2,
  Home,
  Landmark,
  Mountain,
  Wheat,
  type LucideIcon,
} from "lucide-react";

import {
  DEFAULT_INTELLIGENCE_LAYERS,
  INTELLIGENCE_WMS_LAYERS,
  type IntelligenceLayerId,
  type IntelligenceLayerState,
} from "@/lib/radar/wms-services";

export { DEFAULT_INTELLIGENCE_LAYERS, INTELLIGENCE_WMS_LAYERS };
export type { IntelligenceLayerId, IntelligenceLayerState };

export type IntelligenceLayerToggle = {
  id: IntelligenceLayerId;
  label: string;
  icon: LucideIcon;
};

export const INTELLIGENCE_LAYER_TOGGLES: IntelligenceLayerToggle[] = [
  { id: "fay-hatlari", label: "Fay Hatları", icon: Mountain },
  { id: "sit-alani-sinirlari", label: "Sit Alanı Sınırları", icon: Landmark },
  { id: "konut-imar", label: "Konut İmar Alanları", icon: Home },
  { id: "ticari-imar", label: "Ticari İmar Alanları", icon: Building2 },
  { id: "tarim-alanlari", label: "Tarım Alanları", icon: Wheat },
];
