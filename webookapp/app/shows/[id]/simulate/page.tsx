import { prisma } from '@db'
import { notFound } from 'next/navigation'
import { FinishType } from '@prisma/client'
import Link from 'next/link'
import SimulateMatchCard from './SimulateMatchCard'

async function getShowWithUnsimulatedMatches(id: string) {
  const show = await prisma.show.findUnique({
    where: { id: parseInt(id) },
    include: {
      matches: {
        where: { finish: FinishType.UNFINISHED },
        include: {
          participants: { include: { character: true } },
          championship: { include: { reigns: { where: { isCurrent: true } } } }
        },
        orderBy: { id: 'asc' }
      }
    }
  })
  if (!show) notFound()
  return show
}

export default async function SimulatePage({
  params
}: {
  params: Promise<{ id: string }> | { id: string }
}) {
  const resolvedParams = await Promise.resolve(params)
  const show = await getShowWithUnsimulatedMatches(resolvedParams.id)

  return (
    <div className="text-gray-100">
      <div className="p-6 max-w-7xl mx-auto">

        {/* Breadcrumb */}
        <div className="mb-4 text-sm text-gray-400">
          <Link href="/shows" className="hover:text-white transition">Shows</Link>
          <span className="mx-2">→</span>
          <Link href={`/shows/${show.id}`} className="hover:text-white transition">
            {show.title || `${show.month} Week ${show.week}`}
          </Link>
          <span className="mx-2">→</span>
          <span className="text-white">Simulate</span>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white">
              Simulate: {show.title || `${show.month} Week ${show.week}`}
            </h1>
            <p className="text-gray-400 mt-1">
              {show.matches.length === 0
                ? 'All matches simulated'
                : `${show.matches.length} match${show.matches.length !== 1 ? 'es' : ''} remaining`}
            </p>
          </div>
          <Link
            href={`/shows/${show.id}`}
            className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded font-medium transition text-sm"
          >
            ← Back to Show
          </Link>
        </div>

        {show.matches.length === 0 ? (
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-12 text-center">
            <div className="text-4xl mb-4">✅</div>
            <h2 className="text-2xl font-bold text-white mb-2">All matches simulated!</h2>
            <p className="text-gray-400 mb-6">Every match on this show has a result.</p>
            <Link
              href={`/shows/${show.id}`}
              className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded font-medium transition"
            >
              ← Back to Show
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {show.matches.map((match, index) => (
              <SimulateMatchCard key={match.id} match={match} index={index} />
            ))}
          </div>
        )}

      </div>
    </div>
  )
}
