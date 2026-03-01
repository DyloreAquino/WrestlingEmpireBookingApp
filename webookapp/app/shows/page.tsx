// app/shows/page.tsx
import { prisma } from '@/app/lib/db'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Month, ShowType } from '@/generated/prisma/enums'

async function getShows() {
  return prisma.show.findMany({
    orderBy: [{ month: 'asc' }, { week: 'asc' }],
    include: { 
      _count: { select: { matches: true } },
      matches: { select: { finish: true } }
    }
  })
}

async function createShow(formData: FormData) {
  'use server'
  
  const type = formData.get('type') as ShowType
  const month = formData.get('month') as Month
  const week = parseInt(formData.get('week') as string)
  const title = formData.get('title') as string || null
  
  const show = await prisma.show.create({
    data: { type, month, week, title }
  })
  
  redirect(`/shows/${show.id}`)
}

const MONTH_ORDER = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC']
const MONTH_LABELS: Record<string, string> = {
  JAN: 'January', FEB: 'February', MAR: 'March', APR: 'April',
  MAY: 'May', JUN: 'June', JUL: 'July', AUG: 'August',
  SEP: 'September', OCT: 'October', NOV: 'November', DEC: 'December'
}

export default async function ShowsPage() {
  const shows = await getShows()

  // Group by month
  const byMonth = MONTH_ORDER.reduce((acc, month) => {
    const monthShows = shows.filter(s => s.month === month)
    if (monthShows.length > 0) acc[month] = monthShows
    return acc
  }, {} as Record<string, typeof shows>)

  const months = Object.keys(byMonth)

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <div className="p-6 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-white">Shows</h1>

        <div className="flex flex-col lg:flex-row gap-6 items-start">

          {/* Calendar */}
          <div className="flex-1 space-y-6">
            {months.length === 0 ? (
              <div className="text-center py-20 text-gray-500 bg-gray-800 rounded-lg border border-gray-700">
                No shows yet. Create your first show →
              </div>
            ) : (
              months.map(month => {
                const monthShows = byMonth[month]
                // Fill 4 week slots
                const weeks = [1, 2, 3, 4].map(week => 
                  monthShows.find(s => s.week === week) || null
                )

                return (
                  <div key={month} className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
                    {/* Month Header */}
                    <div className="px-5 py-3 bg-gray-750 border-b border-gray-700 flex items-center justify-between">
                      <h2 className="text-lg font-bold text-white">{MONTH_LABELS[month]}</h2>
                      <span className="text-xs text-gray-500">{monthShows.length} / 4 shows</span>
                    </div>

                    {/* 4 Week Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-gray-700">
                      {weeks.map((show, i) => {
                        const week = i + 1
                        if (!show) {
                          return (
                            <div key={week} className="p-4 flex flex-col gap-1 opacity-30">
                              <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">Week {week}</div>
                              <div className="text-sm text-gray-600 italic">—</div>
                            </div>
                          )
                        }

                        const total = show._count.matches
                        const simulated = show.matches.filter(m => m.finish !== 'UNFINISHED').length
                        const allDone = total > 0 && simulated === total
                        const noneStarted = simulated === 0

                        return (
                          <Link
                            key={show.id}
                            href={`/shows/${show.id}`}
                            className="p-4 flex flex-col gap-2 hover:bg-gray-700 transition group"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">Week {week}</span>
                              <span className={`
                                px-2 py-0.5 rounded text-xs font-medium
                                ${show.type === 'PPV' ? 'bg-purple-900 text-purple-200' : 'bg-blue-900 text-blue-200'}
                              `}>
                                {show.type}
                              </span>
                            </div>

                            <div className="text-sm font-semibold text-white group-hover:text-blue-300 transition leading-tight">
                              {show.title || `${show.type} — Wk ${week}`}
                            </div>

                            <div className="mt-auto flex items-center justify-between">
                              <span className="text-xs text-gray-500">
                                {total} match{total !== 1 ? 'es' : ''}
                              </span>
                              {total > 0 && (
                                <span className={`text-xs font-medium ${
                                  allDone ? 'text-green-400' : noneStarted ? 'text-gray-500' : 'text-yellow-400'
                                }`}>
                                  {allDone ? '✓ Done' : noneStarted ? 'Pending' : `${simulated}/${total}`}
                                </span>
                              )}
                            </div>

                            {/* Progress bar */}
                            {total > 0 && (
                              <div className="w-full h-1 bg-gray-700 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all ${allDone ? 'bg-green-500' : 'bg-yellow-500'}`}
                                  style={{ width: `${(simulated / total) * 100}%` }}
                                />
                              </div>
                            )}
                          </Link>
                        )
                      })}
                    </div>
                  </div>
                )
              })
            )}
          </div>

          {/* Create Form */}
          <div className="w-full lg:w-80 bg-gray-800 rounded-lg border border-gray-700 p-6 sticky top-6">
            <h2 className="text-xl font-bold text-white mb-4">Create Show</h2>
            <form action={createShow} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Type</label>
                <select
                  name="type"
                  className="w-full bg-gray-900 border border-gray-600 text-white rounded p-3 focus:border-blue-500 focus:outline-none"
                  required
                >
                  <option value="TV">TV</option>
                  <option value="PPV">PPV</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Month</label>
                <select
                  name="month"
                  className="w-full bg-gray-900 border border-gray-600 text-white rounded p-3 focus:border-blue-500 focus:outline-none"
                  required
                >
                  {Object.values(Month).map(m => (
                    <option key={m} value={m}>{MONTH_LABELS[m]}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Week</label>
                <select
                  name="week"
                  className="w-full bg-gray-900 border border-gray-600 text-white rounded p-3 focus:border-blue-500 focus:outline-none"
                  required
                >
                  {[1, 2, 3, 4].map(w => (
                    <option key={w} value={w}>Week {w}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Title <span className="text-gray-500">(optional)</span>
                </label>
                <input
                  name="title"
                  placeholder="e.g. WrestleMania"
                  className="w-full bg-gray-900 border border-gray-600 text-white rounded p-3 placeholder-gray-500 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded font-medium transition"
              >
                Create Show
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  )
}