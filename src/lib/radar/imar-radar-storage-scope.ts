const SCOPE_PREFIX = "parselos:radar";

export function imarRadarStorageScope(userId: string | null | undefined): string {
  const id = userId?.trim();
  if (!id) return "anonymous";
  return id;
}

export function imarRadarScopedKey(
  userId: string | null | undefined,
  suffix: string,
): string {
  return `${SCOPE_PREFIX}:${imarRadarStorageScope(userId)}:${suffix}`;
}

export const IMAR_RADAR_STORAGE_SUFFIXES = {
  config: "config",
  manualRecords: "manual-records",
  trackingMeta: "tracking-meta",
  trackingEnabled: "tracking-enabled",
  trackedRegions: "tracked-regions",
} as const;
