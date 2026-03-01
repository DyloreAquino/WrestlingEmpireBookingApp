// app/api/matches/simulate/route.ts
import { prisma } from '@db'
import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'

export async function POST(req: Request) {
  try {
    const { matchId, winnerIds, finish } = await req.json()

    if (!matchId || !winnerIds?.length || !finish) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Update match finish
    await prisma.match.update({
      where: { id: matchId },
      data: { finish }
    })

    // Reset all participants
    await prisma.matchParticipant.updateMany({
      where: { matchId },
      data: { isWinner: false }
    })

    // Set winners
    await prisma.matchParticipant.updateMany({
      where: { matchId, characterId: { in: winnerIds } },
      data: { isWinner: true }
    })

    // Fetch match + show for title reign tracking
    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: { show: true }
    })

    if (match?.championshipId && match.show) {
      const { month, week, year } = match.show

      // End the current reign — stamp the end show date
      await prisma.titleReign.updateMany({
        where: { championshipId: match.championshipId, isCurrent: true },
        data: {
          isCurrent: false,
          endDate: new Date(),
          endMonth: month,
          endWeek: week,
          endYear: year,
        }
      })

      // Start new reign with full show context
      await prisma.titleReign.create({
        data: {
          championshipId: match.championshipId,
          characterId: winnerIds[0],
          showId: match.showId,
          startDate: new Date(),
          startMonth: month,
          startWeek: week,
          startYear: year,
          isCurrent: true,
        }
      })
    }

    revalidatePath(`/shows/${match?.showId}/simulate`)
    revalidatePath(`/shows/${match?.showId}`)
    revalidatePath(`/championships`)
    if (match?.championshipId) {
      revalidatePath(`/championships/${match.championshipId}`)
    }
    for (const id of winnerIds) {
      revalidatePath(`/roster/${id}`)
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to simulate match' }, { status: 500 })
  }
}