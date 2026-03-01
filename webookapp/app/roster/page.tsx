import { prisma } from '@db'
import Link from 'next/link'

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

export default async function RosterPage() {
  const { characters, factions, tagTeams } = await getRoster()

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Roster</h1>
      
      {/* Characters */}
      <section className="mb-6">
        <h2 className="text-xl font-semibold">Wrestlers ({characters.length})</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {characters.map(c => (
            <Link 
              key={c.id} 
              href={`/roster/${c.id}`}
              className="p-2 border rounded hover:bg-gray-50"
            >
              <div className="font-medium">{c.name}</div>
              <div className="text-sm text-gray-600">
                {c.alignment} • {c.division}
                {c.faction && ` • ${c.faction.name}`}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Factions */}
      <section className="mb-6">
        <h2 className="text-xl font-semibold">Factions</h2>
        {factions.map(f => (
          <div key={f.id} className="p-2 border rounded mb-2">
            <div className="font-medium">{f.name}</div>
            <div className="text-sm">{f.members.map(m => m.name).join(', ')}</div>
          </div>
        ))}
      </section>

      {/* Tag Teams */}
      <section>
        <h2 className="text-xl font-semibold">Tag Teams</h2>
        {tagTeams.map(t => (
          <div key={t.id} className="p-2 border rounded mb-2">
            <div className="font-medium">{t.name}</div>
            <div className="text-sm">{t.members.map(m => m.name).join(' & ')}</div>
          </div>
        ))}
      </section>
    </div>
  )
}