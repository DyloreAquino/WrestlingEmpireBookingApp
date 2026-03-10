-- CreateEnum
CREATE TYPE "Role" AS ENUM ('WRESTLER', 'BOOKER', 'REFEREE', 'MANAGER');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'NA');

-- CreateEnum
CREATE TYPE "Alignment" AS ENUM ('FACE', 'HEEL', 'TWEENER');

-- CreateEnum
CREATE TYPE "Division" AS ENUM ('TOP_CARD', 'MID_CARD', 'UNDER_CARD', 'TAG');

-- CreateEnum
CREATE TYPE "TitleGender" AS ENUM ('MALE', 'FEMALE', 'ALL');

-- CreateEnum
CREATE TYPE "ShowType" AS ENUM ('TV', 'PPV');

-- CreateEnum
CREATE TYPE "Month" AS ENUM ('JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC');

-- CreateEnum
CREATE TYPE "MatchType" AS ENUM ('SINGLES', 'TAG_TEAM', 'TEAM', 'TRIPLE_THREAT', 'FATAL_FOUR_WAY', 'HANDICAP', 'GAUNTLET', 'BATTLE_ROYALE', 'ROYAL_RUMBLE');

-- CreateEnum
CREATE TYPE "Stipulation" AS ENUM ('HARDCORE', 'OPEN_CHALLENGE', 'CONFRONTATION', 'BEST_OF_THREE', 'IRONMAN', 'LAST_LAUGH', 'SUBMISSION', 'LAST_MAN_STANDING', 'STREET_FIGHT', 'FIRST_BLOOD', 'SUMO_CONTEST', 'SHOOT_FIGHT', 'TAG_ELIMINATION', 'WAR', 'ELIMINATION', 'ESCAPE_TO_VICTORY', 'FURNITURE_SMASH', 'LADDER', 'HELL_IN_A_CELL', 'TRAINING');

-- CreateEnum
CREATE TYPE "FinishType" AS ENUM ('PINFALL', 'SUBMISSION', 'COUNTOUT', 'DQ', 'INTERFERENCE', 'UNIQUE', 'UNFINISHED');

-- CreateEnum
CREATE TYPE "CardPlacement" AS ENUM ('UNDERCARD', 'MIDCARD', 'SEMI_MAIN', 'MAIN');

-- CreateTable
CREATE TABLE "Character" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "gender" "Gender" NOT NULL,
    "alignment" "Alignment" NOT NULL,
    "division" "Division" NOT NULL,
    "finisherName" TEXT,
    "injured" BOOLEAN NOT NULL DEFAULT false,
    "factionId" INTEGER,
    "tagTeamId" INTEGER,
    "rivalryId" INTEGER,
    "friendshipId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Character_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Championship" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "division" "Division" NOT NULL,
    "gender" "TitleGender" NOT NULL,

    CONSTRAINT "Championship_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Show" (
    "id" SERIAL NOT NULL,
    "title" TEXT,
    "type" "ShowType" NOT NULL,
    "month" "Month" NOT NULL,
    "year" INTEGER NOT NULL DEFAULT 1,
    "location" TEXT NOT NULL DEFAULT 'Parts Unknown',
    "week" INTEGER NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Show_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TitleReign" (
    "id" SERIAL NOT NULL,
    "championshipId" INTEGER NOT NULL,
    "characterId" INTEGER NOT NULL,
    "showId" INTEGER,
    "startMonth" "Month",
    "startWeek" INTEGER,
    "startYear" INTEGER,
    "endMonth" "Month",
    "endWeek" INTEGER,
    "endYear" INTEGER,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "isCurrent" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "TitleReign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Match" (
    "id" SERIAL NOT NULL,
    "title" TEXT,
    "matchType" "MatchType" NOT NULL,
    "stipulation" "Stipulation",
    "finish" "FinishType" NOT NULL,
    "placement" "CardPlacement" NOT NULL DEFAULT 'UNDERCARD',
    "championshipId" INTEGER,
    "showId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Match_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MatchParticipant" (
    "id" SERIAL NOT NULL,
    "matchId" INTEGER NOT NULL,
    "characterId" INTEGER NOT NULL,
    "isWinner" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "MatchParticipant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MatchInterference" (
    "id" SERIAL NOT NULL,
    "matchId" INTEGER NOT NULL,
    "characterId" INTEGER NOT NULL,

    CONSTRAINT "MatchInterference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Faction" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Faction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TagTeam" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "TagTeam_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Rivalry" (
    "id" SERIAL NOT NULL,
    "name" TEXT,
    "intensity" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "Rivalry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Friendship" (
    "id" SERIAL NOT NULL,
    "strength" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "Friendship_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Character" ADD CONSTRAINT "Character_factionId_fkey" FOREIGN KEY ("factionId") REFERENCES "Faction"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Character" ADD CONSTRAINT "Character_tagTeamId_fkey" FOREIGN KEY ("tagTeamId") REFERENCES "TagTeam"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Character" ADD CONSTRAINT "Character_rivalryId_fkey" FOREIGN KEY ("rivalryId") REFERENCES "Rivalry"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Character" ADD CONSTRAINT "Character_friendshipId_fkey" FOREIGN KEY ("friendshipId") REFERENCES "Friendship"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TitleReign" ADD CONSTRAINT "TitleReign_championshipId_fkey" FOREIGN KEY ("championshipId") REFERENCES "Championship"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TitleReign" ADD CONSTRAINT "TitleReign_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TitleReign" ADD CONSTRAINT "TitleReign_showId_fkey" FOREIGN KEY ("showId") REFERENCES "Show"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_championshipId_fkey" FOREIGN KEY ("championshipId") REFERENCES "Championship"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_showId_fkey" FOREIGN KEY ("showId") REFERENCES "Show"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchParticipant" ADD CONSTRAINT "MatchParticipant_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchParticipant" ADD CONSTRAINT "MatchParticipant_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchInterference" ADD CONSTRAINT "MatchInterference_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchInterference" ADD CONSTRAINT "MatchInterference_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character"("id") ON DELETE CASCADE ON UPDATE CASCADE;
