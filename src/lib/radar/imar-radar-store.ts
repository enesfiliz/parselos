import type {
  ImarTrackingMeta,
  ManualImarRecord,
  ManualImarRecordInput,
} from "@/lib/radar/imar-radar-types";

const MANUAL_RECORDS_KEY = "parselos-imar-radar-manual-records";
const TRACKING_META_KEY = "parselos-imar-radar-tracking-meta";
const TRACKING_ENABLED_KEY = "parselos-imar-radar-tracking-enabled";
const TRACKED_REGIONS_KEY = "parselos-imar-radar-tracked-regions";

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
}

export function loadManualImarRecords(): ManualImarRecord[] {
  return readJson<ManualImarRecord[]>(MANUAL_RECORDS_KEY, []);
}

export function saveManualImarRecord(input: ManualImarRecordInput): ManualImarRecord {
  const now = new Date().toISOString();
  const record: ManualImarRecord = {
    ...input,
    id: `manual-${crypto.randomUUID()}`,
    createdAt: now,
    updatedAt: now,
  };

  const records = loadManualImarRecords();
  writeJson(MANUAL_RECORDS_KEY, [record, ...records]);
  registerTrackedRegion(input.region);
  return record;
}

export function updateManualImarRecord(
  id: string,
  patch: Partial<ManualImarRecordInput>,
): ManualImarRecord | null {
  const records = loadManualImarRecords();
  const index = records.findIndex((item) => item.id === id);
  if (index < 0) return null;

  const updated: ManualImarRecord = {
    ...records[index]!,
    ...patch,
    updatedAt: new Date().toISOString(),
  };

  records[index] = updated;
  writeJson(MANUAL_RECORDS_KEY, records);
  if (patch.region) registerTrackedRegion(patch.region);
  return updated;
}

export function deleteManualImarRecord(id: string) {
  const records = loadManualImarRecords().filter((item) => item.id !== id);
  writeJson(MANUAL_RECORDS_KEY, records);
}

export function loadTrackingMeta(): Record<string, ImarTrackingMeta> {
  return readJson<Record<string, ImarTrackingMeta>>(TRACKING_META_KEY, {});
}

export function saveTrackingMeta(id: string, meta: ImarTrackingMeta) {
  const all = loadTrackingMeta();
  all[id] = meta;
  writeJson(TRACKING_META_KEY, all);
}

export function loadTrackingEnabled(): boolean {
  if (typeof window === "undefined") return true;
  return localStorage.getItem(TRACKING_ENABLED_KEY) !== "0";
}

export function saveTrackingEnabled(enabled: boolean) {
  if (typeof window === "undefined") return;
  localStorage.setItem(TRACKING_ENABLED_KEY, enabled ? "1" : "0");
}

export function loadTrackedRegions(): string[] {
  return readJson<string[]>(TRACKED_REGIONS_KEY, []);
}

export function registerTrackedRegion(region: string) {
  const trimmed = region.trim();
  if (!trimmed) return;
  const regions = loadTrackedRegions();
  if (regions.includes(trimmed)) return;
  writeJson(TRACKED_REGIONS_KEY, [...regions, trimmed]);
}
