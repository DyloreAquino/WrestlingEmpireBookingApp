// app/api/groups/route.ts
import { prisma } from '@db'
import { auth } from '@/auth'
import { NextResponse } from 'next/server'
import { getActiveUniverseId } from '@/app/lib/session'
export async function POST(req: Request) {
  try {
    const session = await auth()
    const universeId = await getActiveUniverseId()
    if (!universeId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { type, name, memberIds } = await req.json()

    if (!name || !memberIds || memberIds.length < 2) {
      return NextResponse.json({ error: 'Name and at least 2 members are required' }, { status: 400 })
    }

    const connectMembers = { connect: memberIds.map((id: number) => ({ id })) }

    if (type === 'faction') {
      const faction = await prisma.faction.create({
        data: { name, universeId, members: connectMembers }
      })
      return NextResponse.json(faction)
    } else if (type === 'tag_team') {
      const tagTeam = await prisma.tagTeam.create({
        data: { name, universeId, members: connectMembers }
      })
      return NextResponse.json(tagTeam)
    }

    return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
  } catch (e) {
    console.error('POST /api/groups error:', e)
    return NextResponse.json({ error: 'Failed to create group' }, { status: 500 })
  }
}