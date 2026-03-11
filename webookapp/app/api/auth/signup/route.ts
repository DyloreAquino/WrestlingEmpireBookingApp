import { prisma } from '@/app/lib/db'
import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json()

    if (!email || !password || password.length < 8) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 400 })
    }

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ error: 'Email already in use' }, { status: 400 })
    }

    const passwordHash = await bcrypt.hash(password, 12)
    await prisma.user.create({
      data: { email, passwordHash }
    })

    return NextResponse.json({ success: true, redirect: '/setup' })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}