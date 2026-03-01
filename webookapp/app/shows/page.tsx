// app/shows/page.tsx
import { prisma } from '@/app/lib/db'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Month, ShowType } from '@/generated/prisma/enums'

async function getShows() {
  return prisma.show.findMany({
    orderBy: [{ month: 'desc' }, { week: 'desc' }],
    include: { _count: { select: { matches: true } } }
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

export default async function ShowsPage() {
  const shows = await getShows()

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6 text-white">Shows</h1>
        
        {/* Create Form */}
        <form action={createShow} className="mb-8 p-6 bg-gray-800 rounded-lg border border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <select 
              name="type" 
              className="bg-gray-900 border border-gray-600 text-white rounded p-3 focus:border-blue-500 focus:outline-none"
              required
            >
              <option value="TV">TV</option>
              <option value="PPV">PPV</option>
            </select>
            <select 
              name="month" 
              className="bg-gray-900 border border-gray-600 text-white rounded p-3 focus:border-blue-500 focus:outline-none"
              required
            >
              {Object.values(Month).map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
            <input 
              name="week" 
              type="number" 
              min="1" 
              max="4" 
              placeholder="Week" 
              className="bg-gray-900 border border-gray-600 text-white rounded p-3 placeholder-gray-500 focus:border-blue-500 focus:outline-none"
              required 
            />
            <input 
              name="title" 
              placeholder="Title (optional)" 
              className="bg-gray-900 border border-gray-600 text-white rounded p-3 placeholder-gray-500 focus:border-blue-500 focus:outline-none"
            />
          </div>
          <button 
            type="submit" 
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded font-medium transition"
          >
            Create Show
          </button>
        </form>

        {/* Shows List */}
        <div className="space-y-3">
          {shows.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No shows created yet. Create your first show above!
            </div>
          ) : (
            shows.map(show => (
              <Link 
                key={show.id} 
                href={`/shows/${show.id}`}
                className="block p-4 bg-gray-800 rounded-lg border border-gray-700 hover:border-gray-600 hover:bg-gray-750 transition"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <span className={`
                        px-2 py-1 rounded text-xs font-medium
                        ${show.type === 'PPV' ? 'bg-purple-900 text-purple-200' : 'bg-blue-900 text-blue-200'}
                      `}>
                        {show.type}
                      </span>
                      <span className="text-gray-400 text-sm">
                        {show.month} Week {show.week}
                      </span>
                    </div>
                    <div className="text-lg font-medium text-white">
                      {show.title || `${show.type} - ${show.month} Week ${show.week}`}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-gray-400 text-sm">
                      {show._count.matches} match{show._count.matches !== 1 ? 'es' : ''}
                    </span>
                    <span className="text-blue-400">→</span>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  )
}