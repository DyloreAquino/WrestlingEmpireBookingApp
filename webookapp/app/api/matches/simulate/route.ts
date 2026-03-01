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

    // Handle championship change (use first winner)
    const match = await prisma.match.findUnique({
      where: { id: matchId }
    })

    if (match?.championshipId) {
      await prisma.titleReign.updateMany({
        where: { championshipId: match.championshipId, isCurrent: true },
        data: { isCurrent: false, endDate: new Date() }
      })

      await prisma.titleReign.create({
        data: {
          championshipId: match.championshipId,
          characterId: winnerIds[0],
          startDate: new Date(),
          isCurrent: true
        }
      })
    }

    revalidatePath(`/shows/${match?.showId}/simulate`)
    revalidatePath(`/shows/${match?.showId}`)
    for (const id of winnerIds) {
      revalidatePath(`/roster/${id}`)
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to simulate match' }, { status: 500 })
  }
}
