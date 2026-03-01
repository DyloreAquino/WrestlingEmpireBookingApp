// app/roster/[id]/page.tsx
import { prisma } from '@db'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { Alignment, Division } from '@/generated/prisma/enums'

async function getCharacter(id: string) {
  const characterId = parseInt(id)
  
  if (isNaN(characterId)) {
    return null
  }
  
  const character = await prisma.character.findUnique({
    where: { id: characterId },
    include: {
      matchEntries: {
        include: { 
          match: { 
            include: { show: true } 
          } 
        }
        // Remove the orderBy here - we'll sort in JavaScript instead
      },
      titleReigns: { include: { championship: true } },
      faction: true,
      tagTeam: true
    }
  })
  
  // Sort matchEntries manually after fetching
  if (character) {
    character.matchEntries.sort((a, b) => {
      // Compare month first
      const monthOrder = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
      const monthDiff = monthOrder.indexOf(b.match.show.month) - monthOrder.indexOf(a.match.show.month)
      if (monthDiff !== 0) return monthDiff
      // If same month, compare week
      return b.match.show.week - a.match.show.week
    })
  }
  
  return character
}

// Server Action
async function updateCharacter(formData: FormData) {
  'use server'
  
  const id = parseInt(formData.get('id') as string)
  const alignment = formData.get('alignment') as Alignment
  const division = formData.get('division') as Division
  const injured = formData.get('injured') === 'on'
  
  if (isNaN(id)) return
  
  await prisma.character.update({
    where: { id },
    data: { alignment, division, injured }
  })
  
  revalidatePath(`/roster/${id}`)
}

export default async function CharacterPage({ 
  params 
}: { 
  params: Promise<{ id: string }> | { id: string } 
}) {
  const resolvedParams = await Promise.resolve(params)
  const id = resolvedParams.id
  
  const character = await getCharacter(id)
  
  if (!character) {
    notFound()
  }

  const wins = character.matchEntries.filter(e => e.isWinner).length
  const total = character.matchEntries.length

  return (
    <div className="p-4 max-w-2xl">
      <h1 className="text-3xl font-bold mb-2">{character.name}</h1>
      <div className="text-gray-600 mb-4">
        {character.role} • {character.gender} • {character.division}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded">
        <div>
          <div className="text-2xl font-bold">{wins}</div>
          <div className="text-sm text-gray-600">Wins</div>
        </div>
        <div>
          <div className="text-2xl font-bold">{total - wins}</div>
          <div className="text-sm text-gray-600">Losses</div>
        </div>
        <div>
          <div className="text-2xl font-bold">
            {total > 0 ? Math.round((wins/total)*100) : 0}%
          </div>
          <div className="text-sm text-gray-600">Win Rate</div>
        </div>
      </div>

      {/* Edit Form */}
      <form action={updateCharacter} className="mb-6 p-4 border rounded">
        <input type="hidden" name="id" value={character.id} />
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium">Alignment</label>
            <select name="alignment" defaultValue={character.alignment} className="w-full border rounded p-2">
              <option value={Alignment.FACE}>FACE</option>
              <option value={Alignment.HEEL}>HEEL</option>
              <option value={Alignment.TWEENER}>TWEENER</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium">Division</label>
            <select name="division" defaultValue={character.division} className="w-full border rounded p-2">
              <option value={Division.TOP_CARD}>TOP_CARD</option>
              <option value={Division.MID_CARD}>MID_CARD</option>
              <option value={Division.UNDER_CARD}>UNDER_CARD</option>
              <option value={Division.TAG}>TAG</option>
            </select>
          </div>
        </div>
        
        <label className="flex items-center gap-2 mb-4">
          <input type="checkbox" name="injured" defaultChecked={character.injured} />
          <span>Injured</span>
        </label>
        
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
          Update Stats
        </button>
      </form>

      {/* Match History */}
      <h2 className="text-xl font-bold mb-2">Match History</h2>
      <div className="space-y-2">
        {character.matchEntries.map(entry => (
          <div key={entry.id} className="p-2 border rounded flex justify-between">
            <div>
              <Link href={`/matches/${entry.matchId}`} className="font-medium hover:underline">
                {entry.match.matchType} Match
              </Link>
              <div className="text-sm text-gray-600">
                {entry.match.show.month} Week {entry.match.show.week}
              </div>
            </div>
            <div className={entry.isWinner ? 'text-green-600 font-bold' : 'text-red-600'}>
              {entry.isWinner ? 'WIN' : 'LOSS'}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}