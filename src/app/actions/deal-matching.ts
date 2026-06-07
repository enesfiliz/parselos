"use server";

import { revalidatePath } from "next/cache";
import { runBuyerMatchForDeal } from "@/lib/deals/deal-matching";
import type { BuyerMatch } from "@/lib/types/deal";

const DEALS_PATH = "/deals";

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export async function matchDealBuyersAction(
  dealId: string,
): Promise<ActionResult<BuyerMatch | null>> {
  try {
    if (!dealId.trim()) {
      return { success: false, error: "Geçersiz fırsat kimliği." };
    }

    const buyerMatch = await runBuyerMatchForDeal(dealId);
    revalidatePath(DEALS_PATH);
    return { success: true, data: buyerMatch };
  } catch (error) {
    console.error("[matchDealBuyersAction]", error);
    return {
      success: false,
      error: "Müşteri eşleştirmesi yapılırken bir hata oluştu.",
    };
  }
}
