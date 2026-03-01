// app/roster/[id]/page.tsx
import { prisma } from '@db'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { Alignment, Division, Role } from '@/generated/prisma/enums'

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
      },
      titleReigns: { include: { championship: true } },
      faction: true,
      tagTeam: true
    }
  })
  
  if (character) {
    character.matchEntries.sort((a, b) => {
      const monthOrder = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
      const monthDiff = monthOrder.indexOf(b.match.show.month) - monthOrder.indexOf(a.match.show.month)
      if (monthDiff !== 0) return monthDiff
      return b.match.show.week - a.match.show.week
    })
  }
  
  return character
}

async function updateCharacter(formData: FormData) {
  'use server'
  
  const id = parseInt(formData.get('id') as string)
  const name = formData.get('name') as string
  const role = formData.get('role') as Role
  const alignment = formData.get('alignment') as Alignment
  const division = formData.get('division') as Division
  const finisherName = formData.get('finisherName') as string || null
  const injured = formData.get('injured') === 'on'
  
  if (isNaN(id)) return
  
  await prisma.character.update({
    where: { id },
    data: { name, role, alignment, division, finisherName, injured }
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
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <div className="p-6 max-w-6xl mx-auto">
        {/* Breadcrumb */}
        <div className="mb-4 text-sm text-gray-400">
          <Link href="/roster" className="hover:text-white transition">Roster</Link>
          <span className="mx-2">→</span>
          <span className="text-white">{character.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column - Character Info & Edit */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Character Header Card */}
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
              <h1 className="text-3xl font-bold text-white mb-2">{character.name}</h1>
              
              <div className="flex flex-wrap gap-2 mb-4">
                <span className={`
                  px-3 py-1 rounded text-sm font-medium
                  ${character.alignment === 'FACE' ? 'bg-blue-900 text-blue-200' : 
                    character.alignment === 'HEEL' ? 'bg-red-900 text-red-200' : 
                    'bg-purple-900 text-purple-200'}
                `}>
                  {character.alignment}
                </span>
                <span className="bg-gray-700 text-gray-300 px-3 py-1 rounded text-sm">
                  {character.division}
                </span>
                <span className="bg-gray-700 text-gray-300 px-3 py-1 rounded text-sm">
                  {character.gender}
                </span>
                {character.injured && (
                  <span className="bg-red-900 text-red-200 px-3 py-1 rounded text-sm font-medium">
                    INJURED
                  </span>
                )}
              </div>

              <div className="space-y-2 text-sm text-gray-400">
                <div><span className="text-gray-500">Role:</span> {character.role}</div>
                {character.finisherName && (
                  <div><span className="text-gray-500">Finisher:</span> {character.finisherName}</div>
                )}
                {character.faction && (
                  <div><span className="text-gray-500">Faction:</span> {character.faction.name}</div>
                )}
                {character.tagTeam && (
                  <div><span className="text-gray-500">Tag Team:</span> {character.tagTeam.name}</div>
                )}
              </div>
            </div>

            {/* Stats Card */}
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
              <h2 className="text-lg font-bold text-white mb-4">Career Stats</h2>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-gray-900 rounded">
                  <div className="text-2xl font-bold text-green-400">{wins}</div>
                  <div className="text-xs text-gray-500 uppercase">Wins</div>
                </div>
                <div className="text-center p-3 bg-gray-900 rounded">
                  <div className="text-2xl font-bold text-red-400">{total - wins}</div>
                  <div className="text-xs text-gray-500 uppercase">Losses</div>
                </div>
                <div className="text-center p-3 bg-gray-900 rounded">
                  <div className="text-2xl font-bold text-blue-400">
                    {total > 0 ? Math.round((wins/total)*100) : 0}%
                  </div>
                  <div className="text-xs text-gray-500 uppercase">Win Rate</div>
                </div>
              </div>
              <div className="mt-4 text-center text-gray-500 text-sm">
                {total} Total Matches
              </div>
            </div>

            {/* Current Championships */}
            {character.titleReigns.filter(r => r.isCurrent).length > 0 && (
              <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                <h2 className="text-lg font-bold text-white mb-4">Current Championships</h2>
                <div className="space-y-2">
                  {character.titleReigns
                    .filter(r => r.isCurrent)
                    .map(reign => (
                      <div key={reign.id} className="flex items-center gap-3 p-3 bg-yellow-900/30 border border-yellow-700 rounded">
                        <span className="text-2xl">🏆</span>
                        <div>
                          <div className="font-medium text-yellow-200">{reign.championship.name}</div>
                          <div className="text-xs text-yellow-400/70">
                            Since {reign.startDate.toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Edit Form */}
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
              <h2 className="text-lg font-bold text-white mb-4">Edit Character</h2>
              
              <form action={updateCharacter} className="space-y-4">
                <input type="hidden" name="id" value={character.id} />
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Name</label>
                  <input 
                    type="text"
                    name="name"
                    defaultValue={character.name}
                    className="w-full bg-gray-900 border border-gray-600 text-white rounded p-3 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Role</label>
                  <select 
                    name="role"
                    defaultValue={character.role}
                    className="w-full bg-gray-900 border border-gray-600 text-white rounded p-3 focus:border-blue-500 focus:outline-none"
                  >
                    {Object.values(Role).map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Alignment</label>
                  <select 
                    name="alignment"
                    defaultValue={character.alignment}
                    className="w-full bg-gray-900 border border-gray-600 text-white rounded p-3 focus:border-blue-500 focus:outline-none"
                  >
                    {Object.values(Alignment).map(a => (
                      <option key={a} value={a}>{a}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Division</label>
                  <select 
                    name="division"
                    defaultValue={character.division}
                    className="w-full bg-gray-900 border border-gray-600 text-white rounded p-3 focus:border-blue-500 focus:outline-none"
                  >
                    {Object.values(Division).map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Finisher Name</label>
                  <input 
                    type="text"
                    name="finisherName"
                    defaultValue={character.finisherName || ''}
                    placeholder="Optional"
                    className="w-full bg-gray-900 border border-gray-600 text-white rounded p-3 placeholder-gray-500 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <label className="flex items-center gap-3 p-3 bg-gray-900 rounded border border-gray-600 cursor-pointer hover:border-gray-500 transition">
                  <input 
                    type="checkbox" 
                    name="injured" 
                    defaultChecked={character.injured}
                    className="w-5 h-5 rounded border-gray-600 text-red-600 focus:ring-red-500 bg-gray-700"
                  />
                  <span className="text-gray-300">Injured</span>
                </label>
                
                <button 
                  type="submit" 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded font-medium transition"
                >
                  Update Character
                </button>
              </form>
            </div>

          </div>

          {/* Right Column - Match History */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-bold text-white mb-4">Match History ({character.matchEntries.length})</h2>
            
            {character.matchEntries.length === 0 ? (
              <div className="text-center py-12 text-gray-500 bg-gray-800 rounded-lg border border-gray-700">
                No matches recorded yet.
              </div>
            ) : (
              <div className="space-y-3">
                {character.matchEntries.map((entry, index) => (
                  <div 
                    key={entry.id} 
                    className="p-4 bg-gray-800 rounded-lg border border-gray-700 hover:border-gray-600 transition"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-gray-500 font-mono text-sm">#{character.matchEntries.length - index}</span>
                          <Link 
                            href={`/matches/${entry.matchId}`}
                            className="font-medium text-white hover:text-blue-400 transition"
                          >
                            {entry.match.title || `${entry.match.matchType} Match`}
                          </Link>
                        </div>
                        
                        <div className="flex flex-wrap gap-2 mb-2">
                          <span className="bg-gray-700 text-gray-300 px-2 py-1 rounded text-xs">
                            {entry.match.matchType}
                          </span>
                          {entry.match.stipulation && (
                            <span className="bg-red-900 text-red-200 px-2 py-1 rounded text-xs">
                              {entry.match.stipulation}
                            </span>
                          )}
                          {entry.match.championshipId && (
                            <span className="bg-yellow-900 text-yellow-200 px-2 py-1 rounded text-xs">
                              Title Match
                            </span>
                          )}
                        </div>

                        <div className="text-sm text-gray-400">
                          <Link 
                            href={`/shows/${entry.match.showId}`}
                            className="hover:text-white transition"
                          >
                            {entry.match.show.title || `${entry.match.show.type} - ${entry.match.show.month} Week ${entry.match.show.week}`}
                          </Link>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-1">
                        {entry.isWinner ? (
                          <span className="bg-green-900 text-green-200 px-3 py-1 rounded font-bold text-sm">
                            WIN
                          </span>
                        ) : (
                          <span className="bg-red-900 text-red-200 px-3 py-1 rounded font-bold text-sm">
                            LOSS
                          </span>
                        )}
                        {entry.match.finish && entry.match.finish !== 'UNFINISHED' && (
                          <span className="text-xs text-gray-500">{entry.match.finish}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}