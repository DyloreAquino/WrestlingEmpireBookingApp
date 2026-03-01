// app/shows/[id]/page.tsx
import { prisma } from '@/app/lib/db'
import Link from 'next/link'
import { notFound } from 'next/navigation'

async function getShow(id: string) {
  const showId = parseInt(id)
  
  if (isNaN(showId)) {
    return null
  }
  
  const show = await prisma.show.findUnique({
    where: { id: showId },
    include: {
      matches: {
        include: {
          participants: { include: { character: true } },
          championship: true
        }
      }
    }
  })
  
  return show
}

export default async function ShowPage({ 
  params 
}: { 
  params: Promise<{ id: string }> | { id: string } 
}) {
  // Await params for Next.js 15+
  const resolvedParams = await Promise.resolve(params)
  const id = resolvedParams.id
  
  const show = await getShow(id)
  
  if (!show) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <div className="p-6">
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
          <Link 
            href={`/shows/${show.id}/simulate`}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded font-medium transition"
          >
            Simulate Show
          </Link>
        </div>

        {/* Matches List */}
        <div className="space-y-4">
          {show.matches.length === 0 ? (
            <div className="text-center py-12 text-gray-500 bg-gray-800 rounded-lg border border-gray-700">
              No matches booked for this show yet.
            </div>
          ) : (
            show.matches.map(match => (
              <div key={match.id} className="p-4 bg-gray-800 rounded-lg border border-gray-700">
                <div className="flex flex-wrap gap-2 mb-3">
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
                  {match.finish && (
                    <span className="bg-green-900 text-green-200 px-3 py-1 rounded text-sm font-medium">
                      {match.finish}
                    </span>
                  )}
                </div>
                
                <div className="flex flex-wrap gap-2 mb-3">
                  {match.participants.map(p => (
                    <span 
                      key={p.id} 
                      className={`
                        px-3 py-2 rounded text-sm font-medium
                        ${p.isWinner 
                          ? 'bg-green-900 text-green-200 border border-green-700' 
                          : 'bg-gray-700 text-gray-300'}
                      `}
                    >
                      {p.character.name}
                      {p.isWinner && ' 🏆'}
                    </span>
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
      </div>
    </div>
  )
}