export type ImarRecordCategory =
  | "aski"
  | "plan-degisikligi"
  | "parsel"
  | "sanayi"
  | "duyuru"
  | "manuel";

export type ImarTrustStatus =
  | "verified"
  | "source_pending"
  | "manual"
  | "needs_official_check"
  | "source_unavailable";

export type ImarSourceHealth =
  | "healthy"
  | "unavailable"
  | "expired"
  | "unchecked";

export type ImarRecordOrigin = "api" | "manual";

export type ImarRadarApiAnnouncement = {
  id: string;
  title: string;
  summary: string;
  region: string;
  source: string;
  sourceUrl?: string;
  verified?: boolean;
  publishedAt: string;
  matchedKeywords: string[];
  isNew: boolean;
  category: "aski" | "plan-degisikligi" | "parsel" | "sanayi" | "diger";
  sourceHealth?: ImarSourceHealth;
  lastCheckedAt?: string;
};

export type ImarRadarApiAnalysis = {
  summary: string;
  totalMatches: number;
  newCount: number;
  categories: { id: string; label: string; count: number }[];
  trackedKeywords: string[];
  lastScannedAt: string;
  activityLevel: "dusuk" | "orta" | "yuksek";
  scannedSources?: number;
};

export type ImarRadarApiResponse = {
  region: string;
  keywords: string[];
  mode: "live" | "empty";
  announcements: ImarRadarApiAnnouncement[];
  analysis: ImarRadarApiAnalysis;
};

export type ManualImarRecordInput = {
  title: string;
  region: string;
  category: ImarRecordCategory;
  summary: string;
  sourceUrl?: string;
  tracking: boolean;
  verificationNote?: string;
};

export type ManualImarRecord = ManualImarRecordInput & {
  id: string;
  createdAt: string;
  updatedAt: string;
};

export type ImarTrackingMeta = {
  tracked: boolean;
  userVerified?: boolean;
  note?: string;
};

export type ImarRadarItem = {
  id: string;
  origin: ImarRecordOrigin;
  title: string;
  summary: string;
  region: string;
  source: string;
  sourceUrl?: string;
  category: ImarRecordCategory;
  trustStatus: ImarTrustStatus;
  publishedAt: string;
  matchedKeywords: string[];
  isNew: boolean;
  isTracked: boolean;
  verificationNote?: string;
  sourceHealth?: ImarSourceHealth;
  lastCheckedAt?: string;
};

export type ImarRadarFilters = {
  category: "all" | ImarRecordCategory;
  trust: "all" | ImarTrustStatus;
  trackedOnly: boolean;
  query: string;
};
