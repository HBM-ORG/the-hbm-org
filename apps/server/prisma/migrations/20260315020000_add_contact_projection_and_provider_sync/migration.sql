-- AlterTable
ALTER TABLE `EmailQueue`
    ADD COLUMN `provider` VARCHAR(191) NULL,
    ADD COLUMN `providerData` JSON NULL,
    ADD COLUMN `providerMessageId` VARCHAR(191) NULL,
    ADD COLUMN `providerStatus` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `ContactProfile` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NULL,
    `language` VARCHAR(191) NULL,
    `status` VARCHAR(191) NULL,
    `categories` JSON NULL,
    `sourceChannels` JSON NULL,
    `acquisitionSources` JSON NULL,
    `registrationSources` JSON NULL,
    `eventIds` JSON NULL,
    `eventNames` JSON NULL,
    `registrationCount` INTEGER NOT NULL DEFAULT 0,
    `contactSubmissionCount` INTEGER NOT NULL DEFAULT 0,
    `firstSeenAt` DATETIME(3) NULL,
    `lastSeenAt` DATETIME(3) NULL,
    `lastRegistrationAt` DATETIME(3) NULL,
    `lastContactSubmissionAt` DATETIME(3) NULL,
    `lastAcquisitionSource` VARCHAR(191) NULL,
    `lastRegistrationSource` VARCHAR(191) NULL,
    `lastSource` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `ContactProfile_email_key`(`email`),
    INDEX `ContactProfile_lastSeenAt_idx`(`lastSeenAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ContactSubmission` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NULL,
    `email` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NULL,
    `message` TEXT NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'new',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `ContactSubmission_email_idx`(`email`),
    INDEX `ContactSubmission_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ContactProviderSync` (
    `id` VARCHAR(191) NOT NULL,
    `provider` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `contactProfileId` VARCHAR(191) NULL,
    `externalId` VARCHAR(191) NULL,
    `syncStatus` VARCHAR(191) NOT NULL DEFAULT 'pending',
    `lastSyncedAt` DATETIME(3) NULL,
    `lastError` TEXT NULL,
    `isUnsubscribed` BOOLEAN NOT NULL DEFAULT false,
    `isBlocklisted` BOOLEAN NOT NULL DEFAULT false,
    `lastEventType` VARCHAR(191) NULL,
    `lastEventAt` DATETIME(3) NULL,
    `details` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `ContactProviderSync_provider_email_key`(`provider`, `email`),
    INDEX `ContactProviderSync_provider_externalId_idx`(`provider`, `externalId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProviderWebhookEvent` (
    `id` VARCHAR(191) NOT NULL,
    `provider` VARCHAR(191) NOT NULL,
    `eventKey` VARCHAR(191) NOT NULL,
    `eventType` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NULL,
    `externalId` VARCHAR(191) NULL,
    `payload` JSON NOT NULL,
    `processedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `ProviderWebhookEvent_provider_eventKey_key`(`provider`, `eventKey`),
    INDEX `ProviderWebhookEvent_provider_email_idx`(`provider`, `email`),
    INDEX `ProviderWebhookEvent_provider_externalId_idx`(`provider`, `externalId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ContactProviderSync`
    ADD CONSTRAINT `ContactProviderSync_contactProfileId_fkey`
    FOREIGN KEY (`contactProfileId`) REFERENCES `ContactProfile`(`id`)
    ON DELETE SET NULL ON UPDATE CASCADE;
