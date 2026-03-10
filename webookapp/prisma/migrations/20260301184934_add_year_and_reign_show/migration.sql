-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Show" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT,
    "type" TEXT NOT NULL,
    "month" TEXT NOT NULL,
    "year" INTEGER NOT NULL DEFAULT 1,
    "location" TEXT NOT NULL DEFAULT 'Parts Unknown',
    "week" INTEGER NOT NULL,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Show" ("id", "location", "month", "title", "type", "updatedAt", "week") SELECT "id", "location", "month", "title", "type", "updatedAt", "week" FROM "Show";
DROP TABLE "Show";
ALTER TABLE "new_Show" RENAME TO "Show";
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
    CONSTRAINT "TitleReign_championshipId_fkey" FOREIGN KEY ("championshipId") REFERENCES "Championship" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "TitleReign_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "TitleReign_showId_fkey" FOREIGN KEY ("showId") REFERENCES "Show" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_TitleReign" ("championshipId", "characterId", "endDate", "id", "isCurrent", "startDate") SELECT "championshipId", "characterId", "endDate", "id", "isCurrent", "startDate" FROM "TitleReign";
DROP TABLE "TitleReign";
ALTER TABLE "new_TitleReign" RENAME TO "TitleReign";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
