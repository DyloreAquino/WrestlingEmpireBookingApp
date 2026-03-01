// app/matches/[id]/page.tsx
import { prisma } from '@/app/lib/db'
import Link from 'next/link'
import { notFound } from 'next/navigation'

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

export default async function MatchPage({ params }: { params: { id: string } }) {
  const match = await getMatch(params.id)

  const winners = match.participants.filter(p => p.isWinner)
  const losers = match.participants.filter(p => !p.isWinner)

  return (
    <div className="p-4 max-w-3xl mx-auto">
      {/* Breadcrumb */}
      <div className="mb-4 text-sm text-gray-600">
        <Link href="/shows" className="hover:underline">Shows</Link>
        <span className="mx-2">→</span>
        <Link href={`/shows/${match.showId}`} className="hover:underline">
          {match.show.title || `${match.show.month} Week ${match.show.week}`}
        </Link>
        <span className="mx-2">→</span>
        <span>Match</span>
      </div>

      {/* Match Header */}
      <div className="bg-white p-6 rounded shadow mb-6">
        <div className="flex flex-wrap gap-2 mb-3">
          <span className="bg-gray-800 text-white px-3 py-1 rounded text-sm font-medium">
            {match.matchType}
          </span>
          {match.stipulation && (
            <span className="bg-red-600 text-white px-3 py-1 rounded text-sm font-medium">
              {match.stipulation}
            </span>
          )}
          {match.championship && (
            <span className="bg-yellow-500 text-white px-3 py-1 rounded text-sm font-medium">
              🏆 {match.championship.name}
            </span>
          )}
        </div>

        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          {match.title || `${match.matchType} Match`}
        </h1>

        <div className="text-gray-600">
          {match.show.title || `${match.show.type} - ${match.show.month} Week ${match.show.week}`}
        </div>

        {match.finish && (
          <div className="mt-4 inline-block bg-green-100 text-green-800 px-4 py-2 rounded font-medium">
            Finish: {match.finish}
          </div>
        )}
      </div>

      {/* Participants */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        
        {/* Winners */}
        <div className="bg-white p-4 rounded shadow border-l-4 border-green-500">
          <h2 className="text-lg font-bold text-green-700 mb-3">
            Winner{winners.length !== 1 ? 's' : ''}
          </h2>
          {winners.length > 0 ? (
            <div className="space-y-2">
              {winners.map(p => (
                <Link 
                  key={p.id}
                  href={`/roster/${p.characterId}`}
                  className="flex items-center gap-3 p-2 bg-green-50 rounded hover:bg-green-100 transition"
                >
                  <span className="text-2xl">🏆</span>
                  <div>
                    <div className="font-medium text-gray-800">{p.character.name}</div>
                    <div className="text-sm text-gray-600">
                      {p.character.alignment} • {p.character.division}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 italic">Not yet simulated</p>
          )}
        </div>

        {/* Losers */}
        <div className="bg-white p-4 rounded shadow border-l-4 border-red-500">
          <h2 className="text-lg font-bold text-red-700 mb-3">
            {losers.length > 0 ? 'Defeated' : 'Participants'}
          </h2>
          {losers.length > 0 ? (
            <div className="space-y-2">
              {losers.map(p => (
                <Link 
                  key={p.id}
                  href={`/roster/${p.characterId}`}
                  className="flex items-center gap-3 p-2 bg-red-50 rounded hover:bg-red-100 transition"
                >
                  <span className="text-2xl">❌</span>
                  <div>
                    <div className="font-medium text-gray-800">{p.character.name}</div>
                    <div className="text-sm text-gray-600">
                      {p.character.alignment} • {p.character.division}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : winners.length === 0 ? (
            <p className="text-gray-500 italic">Not yet simulated</p>
          ) : (
            <p className="text-gray-500 italic">No defeated opponents</p>
          )}
        </div>
      </div>

      {/* Interferences */}
      {match.interferences.length > 0 && (
        <div className="bg-white p-4 rounded shadow mb-6 border-l-4 border-purple-500">
          <h2 className="text-lg font-bold text-purple-700 mb-3">
            Interferences
          </h2>
          <div className="flex flex-wrap gap-2">
            {match.interferences.map(i => (
              <Link 
                key={i.id}
                href={`/roster/${i.characterId}`}
                className="bg-purple-100 text-purple-800 px-3 py-2 rounded hover:bg-purple-200 transition"
              >
                {i.character.name}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-4">
        <Link 
          href={`/shows/${match.showId}`}
          className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition"
        >
          ← Back to Show
        </Link>
        {match.finish === null && (
          <Link 
            href={`/shows/${match.showId}/simulate`}
            className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition"
          >
            Simulate This Match
          </Link>
        )}
      </div>
    </div>
  )
}