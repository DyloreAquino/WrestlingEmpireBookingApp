'use client'

// app/shows/ShowsCalendar.tsx
import Link from 'next/link'
import { useState } from 'react'

type Show = {
  id: number
  type: string
  month: string
  week: number
  year: number
  title: string | null
  _count: { matches: number }
  matches: { finish: string }[]
}

type Props = {
  // byYear[year][month] = Show[]
  byYear: Record<number, Record<string, Show[]>>
  defaultMonth: string
  defaultYear: number
  monthLabels: Record<string, string>
  createShow: (formData: FormData) => Promise<void>
}

const MONTH_ORDER = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
const MONTH_LABELS: Record<string, string> = {
  JAN: 'January', FEB: 'February', MAR: 'March', APR: 'April',
  MAY: 'May', JUN: 'June', JUL: 'July', AUG: 'August',
  SEP: 'September', OCT: 'October', NOV: 'November', DEC: 'December'
}

export default function ShowsCalendar({ byYear, defaultMonth, defaultYear, monthLabels, createShow }: Props) {
  const [currentYear, setCurrentYear] = useState(defaultYear)
  const [currentMonth, setCurrentMonth] = useState(
    MONTH_ORDER.includes(defaultMonth) ? defaultMonth : MONTH_ORDER[0]
  )
  const [modal, setModal] = useState<{ week: number; month: string } | null>(null)

  const currentIndex = MONTH_ORDER.indexOf(currentMonth)
  const byMonth = byYear[currentYear] ?? {}
  const monthShows = byMonth[currentMonth] ?? []
  const weeks = [1, 2, 3, 4].map(week =>
    monthShows.find(s => s.week === week) || null
  )

  return (
    <>
      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">

        {/* Year Nav */}
        <div className="px-6 py-3 border-b border-gray-700 flex items-center justify-between bg-gray-900/40">
          <button
            onClick={() => setCurrentYear(y => y - 1)}
            className="p-1.5 rounded-lg hover:bg-gray-600 transition text-gray-400"
            aria-label="Previous year"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </button>
          <span className="text-sm font-semibold text-gray-300 tracking-widest">{currentYear}</span>
          <button
            onClick={() => setCurrentYear(y => y + 1)}
            className="p-1.5 rounded-lg hover:bg-gray-600 transition text-gray-400"
            aria-label="Next year"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {/* Month Nav */}
        <div className="px-6 py-4 border-b border-gray-700 flex items-center justify-between">
          <button
            onClick={() => setCurrentMonth(MONTH_ORDER[currentIndex - 1])}
            disabled={currentIndex <= 0}
            className="p-2 rounded-lg hover:bg-gray-600 disabled:opacity-20 disabled:cursor-not-allowed transition text-gray-300"
            aria-label="Previous month"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </button>

          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-white">{monthLabels[currentMonth]}</h2>
            <span className="text-sm text-gray-500">{monthShows.length} / 4 shows</span>
          </div>

          <button
            onClick={() => setCurrentMonth(MONTH_ORDER[currentIndex + 1])}
            disabled={currentIndex >= MONTH_ORDER.length - 1}
            className="p-2 rounded-lg hover:bg-gray-600 disabled:opacity-20 disabled:cursor-not-allowed transition text-gray-300"
            aria-label="Next month"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {/* Month dots — all 12, brighter if they have shows in the current year */}
        <div className="flex items-center justify-center gap-2 py-3 border-b border-gray-700">
          {MONTH_ORDER.map(month => {
            const hasShows = !!byMonth[month]?.length
            return (
              <button
                key={month}
                onClick={() => setCurrentMonth(month)}
                className={`rounded-full transition-all ${
                  month === currentMonth
                    ? 'w-2.5 h-2.5 bg-blue-400'
                    : hasShows
                    ? 'w-2 h-2 bg-gray-400 hover:bg-gray-200'
                    : 'w-2 h-2 bg-gray-700 hover:bg-gray-500'
                }`}
                aria-label={monthLabels[month]}
                title={monthLabels[month]}
              />
            )
          })}
        </div>

        {/* 4 Week Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-gray-700">
          {weeks.map((show, i) => {
            const week = i + 1
            if (!show) {
              return (
                <button
                  key={`${currentYear}-${currentMonth}-empty-${week}`}
                  onClick={() => setModal({ week, month: currentMonth })}
                  className="p-6 flex flex-col gap-2 text-left hover:bg-gray-700/50 transition group cursor-pointer border-0 min-h-[160px]"
                >
                  <div className="text-xs text-gray-500 font-medium uppercase tracking-widest">Week {week}</div>
                  <div className="flex-1 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-1.5 text-gray-700 group-hover:text-gray-400 transition">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                      </svg>
                      <span className="text-xs">Add show</span>
                    </div>
                  </div>
                </button>
              )
            }

            const total = show._count.matches
            const simulated = show.matches.filter(m => m.finish !== 'UNFINISHED').length
            const allDone = total > 0 && simulated === total
            const noneStarted = simulated === 0

            return (
              <Link
                key={`${currentYear}-${currentMonth}-show-${week}`}
                href={`/shows/${show.id}`}
                className="p-6 flex flex-col gap-3 hover:bg-gray-700 transition group min-h-[160px]"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500 font-medium uppercase tracking-widest">Week {week}</span>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                    show.type === 'PPV' ? 'bg-purple-900 text-purple-200' : 'bg-blue-900 text-blue-200'
                  }`}>
                    {show.type}
                  </span>
                </div>

                <div className="text-base font-semibold text-white group-hover:text-blue-300 transition leading-snug flex-1">
                  {show.title || `${show.type} — Wk ${week}`}
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">{total} match{total !== 1 ? 'es' : ''}</span>
                  {total > 0 && (
                    <span className={`text-xs font-medium ${
                      allDone ? 'text-green-400' : noneStarted ? 'text-gray-500' : 'text-yellow-400'
                    }`}>
                      {allDone ? '✓ Done' : noneStarted ? 'Pending' : `${simulated}/${total}`}
                    </span>
                  )}
                </div>

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

      {/* Create Show Modal */}
      {modal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => setModal(null)}
        >
          <div
            className="bg-gray-800 border border-gray-700 rounded-xl shadow-2xl w-full max-w-sm mx-4 p-6"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-lg font-bold text-white">Create Show</h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  {MONTH_LABELS[modal.month]} · Week {modal.week} · {currentYear}
                </p>
              </div>
              <button
                onClick={() => setModal(null)}
                className="p-1.5 rounded-lg hover:bg-gray-700 text-gray-400 hover:text-white transition"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>

            <form action={createShow} className="space-y-3">
              <input type="hidden" name="month" value={modal.month} />
              <input type="hidden" name="week" value={modal.week} />
              <input type="hidden" name="year" value={currentYear} />

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Type</label>
                <select
                  name="type"
                  className="w-full bg-gray-900 border border-gray-600 text-white rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  required
                >
                  <option value="TV">TV</option>
                  <option value="PPV">PPV</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">
                  Title <span className="text-gray-600">(optional)</span>
                </label>
                <input
                  name="title"
                  placeholder="e.g. WrestleMania"
                  className="w-full bg-gray-900 border border-gray-600 text-white rounded-lg px-3 py-2 text-sm placeholder-gray-600 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setModal(null)}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-gray-300 px-4 py-2 rounded-lg text-sm font-medium transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}