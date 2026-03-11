// app/api/characters/[id]/route.ts
import { prisma } from '@db'
import { auth } from '@/auth'
import { NextResponse } from 'next/server'
import { getActiveUniverseId } from '@/app/lib/session'

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  const session = await auth()
  const activeUniverseId = await getActiveUniverseId()
  if (!activeUniverseId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await Promise.resolve(params)
  const characterId = parseInt(id)

  if (isNaN(characterId)) {
    return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })
  }

  try {
    // Security check — character must belong to user's universe
    const existing = await prisma.character.findUnique({ where: { id: characterId } })
    if (!existing || existing.universeId !== activeUniverseId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { name, role, gender, alignment, division, finisherName, injured } = body

    const character = await prisma.character.update({
      where: { id: characterId },
      data: { name, role, gender, alignment, division, finisherName, injured },
    })

    return NextResponse.json(character)
  } catch (e) {
    console.error('PATCH /api/characters error:', e)
    return NextResponse.json({ error: 'Update failed' }, { status: 500 })
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  const session = await auth()
  const activeUniverseId = await getActiveUniverseId()
  if (!activeUniverseId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await Promise.resolve(params)
  const characterId = parseInt(id)

  if (isNaN(characterId)) {
    return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })
  }

  // Security check — character must belong to user's universe
  const existing = await prisma.character.findUnique({ where: { id: characterId } })
  if (!existing || existing.universeId !== activeUniverseId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  await prisma.character.delete({ where: { id: characterId } })

  return NextResponse.json({ success: true })
}