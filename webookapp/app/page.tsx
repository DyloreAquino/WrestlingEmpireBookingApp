// app/page.tsx
import Link from 'next/link'
import { prisma } from '@db'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

const MONTH_ORDER = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC']

async function getHomeData(universeId: number) {
  const [currentChampions, recentShow] = await Promise.all([
    prisma.titleReign.findMany({
      where: { isCurrent: true, championship: { universeId } },
      include: {
        championship: true,
        character: true
      }
    }),
    prisma.show.findFirst({
      where: { universeId },
      orderBy: { updatedAt: 'desc' },
      include: {
        _count: { select: { matches: true } },
        matches: { select: { finish: true } }
      }
    })
  ])

  if (!recentShow) {
    return { currentChampions, featuredShow: null, label: 'upcoming' as const }
  }

  const total = recentShow._count.matches
  const simulated = recentShow.matches.filter(m => m.finish !== 'UNFINISHED').length
  const fullyDone = total > 0 && simulated === total

  if (!fullyDone) {
    return { currentChampions, featuredShow: recentShow, label: 'recent' as const }
  }

  const allShows = await prisma.show.findMany({
    where: { universeId },
    include: {
      _count: { select: { matches: true } },
      matches: { select: { finish: true } }
    }
  })

  const recentMonthIndex = MONTH_ORDER.indexOf(recentShow.month)

  const nextShow = allShows
    .filter(s => {
      const monthIndex = MONTH_ORDER.indexOf(s.month)
      return monthIndex > recentMonthIndex ||
        (monthIndex === recentMonthIndex && s.week > recentShow.week)
    })
    .sort((a, b) => {
      const monthDiff = MONTH_ORDER.indexOf(a.month) - MONTH_ORDER.indexOf(b.month)
      return monthDiff !== 0 ? monthDiff : a.week - b.week
    })[0] ?? null

  return { currentChampions, featuredShow: nextShow, label: 'upcoming' as const }
}

export default async function HomePage() {
  const session = await auth()
  if (!session?.user?.activeUniverseId) redirect('/settings')

  const universeId = session.user.activeUniverseId
  const { currentChampions, featuredShow, label } = await getHomeData(universeId)

  return (
    <div className="text-gray-100">
      <div className="p-6 max-w-4xl mx-auto">

        <h1 className="text-4xl font-bold text-white mt-8 mb-8 text-center">Wrestling Booker</h1>

        <section className="mb-8">
          <h2 className="text-xl font-bold text-white mb-4">Current Champions</h2>
          {currentChampions.length === 0 ? (
            <div className="text-gray-500 bg-gray-800 rounded-lg p-6 border border-gray-700 text-center">
              No champions crowned yet
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {currentChampions.map(reign => (
                <Link key={reign.id} href={`/roster/${reign.characterId}`}
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

        <section className="mb-8">
          <h2 className="text-xl font-bold text-white mb-4">
            {label === 'recent' ? 'Recent Show' : 'Upcoming Show'}
          </h2>
          {featuredShow ? (
            <Link href={`/shows/${featuredShow.id}`}
              className="block p-6 bg-gray-800 rounded-lg border border-gray-700 hover:border-purple-600 transition"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`px-3 py-1 rounded text-sm font-medium ${
                      featuredShow.type === 'PPV' ? 'bg-purple-900 text-purple-200' : 'bg-blue-900 text-blue-200'
                    }`}>
                      {featuredShow.type}
                    </span>
                    <span className="text-gray-400">{featuredShow.month} Week {featuredShow.week}</span>
                  </div>
                  <div className="text-2xl font-bold text-white">
                    {featuredShow.title || `${featuredShow.type} - ${featuredShow.month} Week ${featuredShow.week}`}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-purple-400">{featuredShow._count.matches}</div>
                  <div className="text-sm text-gray-500">matches booked</div>
                </div>
              </div>
            </Link>
          ) : (
            <Link href="/shows"
              className="block p-6 bg-gray-800 rounded-lg border border-gray-700 hover:border-green-600 transition text-center"
            >
              <div className="text-gray-400 mb-2">No upcoming shows scheduled</div>
              <div className="text-green-400 font-medium">+ Create a new show →</div>
            </Link>
          )}
        </section>

        <div className="grid grid-cols-3 gap-4">
          <Link href="/roster"
            className="p-6 bg-gray-800 rounded-lg border border-gray-700 hover:border-blue-500 transition text-center"
          >
            <div className="text-4xl mb-2">👤</div>
            <div className="text-lg font-bold text-white">Roster</div>
            <div className="text-sm text-gray-400">Manage wrestlers</div>
          </Link>
          <Link href="/shows"
            className="p-6 bg-gray-800 rounded-lg border border-gray-700 hover:border-green-500 transition text-center"
          >
            <div className="text-4xl mb-2">📺</div>
            <div className="text-lg font-bold text-white">Shows</div>
            <div className="text-sm text-gray-400">Book events</div>
          </Link>
          <Link href="/championships"
            className="p-6 bg-gray-800 rounded-lg border border-gray-700 hover:border-yellow-500 transition text-center"
          >
            <div className="text-4xl mb-2">🏆</div>
            <div className="text-lg font-bold text-white">Championships</div>
            <div className="text-sm text-gray-400">Title belts</div>
          </Link>
        </div>

      </div>
    </div>
  )
}