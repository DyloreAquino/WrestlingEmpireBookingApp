// app/page.tsx
import Link from 'next/link'
import { prisma } from '@db'

async function getHomeData() {
  const [currentChampions, upcomingShow] = await Promise.all([
    prisma.titleReign.findMany({
      where: { isCurrent: true },
      include: {
        championship: true,
        character: true
      }
    }),
    prisma.show.findFirst({
      orderBy: [{ month: 'desc' }, { week: 'desc' }],
      include: {
        _count: { select: { matches: true } }
      }
    })
  ])

  return { currentChampions, upcomingShow }
}

export default async function HomePage() {
  const { currentChampions, upcomingShow } = await getHomeData()

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <div className="p-6 max-w-4xl mx-auto">
        
        {/* Header */}
        <h1 className="text-4xl font-bold text-white mt-8 mb-8 text-center">Wrestling Booker</h1>

        {/* Current Champions */}
        <section className="mb-8">
          <h2 className="text-xl font-bold text-white mb-4">Current Champions</h2>
          {currentChampions.length === 0 ? (
            <div className="text-gray-500 bg-gray-800 rounded-lg p-6 border border-gray-700 text-center">
              No champions crowned yet
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {currentChampions.map(reign => (
                <Link
                  key={reign.id}
                  href={`/roster/${reign.characterId}`}
                  className="flex items-center gap-4 p-4 bg-gray-800 rounded-lg border border-gray-700 hover:border-yellow-600 transition"
                >
                  <span className="text-3xl">🏆</span>
                  <div>
                    <div className="font-medium text-white">{reign.championship.name}</div>
                    <div className="text-yellow-400">{reign.character.name}</div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Upcoming Show */}
        <section className="mb-8">
          <h2 className="text-xl font-bold text-white mb-4">Upcoming Show</h2>
          {upcomingShow ? (
            <Link
              href={`/shows/${upcomingShow.id}`}
              className="block p-6 bg-gray-800 rounded-lg border border-gray-700 hover:border-purple-600 transition"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`
                      px-3 py-1 rounded text-sm font-medium
                      ${upcomingShow.type === 'PPV' ? 'bg-purple-900 text-purple-200' : 'bg-blue-900 text-blue-200'}
                    `}>
                      {upcomingShow.type}
                    </span>
                    <span className="text-gray-400">{upcomingShow.month} Week {upcomingShow.week}</span>
                  </div>
                  <div className="text-2xl font-bold text-white">
                    {upcomingShow.title || `${upcomingShow.type} - ${upcomingShow.month} Week ${upcomingShow.week}`}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-purple-400">{upcomingShow._count.matches}</div>
                  <div className="text-sm text-gray-500">matches booked</div>
                </div>
              </div>
            </Link>
          ) : (
            <div className="text-gray-500 bg-gray-800 rounded-lg p-6 border border-gray-700 text-center">
              No upcoming shows
            </div>
          )}
        </section>

        {/* Navigation */}
        <div className="grid grid-cols-2 gap-4">
          <Link 
            href="/roster"
            className="p-6 bg-gray-800 rounded-lg border border-gray-700 hover:border-blue-500 hover:bg-gray-750 transition text-center"
          >
            <div className="text-4xl mb-2">👤</div>
            <div className="text-lg font-bold text-white">Roster</div>
            <div className="text-sm text-gray-400">Manage wrestlers</div>
          </Link>

          <Link 
            href="/shows"
            className="p-6 bg-gray-800 rounded-lg border border-gray-700 hover:border-green-500 hover:bg-gray-750 transition text-center"
          >
            <div className="text-4xl mb-2">📺</div>
            <div className="text-lg font-bold text-white">Shows</div>
            <div className="text-sm text-gray-400">Book events</div>
          </Link>
        </div>

      </div>
    </div>
  )
}