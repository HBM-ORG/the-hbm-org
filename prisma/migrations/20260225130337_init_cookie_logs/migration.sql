-- CreateTable
CREATE TABLE "CookieConsentLog" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "choice" TEXT NOT NULL,
    "settings" TEXT NOT NULL,
    "hashedIp" TEXT NOT NULL
);
