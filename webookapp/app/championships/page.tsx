// app/championships/page.tsx
import { prisma } from '@db'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { Division, TitleGender } from '@/generated/prisma'

const MAX_CHAMPIONSHIPS = 4

const DIVISION_LABELS: Record<string, string> = {
  TOP_CARD: 'Top Card', MID_CARD: 'Mid Card', UNDER_CARD: 'Under Card', TAG: 'Tag',
}
const DIVISION_COLORS: Record<string, string> = {
  TOP_CARD:   'bg-yellow-900 text-yellow-200',
  MID_CARD:   'bg-blue-900 text-blue-200',
  UNDER_CARD: 'bg-gray-700 text-gray-300',
  TAG:        'bg-green-900 text-green-200',
}
const GENDER_COLORS: Record<string, string> = {
  MALE:   'bg-blue-900 text-blue-200',
  FEMALE: 'bg-pink-900 text-pink-200',
  ALL:    'bg-purple-900 text-purple-200',
}

async function getChampionships() {
  return prisma.championship.findMany({
    orderBy: { id: 'asc' },
    include: {
      reigns: {
        where: { isCurrent: true },
        include: { character: true },
        take: 1,
      }
    }
  })
}

async function createChampionship(formData: FormData) {
  'use server'

  const name     = formData.get('name') as string
  const division = formData.get('division') as Division
  const gender   = formData.get('gender') as TitleGender

  const count = await prisma.championship.count()
  if (count >= MAX_CHAMPIONSHIPS) return

  await prisma.championship.create({
    data: { name, division, gender }
  })

  revalidatePath('/championships')
  redirect('/championships')
}

async function deleteChampionship(formData: FormData) {
  'use server'

  const id = parseInt(formData.get('id') as string)
  if (isNaN(id)) return

  await prisma.championship.delete({ where: { id } })

  revalidatePath('/championships')
  redirect('/championships')
}

export default async function ChampionshipsPage() {
  const championships = await getChampionships()
  const canCreate = championships.length < MAX_CHAMPIONSHIPS

  return (
    <div className="text-gray-100">
      <div className="p-6 max-w-5xl mx-auto">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white">Championships</h1>
          <p className="text-gray-400 text-sm mt-1">{championships.length} / {MAX_CHAMPIONSHIPS} titles created</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

          {/* Championship Cards */}
          <div className="lg:col-span-2 space-y-4">
            {championships.length === 0 ? (
              <div className="text-center py-20 text-gray-500 bg-gray-800 rounded-lg border border-gray-700">
                No championships created yet. Create up to {MAX_CHAMPIONSHIPS} titles.
              </div>
            ) : (
              championships.map(c => {
                const currentReign = c.reigns[0] ?? null
                return (
                  <div key={c.id} className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
                    <div className="p-5 flex items-start justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <span className="text-4xl">🏆</span>
                        <div>
                          <h2 className="text-xl font-bold text-white">{c.name}</h2>
                          <div className="flex gap-2 mt-1.5">
                            <span className={`text-xs px-2 py-0.5 rounded font-medium ${DIVISION_COLORS[c.division]}`}>
                              {DIVISION_LABELS[c.division]}
                            </span>
                            <span className={`text-xs px-2 py-0.5 rounded font-medium ${GENDER_COLORS[c.gender]}`}>
                              {c.gender}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Delete form */}
                      <form action={deleteChampionship}>
                        <input type="hidden" name="id" value={c.id} />
                        <button
                          type="submit"
                          className="text-gray-600 hover:text-red-400 transition text-sm px-2 py-1 rounded hover:bg-gray-700"
                          title="Delete championship"
                        >
                          ✕
                        </button>
                      </form>
                    </div>

                    {/* Current champion */}
                    <div className="border-t border-gray-700 px-5 py-3">
                      {currentReign ? (
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-gray-500 uppercase tracking-wide font-medium">Champion</span>
                          <Link
                            href={`/roster/${currentReign.character.id}`}
                            className="text-yellow-400 hover:text-yellow-300 font-semibold transition"
                          >
                            {currentReign.character.name}
                          </Link>
                          <span className="text-xs text-gray-500">
                            since {new Date(currentReign.startDate).toLocaleDateString()}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-gray-500">
                          <span className="text-xs uppercase tracking-wide font-medium">Champion</span>
                          <span className="text-sm italic">Vacant</span>
                        </div>
                      )}
                    </div>

                    {/* Reign history link */}
                    <div className="border-t border-gray-700 px-5 py-2">
                      <Link
                        href={`/championships/${c.id}`}
                        className="text-xs text-blue-400 hover:text-blue-300 transition"
                      >
                        View reign history →
                      </Link>
                    </div>
                  </div>
                )
              })
            )}

            {/* Empty slots */}
            {Array(Math.max(0, MAX_CHAMPIONSHIPS - championships.length)).fill(null).map((_, i) => (
              <div key={`empty-${i}`} className="bg-gray-800/40 rounded-lg border-2 border-dashed border-gray-700 p-8 text-center text-gray-600">
                <div className="text-3xl mb-2 opacity-30">🏆</div>
                <div className="text-sm">Championship slot {championships.length + i + 1}</div>
              </div>
            ))}
          </div>

          {/* Create Form */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 sticky top-6">
              <h2 className="text-xl font-bold text-white mb-1">Create Championship</h2>
              <p className="text-xs text-gray-500 mb-4">
                {canCreate
                  ? `${MAX_CHAMPIONSHIPS - championships.length} slot${MAX_CHAMPIONSHIPS - championships.length !== 1 ? 's' : ''} remaining`
                  : 'Maximum of 4 championships reached'}
              </p>

              {canCreate ? (
                <form action={createChampionship} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Name *</label>
                    <input
                      type="text" name="name" required
                      placeholder="e.g. World Heavyweight Championship"
                      className="w-full bg-gray-900 border border-gray-600 text-white rounded p-3 placeholder-gray-500 focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Division</label>
                    <select name="division"
                      className="w-full bg-gray-900 border border-gray-600 text-white rounded p-3 focus:border-blue-500 focus:outline-none"
                    >
                      {Object.values(Division).map(d => (
                        <option key={d} value={d}>{DIVISION_LABELS[d]}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Gender</label>
                    <select name="gender"
                      className="w-full bg-gray-900 border border-gray-600 text-white rounded p-3 focus:border-blue-500 focus:outline-none"
                    >
                      {Object.values(TitleGender).map(g => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                  </div>

                  <button type="submit"
                    className="w-full bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-3 rounded font-medium transition"
                  >
                    Create Championship
                  </button>
                </form>
              ) : (
                <div className="text-center py-6 text-gray-500 text-sm">
                  Delete an existing championship to create a new one.
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}