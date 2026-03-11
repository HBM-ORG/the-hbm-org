-- CreateTable
CREATE TABLE `CookieConsentLog` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `timestamp` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `choice` VARCHAR(191) NOT NULL,
    `settings` TEXT NOT NULL,
    `hashedIp` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `EmailQueue` (
    `id` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL,
    `scheduledFor` DATETIME(3) NOT NULL,
    `data` JSON NOT NULL,
    `stepType` VARCHAR(191) NOT NULL,
    `flowId` VARCHAR(191) NULL,
    `sequenceId` VARCHAR(191) NULL,
    `stepIndex` INTEGER NULL,
    `attempts` INTEGER NOT NULL DEFAULT 0,
    `error` TEXT NULL,
    `sentAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Registration` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NULL,
    `acquisitionSource` VARCHAR(191) NULL,
    `registrationSource` VARCHAR(191) NULL,
    `source` VARCHAR(191) NULL,
    `category` VARCHAR(191) NULL,
    `eventId` VARCHAR(191) NULL,
    `eventName` VARCHAR(191) NULL,
    `date` DATETIME(3) NOT NULL,
    `language` VARCHAR(191) NULL,
    `status` VARCHAR(191) NULL,
    `history` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Event` (
    `id` VARCHAR(191) NOT NULL,
    `legacyId` VARCHAR(191) NULL,
    `folderName` VARCHAR(191) NULL,
    `title` JSON NOT NULL,
    `description` JSON NOT NULL,
    `date` DATETIME(3) NOT NULL,
    `location` VARCHAR(191) NOT NULL,
    `locationParams` JSON NULL,
    `type` VARCHAR(191) NOT NULL,
    `image` VARCHAR(191) NULL,
    `heroVideo` VARCHAR(191) NULL,
    `gallery` JSON NULL,
    `imageBubbles` JSON NULL,
    `promoBubbles` JSON NULL,
    `whatToExpect` JSON NULL,
    `showPartnership` BOOLEAN NOT NULL DEFAULT false,
    `partnership` JSON NULL,
    `freeText` JSON NULL,
    `socialProof` JSON NULL,
    `tags` JSON NULL,
    `highlights` JSON NULL,
    `partners` JSON NULL,
    `faqs` JSON NULL,
    `hostNote` JSON NULL,
    `registration` JSON NULL,
    `visuals` JSON NULL,
    `isLocked` BOOLEAN NOT NULL DEFAULT false,
    `contentEnglishOnly` BOOLEAN NOT NULL DEFAULT false,
    `importantDetailsHeading` JSON NULL,
    `importantDetailsSectionLabel` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Event_legacyId_key`(`legacyId`),
    INDEX `Event_date_idx`(`date`),
    INDEX `Event_legacyId_idx`(`legacyId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TeamMember` (
    `id` VARCHAR(191) NOT NULL,
    `legacyId` VARCHAR(191) NULL,
    `name` VARCHAR(191) NOT NULL,
    `role` VARCHAR(191) NOT NULL,
    `nickname` VARCHAR(191) NOT NULL,
    `image` VARCHAR(191) NULL,
    `linkedin` VARCHAR(191) NULL,
    `bio` TEXT NOT NULL,
    `funFact` TEXT NOT NULL,
    `imagePosition` VARCHAR(191) NULL,
    `imageScale` DOUBLE NULL,
    `displayOrder` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `TeamMember_legacyId_key`(`legacyId`),
    INDEX `TeamMember_displayOrder_idx`(`displayOrder`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Testimonial` (
    `id` VARCHAR(191) NOT NULL,
    `legacyId` VARCHAR(191) NULL,
    `quote` TEXT NOT NULL,
    `author` VARCHAR(191) NOT NULL,
    `role` VARCHAR(191) NOT NULL,
    `companyLogo` VARCHAR(191) NULL,
    `stars` INTEGER NOT NULL DEFAULT 5,
    `displayOrder` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Testimonial_legacyId_key`(`legacyId`),
    INDEX `Testimonial_displayOrder_idx`(`displayOrder`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Partner` (
    `id` VARCHAR(191) NOT NULL,
    `legacyId` VARCHAR(191) NULL,
    `name` VARCHAR(191) NOT NULL,
    `logoUrl` VARCHAR(191) NOT NULL,
    `website` VARCHAR(191) NULL,
    `displayOrder` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Partner_legacyId_key`(`legacyId`),
    INDEX `Partner_displayOrder_idx`(`displayOrder`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `EmailFlow` (
    `id` VARCHAR(191) NOT NULL,
    `legacyId` VARCHAR(191) NULL,
    `name` VARCHAR(191) NOT NULL,
    `trigger` VARCHAR(191) NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `subject` JSON NOT NULL,
    `body` JSON NOT NULL,
    `subjectB` JSON NULL,
    `abTestActive` BOOLEAN NOT NULL DEFAULT false,
    `includeCalendar` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `EmailFlow_legacyId_key`(`legacyId`),
    INDEX `EmailFlow_trigger_idx`(`trigger`),
    INDEX `EmailFlow_active_idx`(`active`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `EmailSequence` (
    `id` VARCHAR(191) NOT NULL,
    `legacyId` VARCHAR(191) NULL,
    `name` VARCHAR(191) NOT NULL,
    `trigger` VARCHAR(191) NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `steps` JSON NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `EmailSequence_legacyId_key`(`legacyId`),
    INDEX `EmailSequence_trigger_idx`(`trigger`),
    INDEX `EmailSequence_active_idx`(`active`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SmtpConfig` (
    `id` VARCHAR(191) NOT NULL,
    `host` VARCHAR(191) NOT NULL,
    `port` INTEGER NOT NULL,
    `user` VARCHAR(191) NOT NULL,
    `pass` TEXT NOT NULL,
    `from` VARCHAR(191) NOT NULL,
    `secure` BOOLEAN NOT NULL DEFAULT false,
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `GlobalStyling` (
    `id` VARCHAR(191) NOT NULL,
    `primaryColor` VARCHAR(191) NOT NULL,
    `secondaryColor` VARCHAR(191) NOT NULL,
    `logoUrl` VARCHAR(191) NOT NULL,
    `fontFamily` VARCHAR(191) NOT NULL,
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
