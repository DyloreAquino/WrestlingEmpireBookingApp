// app/shows/[id]/MatchForm.tsx
'use client'

import { useState } from 'react'
import { MatchType, Stipulation, FinishType } from '@/generated/prisma/enums'

interface Character {
  id: number
  name: string
  alignment: string
  division: string
}

interface Championship {
  id: number
  name: string
}

interface MatchFormProps {
  showId: number
  characters: Character[]
  championships: Championship[]
}

export default function MatchForm({ showId, characters, championships }: MatchFormProps) {
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [matchType, setMatchType] = useState<MatchType>(MatchType.SINGLES)
  const [stipulation, setStipulation] = useState<Stipulation | ''>('')
  const [championshipId, setChampionshipId] = useState<string>('')

  const toggleParticipant = (id: number) => {
    setSelectedIds(prev => 
      prev.includes(id) 
        ? prev.filter(i => i !== id)
        : [...prev, id]
    )
  }

  const selectedNames = characters
    .filter(c => selectedIds.includes(c.id))
    .map(c => c.name)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    if (selectedIds.length < 2) {
        alert('Please select at least 2 participants')
        setIsModalOpen(true)
        return
    }

    const formData = new FormData(e.currentTarget)

    const res = await fetch('/api/matches', {
        method: 'POST',
        body: formData,
    })

    if (res.ok) {
        const data = await res.json()
        window.location.href = `/match/${data.id}`
    } else {
        alert('Failed to create match')
    }
    }

  return (
    <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 sticky top-6">
      <h2 className="text-xl font-bold text-white mb-4">Add Match</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="hidden" name="showId" value={showId} />
        <input type="hidden" name="participants" value={selectedIds.join(',')} />
        
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Participants <span className="text-red-400">*</span>
          </label>
          <div 
            onClick={() => setIsModalOpen(true)}
            className="min-h-15 bg-gray-900 border border-gray-600 rounded p-3 flex flex-wrap gap-2 cursor-pointer hover:border-gray-500 transition"
          >
            {selectedNames.length === 0 ? (
              <span className="text-gray-500 text-sm italic">Click to select participants...</span>
            ) : (
              selectedNames.map(name => (
                <span key={name} className="bg-blue-900 text-blue-200 px-3 py-1 rounded text-sm">
                  {name}
                </span>
              ))
            )}
          </div>
          <p className="text-xs text-gray-500 mt-1">Select 2 or more wrestlers</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Match Title <span className="text-gray-500">(optional)</span>
          </label>
          <input 
            type="text"
            name="title"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Leave blank for auto-generated title"
            className="w-full bg-gray-900 border border-gray-600 text-white rounded p-3 placeholder-gray-500 focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Match Type</label>
          <select 
            name="matchType"
            value={matchType}
            onChange={e => setMatchType(e.target.value as MatchType)}
            className="w-full bg-gray-900 border border-gray-600 text-white rounded p-3 focus:border-blue-500 focus:outline-none"
            required
          >
            {Object.values(MatchType).map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Stipulation (Optional)</label>
          <select 
            name="stipulation"
            value={stipulation}
            onChange={e => setStipulation(e.target.value as Stipulation || '')}
            className="w-full bg-gray-900 border border-gray-600 text-white rounded p-3 focus:border-blue-500 focus:outline-none"
          >
            <option value="">None</option>
            {Object.values(Stipulation).map(stip => (
              <option key={stip} value={stip}>{stip}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Championship (Optional)</label>
          <select 
            name="championshipId"
            value={championshipId}
            onChange={e => setChampionshipId(e.target.value)}
            className="w-full bg-gray-900 border border-gray-600 text-white rounded p-3 focus:border-blue-500 focus:outline-none"
          >
            <option value="">No Title</option>
            {championships.map(title => (
              <option key={title.id} value={title.id}>🏆 {title.name}</option>
            ))}
          </select>
        </div>

        <button 
          type="submit" 
          className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded font-medium transition"
        >
          Add Match
        </button>
      </form>

      {/* Modal */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={e => e.target === e.currentTarget && setIsModalOpen(false)}
        >
          <div className="bg-gray-800 rounded-lg border border-gray-700 max-w-4xl w-full max-h-[80vh] flex flex-col">
            <div className="p-4 border-b border-gray-700 flex justify-between items-center">
              <h3 className="text-xl font-bold text-white">Select Participants</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>

            <div className="p-4 border-b border-gray-700 bg-gray-750">
              <span className="text-gray-300">
                Selected: <span className="text-blue-400 font-bold">{selectedIds.length}</span> wrestlers
              </span>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {characters.map(char => (
                  <button
                    key={char.id}
                    type="button"
                    onClick={() => toggleParticipant(char.id)}
                    className={`p-4 rounded-lg border-2 transition text-left ${
                      selectedIds.includes(char.id)
                        ? 'bg-blue-900 border-blue-500'
                        : 'bg-gray-700 border-transparent hover:bg-gray-600'
                    }`}
                  >
                    <div className="font-medium text-white mb-1">{char.name}</div>
                    <div className="text-xs text-gray-400">{char.alignment} • {char.division}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 border-t border-gray-700 flex justify-end gap-3">
              <button 
                onClick={() => setSelectedIds([])}
                className="px-4 py-2 text-gray-400 hover:text-white transition"
              >
                Clear
              </button>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium transition"
              >
                Confirm Selection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}