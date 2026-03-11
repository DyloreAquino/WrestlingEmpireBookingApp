// app/shows/page.tsx
import { prisma } from '@db'
import { redirect } from 'next/navigation'
import { Month, ShowType } from "@/app/lib/types"
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
    select: { month: true, year: true }
  })

  const currentCalendarMonth = MONTH_ORDER[new Date().getMonth()]
  const currentCalendarYear  = new Date().getFullYear()
  const defaultMonth = mostRecentShow?.month ?? currentCalendarMonth
  const defaultYear  = mostRecentShow?.year  ?? currentCalendarYear

  // Group by year → month
  const byYear: Record<number, Record<string, typeof shows>> = {}
  for (const show of shows) {
    if (!byYear[show.year]) byYear[show.year] = {}
    if (!byYear[show.year][show.month]) byYear[show.year][show.month] = []
    byYear[show.year][show.month].push(show)
  }

  const years = Object.keys(byYear).map(Number)

  return (
    <div className="text-gray-100">
      <div className="p-6 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-white">Shows</h1>

          <ShowsCalendar
            byYear={byYear}
            defaultMonth={defaultMonth}
            defaultYear={defaultYear}
            monthLabels={MONTH_LABELS}
            createShow={createShow}
          />

      </div>
    </div>
  )
}