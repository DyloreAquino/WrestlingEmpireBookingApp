-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Show" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT,
    "type" TEXT NOT NULL,
    "month" TEXT NOT NULL,
    "location" TEXT NOT NULL DEFAULT 'Parts Unknown',
    "week" INTEGER NOT NULL,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Show" ("id", "month", "title", "type", "week") SELECT "id", "month", "title", "type", "week" FROM "Show";
DROP TABLE "Show";
ALTER TABLE "new_Show" RENAME TO "Show";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
