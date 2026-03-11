'use client'

import { useState } from 'react'
import { FinishType } from "@/app/lib/types"

interface Participant {
  id: number
  characterId: number
  character: { name: string; alignment: string; division: string }
}

interface Match {
  id: number
  title: string | null
  matchType: string
  stipulation: string | null
  championship: { name: string } | null
  participants: Participant[]
}

interface SimulateFormProps {
  match: Match
  index: number
}

export default function SimulateMatchCard({ match, index }: SimulateFormProps) {
  const [winnerIds, setWinnerIds] = useState<number[]>([])
  const [finish, setFinish] = useState<string>(FinishType.PINFALL)
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const toggleWinner = (characterId: number) => {
    setWinnerIds(prev =>
      prev.includes(characterId)
        ? prev.filter(id => id !== characterId)
        : [...prev, characterId]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (winnerIds.length === 0) {
      alert('Select at least one winner')
      return
    }

    setLoading(true)
    const res = await fetch('/api/matches/simulate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ matchId: match.id, winnerIds, finish })
    })

    if (res.ok) {
      setSubmitted(true)
    } else {
      alert('Failed to simulate match')
    }
    setLoading(false)
  }

  if (submitted) {
    return (
      <div className="bg-gray-800 rounded-lg border border-green-700 p-6 flex flex-col items-center justify-center gap-3 min-h-48">
        <div className="text-4xl">✅</div>
        <div className="font-bold text-white text-center">{match.title || `${match.matchType} Match`}</div>
        <div className="text-green-400 text-sm">Simulated — {finish}</div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="bg-gray-800 rounded-lg border border-gray-700 p-5 flex flex-col gap-4">

      {/* Match Header */}
      <div>
        <div className="flex flex-wrap gap-2 mb-2">
          <span className="text-gray-500 font-mono text-xs">#{index + 1}</span>
          <span className="bg-gray-700 text-gray-200 px-2 py-0.5 rounded text-xs font-medium">
            {match.matchType}
          </span>
          {match.stipulation && (
            <span className="bg-red-900 text-red-200 px-2 py-0.5 rounded text-xs font-medium">
              {match.stipulation}
            </span>
          )}
          {match.championship && (
            <span className="bg-yellow-900 text-yellow-200 px-2 py-0.5 rounded text-xs font-medium">
              🏆 {match.championship.name}
            </span>
          )}
        </div>
        <h3 className="font-bold text-white">
          {match.title || `${match.matchType} Match`}
        </h3>
      </div>

      {/* Winner Selector */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Winner(s) <span className="text-red-400">*</span>
          {winnerIds.length > 0 && (
            <span className="ml-2 text-blue-400 font-normal">{winnerIds.length} selected</span>
          )}
        </label>
        <div className="grid grid-cols-2 gap-2">
          {match.participants.map(p => (
            <button
              key={p.characterId}
              type="button"
              onClick={() => toggleWinner(p.characterId)}
              className={`p-3 rounded-lg border-2 transition text-left ${
                winnerIds.includes(p.characterId)
                  ? 'bg-green-900/40 border-green-500'
                  : 'bg-gray-700 border-transparent hover:bg-gray-600'
              }`}
            >
              <div className="font-medium text-white text-sm">{p.character.name}</div>
              <div className="text-xs text-gray-400">{p.character.alignment} • {p.character.division}</div>
              {winnerIds.includes(p.characterId) && (
                <div className="text-green-400 text-xs mt-1 font-semibold">🏆 Winner</div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Finish */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Finish</label>
        <select
          value={finish}
          onChange={e => setFinish(e.target.value)}
          className="w-full bg-gray-900 border border-gray-600 text-white rounded p-2.5 focus:border-blue-500 focus:outline-none text-sm"
        >
          {Object.values(FinishType).filter(f => f !== FinishType.UNFINISHED).map(f => (
            <option key={f} value={f}>{f}</option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        disabled={loading || winnerIds.length === 0}
        className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:text-gray-500 text-white px-4 py-2.5 rounded font-medium transition text-sm"
      >
        {loading ? 'Simulating...' : 'Simulate Match'}
      </button>
    </form>
  )
}
