'use client'

// app/shows/[id]/ShowCard.tsx
import { useState } from 'react'
import Link from 'next/link'
import { MatchType, Stipulation, CardPlacement } from '@/generated/prisma/client'

interface Character {
  id: number
  name: string
  alignment: string
  division: string
  gender: string
}

interface Championship {
  id: number
  name: string
}

interface Participant {
  id: number
  characterId: number
  isWinner: boolean
  character: { name: string }
}

interface Match {
  id: number
  title: string | null
  matchType: string
  stipulation: string | null
  finish: string
  placement: string
  championship: { id: number; name: string } | null
  participants: Participant[]
}

interface Props {
  showId: number
  showType: 'TV' | 'PPV'
  matches: Match[]
  characters: Character[]
  championships: Championship[]
  bookedCharacterIds: number[]
}

// ─── Slot config ────────────────────────────────────────────────────────────
const TV_SLOTS: { placement: CardPlacement; count: number }[] = [
  { placement: CardPlacement.MAIN,      count: 1 },
  { placement: CardPlacement.MIDCARD,   count: 2 },
  { placement: CardPlacement.UNDERCARD, count: 3 },
]
const PPV_SLOTS: { placement: CardPlacement; count: number }[] = [
  { placement: CardPlacement.MAIN,      count: 1 },
  { placement: CardPlacement.SEMI_MAIN, count: 2 },
  { placement: CardPlacement.MIDCARD,   count: 3 },
  { placement: CardPlacement.UNDERCARD, count: 4 },
]

const PLACEMENT_LABELS: Record<string, string> = {
  MAIN: 'Main Event', SEMI_MAIN: 'Semi-Main', MIDCARD: 'Midcard', UNDERCARD: 'Undercard',
}
const PLACEMENT_COLORS: Record<string, string> = {
  MAIN:      'border-yellow-600 bg-yellow-900/20 text-yellow-300',
  SEMI_MAIN: 'border-orange-600 bg-orange-900/20 text-orange-300',
  MIDCARD:   'border-blue-600 bg-blue-900/20 text-blue-300',
  UNDERCARD: 'border-gray-600 bg-gray-800 text-gray-400',
}
const PLACEMENT_BADGE: Record<string, string> = {
  MAIN:      'bg-yellow-900 text-yellow-200',
  SEMI_MAIN: 'bg-orange-900 text-orange-200',
  MIDCARD:   'bg-blue-900 text-blue-200',
  UNDERCARD: 'bg-gray-700 text-gray-300',
}
const FINISH_COLORS: Record<string, string> = {
  UNFINISHED:   'bg-gray-600 text-gray-300',
  PINFALL:      'bg-green-900 text-green-200',
  SUBMISSION:   'bg-green-900 text-green-200',
  COUNTOUT:     'bg-yellow-900 text-yellow-200',
  DQ:           'bg-red-900 text-red-200',
  INTERFERENCE: 'bg-purple-900 text-purple-200',
  UNIQUE:       'bg-blue-900 text-blue-200',
}

// ─── Character card tag colors ───────────────────────────────────────────────
const ALIGNMENT_COLORS: Record<string, string> = {
  FACE:    'bg-green-900 text-green-200',
  HEEL:    'bg-purple-900 text-purple-200',
  TWEENER: 'bg-yellow-900 text-yellow-200',
}
const GENDER_COLORS: Record<string, string> = {
  MALE:   'bg-blue-900 text-blue-200',
  FEMALE: 'bg-pink-900 text-pink-200',
  NA:     'bg-gray-700 text-gray-300',
}
const DIVISION_COLORS: Record<string, string> = {
  TOP_CARD:   'bg-yellow-900 text-yellow-200',
  MID_CARD:   'bg-blue-900 text-blue-200',
  UNDER_CARD: 'bg-gray-900 text-gray-400',
  TAG:        'bg-green-900 text-green-200',
}
const DIVISION_LABELS: Record<string, string> = {
  TOP_CARD: 'Top Card', MID_CARD: 'Mid Card', UNDER_CARD: 'Under Card', TAG: 'Tag',
}

// ─── Filter groups ────────────────────────────────────────────────────────────
const FILTER_ALIGNMENTS = ['ALL', 'FACE', 'HEEL', 'TWEENER']
const FILTER_GENDERS    = ['ALL', 'MALE', 'FEMALE', 'NA']
const FILTER_DIVISIONS  = ['ALL', 'TOP_CARD', 'MID_CARD', 'UNDER_CARD', 'TAG']

