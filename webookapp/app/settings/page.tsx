// app/settings/page.tsx
import { prisma } from '@db'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import ResetPanel from './ResetPanel'
import { auth, signOut } from '@/auth'
import UniversePanel from './UniversePanel'

async function createUniverse(fd: FormData) {
  'use server'
  const session = await auth()
  if (!session?.user?.id) return
  const name = fd.get('name') as string
  if (!name?.trim()) return
  const count = await prisma.universe.count({ where: { userId: Number(session.user.id) } })
  if (count >= 3) return
  await prisma.universe.create({
    data: { name: name.trim(), userId: Number(session.user.id) }
  })
  revalidatePath('/settings')
  redirect('/settings')
}

async function switchUniverse(fd: FormData) {
  'use server'
  const session = await auth()
  if (!session?.user?.id) return
  const universeId = Number(fd.get('universeId'))
  // Security check — universe must belong to this user
  const universe = await prisma.universe.findUnique({ where: { id: universeId } })
  if (!universe || universe.userId !== Number(session.user.id)) return
  await prisma.user.update({
    where: { id: Number(session.user.id) },
    data: { activeUniverseId: universeId }
  })
  revalidatePath('/settings')
  redirect('/settings')
}

async function getUniverses(userId: number) {
  return prisma.universe.findMany({
    where: { userId },
    orderBy: { createdAt: 'asc' }
  })
}

async function getStats(universeId: number | null) {
  if (!universeId) return { wrestlers: 0, shows: 0, championships: 0, matches: 0, reigns: 0 }
  const [wrestlers, shows, championships, matches, reigns] = await Promise.all([
    prisma.character.count({ where: { universeId } }),
    prisma.show.count({ where: { universeId } }),
    prisma.championship.count({ where: { universeId } }),
    prisma.match.count({ where: { show: { universeId } } }),
    prisma.titleReign.count({ where: { championship: { universeId } } }),
  ])
  return { wrestlers, shows, championships, matches, reigns }
}

async function resetRoster() {
  'use server'
  const session = await auth()
  if (!session?.user?.activeUniverseId) return
  const universeId = session.user.activeUniverseId
  await prisma.character.deleteMany({ where: { universeId } })
  await prisma.faction.deleteMany({ where: { universeId } })
  await prisma.tagTeam.deleteMany({ where: { universeId } })
  await prisma.rivalry.deleteMany({ where: { universeId } })
  await prisma.friendship.deleteMany({ where: { universeId } })
  revalidatePath('/settings')
  redirect('/settings')
}

async function resetShows() {
  'use server'
  const session = await auth()
  if (!session?.user?.activeUniverseId) return
  const universeId = session.user.activeUniverseId
  await prisma.matchParticipant.deleteMany({ where: { match: { show: { universeId } } } })
  await prisma.matchInterference.deleteMany({ where: { match: { show: { universeId } } } })
  await prisma.match.deleteMany({ where: { show: { universeId } } })
  await prisma.titleReign.updateMany({ where: { championship: { universeId } }, data: { showId: null } })
  await prisma.show.deleteMany({ where: { universeId } })
  revalidatePath('/settings')
  redirect('/settings')
}

async function resetChampionships() {
  'use server'
  const session = await auth()
  if (!session?.user?.activeUniverseId) return
  const universeId = session.user.activeUniverseId
  await prisma.titleReign.deleteMany({ where: { championship: { universeId } } })
  await prisma.championship.deleteMany({ where: { universeId } })
  revalidatePath('/settings')
  redirect('/settings')
}

async function resetAll() {
  'use server'
  const session = await auth()
  if (!session?.user?.activeUniverseId) return
  const universeId = session.user.activeUniverseId
  await prisma.matchParticipant.deleteMany({ where: { match: { show: { universeId } } } })
  await prisma.matchInterference.deleteMany({ where: { match: { show: { universeId } } } })
  await prisma.match.deleteMany({ where: { show: { universeId } } })
  await prisma.titleReign.deleteMany({ where: { championship: { universeId } } })
  await prisma.show.deleteMany({ where: { universeId } })
  await prisma.championship.deleteMany({ where: { universeId } })
  await prisma.character.deleteMany({ where: { universeId } })
  await prisma.faction.deleteMany({ where: { universeId } })
  await prisma.tagTeam.deleteMany({ where: { universeId } })
  await prisma.rivalry.deleteMany({ where: { universeId } })
  await prisma.friendship.deleteMany({ where: { universeId } })
  revalidatePath('/settings')
  redirect('/settings')
}

export default async function SettingsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const userId = Number(session.user.id)
  const activeUniverseId = session.user.activeUniverseId

  const [stats, universes] = await Promise.all([
    getStats(activeUniverseId),
    getUniverses(userId)
  ])

  return (
    <div className="text-gray-100">
      <div className="p-6 max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-bold text-white">Settings</h1>
          <form action={async () => { 'use server'; await signOut({ redirectTo: '/login' }) }}>
            <button type="submit" className="px-4 py-2 bg-red-700 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition">
              Sign out
            </button>
          </form>
        </div>
        <p className="text-gray-400 mb-8">Manage your universe data.</p>

        <UniversePanel
          universes={universes}
          activeUniverseId={activeUniverseId}
          switchUniverse={switchUniverse}
          createUniverse={createUniverse}
        />

        <ResetPanel
          stats={stats}
          resetRoster={resetRoster}
          resetShows={resetShows}
          resetChampionships={resetChampionships}
          resetAll={resetAll}
        />
      </div>
    </div>
  )
}