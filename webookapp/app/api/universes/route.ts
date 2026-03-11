import { prisma } from '@/app/lib/db'
import { auth } from '@/auth'
import { NextResponse } from 'next/server'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const universes = await prisma.universe.findMany({
    where: { userId: Number(session.user.id) },
    orderBy: { createdAt: 'asc' }
  })

  return NextResponse.json(universes)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { name } = await req.json()
  if (!name?.trim()) return NextResponse.json({ error: 'Name is required' }, { status: 400 })

  const count = await prisma.universe.count({
    where: { userId: Number(session.user.id) }
  })
  if (count >= 3) return NextResponse.json({ error: 'Maximum 3 universes allowed' }, { status: 400 })

  const universe = await prisma.universe.create({
    data: { name: name.trim(), userId: Number(session.user.id) }
  })

  // set as active if first universe
  if (count === 0) {
    await prisma.user.update({
      where: { id: Number(session.user.id) },
      data: { activeUniverseId: universe.id }
    })
  }

  return NextResponse.json(universe)
}