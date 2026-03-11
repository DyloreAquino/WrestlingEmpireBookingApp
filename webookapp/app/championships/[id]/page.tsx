// app/championships/[id]/page.tsx
import { prisma } from '@db'
import { auth } from '@/auth'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import AssignChampionModal from './AssignChampionModal'
import { getActiveUniverseId } from '@/app/lib/session'

const MONTH_LABELS: Record<string, string> = {
  JAN: 'Jan', FEB: 'Feb', MAR: 'Mar', APR: 'Apr',
  MAY: 'May', JUN: 'Jun', JUL: 'Jul', AUG: 'Aug',
  SEP: 'Sep', OCT: 'Oct', NOV: 'Nov', DEC: 'Dec'
}
const DIVISION_LABELS: Record<string, string> = {
  TOP_CARD: 'Top Card', MID_CARD: 'Mid Card', UNDER_CARD: 'Under Card', TAG: 'Tag',
}
const DIVISION_COLORS: Record<string, string> = {
  TOP_CARD:   'bg-yellow-900 text-yellow-200',
  MID_CARD:   'bg-blue-900 text-blue-200',
  UNDER_CARD: 'bg-gray-700 text-gray-300',
  TAG:        'bg-green-900 text-green-200',
}
const GENDER_COLORS: Record<string, string> = {
  MALE:   'bg-blue-900 text-blue-200',
  FEMALE: 'bg-pink-900 text-pink-200',
  ALL:    'bg-purple-900 text-purple-200',
}
const FINISH_COLORS: Record<string, string> = {
  PINFALL:      'bg-green-900 text-green-200',
  SUBMISSION:   'bg-green-900 text-green-200',
  COUNTOUT:     'bg-yellow-900 text-yellow-200',
  DQ:           'bg-red-900 text-red-200',
  INTERFERENCE: 'bg-purple-900 text-purple-200',
  UNIQUE:       'bg-blue-900 text-blue-200',
  UNFINISHED:   'bg-gray-600 text-gray-300',
}

function showLabel(show: { title: string | null; type: string; month: string; week: number; year: number }) {
  const base = show.title || `${show.type} - ${MONTH_LABELS[show.month]} Wk${show.week}`
  return `${base} (Year ${show.year})`
}

function reignDuration(
  startMonth: string | null, startWeek: number | null, startYear: number | null,
  endMonth: string | null,   endWeek: number | null,   endYear: number | null,
  isCurrent: boolean
) {
  if (!startMonth || !startWeek || !startYear) return null
  const start = `${MONTH_LABELS[startMonth]} Wk${startWeek}, Yr${startYear}`
  if (isCurrent) return `${start} — Present`
  if (!endMonth || !endWeek || !endYear) return start
  return `${start} — ${MONTH_LABELS[endMonth]} Wk${endWeek}, Yr${endYear}`
}

async function getChampionship(id: string) {
  const champId = parseInt(id)
  if (isNaN(champId)) return null
  return prisma.championship.findUnique({
    where: { id: champId },
    include: {
      reigns: {
        orderBy: { startDate: 'desc' },
        include: { character: true, show: true }
      },
      matches: {
        orderBy: [
          { show: { year: 'desc' } },
          { show: { month: 'desc' } },
          { show: { week: 'desc' } },
        ],
        include: {
          show: true,
          participants: { include: { character: true } }
        }
      }
    }
  })
}

