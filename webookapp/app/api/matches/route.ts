// app/api/matches/route.ts
import { prisma } from '@db'
import { auth } from '@/auth'
import { MatchType, Stipulation, FinishType, CardPlacement } from "@/app/lib/types"
import { NextResponse } from 'next/server'
import { getActiveUniverseId } from '@/app/lib/session'

export async function POST(req: Request) {
  try {
    const session = await auth()
    const universeId = getActiveUniverseId()
    if (!universeId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await req.formData()

    const showId = parseInt(formData.get('showId') as string)
    const participants = (formData.get('participants') as string)
      .split(',')
      .map(Number)
      .filter(Boolean)
    const title = (formData.get('title') as string) || undefined
    const matchType = (formData.get('matchType') as MatchType) || MatchType.SINGLES
    const stipulation = (formData.get('stipulation') as Stipulation) || undefined
    const championshipIdRaw = formData.get('championshipId') as string
    const championshipId = championshipIdRaw ? parseInt(championshipIdRaw) : undefined
    const placement = formData.get('placement') as CardPlacement ?? CardPlacement.UNDERCARD

    if (!showId || participants.length < 2) {
      return NextResponse.json(
        { error: 'Invalid showId or not enough participants' },
        { status: 400 }
      )
    }

    // Security check — show must belong to user's universe
    const show = await prisma.show.findUnique({ where: { id: showId } })
    if (!show || show.universeId !== universeId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const match = await prisma.match.create({
      data: {
        showId,
        title,
        matchType,
        stipulation: stipulation || null,
        championshipId: championshipId || null,
        finish: FinishType.UNFINISHED,
        placement,
        participants: {
          create: participants.map(characterId => ({ characterId }))
        }
      }
    })

    return NextResponse.json(match, { status: 201 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to create match' }, { status: 500 })
  }
}