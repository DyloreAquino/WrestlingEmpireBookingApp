// app/page.tsx
import Link from 'next/link'
import { prisma } from './lib/db'

async function getDashboardStats() {
  const [
    totalWrestlers,
    totalShows,
    totalMatches,
    currentChampions,
    factions,
    tagTeams,
    rivalries,
    injured,
    recentShows
  ] = await Promise.all([
    prisma.character.count(),
    prisma.show.count(),
    prisma.match.count(),
    prisma.titleReign.count({ where: { isCurrent: true } }),
    prisma.faction.count(),
    prisma.tagTeam.count(),
    prisma.rivalry.count(),
    prisma.character.count({ where: { injured: true } }),
    prisma.show.findMany({
      take: 5,
      orderBy: [{ month: 'desc' }, { week: 'desc' }],
      include: { _count: { select: { matches: true } } }
    })
  ])
  
  return { 
    totalWrestlers, 
    totalShows, 
    totalMatches, 
    currentChampions,
    factions,
    tagTeams,
    rivalries,
    injured,
    recentShows
  }
}

export default async function HomePage() {
  const stats = await getDashboardStats()

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-gray-900 text-white p-4">
        <h1 className="text-2xl font-bold">Wrestling Booker</h1>
      </header>

      {/* Dashboard Stats */}
      <div className="p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-4 rounded shadow">
            <div className="text-3xl font-bold text-blue-600">{stats.totalWrestlers}</div>
            <div className="text-gray-600 text-sm">Wrestlers</div>
          </div>
          <div className="bg-white p-4 rounded shadow">
            <div className="text-3xl font-bold text-green-600">{stats.totalShows}</div>
            <div className="text-gray-600 text-sm">Shows</div>
          </div>
          <div className="bg-white p-4 rounded shadow">
            <div className="text-3xl font-bold text-purple-600">{stats.totalMatches}</div>
            <div className="text-gray-600 text-sm">Matches</div>
          </div>
          <div className="bg-white p-4 rounded shadow">
            <div className="text-3xl font-bold text-yellow-600">{stats.currentChampions}</div>
            <div className="text-gray-600 text-sm">Current Champions</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Navigation Cards - Left Column */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Roster */}
            <Link href="/roster" className="group block">
              <div className="bg-white p-6 rounded shadow hover:shadow-lg transition border-l-4 border-blue-500">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-gray-800 group-hover:text-blue-600">Roster</h2>
                    <p className="text-gray-600 mt-1">Manage wrestlers, factions, and tag teams</p>
                  </div>
                  <span className="text-3xl">👤</span>
                </div>
                <div className="mt-4 flex gap-4 text-sm">
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">{stats.totalWrestlers} Wrestlers</span>
                  <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded">{stats.factions} Factions</span>
                  <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded">{stats.tagTeams} Tag Teams</span>
                </div>
              </div>
            </Link>

            {/* Shows */}
            <Link href="/shows" className="group block">
              <div className="bg-white p-6 rounded shadow hover:shadow-lg transition border-l-4 border-green-500">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-gray-800 group-hover:text-green-600">Shows</h2>
                    <p className="text-gray-600 mt-1">Create and manage shows and events</p>
                  </div>
                  <span className="text-3xl">📺</span>
                </div>
                <div className="mt-4 flex gap-4 text-sm">
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded">{stats.totalShows} Total Shows</span>
                  <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded">{stats.totalMatches} Matches Booked</span>
                </div>
              </div>
            </Link>

            {/* Championships */}
            <Link href="/championships" className="group block">
              <div className="bg-white p-6 rounded shadow hover:shadow-lg transition border-l-4 border-yellow-500">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-gray-800 group-hover:text-yellow-600">Championships</h2>
                    <p className="text-gray-600 mt-1">View titles and current champions</p>
                  </div>
                  <span className="text-3xl">🏆</span>
                </div>
                <div className="mt-4 text-sm">
                  <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded">{stats.currentChampions} Current Champions</span>
                </div>
              </div>
            </Link>

          </div>

          {/* Sidebar - Right Column */}
          <div className="space-y-6">
            
            {/* Detailed Stats */}
            <div className="bg-white p-6 rounded shadow border-t-4 border-gray-400">
              <h2 className="text-lg font-bold text-gray-800 mb-4">Universe Overview</h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span className="text-gray-600">Active Factions</span>
                  <span className="text-xl font-bold text-gray-800">{stats.factions}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span className="text-gray-600">Tag Teams</span>
                  <span className="text-xl font-bold text-gray-800">{stats.tagTeams}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span className="text-gray-600">Ongoing Rivalries</span>
                  <span className="text-xl font-bold text-gray-800">{stats.rivalries}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-red-50 rounded border border-red-100">
                  <span className="text-red-600">Injured Wrestlers</span>
                  <span className="text-xl font-bold text-red-600">{stats.injured}</span>
                </div>
              </div>
            </div>

            {/* Recent Shows */}
            <div className="bg-white p-6 rounded shadow border-t-4 border-purple-500">
              <h2 className="text-lg font-bold text-gray-800 mb-4">Recent Shows</h2>
              <div className="space-y-2">
                {stats.recentShows.length === 0 ? (
                  <p className="text-gray-500 text-sm">No shows created yet</p>
                ) : (
                  stats.recentShows.map(show => (
                    <Link 
                      key={show.id} 
                      href={`/shows/${show.id}`}
                      className="block p-3 bg-gray-50 rounded hover:bg-purple-50 transition"
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-gray-800">
                          {show.title || `${show.type} - ${show.month} Week ${show.week}`}
                        </span>
                        <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">
                          {show._count.matches} matches
                        </span>
                      </div>
                    </Link>
                  ))
                )}
              </div>
              <Link href="/shows" className="block mt-4 text-sm text-purple-600 font-medium hover:underline">
                View All Shows →
              </Link>
            </div>

          </div>

        </div>
      </div>
    </div>
  )
}