export default async function ChampionshipPage({
  params
}: {
  params: Promise<{ id: string }> | { id: string }
}) {
  const session = await auth()
  const universeId = await getActiveUniverseId()
  if (!universeId) redirect('/settings')

  
  const { id } = await Promise.resolve(params)
  const championship = await getChampionship(id)
  if (!championship) notFound()

  // Security check
  if (championship.universeId !== universeId) notFound()

  const characters = await prisma.character.findMany({
    where: {
      universeId,
      role: 'WRESTLER',
      ...(championship.gender !== 'ALL' ? { gender: championship.gender as any } : {}),
    },
    orderBy: { name: 'asc' },
    select: { id: true, name: true, division: true }
  })

  const currentReign = championship.reigns.find(r => r.isCurrent)
  const pastReigns   = championship.reigns.filter(r => !r.isCurrent)

  async function assignChampion(formData: FormData) {
    'use server'
    const session = await auth()
    const activeUniverseId = await getActiveUniverseId()
    if (!activeUniverseId) return

    const championshipId = parseInt(formData.get('championshipId') as string)
    const characterId    = parseInt(formData.get('characterId') as string)
    const startMonth     = formData.get('startMonth') as string
    const startWeek      = parseInt(formData.get('startWeek') as string)
    const startYear      = parseInt(formData.get('startYear') as string)

    // Security check
    const champ = await prisma.championship.findUnique({ where: { id: championshipId } })
    if (!champ || champ.universeId !== activeUniverseId) return

    const existing = await prisma.titleReign.findFirst({
      where: { championshipId, isCurrent: true }
    })
    if (existing) {
      await prisma.titleReign.update({
        where: { id: existing.id },
        data: {
          isCurrent: false,
          endMonth:  startMonth as any,
          endWeek:   startWeek,
          endYear:   startYear,
          endDate:   new Date(),
        }
      })
    }

    await prisma.titleReign.create({
      data: {
        championshipId,
        characterId,
        startMonth: startMonth as any,
        startWeek,
        startYear,
        startDate: new Date(),
        isCurrent: true,
      }
    })

    revalidatePath(`/championships/${championshipId}`)
  }

  return (
    <div className="text-gray-100">
      <div className="p-6 max-w-5xl mx-auto">

        <div className="mb-4 text-sm text-gray-400">
          <Link href="/championships" className="hover:text-white transition">Championships</Link>
          <span className="mx-2">→</span>
          <span className="text-white">{championship.name}</span>
        </div>

        <div className="flex items-start justify-between gap-5 mb-8">
          <div className="flex items-start gap-5">
            <span className="text-5xl">🏆</span>
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">{championship.name}</h1>
              <div className="flex gap-2">
                <span className={`text-xs px-2 py-1 rounded font-medium ${DIVISION_COLORS[championship.division]}`}>
                  {DIVISION_LABELS[championship.division]}
                </span>
                <span className={`text-xs px-2 py-1 rounded font-medium ${GENDER_COLORS[championship.gender]}`}>
                  {championship.gender}
                </span>
              </div>
            </div>
          </div>
          <AssignChampionModal
            championshipId={championship.id}
            characters={characters}
            assignChampion={assignChampion}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          <div className="lg:col-span-2 space-y-6">
            <section>
              <h2 className="text-lg font-bold text-white mb-3">Current Champion</h2>
              {currentReign ? (
                <div className="bg-yellow-900/20 border border-yellow-700 rounded-lg p-4 flex items-center gap-4">
                  <span className="text-3xl">👑</span>
                  <div className="flex-1">
                    <Link href={`/roster/${currentReign.characterId}`}
                      className="text-xl font-bold text-yellow-300 hover:text-yellow-200 transition"
                    >
                      {currentReign.character.name}
                    </Link>
                    {currentReign.startMonth && (
                      <div className="text-sm text-yellow-400/70 mt-0.5">
                        Champion since {MONTH_LABELS[currentReign.startMonth]} Wk{currentReign.startWeek}, Year {currentReign.startYear}
                        {currentReign.show && (
                          <> · <Link href={`/shows/${currentReign.show.id}`} className="hover:text-yellow-300 transition">
                            {showLabel(currentReign.show)}
                          </Link></>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 text-gray-500 italic">
                  Vacant — no current champion
                </div>
              )}
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-3">
                Reign History <span className="text-gray-500 font-normal text-sm">({championship.reigns.length} total)</span>
              </h2>
              {pastReigns.length === 0 ? (
                <div className="text-gray-500 text-sm bg-gray-800 rounded-lg border border-gray-700 p-6 text-center">
                  No previous reigns.
                </div>
              ) : (
                <div className="space-y-2">
                  {pastReigns.map((reign, index) => (
                    <div key={reign.id} className="bg-gray-800 border border-gray-700 rounded-lg p-4 flex items-center gap-4">
                      <span className="text-gray-600 font-mono text-sm w-6 text-right shrink-0">
                        {pastReigns.length - index}
                      </span>
                      <div className="flex-1">
                        <Link href={`/roster/${reign.characterId}`}
                          className="font-semibold text-white hover:text-blue-300 transition"
                        >
                          {reign.character.name}
                        </Link>
                        {reign.startMonth && (
                          <div className="text-xs text-gray-400 mt-0.5">
                            {reignDuration(
                              reign.startMonth, reign.startWeek, reign.startYear,
                              reign.endMonth,   reign.endWeek,   reign.endYear,
                              reign.isCurrent
                            )}
                          </div>
                        )}
                        {reign.show && (
                          <div className="text-xs text-gray-500 mt-0.5">
                            Won at <Link href={`/shows/${reign.show.id}`} className="hover:text-white transition">
                              {showLabel(reign.show)}
                            </Link>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          <div className="lg:col-span-1">
            <h2 className="text-lg font-bold text-white mb-3">
              Title Matches <span className="text-gray-500 font-normal text-sm">({championship.matches.length})</span>
            </h2>
            {championship.matches.length === 0 ? (
              <div className="text-gray-500 text-sm bg-gray-800 rounded-lg border border-gray-700 p-4 text-center">
                No title matches yet.
              </div>
            ) : (
              <div className="space-y-2">
                {championship.matches.map(match => (
                  <Link key={match.id} href={`/matches/${match.id}`}
                    className="block bg-gray-800 border border-gray-700 hover:border-gray-600 rounded-lg p-3 transition"
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="text-xs text-gray-400">
                        {MONTH_LABELS[match.show.month]} Wk{match.show.week}, Yr{match.show.year}
                      </span>
                      <span className={`text-xs px-1.5 py-0.5 rounded ${FINISH_COLORS[match.finish] ?? 'bg-gray-600 text-gray-300'}`}>
                        {match.finish === 'UNFINISHED' ? 'Pending' : match.finish}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mb-1.5 truncate">
                      {match.show.title || `${match.show.type} - ${MONTH_LABELS[match.show.month]} Wk${match.show.week}`}
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {match.participants.map(p => (
                        <span key={p.id} className={`text-xs px-1.5 py-0.5 rounded ${
                          p.isWinner ? 'bg-green-900 text-green-200' : 'bg-gray-700 text-gray-400'
                        }`}>
                          {p.character.name}{p.isWinner ? ' 🏆' : ''}
                        </span>
                      ))}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}