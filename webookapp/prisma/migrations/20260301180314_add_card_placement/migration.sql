-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Match" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT,
    "matchType" TEXT NOT NULL,
    "stipulation" TEXT,
    "finish" TEXT NOT NULL,
    "placement" TEXT NOT NULL DEFAULT 'UNDERCARD',
    "championshipId" INTEGER,
    "showId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Match_championshipId_fkey" FOREIGN KEY ("championshipId") REFERENCES "Championship" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Match_showId_fkey" FOREIGN KEY ("showId") REFERENCES "Show" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Match" ("championshipId", "createdAt", "finish", "id", "matchType", "showId", "stipulation", "title") SELECT "championshipId", "createdAt", "finish", "id", "matchType", "showId", "stipulation", "title" FROM "Match";
DROP TABLE "Match";
ALTER TABLE "new_Match" RENAME TO "Match";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
