'use client'

// app/championships/[id]/AssignChampionModal.tsx
import { useState } from 'react'

const MONTHS = [
  { value: 'JAN', label: 'January' },
  { value: 'FEB', label: 'February' },
  { value: 'MAR', label: 'March' },
  { value: 'APR', label: 'April' },
  { value: 'MAY', label: 'May' },
  { value: 'JUN', label: 'June' },
  { value: 'JUL', label: 'July' },
  { value: 'AUG', label: 'August' },
  { value: 'SEP', label: 'September' },
  { value: 'OCT', label: 'October' },
  { value: 'NOV', label: 'November' },
  { value: 'DEC', label: 'December' },
]

type Character = { id: number; name: string; division: string }

type Props = {
  championshipId: number
  characters: Character[]
  assignChampion: (formData: FormData) => Promise<void>
}

const DIVISION_COLORS: Record<string, string> = {
  TOP_CARD:   'bg-yellow-900/50 text-yellow-300',
  MID_CARD:   'bg-blue-900/50 text-blue-300',
  UNDER_CARD: 'bg-gray-700 text-gray-300',
  TAG:        'bg-green-900/50 text-green-300',
}
const DIVISION_LABELS: Record<string, string> = {
  TOP_CARD: 'Top', MID_CARD: 'Mid', UNDER_CARD: 'Under', TAG: 'Tag',
}

export default function AssignChampionModal({ championshipId, characters, assignChampion }: Props) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')

  const filtered = characters.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 bg-yellow-600 hover:bg-yellow-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition shrink-0"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
        </svg>
        Assign Champion
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-gray-800 border border-gray-700 rounded-xl shadow-2xl w-full max-w-md mx-4"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700">
              <div>
                <h2 className="text-lg font-bold text-white">Assign Champion</h2>
                <p className="text-xs text-gray-400 mt-0.5">This will start a new title reign</p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-lg hover:bg-gray-700 text-gray-400 hover:text-white transition"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>

            <form action={async (fd) => { await assignChampion(fd); setOpen(false) }} className="p-6 space-y-5">
              <input type="hidden" name="championshipId" value={championshipId} />

              {/* Character picker */}
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-2">Wrestler</label>
                <input
                  type="text"
                  placeholder="Search..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-600 text-white rounded-lg px-3 py-2 text-sm placeholder-gray-600 focus:border-yellow-500 focus:outline-none mb-2"
                />
                <div className="max-h-48 overflow-y-auto rounded-lg border border-gray-600 divide-y divide-gray-700">
                  {filtered.length === 0 ? (
                    <div className="px-3 py-4 text-sm text-gray-500 text-center">No wrestlers found</div>
                  ) : (
                    filtered.map(c => (
                      <label
                        key={c.id}
                        className="flex items-center gap-3 px-3 py-2.5 hover:bg-gray-700 cursor-pointer transition"
                      >
                        <input
                          type="radio"
                          name="characterId"
                          value={c.id}
                          required
                          className="accent-yellow-500"
                        />
                        <span className="text-sm text-white flex-1">{c.name}</span>
                        <span className={`text-xs px-1.5 py-0.5 rounded ${DIVISION_COLORS[c.division] ?? 'bg-gray-700 text-gray-300'}`}>
                          {DIVISION_LABELS[c.division] ?? c.division}
                        </span>
                      </label>
                    ))
                  )}
                </div>
              </div>

              {/* Reign start date */}
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-2">Reign Start Date</label>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Month</label>
                    <select
                      name="startMonth"
                      required
                      className="w-full bg-gray-900 border border-gray-600 text-white rounded-lg px-2 py-2 text-sm focus:border-yellow-500 focus:outline-none"
                    >
                      {MONTHS.map(m => (
                        <option key={m.value} value={m.value}>{m.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Week</label>
                    <select
                      name="startWeek"
                      required
                      className="w-full bg-gray-900 border border-gray-600 text-white rounded-lg px-2 py-2 text-sm focus:border-yellow-500 focus:outline-none"
                    >
                      {[1, 2, 3, 4].map(w => (
                        <option key={w} value={w}>Wk {w}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Year</label>
                    <input
                      type="number"
                      name="startYear"
                      min={1}
                      defaultValue={1}
                      required
                      className="w-full bg-gray-900 border border-gray-600 text-white rounded-lg px-2 py-2 text-sm focus:border-yellow-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-gray-300 px-4 py-2 rounded-lg text-sm font-medium transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-yellow-600 hover:bg-yellow-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
                >
                  Assign Champion
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
