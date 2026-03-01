// app/shows/page.tsx
import { prisma } from '@/app/lib/db'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Month, ShowType } from '@/generated/prisma/enums'
import ShowsCalendar from './ShowsCalendar'

async function getShows() {
  return prisma.show.findMany({
    orderBy: [{ year: 'asc' }, { month: 'asc' }, { week: 'asc' }],
    include: {
      _count: { select: { matches: true } },
      matches: { select: { finish: true } }
    }
  })
}

async function createShow(formData: FormData) {
  'use server'

  const type  = formData.get('type') as ShowType
  const month = formData.get('month') as Month
  const week  = parseInt(formData.get('week') as string)
  const year  = parseInt(formData.get('year') as string)
  const title = formData.get('title') as string || null

  const show = await prisma.show.create({
    data: { type, month, week, year, title }
  })

  redirect(`/shows/${show.id}`)
}

const MONTH_ORDER = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
const MONTH_LABELS: Record<string, string> = {
  JAN: 'January', FEB: 'February', MAR: 'March', APR: 'April',
  MAY: 'May', JUN: 'June', JUL: 'July', AUG: 'August',
  SEP: 'September', OCT: 'October', NOV: 'November', DEC: 'December'
}

export default async function ShowsPage() {
  const shows = await getShows()

  const mostRecentShow = await prisma.show.findFirst({
    orderBy: { updatedAt: 'desc' },
    select: { month: true }
  })

  const currentCalendarMonth = MONTH_ORDER[new Date().getMonth()]
  const defaultMonth = mostRecentShow?.month ?? currentCalendarMonth

  // Group by month
  const byMonth = MONTH_ORDER.reduce((acc, month) => {
    const monthShows = shows.filter(s => s.month === month)
    if (monthShows.length > 0) acc[month] = monthShows
    return acc
  }, {} as Record<string, typeof shows>)

  const months = Object.keys(byMonth)

  // Derive max year for the year select default
  const maxYear = shows.reduce((max, s) => Math.max(max, s.year), 1)

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <div className="p-6 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-white">Shows</h1>

        <div className="flex flex-col lg:flex-row gap-6 items-start">

          {/* Calendar */}
          <div className="flex-1">
            {months.length === 0 ? (
              <div className="text-center py-20 text-gray-500 bg-gray-800 rounded-lg border border-gray-700">
                No shows yet. Create your first show →
              </div>
            ) : (
              <ShowsCalendar
                byMonth={byMonth}
                months={months}
                defaultMonth={defaultMonth}
                monthLabels={MONTH_LABELS}
              />
            )}
          </div>

          {/* Create Form */}
          <div className="w-full lg:w-80 bg-gray-800 rounded-lg border border-gray-700 p-6 sticky top-6">
            <h2 className="text-xl font-bold text-white mb-4">Create Show</h2>
            <form action={createShow} className="space-y-4">

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Type</label>
                <select name="type"
                  className="w-full bg-gray-900 border border-gray-600 text-white rounded p-3 focus:border-blue-500 focus:outline-none"
                  required
                >
                  <option value="TV">TV</option>
                  <option value="PPV">PPV</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Year</label>
                <input
                  type="number"
                  name="year"
                  min={1}
                  defaultValue={maxYear}
                  className="w-full bg-gray-900 border border-gray-600 text-white rounded p-3 focus:border-blue-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Month</label>
                <select name="month"
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
                <select name="week"
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

              <button type="submit"
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