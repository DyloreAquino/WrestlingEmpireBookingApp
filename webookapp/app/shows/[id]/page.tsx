// app/shows/[id]/page.tsx
import { prisma } from '@db'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { FinishType } from '@/generated/prisma/enums'
import MatchForm from './MatchForm'

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

async function getCharactersAndChampionships() {
  const [characters, championships] = await Promise.all([
    prisma.character.findMany({
      where: { injured: false },
      orderBy: { name: 'asc' },
      select: { id: true, name: true, alignment: true, division: true }
    }),
    prisma.championship.findMany({ 
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
  const resolvedParams = await Promise.resolve(params)
  const id = resolvedParams.id
  
  const [show, { characters, championships }] = await Promise.all([
    getShow(id),
    getCharactersAndChampionships()
  ])
  
  if (!show) notFound()

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <div className="p-6 max-w-6xl mx-auto">
        {/* Breadcrumb */}
        <div className="mb-4 text-sm text-gray-400">
          <Link href="/shows" className="hover:text-white transition">Shows</Link>
          <span className="mx-2">→</span>
          <span className="text-white">{show.title || `${show.month} Week ${show.week}`}</span>
        </div>

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className={`
                px-3 py-1 rounded text-sm font-medium
                ${show.type === 'PPV' ? 'bg-purple-900 text-purple-200' : 'bg-blue-900 text-blue-200'}
              `}>
                {show.type}
              </span>
              <span className="text-gray-400">{show.month} Week {show.week}</span>
            </div>
            <h1 className="text-3xl font-bold text-white">
              {show.title || `${show.type} - ${show.month} Week ${show.week}`}
            </h1>
          </div>
          {show.matches.some(m => m.finish === FinishType.UNFINISHED) && (
            <Link 
              href={`/shows/${show.id}/simulate`}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded font-medium transition"
            >
              Simulate Show
            </Link>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Matches List */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-xl font-bold text-white mb-4">Matches ({show.matches.length})</h2>
            
            {show.matches.length === 0 ? (
              <div className="text-center py-12 text-gray-500 bg-gray-800 rounded-lg border border-gray-700">
                No matches booked for this show yet.
              </div>
            ) : (
              show.matches.map((match, index) => (
                <div key={match.id} className="p-4 bg-gray-800 rounded-lg border border-gray-700">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-gray-500 font-mono">#{index + 1}</span>
                    <div className="flex flex-wrap gap-2">
                      <span className="bg-gray-700 text-gray-200 px-3 py-1 rounded text-sm font-medium">
                        {match.matchType}
                      </span>
                      {match.stipulation && (
                        <span className="bg-red-900 text-red-200 px-3 py-1 rounded text-sm font-medium">
                          {match.stipulation}
                        </span>
                      )}
                      {match.championship && (
                        <span className="bg-yellow-900 text-yellow-200 px-3 py-1 rounded text-sm font-medium">
                          🏆 {match.championship.name}
                        </span>
                      )}
                      {match.finish === FinishType.UNFINISHED ? (
                        <span className="bg-gray-600 text-gray-300 px-3 py-1 rounded text-sm font-medium">
                          Not Simulated
                        </span>
                      ) : (
                        <span className="bg-green-900 text-green-200 px-3 py-1 rounded text-sm font-medium">
                          {match.finish}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-white mb-2">{match.title}</h3>
                  
                  <div className="flex flex-wrap gap-2 mb-3">
                    {match.participants.map(p => (
                      <Link
                        key={p.id}
                        href={`/roster/${p.characterId}`}
                        className={`
                          px-3 py-2 rounded text-sm font-medium transition
                          ${p.isWinner 
                            ? 'bg-green-900 text-green-200 border border-green-700' 
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}
                        `}
                      >
                        {p.character.name}
                        {p.isWinner && ' 🏆'}
                      </Link>
                    ))}
                  </div>

                  <Link 
                    href={`/matches/${match.id}`}
                    className="text-blue-400 hover:text-blue-300 text-sm font-medium transition"
                  >
                    View Match Details →
                  </Link>
                </div>
              ))
            )}
          </div>

          {/* Add Match Form */}
          <div className="lg:col-span-1">
            <MatchForm 
              showId={show.id} 
              characters={characters} 
              championships={championships}
            />
          </div>

        </div>
      </div>
    </div>
  )
}