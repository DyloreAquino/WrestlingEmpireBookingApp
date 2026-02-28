import { prisma } from "@/lib/prisma";
import MatchCard from "@/components/booking/MatchCard";

export default async function BookingPage() {
  // 1. Fetch data from the database
  const wrestlers = await prisma.character.findMany({
    where: { role: "WRESTLER", injured: false },
  });

  const shows = await prisma.show.findMany({
    take: 1, // Just grab the first available show for testing
  });

  if (shows.length === 0) {
    return <div>Please create a Show in your database first!</div>;
  }

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-6">Match Creator Test</h1>
      
      {/* 2. Pass the data to your Client Component */}
      <div className="max-w-md">
        <MatchCard 
          showId={shows[0].id} 
          wrestlers={wrestlers} 
        />
      </div>
    </main>
  );
}