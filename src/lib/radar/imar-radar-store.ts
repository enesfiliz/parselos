import type {
  ImarTrackingMeta,
  ManualImarRecord,
  ManualImarRecordInput,
} from "@/lib/radar/imar-radar-types";
import {
  IMAR_RADAR_STORAGE_SUFFIXES,
  imarRadarScopedKey,
} from "@/lib/radar/imar-radar-storage-scope";

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

export function loadManualImarRecords(userId: string | null | undefined): ManualImarRecord[] {
  const key = imarRadarScopedKey(userId, IMAR_RADAR_STORAGE_SUFFIXES.manualRecords);
  return readJson<ManualImarRecord[]>(key, []);
}

export function saveManualImarRecord(
  userId: string | null | undefined,
  input: ManualImarRecordInput,
): ManualImarRecord {
  const key = imarRadarScopedKey(userId, IMAR_RADAR_STORAGE_SUFFIXES.manualRecords);
  const now = new Date().toISOString();
  const record: ManualImarRecord = {
    ...input,
    id: `manual-${crypto.randomUUID()}`,
    createdAt: now,
    updatedAt: now,
  };

  const records = loadManualImarRecords(userId);
  writeJson(key, [record, ...records]);
  registerTrackedRegion(userId, input.region);
  return record;
}

export function updateManualImarRecord(
  userId: string | null | undefined,
  id: string,
  patch: Partial<ManualImarRecordInput>,
): ManualImarRecord | null {
  const key = imarRadarScopedKey(userId, IMAR_RADAR_STORAGE_SUFFIXES.manualRecords);
  const records = loadManualImarRecords(userId);
  const index = records.findIndex((item) => item.id === id);
  if (index < 0) return null;

  const updated: ManualImarRecord = {
    ...records[index]!,
    ...patch,
    updatedAt: new Date().toISOString(),
  };

  records[index] = updated;
  writeJson(key, records);
  if (patch.region) registerTrackedRegion(userId, patch.region);
  return updated;
}

export function deleteManualImarRecord(userId: string | null | undefined, id: string) {
  const key = imarRadarScopedKey(userId, IMAR_RADAR_STORAGE_SUFFIXES.manualRecords);
  const records = loadManualImarRecords(userId).filter((item) => item.id !== id);
  writeJson(key, records);
}

export function loadTrackingMeta(
  userId: string | null | undefined,
): Record<string, ImarTrackingMeta> {
  const key = imarRadarScopedKey(userId, IMAR_RADAR_STORAGE_SUFFIXES.trackingMeta);
  return readJson<Record<string, ImarTrackingMeta>>(key, {});
}

export function saveTrackingMeta(
  userId: string | null | undefined,
  id: string,
  meta: ImarTrackingMeta,
) {
  const key = imarRadarScopedKey(userId, IMAR_RADAR_STORAGE_SUFFIXES.trackingMeta);
  const all = loadTrackingMeta(userId);
  all[id] = meta;
  writeJson(key, all);
}

export function loadTrackingEnabled(userId: string | null | undefined): boolean {
  if (typeof window === "undefined") return true;
  const key = imarRadarScopedKey(userId, IMAR_RADAR_STORAGE_SUFFIXES.trackingEnabled);
  return localStorage.getItem(key) !== "0";
}

export function saveTrackingEnabled(userId: string | null | undefined, enabled: boolean) {
  if (typeof window === "undefined") return;
  const key = imarRadarScopedKey(userId, IMAR_RADAR_STORAGE_SUFFIXES.trackingEnabled);
  localStorage.setItem(key, enabled ? "1" : "0");
}

export function loadTrackedRegions(userId: string | null | undefined): string[] {
  const key = imarRadarScopedKey(userId, IMAR_RADAR_STORAGE_SUFFIXES.trackedRegions);
  return readJson<string[]>(key, []);
}

export function registerTrackedRegion(userId: string | null | undefined, region: string) {
  const key = imarRadarScopedKey(userId, IMAR_RADAR_STORAGE_SUFFIXES.trackedRegions);
  const trimmed = region.trim();
  if (!trimmed) return;
  const regions = loadTrackedRegions(userId);
  if (regions.includes(trimmed)) return;
  writeJson(key, [...regions, trimmed]);
}
