'use client'

// app/shows/ShowsCalendar.tsx
import Link from 'next/link'
import { useState } from 'react'

type Show = {
  id: number
  type: string
  month: string
  week: number
  title: string | null
  _count: { matches: number }
  matches: { finish: string }[]
}

type Props = {
  byMonth: Record<string, Show[]>
  months: string[]
  defaultMonth: string
  monthLabels: Record<string, string>
}

export default function ShowsCalendar({ byMonth, months, defaultMonth, monthLabels }: Props) {
  // Default to the passed-in month, or the first available month
  const initialMonth = months.includes(defaultMonth) ? defaultMonth : months[0]
  const [currentMonth, setCurrentMonth] = useState(initialMonth)

  const currentIndex = months.indexOf(currentMonth)
  const hasPrev = currentIndex > 0
  const hasNext = currentIndex < months.length - 1

  const monthShows = byMonth[currentMonth] ?? []
  const weeks = [1, 2, 3, 4].map(week =>
    monthShows.find(s => s.week === week) || null
  )

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
      {/* Month Header with Nav */}
      <div className="px-5 py-3 bg-gray-750 border-b border-gray-700 flex items-center justify-between">
        <button
          onClick={() => hasPrev && setCurrentMonth(months[currentIndex - 1])}
          disabled={!hasPrev}
          className="p-1.5 rounded hover:bg-gray-600 disabled:opacity-20 disabled:cursor-not-allowed transition text-gray-300"
          aria-label="Previous month"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </button>

        <div className="flex items-center gap-3">
          <h2 className="text-lg font-bold text-white">{monthLabels[currentMonth]}</h2>
          <span className="text-xs text-gray-500">{monthShows.length} / 4 shows</span>
        </div>

        <button
          onClick={() => hasNext && setCurrentMonth(months[currentIndex + 1])}
          disabled={!hasNext}
          className="p-1.5 rounded hover:bg-gray-600 disabled:opacity-20 disabled:cursor-not-allowed transition text-gray-300"
          aria-label="Next month"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      {/* Month dots indicator */}
      {months.length > 1 && (
        <div className="flex items-center justify-center gap-1.5 py-2 border-b border-gray-700">
          {months.map(month => (
            <button
              key={month}
              onClick={() => setCurrentMonth(month)}
              className={`rounded-full transition-all ${
                month === currentMonth
                  ? 'w-2 h-2 bg-blue-400'
                  : 'w-1.5 h-1.5 bg-gray-600 hover:bg-gray-400'
              }`}
              aria-label={monthLabels[month]}
            />
          ))}
        </div>
      )}

      {/* 4 Week Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-gray-700">
        {weeks.map((show, i) => {
          const week = i + 1
          if (!show) {
            return (
              <div key={`${currentMonth}-empty-${week}`} className="p-4 flex flex-col gap-1 opacity-30">
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
              key={`${currentMonth}-show-${week}`}
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
}