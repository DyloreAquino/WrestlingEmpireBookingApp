-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_MatchInterference" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "matchId" INTEGER NOT NULL,
    "characterId" INTEGER NOT NULL,
    CONSTRAINT "MatchInterference_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "MatchInterference_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_MatchInterference" ("characterId", "id", "matchId") SELECT "characterId", "id", "matchId" FROM "MatchInterference";
DROP TABLE "MatchInterference";
ALTER TABLE "new_MatchInterference" RENAME TO "MatchInterference";
CREATE TABLE "new_MatchParticipant" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "matchId" INTEGER NOT NULL,
    "characterId" INTEGER NOT NULL,
    "isWinner" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "MatchParticipant_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "MatchParticipant_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_MatchParticipant" ("characterId", "id", "isWinner", "matchId") SELECT "characterId", "id", "isWinner", "matchId" FROM "MatchParticipant";
DROP TABLE "MatchParticipant";
ALTER TABLE "new_MatchParticipant" RENAME TO "MatchParticipant";
CREATE TABLE "new_TitleReign" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "championshipId" INTEGER NOT NULL,
    "characterId" INTEGER NOT NULL,
    "showId" INTEGER,
    "startMonth" TEXT,
    "startWeek" INTEGER,
    "startYear" INTEGER,
    "endMonth" TEXT,
    "endWeek" INTEGER,
    "endYear" INTEGER,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME,
    "isCurrent" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "TitleReign_championshipId_fkey" FOREIGN KEY ("championshipId") REFERENCES "Championship" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TitleReign_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TitleReign_showId_fkey" FOREIGN KEY ("showId") REFERENCES "Show" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_TitleReign" ("championshipId", "characterId", "endDate", "endMonth", "endWeek", "endYear", "id", "isCurrent", "showId", "startDate", "startMonth", "startWeek", "startYear") SELECT "championshipId", "characterId", "endDate", "endMonth", "endWeek", "endYear", "id", "isCurrent", "showId", "startDate", "startMonth", "startWeek", "startYear" FROM "TitleReign";
DROP TABLE "TitleReign";
ALTER TABLE "new_TitleReign" RENAME TO "TitleReign";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
