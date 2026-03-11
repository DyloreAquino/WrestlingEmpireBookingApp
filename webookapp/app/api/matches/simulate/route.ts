// app/api/matches/simulate/route.ts
import { prisma } from '@db'
import { auth } from '@/auth'
import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { getActiveUniverseId } from '@/app/lib/session'

export async function POST(req: Request) {
  try {
    const session = await auth()
    const universeId = await getActiveUniverseId()
    
    if (!universeId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    
    const { matchId, winnerIds, finish } = await req.json()

    if (!matchId || !winnerIds?.length || !finish) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Security check — match's show must belong to user's universe
    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: { show: true }
    })

    if (!match || match.show.universeId !== universeId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await prisma.match.update({
      where: { id: matchId },
      data: { finish }
    })

    await prisma.matchParticipant.updateMany({
      where: { matchId },
      data: { isWinner: false }
    })

    await prisma.matchParticipant.updateMany({
      where: { matchId, characterId: { in: winnerIds } },
      data: { isWinner: true }
    })

    if (match.championshipId && match.show) {
      const { month, week, year } = match.show

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

    revalidatePath(`/shows/${match.showId}/simulate`)
    revalidatePath(`/shows/${match.showId}`)
    revalidatePath(`/championships`)
    if (match.championshipId) {
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