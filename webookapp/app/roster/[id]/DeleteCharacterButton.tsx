'use client'

// app/roster/[id]/DeleteCharacterButton.tsx
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function DeleteCharacterButton({ characterId, characterName }: { characterId: number; characterName: string }) {
  const [showConfirm, setShowConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const router = useRouter()

  async function handleDelete() {
    setDeleting(true)
    await fetch(`/api/characters/${characterId}`, { method: 'DELETE' })
    router.push('/roster')
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setShowConfirm(true)}
        className="w-full bg-red-900 hover:bg-red-800 text-red-200 px-4 py-3 rounded font-medium transition border border-red-700"
      >
        Delete Character
      </button>

      {showConfirm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 max-w-sm w-full shadow-xl">
            <h3 className="text-lg font-bold text-white mb-2">Delete Character?</h3>
            <p className="text-gray-400 text-sm mb-6">
              This will permanently delete <span className="text-white font-medium">{characterName}</span> and all their match history. This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                disabled={deleting}
                className="flex-1 px-4 py-2 rounded bg-gray-700 hover:bg-gray-600 text-gray-300 font-medium transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 px-4 py-2 rounded bg-red-700 hover:bg-red-600 text-white font-bold transition disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}