function FilterBar({ label, options, value, onChange, colorFn }: {
  label: string
  options: string[]
  value: string
  onChange: (v: string) => void
  colorFn?: (v: string) => string
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
            className={`px-2.5 py-0.5 rounded text-xs font-medium transition ${
              value === opt
                ? (opt === 'ALL' ? 'bg-gray-500 text-white' : (colorFn?.(opt) ?? 'bg-blue-600 text-white'))
                : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
            }`}
          >
            {opt === 'ALL' ? 'All' : (DIVISION_LABELS[opt] ?? opt.charAt(0) + opt.slice(1).toLowerCase())}
          </button>
        ))}
      </div>
    </div>
  )
}

export default function ShowCard({ showId, showType, matches, characters, championships, bookedCharacterIds }: Props) {
  const slots = showType === 'PPV' ? PPV_SLOTS : TV_SLOTS

  // ── Add match modal state ──
  const [modalOpen, setModalOpen]                     = useState(false)
  const [activePlacement, setActivePlacement]         = useState<CardPlacement>(CardPlacement.UNDERCARD)
  const [participantModalOpen, setParticipantModalOpen] = useState(false)

  // ── Form state ──
  const [selectedIds, setSelectedIds]   = useState<number[]>([])
  const [title, setTitle]               = useState('')
  const [matchType, setMatchType]       = useState<MatchType>(MatchType.SINGLES)
  const [stipulation, setStipulation]   = useState('')
  const [championshipId, setChampionshipId] = useState('')
  const [submitting, setSubmitting]     = useState(false)
  const [error, setError]               = useState<string | null>(null)

  // ── Participant picker filters ──
  const [filterAlignment, setFilterAlignment] = useState('ALL')
  const [filterGender, setFilterGender]       = useState('ALL')
  const [filterDivision, setFilterDivision]   = useState('ALL')

  const filteredCharacters = characters.filter(c => {
    if (filterAlignment !== 'ALL' && c.alignment !== filterAlignment) return false
    if (filterGender    !== 'ALL' && c.gender    !== filterGender)    return false
    if (filterDivision  !== 'ALL' && c.division  !== filterDivision)  return false
    return true
  })

  function openModal(placement: CardPlacement) {
    setActivePlacement(placement)
    setSelectedIds([])
    setTitle('')
    setMatchType(MatchType.SINGLES)
    setStipulation('')
    setChampionshipId('')
    setError(null)
    setModalOpen(true)
  }

  function toggleParticipant(id: number) {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])
  }

  const selectedNames = characters.filter(c => selectedIds.includes(c.id)).map(c => ({id: c.id, name: c.name}))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (selectedIds.length < 2) { setError('Please select at least 2 participants'); return }
    setSubmitting(true); setError(null)

    const fd = new FormData()
    fd.append('showId',         String(showId))
    fd.append('participants',   selectedIds.join(','))
    fd.append('title',          title)
    fd.append('matchType',      matchType)
    fd.append('stipulation',    stipulation)
    fd.append('championshipId', championshipId)
    fd.append('placement',      activePlacement)

    const res = await fetch('/api/matches', { method: 'POST', body: fd })
    if (res.ok) {
      window.location.href = `/shows/${showId}`
    } else {
      setError('Failed to create match')
      setSubmitting(false)
    }
  }

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-4">
      {slots.map(({ placement, count }) => {
        const placementMatches = matches.filter(m => m.placement === placement)
        const slotItems: (Match | null)[] = [
          ...placementMatches.slice(0, count),
          ...Array(Math.max(0, count - placementMatches.length)).fill(null),
        ]
        const widthClass =
          placement === 'MAIN'      ? 'max-w-lg'  :
          placement === 'SEMI_MAIN' ? 'max-w-2xl' :
          placement === 'MIDCARD'   ? 'max-w-3xl' : 'max-w-5xl'

        return (
          <div key={placement} className={`mx-auto w-full ${widthClass}`}>
            <div className="flex gap-3">
              {slotItems.map((match, i) => (
                <div
                  key={match ? match.id : `empty-${placement}-${i}`}
                  className={`flex-1 rounded-lg border-2 ${PLACEMENT_COLORS[placement]} ${match ? '' : 'opacity-60'}`}
                >
                  {match ? (
                    <div className="p-4">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className={`text-xs px-2 py-0.5 rounded font-medium ${PLACEMENT_BADGE[placement]}`}>
                          {PLACEMENT_LABELS[placement]}
                        </span>
                        <span className="text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded">{match.matchType}</span>
                        {match.stipulation && (
                          <span className="text-xs bg-red-900 text-red-200 px-2 py-0.5 rounded">{match.stipulation}</span>
                        )}
                        {match.championship && (
                          <span className="text-xs bg-yellow-900 text-yellow-200 px-2 py-0.5 rounded">🏆 {match.championship.name}</span>
                        )}
                        <span className={`text-xs px-2 py-0.5 rounded ml-auto ${FINISH_COLORS[match.finish] ?? 'bg-gray-600 text-gray-300'}`}>
                          {match.finish === 'UNFINISHED' ? 'Pending' : match.finish}
                        </span>
                      </div>
                      {match.title && <div className="text-sm font-semibold text-white mb-2">{match.title}</div>}
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {match.participants.map(p => (
                          <Link key={p.id} href={`/roster/${p.characterId}`}
                            className={`text-xs px-2 py-1 rounded font-medium transition ${
                              p.isWinner ? 'bg-green-900 text-green-200 border border-green-700' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            }`}
                          >
                            {p.character.name}{p.isWinner ? ' 🏆' : ''}
                          </Link>
                        ))}
                      </div>
                      <Link href={`/matches/${match.id}`} className="text-xs text-blue-400 hover:text-blue-300 transition">
                        View details →
                      </Link>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => openModal(placement as CardPlacement)}
                      className="w-full h-full min-h-[90px] p-4 flex flex-col items-center justify-center gap-2 hover:opacity-100 transition group cursor-pointer"
                    >
                      <div className="w-8 h-8 rounded-full border-2 border-current flex items-center justify-center text-lg group-hover:scale-110 transition-transform">+</div>
                      <span className="text-xs font-medium uppercase tracking-wide">{PLACEMENT_LABELS[placement]}</span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )
      })}

      {/* ── Add Match Modal ─────────────────────────────────────────────────── */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={e => e.target === e.currentTarget && setModalOpen(false)}
        >
          <div className="bg-gray-800 rounded-lg border border-gray-700 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b border-gray-700 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-white">Add Match</h3>
                <span className={`text-xs px-2 py-0.5 rounded font-medium ${PLACEMENT_BADGE[activePlacement]}`}>
                  {PLACEMENT_LABELS[activePlacement]}
                </span>
              </div>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-white text-2xl">×</button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {/* Participants trigger */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Participants <span className="text-red-400">*</span>
                </label>
                <div onClick={() => setParticipantModalOpen(true)}
                  className="min-h-[48px] bg-gray-900 border border-gray-600 rounded p-3 flex flex-wrap gap-2 cursor-pointer hover:border-gray-500 transition"
                >
                  {selectedNames.length === 0
                    ? <span className="text-gray-500 text-sm italic">Click to select participants...</span>
                    : selectedNames.map(({id, name}) => (
                        <span key={id} className="bg-blue-900 text-blue-200 px-2 py-1 rounded text-xs">{name}</span>
                      ))
                  }
                </div>
                <p className="text-xs text-gray-500 mt-1">Select 2 or more wrestlers</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Match Title <span className="text-gray-500">(optional)</span></label>
                <input type="text" value={title} onChange={e => setTitle(e.target.value)}
                  placeholder="Leave blank for auto-generated"
                  className="w-full bg-gray-900 border border-gray-600 text-white rounded p-3 placeholder-gray-500 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Match Type</label>
                <select value={matchType} onChange={e => setMatchType(e.target.value as MatchType)}
                  className="w-full bg-gray-900 border border-gray-600 text-white rounded p-3 focus:border-blue-500 focus:outline-none"
                >
                  {Object.values(MatchType).map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Stipulation (Optional)</label>
                <select value={stipulation} onChange={e => setStipulation(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-600 text-white rounded p-3 focus:border-blue-500 focus:outline-none"
                >
                  <option value="">None</option>
                  {Object.values(Stipulation).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Championship (Optional)</label>
                <select value={championshipId} onChange={e => setChampionshipId(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-600 text-white rounded p-3 focus:border-blue-500 focus:outline-none"
                >
                  <option value="">No Title</option>
                  {championships.map(c => <option key={c.id} value={c.id}>🏆 {c.name}</option>)}
                </select>
              </div>

              {error && <p className="text-red-400 text-sm">{error}</p>}

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setModalOpen(false)}
                  className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded font-medium transition"
                >Cancel</button>
                <button type="submit" disabled={submitting}
                  className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded font-medium transition"
                >
                  {submitting ? 'Adding...' : 'Add Match'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Participant Picker Modal ─────────────────────────────────────────── */}
      {participantModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60] p-4"
          onClick={e => e.target === e.currentTarget && setParticipantModalOpen(false)}
        >
          <div className="bg-gray-800 rounded-lg border border-gray-700 max-w-4xl w-full max-h-[85vh] flex flex-col">

            {/* Header */}
            <div className="p-4 border-b border-gray-700 flex justify-between items-center">
              <h3 className="text-xl font-bold text-white">Select Participants</h3>
              <button onClick={() => setParticipantModalOpen(false)} className="text-gray-400 hover:text-white text-2xl">×</button>
            </div>

            {/* Selected count */}
            <div className="px-4 py-2 border-b border-gray-700 flex items-center justify-between">
              <span className="text-sm text-gray-300">
                Selected: <span className="text-blue-400 font-bold">{selectedIds.length}</span>
              </span>
              <span className="text-xs text-gray-500">{filteredCharacters.length} shown</span>
            </div>

            {/* Filters */}
            <div className="px-4 py-3 border-b border-gray-700 space-y-2 bg-gray-800/80">
              <FilterBar
                label="Align"
                options={FILTER_ALIGNMENTS}
                value={filterAlignment}
                onChange={setFilterAlignment}
                colorFn={v => ALIGNMENT_COLORS[v]}
              />
              <FilterBar
                label="Gender"
                options={FILTER_GENDERS}
                value={filterGender}
                onChange={setFilterGender}
                colorFn={v => GENDER_COLORS[v]}
              />
              <FilterBar
                label="Division"
                options={FILTER_DIVISIONS}
                value={filterDivision}
                onChange={setFilterDivision}
                colorFn={v => DIVISION_COLORS[v]}
              />
            </div>

            {/* Character grid */}
            <div className="flex-1 overflow-y-auto p-4">
              {filteredCharacters.length === 0 ? (
                <div className="text-center py-12 text-gray-500">No wrestlers match the filters.</div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {filteredCharacters.map(char => {
                    const isBooked = bookedCharacterIds.includes(char.id)
                    const isSelected = selectedIds.includes(char.id)
                    return (
                    <button
                      key={char.id}
                      type="button"
                      onClick={() => toggleParticipant(char.id)}
                      className={`p-3 rounded-lg border-2 transition text-left relative ${
                        isSelected
                          ? 'bg-blue-900 border-blue-500'
                          : isBooked
                          ? 'bg-gray-800 border-gray-700 opacity-50 hover:opacity-75'
                          : 'bg-gray-700 border-transparent hover:bg-gray-600'
                      }`}
                    >
                      {isBooked && !isSelected && (
                        <span className="absolute top-1.5 right-1.5 text-xs bg-gray-600 text-gray-400 px-1 rounded">booked</span>
                      )}
                      <div className="font-medium text-white text-sm mb-2">{char.name}</div>
                      <div className="flex flex-wrap gap-1">
                        <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${ALIGNMENT_COLORS[char.alignment] ?? 'bg-gray-600 text-gray-300'}`}>
                          {char.alignment}
                        </span>
                        <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${GENDER_COLORS[char.gender] ?? 'bg-gray-600 text-gray-300'}`}>
                          {char.gender}
                        </span>
                        <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${DIVISION_COLORS[char.division] ?? 'bg-gray-600 text-gray-300'}`}>
                          {DIVISION_LABELS[char.division] ?? char.division}
                        </span>
                      </div>
                    </button>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-700 flex justify-between items-center">
              <button onClick={() => setSelectedIds([])} className="px-4 py-2 text-gray-400 hover:text-white transition text-sm">
                Clear selection
              </button>
              <button onClick={() => setParticipantModalOpen(false)}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium transition"
              >
                Confirm ({selectedIds.length})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}