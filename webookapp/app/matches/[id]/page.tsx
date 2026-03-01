// app/matches/[id]/page.tsx
import { prisma } from '@/app/lib/db'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { FinishType } from '@/generated/prisma/enums'

async function getMatch(id: string) {
  const match = await prisma.match.findUnique({
    where: { id: parseInt(id) },
    include: {
      show: true,
      championship: true,
      participants: {
        include: { character: true },
        orderBy: { isWinner: 'desc' }
      },
      interferences: {
        include: { character: true }
      }
    }
  })
  if (!match) notFound()
  return match
}

export default async function MatchPage({ params }: { params: Promise<{ id: string }> | { id: string } }) {
  const resolvedParams = await Promise.resolve(params)
  const match = await getMatch(resolvedParams.id)

  const winners = match.participants.filter(p => p.isWinner)
  const losers = match.participants.filter(p => !p.isWinner)
  const isSimulated = match.finish !== FinishType.UNFINISHED

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <div className="p-6 max-w-6xl mx-auto">

        {/* Breadcrumb */}
        <div className="mb-4 text-sm text-gray-400">
          <Link href="/shows" className="hover:text-white transition">Shows</Link>
          <span className="mx-2">→</span>
          <Link href={`/shows/${match.showId}`} className="hover:text-white transition">
            {match.show.title || `${match.show.month} Week ${match.show.week}`}
          </Link>
          <span className="mx-2">→</span>
          <span className="text-white">{match.title || `${match.matchType} Match`}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left Column */}
          <div className="lg:col-span-1 space-y-6">

            {/* Match Info Card */}
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
              <div className="flex flex-wrap gap-2 mb-4">
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
                {isSimulated ? (
                  <span className="bg-green-900 text-green-200 px-3 py-1 rounded text-sm font-medium">
                    {match.finish}
                  </span>
                ) : (
                  <span className="bg-gray-600 text-gray-300 px-3 py-1 rounded text-sm font-medium">
                    Not Simulated
                  </span>
                )}
              </div>

              <h1 className="text-2xl font-bold text-white mb-3">
                {match.title || `${match.matchType} Match`}
              </h1>

              <div className="space-y-2 text-sm text-gray-400">
                <div>
                  <span className="text-gray-500">Show: </span>
                  <Link href={`/shows/${match.showId}`} className="hover:text-white transition">
                    {match.show.title || `${match.show.type} — ${match.show.month} Week ${match.show.week}`}
                  </Link>
                </div>
                {match.championship && (
                  <div>
                    <span className="text-gray-500">Championship: </span>
                    <span className="text-yellow-300">{match.championship.name}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Match Stats Card */}
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
              <h2 className="text-lg font-bold text-white mb-4">Match Stats</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-gray-900 rounded">
                  <div className="text-2xl font-bold text-blue-400">{match.participants.length}</div>
                  <div className="text-xs text-gray-500 uppercase">Participants</div>
                </div>
                <div className="text-center p-3 bg-gray-900 rounded">
                  <div className="text-2xl font-bold text-purple-400">{match.interferences.length}</div>
                  <div className="text-xs text-gray-500 uppercase">Interferences</div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 space-y-3">
              <h2 className="text-lg font-bold text-white mb-2">Actions</h2>
              <Link
                href={`/shows/${match.showId}`}
                className="block w-full text-center bg-gray-700 hover:bg-gray-600 text-white px-4 py-3 rounded font-medium transition"
              >
                ← Back to Show
              </Link>
              {!isSimulated && (
                <Link
                  href={`/shows/${match.showId}/simulate`}
                  className="block w-full text-center bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded font-medium transition"
                >
                  Simulate Show
                </Link>
              )}
            </div>

          </div>

          {/* Right Column */}
          <div className="lg:col-span-2 space-y-6">

            {/* Winners */}
            <div className="bg-gray-800 rounded-lg border border-gray-700">
              <div className="p-4 border-b border-gray-700">
                <h2 className="text-lg font-bold text-white">
                  {isSimulated ? `Winner${winners.length !== 1 ? 's' : ''}` : 'Participants'}
                </h2>
              </div>
              <div className="p-4">
                {winners.length > 0 ? (
                  <div className="space-y-3">
                    {winners.map(p => (
                      <Link
                        key={p.id}
                        href={`/roster/${p.characterId}`}
                        className="flex items-center gap-4 p-3 bg-green-900/20 border border-green-800 rounded-lg hover:bg-green-900/30 transition"
                      >
                        <span className="text-2xl">🏆</span>
                        <div className="flex-1">
                          <div className="font-semibold text-white">{p.character.name}</div>
                          <div className="text-sm text-gray-400">
                            {p.character.alignment} • {p.character.division}
                          </div>
                        </div>
                        <span className="bg-green-900 text-green-200 px-3 py-1 rounded font-bold text-sm">WIN</span>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {match.participants.map(p => (
                      <Link
                        key={p.id}
                        href={`/roster/${p.characterId}`}
                        className="flex items-center gap-4 p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition"
                      >
                        <div className="flex-1">
                          <div className="font-semibold text-white">{p.character.name}</div>
                          <div className="text-sm text-gray-400">
                            {p.character.alignment} • {p.character.division}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Losers — only show after simulated */}
            {isSimulated && losers.length > 0 && (
              <div className="bg-gray-800 rounded-lg border border-gray-700">
                <div className="p-4 border-b border-gray-700">
                  <h2 className="text-lg font-bold text-white">Defeated</h2>
                </div>
                <div className="p-4 space-y-3">
                  {losers.map(p => (
                    <Link
                      key={p.id}
                      href={`/roster/${p.characterId}`}
                      className="flex items-center gap-4 p-3 bg-red-900/20 border border-red-900 rounded-lg hover:bg-red-900/30 transition"
                    >
                      <span className="text-2xl">❌</span>
                      <div className="flex-1">
                        <div className="font-semibold text-white">{p.character.name}</div>
                        <div className="text-sm text-gray-400">
                          {p.character.alignment} • {p.character.division}
                        </div>
                      </div>
                      <span className="bg-red-900 text-red-200 px-3 py-1 rounded font-bold text-sm">LOSS</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Interferences */}
            {match.interferences.length > 0 && (
              <div className="bg-gray-800 rounded-lg border border-gray-700">
                <div className="p-4 border-b border-gray-700">
                  <h2 className="text-lg font-bold text-white">Interferences</h2>
                </div>
                <div className="p-4 flex flex-wrap gap-3">
                  {match.interferences.map(i => (
                    <Link
                      key={i.id}
                      href={`/roster/${i.characterId}`}
                      className="flex items-center gap-2 bg-purple-900/30 border border-purple-800 text-purple-200 px-4 py-2 rounded-lg hover:bg-purple-900/50 transition"
                    >
                      <span>⚡</span>
                      {i.character.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  )
}
