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

async function getStats(userId: number, universeId: number | null) {
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
  // Delete characters + cascade clears matchParticipants, interferences, titleReigns
  await prisma.character.deleteMany()
  await prisma.faction.deleteMany()
  await prisma.tagTeam.deleteMany()
  await prisma.rivalry.deleteMany()
  await prisma.friendship.deleteMany()
  revalidatePath('/settings')
  redirect('/settings')
}

async function resetShows() {
  'use server'
  // Delete matches first (FK), then shows
  await prisma.matchParticipant.deleteMany()
  await prisma.matchInterference.deleteMany()
  await prisma.match.deleteMany()
  await prisma.show.deleteMany()
  // Also clear reign show links
  await prisma.titleReign.updateMany({ data: { showId: null } })
  revalidatePath('/settings')
  redirect('/settings')
}

async function resetChampionships() {
  'use server'
  await prisma.titleReign.deleteMany()
  await prisma.championship.deleteMany()
  revalidatePath('/settings')
  redirect('/settings')
}

async function resetAll() {
  'use server'
  await prisma.matchParticipant.deleteMany()
  await prisma.matchInterference.deleteMany()
  await prisma.match.deleteMany()
  await prisma.titleReign.deleteMany()
  await prisma.show.deleteMany()
  await prisma.championship.deleteMany()
  await prisma.character.deleteMany()
  await prisma.faction.deleteMany()
  await prisma.tagTeam.deleteMany()
  await prisma.rivalry.deleteMany()
  await prisma.friendship.deleteMany()
  revalidatePath('/settings')
  redirect('/settings')
}

export default async function SettingsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')
  
  const userId = Number(session.user.id)
  const activeUniverseId = session.user.activeUniverseId

  const [stats, universes] = await Promise.all([
    getStats(userId, activeUniverseId),  // we'll update getStats too
    getUniverses(userId)
  ])

  return (
    <div className="text-gray-100">
      <div className="p-6 max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
        <p className="text-gray-400 mb-8">Manage your universe data.</p>

        <ResetPanel
          stats={stats}
          resetRoster={resetRoster}
          resetShows={resetShows}
          resetChampionships={resetChampionships}
          resetAll={resetAll}
        />

        <UniversePanel
          universes={universes}
          activeUniverseId={activeUniverseId}
          switchUniverse={switchUniverse}
          createUniverse={createUniverse}
        />

        <form action={async () => { 'use server'; await signOut({ redirectTo: '/login' }) }}>
          <button type="submit" className="px-4 py-2 bg-red-700 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition">
            Sign out
          </button>
        </form>
      </div>
    </div>
  )
}