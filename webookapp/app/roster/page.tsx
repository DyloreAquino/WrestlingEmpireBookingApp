// app/roster/page.tsx
import { prisma } from '@db'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { Role, Gender, Alignment, Division } from '@/generated/prisma/enums'

async function getRoster() {
  const [characters, factions, tagTeams] = await Promise.all([
    prisma.character.findMany({
      orderBy: { name: 'asc' },
      include: { faction: true, tagTeam: true }
    }),
    prisma.faction.findMany({ include: { members: true } }),
    prisma.tagTeam.findMany({ include: { members: true } })
  ])
  return { characters, factions, tagTeams }
}

async function createCharacter(formData: FormData) {
  'use server'
  
  const name = formData.get('name') as string
  const role = formData.get('role') as Role
  const gender = formData.get('gender') as Gender
  const alignment = formData.get('alignment') as Alignment
  const division = formData.get('division') as Division
  const finisherName = formData.get('finisherName') as string || null

  const character = await prisma.character.create({
    data: {
      name,
      role,
      gender,
      alignment,
      division,
      finisherName,
      injured: false
    }
  })

  revalidatePath('/roster')
  redirect(`/roster/${character.id}`)
}

export default async function RosterPage() {
  const { characters, factions, tagTeams } = await getRoster()

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <div className="p-6 max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-white">Roster</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Characters */}
            <section>
              <h2 className="text-xl font-bold text-white mb-4">Wrestlers ({characters.length})</h2>
              {characters.length === 0 ? (
                <div className="text-center py-12 text-gray-500 bg-gray-800 rounded-lg border border-gray-700">
                  No wrestlers created yet.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {characters.map(c => (
                    <Link 
                      key={c.id} 
                      href={`/roster/${c.id}`}
                      className="p-4 bg-gray-800 rounded-lg border border-gray-700 hover:border-gray-600 hover:bg-gray-750 transition"
                    >
                      <div className="font-medium text-white text-lg">{c.name}</div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <span className={`
                          text-xs px-2 py-1 rounded
                          ${c.alignment === 'FACE' ? 'bg-blue-900 text-blue-200' : 
                            c.alignment === 'HEEL' ? 'bg-red-900 text-red-200' : 
                            'bg-purple-900 text-purple-200'}
                        `}>
                          {c.alignment}
                        </span>
                        <span className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded">
                          {c.division}
                        </span>
                        {c.injured && (
                          <span className="text-xs bg-red-900 text-red-200 px-2 py-1 rounded">
                            INJURED
                          </span>
                        )}
                      </div>
                      {(c.faction || c.tagTeam) && (
                        <div className="text-sm text-gray-400 mt-2">
                          {c.faction && <>👥 {c.faction.name}</>}
                          {c.tagTeam && <>🤝 {c.tagTeam.name}</>}
                        </div>
                      )}
                    </Link>
                  ))}
                </div>
              )}
            </section>

            {/* Factions */}
            <section>
              <h2 className="text-xl font-bold text-white mb-4">Factions ({factions.length})</h2>
              {factions.length === 0 ? (
                <div className="text-gray-500 text-sm">No factions created yet.</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {factions.map(f => (
                    <div key={f.id} className="p-4 bg-gray-800 rounded-lg border border-gray-700">
                      <div className="font-medium text-white text-lg mb-2">{f.name}</div>
                      <div className="flex flex-wrap gap-2">
                        {f.members.map(m => (
                          <Link 
                            key={m.id} 
                            href={`/roster/${m.id}`}
                            className="text-sm bg-gray-700 text-gray-300 px-3 py-1 rounded hover:bg-gray-600 transition"
                          >
                            {m.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Tag Teams */}
            <section>
              <h2 className="text-xl font-bold text-white mb-4">Tag Teams ({tagTeams.length})</h2>
              {tagTeams.length === 0 ? (
                <div className="text-gray-500 text-sm">No tag teams created yet.</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {tagTeams.map(t => (
                    <div key={t.id} className="p-4 bg-gray-800 rounded-lg border border-gray-700">
                      <div className="font-medium text-white text-lg mb-2">{t.name}</div>
                      <div className="flex gap-2">
                        {t.members.map(m => (
                          <Link 
                            key={m.id} 
                            href={`/roster/${m.id}`}
                            className="text-sm bg-gray-700 text-gray-300 px-3 py-1 rounded hover:bg-gray-600 transition"
                          >
                            {m.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

          </div>

          {/* Create Character Form */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 sticky top-6">
              <h2 className="text-xl font-bold text-white mb-4">Create Character</h2>
              
              <form action={createCharacter} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Name *</label>
                  <input 
                    type="text"
                    name="name"
                    required
                    placeholder="Enter character name"
                    className="w-full bg-gray-900 border border-gray-600 text-white rounded p-3 placeholder-gray-500 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Role</label>
                  <select 
                    name="role"
                    className="w-full bg-gray-900 border border-gray-600 text-white rounded p-3 focus:border-blue-500 focus:outline-none"
                  >
                    {Object.values(Role).map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Gender</label>
                  <select 
                    name="gender"
                    className="w-full bg-gray-900 border border-gray-600 text-white rounded p-3 focus:border-blue-500 focus:outline-none"
                  >
                    {Object.values(Gender).map(g => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Alignment</label>
                  <select 
                    name="alignment"
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
                    placeholder="Optional"
                    className="w-full bg-gray-900 border border-gray-600 text-white rounded p-3 placeholder-gray-500 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <button 
                  type="submit" 
                  className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded font-medium transition"
                >
                  Create Character
                </button>
              </form>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}