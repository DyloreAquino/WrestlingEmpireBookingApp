'use client'

// app/settings/ResetPanel.tsx
import { useState } from 'react'

type Stats = {
  wrestlers: number
  shows: number
  championships: number
  matches: number
  reigns: number
}

type Props = {
  stats: Stats
  resetRoster: (fd: FormData) => Promise<void>
  resetShows: (fd: FormData) => Promise<void>
  resetChampionships: (fd: FormData) => Promise<void>
  resetAll: (fd: FormData) => Promise<void>
}

type ConfirmState = {
  key: 'roster' | 'shows' | 'championships' | 'all'
  label: string
  description: string
  action: (fd: FormData) => Promise<void>
  danger: boolean
} | null

const ACTIONS = (
  stats: Stats,
  resetRoster: Props['resetRoster'],
  resetShows: Props['resetShows'],
  resetChampionships: Props['resetChampionships'],
  resetAll: Props['resetAll']
) => [
  {
    key: 'roster' as const,
    icon: '👤',
    label: 'Reset Roster',
    description: 'Deletes all wrestlers, factions, tag teams, rivalries, and friendships.',
    stat: `${stats.wrestlers} wrestler${stats.wrestlers !== 1 ? 's' : ''}`,
    action: resetRoster,
    danger: false,
  },
  {
    key: 'shows' as const,
    icon: '📺',
    label: 'Delete Shows',
    description: 'Deletes all shows and every match booked within them.',
    stat: `${stats.shows} show${stats.shows !== 1 ? 's' : ''}, ${stats.matches} match${stats.matches !== 1 ? 'es' : ''}`,
    action: resetShows,
    danger: false,
  },
  {
    key: 'championships' as const,
    icon: '🏆',
    label: 'Delete Championships',
    description: 'Deletes all title belts and their reign history.',
    stat: `${stats.championships} title${stats.championships !== 1 ? 's' : ''}, ${stats.reigns} reign${stats.reigns !== 1 ? 's' : ''}`,
    action: resetChampionships,
    danger: false,
  },
  {
    key: 'all' as const,
    icon: '💀',
    label: 'Delete Everything',
    description: 'Wipes the entire universe. This cannot be undone.',
    stat: 'Full reset',
    action: resetAll,
    danger: true,
  },
]

export default function ResetPanel({ stats, resetRoster, resetShows, resetChampionships, resetAll }: Props) {
  const [confirm, setConfirm] = useState<ConfirmState>(null)
  const actions = ACTIONS(stats, resetRoster, resetShows, resetChampionships, resetAll)

  return (
    <>
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-4">Reset Data</h2>

        {actions.map(item => (
          <div
            key={item.key}
            className={`flex items-center justify-between gap-4 p-4 rounded-lg border ${
              item.danger
                ? 'bg-red-950/30 border-red-900/50'
                : 'bg-gray-800 border-gray-700'
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <span className="text-2xl shrink-0">{item.icon}</span>
              <div className="min-w-0">
                <div className="font-medium text-white text-sm">{item.label}</div>
                <div className="text-xs text-gray-400 mt-0.5">{item.description}</div>
                <div className={`text-xs mt-1 font-mono ${item.danger ? 'text-red-400' : 'text-gray-500'}`}>
                  {item.stat}
                </div>
              </div>
            </div>
            <button
              onClick={() => setConfirm({
                key: item.key,
                label: item.label,
                description: item.description,
                action: item.action,
                danger: item.danger,
              })}
              className={`shrink-0 px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                item.danger
                  ? 'bg-red-700 hover:bg-red-600 text-white'
                  : 'bg-gray-700 hover:bg-gray-600 text-gray-200'
              }`}
            >
              {item.danger ? 'Wipe All' : 'Reset'}
            </button>
          </div>
        ))}
      </div>

      {/* Confirm modal */}
      {confirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          onClick={() => setConfirm(null)}
        >
          <div
            className="bg-gray-800 border border-gray-700 rounded-xl shadow-2xl w-full max-w-sm mx-4 p-6"
            onClick={e => e.stopPropagation()}
          >
            <div className="text-center mb-5">
              <div className="text-4xl mb-3">{confirm.danger ? '⚠️' : '🗑️'}</div>
              <h2 className="text-lg font-bold text-white">{confirm.label}</h2>
              <p className="text-sm text-gray-400 mt-1">{confirm.description}</p>
              {confirm.danger && (
                <p className="text-sm text-red-400 font-medium mt-2">This cannot be undone.</p>
              )}
            </div>

            <form
              action={async (fd) => {
                await confirm.action(fd)
                setConfirm(null)
              }}
              className="flex gap-2"
            >
              <button
                type="button"
                onClick={() => setConfirm(null)}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-gray-300 px-4 py-2 rounded-lg text-sm font-medium transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition text-white ${
                  confirm.danger ? 'bg-red-700 hover:bg-red-600' : 'bg-gray-600 hover:bg-gray-500'
                }`}
              >
                Yes, {confirm.danger ? 'wipe everything' : 'reset'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}