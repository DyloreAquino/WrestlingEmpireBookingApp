import { prisma } from "@/lib/prisma";
import { ScheduleMatchInput, ResolveMatchInput } from "@/types";

export const BookingService = {
  /**
   * STEP 1: Schedule the match on the card.
   * Winners and Finish are UNFINISHED at this stage.
   */
  async scheduleMatch(data: ScheduleMatchInput) {
    return await prisma.match.create({
      data: {
        showId: data.showId,
        matchType: data.matchType,
        stipulation: data.stipulation as any,
        finish: "UNFINISHED", // Using your FinishType Enum
        championshipId: data.championshipId,
        participants: {
          create: data.participantIds.map((id) => ({
            characterId: id,
            isWinner: false,
          })),
        },
      },
    });
  },

  /**
   * STEP 2: "Simulate" or Record the result.
   * This updates participants, sets the finish, and handles titles.
   */
  async resolveMatch(data: ResolveMatchInput) {
    return await prisma.$transaction(async (tx) => {
      // 1. Update the Match Finish
      const match = await tx.match.update({
        where: { id: data.matchId },
        data: { 
          finish: data.finish as any,
          interferences: {
            create: data.interferenceIds?.map(id => ({ characterId: id }))
          }
        },
        include: { championship: true }
      });

      // 2. Set the Winners
      await tx.matchParticipant.updateMany({
        where: { 
          matchId: data.matchId,
          characterId: { in: data.winnerIds }
        },
        data: { isWinner: true }
      });

      // 3. Automated Title Change Logic
      if (match.championshipId && data.winnerIds.length > 0) {
        const currentReign = await tx.titleReign.findFirst({
          where: { championshipId: match.championshipId, isCurrent: true },
        });

        // Check if the current champion is NOT in the winner list
        if (currentReign && !data.winnerIds.includes(currentReign.characterId)) {
          // End old reign
          await tx.titleReign.update({
            where: { id: currentReign.id },
            data: { isCurrent: false, endDate: new Date() },
          });

          // Start new reign (using the first winner in the list)
          await tx.titleReign.create({
            data: {
              championshipId: match.championshipId,
              characterId: data.winnerIds[0],
              startDate: new Date(),
              isCurrent: true,
            },
          });
        }
      }

      return match;
    });
  },
};