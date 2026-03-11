'use client'

// app/settings/UniversePanel.tsx
import { useState } from 'react'

type Universe = {
  id: number
  name: string
  createdAt: Date
}

type Props = {
  universes: Universe[]
  activeUniverseId: number | null
  switchUniverse: (fd: FormData) => Promise<void>
  createUniverse: (fd: FormData) => Promise<void>
}

export default function UniversePanel({ universes, activeUniverseId, switchUniverse, createUniverse }: Props) {
  const [showCreate, setShowCreate] = useState(false)
  const [name, setName] = useState('')

  return (
    <div className="space-y-3 mb-10 mt-10">
      <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-4">Universes</h2>

      {universes.map(u => (
        <div
          key={u.id}
          className={`flex items-center justify-between gap-4 p-4 rounded-lg border ${
            u.id === activeUniverseId
              ? 'bg-blue-950/40 border-blue-700'
              : 'bg-gray-800 border-gray-700'
          }`}
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">🌍</span>
            <div>
              <div className="font-medium text-white text-sm">{u.name}</div>
              {u.id === activeUniverseId && (
                <div className="text-xs text-blue-400 mt-0.5">Active</div>
              )}
            </div>
          </div>

          {u.id !== activeUniverseId && (
            <form action={switchUniverse}>
              <input type="hidden" name="universeId" value={u.id} />
              <button
                type="submit"
                className="shrink-0 px-3 py-1.5 rounded-lg text-sm font-medium bg-gray-700 hover:bg-gray-600 text-gray-200 transition"
              >
                Switch
              </button>
            </form>
          )}
        </div>
      ))}

      {universes.length < 3 && (
        <div className="p-4 rounded-lg border border-dashed border-gray-600 bg-gray-800/50">
          {!showCreate ? (
            <button
              onClick={() => setShowCreate(true)}
              className="w-full text-sm text-gray-400 hover:text-white transition flex items-center justify-center gap-2"
            >
              <span className="text-lg">+</span> Create new universe
            </button>
          ) : (
            <form
              action={async (fd) => {
                await createUniverse(fd)
                setShowCreate(false)
                setName('')
              }}
              className="flex gap-2"
            >
              <input
                type="text"
                name="name"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Universe name"
                required
                autoFocus
                className="flex-1 bg-gray-900 border border-gray-600 text-white rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              />
              <button
                type="submit"
                className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition"
              >
                Create
              </button>
              <button
                type="button"
                onClick={() => { setShowCreate(false); setName('') }}
                className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg text-sm transition"
              >
                Cancel
              </button>
            </form>
          )}
        </div>
      )}

      {universes.length >= 3 && (
        <p className="text-xs text-gray-500 text-center">Maximum 3 universes reached.</p>
      )}
    </div>
  )
}