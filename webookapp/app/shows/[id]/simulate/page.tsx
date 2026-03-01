import { prisma } from '@db'
import { notFound, redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { FinishType } from '@/generated/prisma/enums'
import Link from 'next/link'

async function getShowWithUnsimulatedMatches(id: string) {
  const show = await prisma.show.findUnique({
    where: { id: parseInt(id) },
    include: {
      matches: {
        where: { 
            NOT: { finish: 'UNFINISHED' }
        },
        include: {
          participants: { include: { character: true } },
          championship: { include: { reigns: { where: { isCurrent: true } } } }
        }
      }
    }
  })
  if (!show) notFound()
  return show
}

async function simulateMatch(formData: FormData) {
  'use server'
  
  const matchId = parseInt(formData.get('matchId') as string)
  const winnerId = parseInt(formData.get('winnerId') as string)
  const finish = formData.get('finish') as FinishType
  
  // Update match finish
  await prisma.match.update({
    where: { id: matchId },
    data: { finish }
  })
  
  // Reset all winners
  await prisma.matchParticipant.updateMany({
    where: { matchId },
    data: { isWinner: false }
  })
  
  // Set new winner (using updateMany - no schema change needed)
  await prisma.matchParticipant.updateMany({
    where: { matchId, characterId: winnerId },
    data: { isWinner: true }
  })
  
  // Handle title change...
  const match = await prisma.match.findUnique({
    where: { id: matchId },
    include: { championship: true }
  })
  
  if (match?.championshipId) {
    await prisma.titleReign.updateMany({
      where: { championshipId: match.championshipId, isCurrent: true },
      data: { isCurrent: false, endDate: new Date() }
    })
    
    await prisma.titleReign.create({
      data: {
        championshipId: match.championshipId,
        characterId: winnerId,
        startDate: new Date(),
        isCurrent: true
      }
    })
  }
  
  revalidatePath(`/shows/${match?.showId}/simulate`)
  revalidatePath(`/shows/${match?.showId}`)
  revalidatePath(`/roster/${winnerId}`)
}

export default async function SimulatePage({ params }: { params: { id: string } }) {
  const show = await getShowWithUnsimulatedMatches(params.id)
  
  if (show.matches.length === 0) {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">All matches simulated!</h1>
        <Link href={`/shows/${show.id}`} className="text-blue-600">
          ← Back to show
        </Link>
      </div>
    )
  }

  return (
    <div className="p-4 max-w-2xl">
      <h1 className="text-2xl font-bold mb-4">
        Simulate: {show.title || `${show.month} Week ${show.week}`}
      </h1>
      
      {show.matches.map(match => (
        <form key={match.id} action={simulateMatch} className="mb-6 p-4 border rounded bg-gray-50">
          <input type="hidden" name="matchId" value={match.id} />
          
          <h3 className="font-bold mb-2">
            {match.matchType}
            {match.championship && ` for ${match.championship.name}`}
          </h3>
          
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Winner</label>
            <select name="winnerId" className="w-full border rounded p-2" required>
              <option value="">Select winner...</option>
              {match.participants.map(p => (
                <option key={p.characterId} value={p.characterId}>
                  {p.character.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Finish</label>
            <select name="finish" className="w-full border rounded p-2" required>
              {Object.values(FinishType).map(f => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </div>
          
          <button type="submit" className="bg-purple-600 text-white px-4 py-2 rounded w-full">
            Simulate Match
          </button>
        </form>
      ))}
    </div>
  )
}