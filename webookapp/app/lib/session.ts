import { auth } from '@/auth'
import { prisma } from '@/app/lib/db'

export async function getActiveUniverseId(): Promise<number | null> {
  const session = await auth()
  if (!session?.user?.id) return null
  
  const user = await prisma.user.findUnique({
    where: { id: Number(session.user.id) },
    select: { activeUniverseId: true }
  })
  
  return user?.activeUniverseId ?? null
}