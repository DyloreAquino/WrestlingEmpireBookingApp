'use client'

// app/roster/RosterFilters.tsx
import Link from 'next/link'
import { useState } from 'react'

type Character = {
  id: number
  name: string
  alignment: string
  division: string
  gender: string
  injured: boolean
  faction: { name: string } | null
  tagTeam: { name: string } | null
}

type Props = {
  characters: Character[]
}

const ALIGNMENTS = ['ALL', 'FACE', 'HEEL', 'TWEENER']
const GENDERS = ['ALL', 'MALE', 'FEMALE', 'NA']
const DIVISIONS = ['ALL', 'TOP_CARD', 'MID_CARD', 'UNDER_CARD', 'TAG']

const DIVISION_LABELS: Record<string, string> = {
  TOP_CARD: 'Top Card',
  MID_CARD: 'Mid Card',
  UNDER_CARD: 'Under Card',
  TAG: 'Tag',
}

export default function RosterFilters({ characters }: Props) {
  const [alignment, setAlignment] = useState('ALL')
  const [gender, setGender] = useState('ALL')
  const [division, setDivision] = useState('ALL')

  const filtered = characters.filter(c => {
    if (alignment !== 'ALL' && c.alignment !== alignment) return false
    if (gender !== 'ALL' && c.gender !== gender) return false
    if (division !== 'ALL' && c.division !== division) return false
    return true
  })

  function FilterGroup({ label, options, value, onChange }: {
    label: string
    options: string[]
    value: string
    onChange: (v: string) => void
  }) {
    return (
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-gray-500 uppercase tracking-wide font-medium w-16 shrink-0">{label}</span>
        <div className="flex gap-1.5 flex-wrap">
          {options.map(opt => (
            <button
              key={opt}
              type="button"
              onClick={() => onChange(opt)}
              className={`px-3 py-1 rounded text-xs font-medium transition ${
                value === opt
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {opt === 'ALL' ? 'All' : DIVISION_LABELS[opt] ?? opt.charAt(0) + opt.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filter Bar */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-4 space-y-3">
        <FilterGroup label="Alignment" options={ALIGNMENTS} value={alignment} onChange={setAlignment} />
        <FilterGroup label="Gender" options={GENDERS} value={gender} onChange={setGender} />
        <FilterGroup label="Division" options={DIVISIONS} value={division} onChange={setDivision} />
      </div>

      {/* Results count */}
      <div className="text-sm text-gray-500">
        Showing {filtered.length} of {characters.length} wrestlers
      </div>

      {/* Character Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-500 bg-gray-800 rounded-lg border border-gray-700">
          No wrestlers match the selected filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {filtered.map(c => (
            <Link
              key={c.id}
              href={`/roster/${c.id}`}
              className="p-4 bg-gray-800 rounded-lg border border-gray-700 hover:border-gray-600 hover:bg-gray-750 transition"
            >
              <div className="font-medium text-white text-lg">{c.name}</div>
              <div className="flex flex-wrap gap-2 mt-2">
                <span className={`text-xs px-2 py-1 rounded ${
                  c.alignment === 'FACE' ? 'bg-blue-900 text-blue-200' :
                  c.alignment === 'HEEL' ? 'bg-red-900 text-red-200' :
                  'bg-purple-900 text-purple-200'
                }`}>
                  {c.alignment}
                </span>
                <span className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded">
                  {DIVISION_LABELS[c.division] ?? c.division}
                </span>
                <span className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded">
                  {c.gender}
                </span>
                {c.injured && (
                  <span className="text-xs bg-red-900 text-red-200 px-2 py-1 rounded">INJURED</span>
                )}
              </div>
              {(c.faction || c.tagTeam) && (
                <div className="text-sm text-gray-400 mt-2">
                  {c.faction && <>👥 {c.faction.name}</>}
                  {c.tagTeam && <>🤝 {c.tagTeam.name}</>}
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}