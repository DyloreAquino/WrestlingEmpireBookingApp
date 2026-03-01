// app/api/characters/[id]/route.ts
import { prisma } from '@db'
import { NextResponse } from 'next/server'

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  const { id } = await Promise.resolve(params)
  const characterId = parseInt(id)

  if (isNaN(characterId)) {
    return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })
  }

  try {
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
  const { id } = await Promise.resolve(params)
  const characterId = parseInt(id)

  if (isNaN(characterId)) {
    return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })
  }

  await prisma.character.delete({ where: { id: characterId } })

  return NextResponse.json({ success: true })
}