-- CreateTable
CREATE TABLE `EmailEngagement` (
    `id` VARCHAR(191) NOT NULL,
    `trackingId` VARCHAR(191) NULL,
    `eventType` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `timestamp` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `metadata` JSON NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
