// app/api/groups/route.ts
import { prisma } from '@db'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { type, name, memberIds } = await req.json()

    if (!name || !memberIds || memberIds.length < 2) {
      return NextResponse.json({ error: 'Name and at least 2 members are required' }, { status: 400 })
    }

    const connectMembers = { connect: memberIds.map((id: number) => ({ id })) }

    if (type === 'faction') {
      const faction = await prisma.faction.create({
        data: { name, members: connectMembers }
      })
      return NextResponse.json(faction)
    } else if (type === 'tag_team') {
      const tagTeam = await prisma.tagTeam.create({
        data: { name, members: connectMembers }
      })
      return NextResponse.json(tagTeam)
    }

    return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
  } catch (e) {
    console.error('POST /api/groups error:', e)
    return NextResponse.json({ error: 'Failed to create group' }, { status: 500 })
  }
}