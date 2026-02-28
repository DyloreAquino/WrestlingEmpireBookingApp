import { Prisma } from "@prisma-client";

// 1. A Match with all its relational data included
export type MatchWithDetails = Prisma.MatchGetPayload<{
  include: {
    participants: { include: { character: true } };
    championship: true;
    show: true;
  };
}>;

// 2. A Character with their current gold and team status
export type RosterMember = Prisma.CharacterGetPayload<{
  include: {
    titleReigns: { where: { isCurrent: true }; include: { championship: true } };
    tagTeam: true;
    faction: true;
  };
}>;

// Input for just scheduling the match
export type ScheduleMatchInput = {
  showId: number;
  matchType: "SINGLES" | "TAG_TEAM" | "TRIPLE_THREAT" | "FATAL_FOUR_WAY"; // match your Enum
  stipulation?: string;
  championshipId?: number;
  participantIds: number[]; // Just the IDs of who is involved
};

// Input for recording what actually happened
export type ResolveMatchInput = {
  matchId: number;
  winnerIds: number[]; // Can be multiple for Tag Teams
  finish: "PINFALL" | "SUBMISSION" | "DQ" | "COUNTOUT"; // match your Enum
  interferenceIds?: number[];
};