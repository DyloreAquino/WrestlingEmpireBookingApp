"use client";

import { useState } from "react";
import { scheduleMatchAction, resolveMatchAction } from "@/app/actions/booking";

export default function MatchCard({ showId, wrestlers }) {
  const [matchId, setMatchId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  // Button 1: Schedule
  const handleSchedule = async () => {
    setLoading(true);
    const result = await scheduleMatchAction({
      showId,
      matchType: "SINGLES",
      participantIds: [wrestlers[0].id, wrestlers[1].id],
    });
    setMatchId(result.id);
    setLoading(false);
    alert("Match Scheduled on the Card!");
  };

  // Button 2: Resolve (Only shows after scheduling)
  const handleResolve = async (winnerId: number) => {
    if (!matchId) return;
    setLoading(true);
    await resolveMatchAction(matchId, [winnerId]);
    setMatchId(null); // Reset for next match
    setLoading(false);
    alert("Match Result Recorded!");
  };

  return (
    <div className="p-4 border rounded shadow">
      {!matchId ? (
        <button 
          onClick={handleSchedule}
          disabled={loading}
          className="bg-blue-600 text-white p-2 rounded"
        >
          {loading ? "Booking..." : "Schedule Match"}
        </button>
      ) : (
        <div className="flex flex-col gap-2">
          <p className="font-bold text-orange-500">LIVE MATCH IN PROGRESS</p>
          <button 
            onClick={() => handleResolve(wrestlers[0].id)}
            className="bg-green-600 text-white p-2 rounded"
          >
            Mark {wrestlers[0].name} as Winner
          </button>
          <button 
            onClick={() => handleResolve(wrestlers[1].id)}
            className="bg-green-600 text-white p-2 rounded"
          >
            Mark {wrestlers[1].name} as Winner
          </button>
        </div>
      )}
    </div>
  );
}