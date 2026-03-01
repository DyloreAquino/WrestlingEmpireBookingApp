'use client'

// app/roster/CreateGroupForm.tsx
import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Character {
  id: number
  name: string
  alignment: string
  division: string
}

interface Props {
  characters: Character[]
}

export default function CreateGroupForm({ characters }: Props) {
  const [groupType, setGroupType] = useState<'faction' | 'tag_team'>('faction')
  const [name, setName] = useState('')
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const toggleMember = (id: number) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const selectedNames = characters
    .filter(c => selectedIds.includes(c.id))
    .map(c => c.name)

  const minMembers = groupType === 'tag_team' ? 2 : 2

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!name.trim()) {
      setError('Please enter a name')
      return
    }
    if (selectedIds.length < minMembers) {
      setError(`Please select at least ${minMembers} members`)
      return
    }

    setSaving(true)
    setError(null)

    try {
      const res = await fetch('/api/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: groupType, name: name.trim(), memberIds: selectedIds }),
      })

      if (!res.ok) {
        const json = await res.json()
        setError(json.error ?? 'Failed to create group')
        return
      }

      setName('')
      setSelectedIds([])
      setGroupType('faction')
      router.refresh()
    } catch {
      setError('Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
      <h2 className="text-xl font-bold text-white mb-4">Create Group</h2>

      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Type toggle */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Type</label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setGroupType('faction')}
              className={`flex-1 py-2 rounded text-sm font-medium transition ${
                groupType === 'faction'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              👥 Faction
            </button>
            <button
              type="button"
              onClick={() => setGroupType('tag_team')}
              className={`flex-1 py-2 rounded text-sm font-medium transition ${
                groupType === 'tag_team'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              🤝 Tag Team
            </button>
          </div>
        </div>

        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            {groupType === 'faction' ? 'Faction' : 'Tag Team'} Name <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder={groupType === 'faction' ? 'e.g. The Shield' : 'e.g. The Hardy Boyz'}
            className="w-full bg-gray-900 border border-gray-600 text-white rounded p-3 placeholder-gray-500 focus:border-blue-500 focus:outline-none"
          />
        </div>

        {/* Members picker */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Members <span className="text-red-400">*</span>
          </label>
          <div
            onClick={() => setIsModalOpen(true)}
            className="min-h-12 bg-gray-900 border border-gray-600 rounded p-3 flex flex-wrap gap-2 cursor-pointer hover:border-gray-500 transition"
          >
            {selectedNames.length === 0 ? (
              <span className="text-gray-500 text-sm italic">Click to select members...</span>
            ) : (
              selectedNames.map(n => (
                <span key={n} className="bg-blue-900 text-blue-200 px-3 py-1 rounded text-sm">{n}</span>
              ))
            )}
          </div>
          <p className="text-xs text-gray-500 mt-1">Select at least 2 members</p>
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-4 py-3 rounded font-medium transition"
        >
          {saving ? 'Creating...' : `Create ${groupType === 'faction' ? 'Faction' : 'Tag Team'}`}
        </button>
      </form>

      {/* Member picker modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={e => e.target === e.currentTarget && setIsModalOpen(false)}
        >
          <div className="bg-gray-800 rounded-lg border border-gray-700 max-w-4xl w-full max-h-[80vh] flex flex-col">
            <div className="p-4 border-b border-gray-700 flex justify-between items-center">
              <h3 className="text-xl font-bold text-white">Select Members</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>

            <div className="p-4 border-b border-gray-700">
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
                    onClick={() => toggleMember(char.id)}
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