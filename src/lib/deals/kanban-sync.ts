import {
  applyOptimisticDealMove,
  type DealCardData,
  type DealStageId,
} from "@/lib/types/deal";

/** Align save payload with the live board stage (avoids drag vs debounced-save races). */
export function dealPayloadWithLatestStage(
  deal: DealCardData,
  liveDeals: DealCardData[],
): DealCardData {
  const live = liveDeals.find((item) => item.id === deal.id);
  if (!live || live.stage === deal.stage) return deal;
  return { ...deal, stage: live.stage };
}

/** Keep optimistic stage when a stale save response arrives after drag. */
export function mergeSavedDealWithLocalStage(
  live: DealCardData,
  saved: DealCardData,
): DealCardData {
  if (live.stage === saved.stage) return saved;
  return { ...saved, stage: live.stage };
}

export type StageMutationMeta = {
  version: number;
  targetStage: DealStageId;
  previousStage: DealStageId;
};

/** Start a stage mutation; returns monotonically increasing version for this deal. */
export function beginStageMutation(
  versions: Record<string, number>,
  metas: Record<string, StageMutationMeta>,
  dealId: string,
  previousStage: DealStageId,
  targetStage: DealStageId,
): number {
  const version = (versions[dealId] ?? 0) + 1;
  versions[dealId] = version;
  metas[dealId] = { version, targetStage, previousStage };
  return version;
}

export function isLatestStageMutation(
  versions: Record<string, number>,
  dealId: string,
  version: number,
): boolean {
  return versions[dealId] === version;
}

export function hasInFlightStageMutations(
  metas: Record<string, StageMutationMeta>,
): boolean {
  return Object.keys(metas).length > 0;
}

/**
 * Failure rollback only when this request is still the latest mutation and the
 * card remains on this request's optimistic target stage.
 */
export function resolveStageMutationFailure(
  versions: Record<string, number>,
  metas: Record<string, StageMutationMeta>,
  dealId: string,
  version: number,
  liveDeals: DealCardData[],
): DealStageId | null {
  if (!isLatestStageMutation(versions, dealId, version)) {
    return null;
  }

  const meta = metas[dealId];
  if (!meta || meta.version !== version) {
    return null;
  }

  const live = liveDeals.find((deal) => deal.id === dealId);
  if (!live || live.stage !== meta.targetStage) {
    return null;
  }

  return meta.previousStage;
}

/** Apply success payload only for the latest mutation; preserve live stage if ahead. */
export function resolveStageMutationSuccess(
  versions: Record<string, number>,
  dealId: string,
  version: number,
  liveDeals: DealCardData[],
  saved: DealCardData,
): DealCardData | null {
  if (!isLatestStageMutation(versions, dealId, version)) {
    return null;
  }

  const live = liveDeals.find((deal) => deal.id === dealId);
  if (!live) {
    return saved;
  }

  return mergeSavedDealWithLocalStage(live, saved);
}

export function finishStageMutation(
  metas: Record<string, StageMutationMeta>,
  dealId: string,
  version: number,
): void {
  const meta = metas[dealId];
  if (meta?.version === version) {
    delete metas[dealId];
  }
}

export function applyStageRollback(
  liveDeals: DealCardData[],
  dealId: string,
  rollbackStage: DealStageId,
): DealCardData[] {
  return applyOptimisticDealMove(liveDeals, { dealId, stage: rollbackStage });
}

export function applyStageSuccessMerge(
  liveDeals: DealCardData[],
  merged: DealCardData,
): DealCardData[] {
  return liveDeals.map((deal) => (deal.id === merged.id ? merged : deal));
}
