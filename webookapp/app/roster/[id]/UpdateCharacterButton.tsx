'use client'

// app/roster/[id]/UpdateCharacterButton.tsx
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function UpdateCharacterButton({ characterId }: { characterId: number }) {
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  async function handleUpdate() {
    setSaving(true)
    setError(null)

    const get = (field: string) =>
      (document.getElementById(`${field}-${characterId}`) as HTMLInputElement | HTMLSelectElement | null)?.value ?? ''

    const injured = (document.getElementById(`injured-${characterId}`) as HTMLInputElement | null)?.checked ?? false

    try {
      const res = await fetch(`/api/characters/${characterId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: get('name'),
          role: get('role'),
          gender: get('gender'),
          alignment: get('alignment'),
          division: get('division'),
          finisherName: get('finisherName').trim() || null,
          injured,
        }),
      })

      if (!res.ok) {
        const json = await res.json()
        setError(json.error ?? 'Update failed')
        return
      }

      router.refresh()
    } catch {
      setError('Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-2">
      {error && <p className="text-red-400 text-sm">{error}</p>}
      <button
        type="button"
        onClick={handleUpdate}
        disabled={saving}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-3 rounded font-medium transition cursor-pointer"
      >
        {saving ? 'Saving...' : 'Update Character'}
      </button>
    </div>
  )
}