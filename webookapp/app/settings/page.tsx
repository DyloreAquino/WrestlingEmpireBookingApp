// app/settings/page.tsx
import { prisma } from '@db'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import ResetPanel from './ResetPanel'
export const dynamic = 'force-dynamic'

async function getStats() {
  const [wrestlers, shows, championships, matches, reigns] = await Promise.all([
    prisma.character.count(),
    prisma.show.count(),
    prisma.championship.count(),
    prisma.match.count(),
    prisma.titleReign.count(),
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
  const stats = await getStats()

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
      </div>
    </div>
  )
}