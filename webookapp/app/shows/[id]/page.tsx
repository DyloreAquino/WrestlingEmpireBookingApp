// app/shows/[id]/page.tsx
import { prisma } from '@db'
import { auth } from '@/auth'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { FinishType } from "@/app/lib/types"
import ShowCard from './ShowCard'
import { getActiveUniverseId } from '@/app/lib/session'

async function getShow(id: string) {
  const showId = parseInt(id)
  if (isNaN(showId)) return null

  return prisma.show.findUnique({
    where: { id: showId },
    include: {
      matches: {
        include: {
          participants: { include: { character: true } },
          championship: true
        },
        orderBy: { id: 'asc' }
      }
    }
  })
}

async function getCharactersAndChampionships(universeId: number) {
  const [characters, championships] = await Promise.all([
    prisma.character.findMany({
      where: { universeId, injured: false },
      orderBy: { name: 'asc' },
      select: { id: true, name: true, alignment: true, division: true, gender: true }
    }),
    prisma.championship.findMany({
      where: { universeId },
      orderBy: { name: 'asc' },
      select: { id: true, name: true }
    })
  ])
  return { characters, championships }
}

export default async function ShowPage({
  params
}: {
  params: Promise<{ id: string }> | { id: string }
}) {
  const session = await auth()
  const universeId = await getActiveUniverseId()
  if (!universeId) redirect('/settings')

  
  const resolvedParams = await Promise.resolve(params)
  const id = resolvedParams.id

  const [show, { characters, championships }] = await Promise.all([
    getShow(id),
    getCharactersAndChampionships(universeId)
  ])

  if (!show) notFound()

  // Security check — make sure this show belongs to the user's universe
  if (show.universeId !== universeId) notFound()

  const hasUnfinished = show.matches.some(m => m.finish === FinishType.UNFINISHED)
  const hasMatches = show.matches.length > 0

  const bookedCharacterIds = [...new Set(
    show.matches.flatMap(m => m.participants.map(p => p.characterId))
  )]

  return (
    <div className="text-gray-100">
      <div className="p-6 max-w-5xl mx-auto">

        <div className="mb-4 text-sm text-gray-400">
          <Link href="/shows" className="hover:text-white transition">Shows</Link>
          <span className="mx-2">→</span>
          <span className="text-white">{show.title || `${show.month} Week ${show.week}`}</span>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className={`px-3 py-1 rounded text-sm font-medium ${
                show.type === 'PPV' ? 'bg-purple-900 text-purple-200' : 'bg-blue-900 text-blue-200'
              }`}>
                {show.type}
              </span>
              <span className="text-gray-400">{show.month} Week {show.week}</span>
            </div>
            <h1 className="text-3xl font-bold text-white">
              {show.title || `${show.type} - ${show.month} Week ${show.week}`}
            </h1>
          </div>

          {hasMatches && (
            <Link
              href={`/shows/${show.id}/simulate`}
              className={`px-6 py-3 rounded font-medium transition ${
                hasUnfinished
                  ? 'bg-purple-600 hover:bg-purple-700 text-white'
                  : 'bg-gray-700 text-gray-400 cursor-default pointer-events-none'
              }`}
            >
              {hasUnfinished ? 'Simulate Show' : '✓ All Simulated'}
            </Link>
          )}
        </div>

        <ShowCard
          showId={show.id}
          showType={show.type as 'TV' | 'PPV'}
          matches={show.matches.map(m => ({
            id: m.id,
            title: m.title,
            matchType: m.matchType,
            stipulation: m.stipulation ?? null,
            finish: m.finish,
            placement: m.placement,
            championship: m.championship ? { id: m.championship.id, name: m.championship.name } : null,
            participants: m.participants.map(p => ({
              id: p.id,
              characterId: p.characterId,
              isWinner: p.isWinner,
              character: { name: p.character.name }
            }))
          }))}
          characters={characters}
          championships={championships}
          bookedCharacterIds={bookedCharacterIds}
        />

      </div>
    </div>
  )
}