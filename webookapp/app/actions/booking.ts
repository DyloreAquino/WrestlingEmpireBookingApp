"use server";

import { BookingService } from "@/services/booking";
import { revalidatePath } from "next/cache";

export async function scheduleMatchAction(formData: any) {
  // 1. Extract data from your form/state
  const match = await BookingService.scheduleMatch({
    showId: formData.showId,
    matchType: formData.matchType,
    participantIds: formData.participantIds,
    championshipId: formData.championshipId,
  });

  // 2. Refresh the page data so the "Resolve" button appears
  revalidatePath("/booking"); 
  return match;
}

export async function resolveMatchAction(matchId: number, winnerIds: number[]) {
  // 1. Finalize the match
  await BookingService.resolveMatch({
    matchId,
    winnerIds,
    finish: "PINFALL", // You can pass this from UI
  });

  // 2. Refresh to show new champions or updated records
  revalidatePath("/booking");
  revalidatePath("/roster");
}