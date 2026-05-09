ALTER TABLE `EmailFlow`
    ADD COLUMN `deliveryMode` VARCHAR(191) NOT NULL DEFAULT 'architect_html',
    ADD COLUMN `brevoTemplateId` VARCHAR(191) NULL,
    ADD COLUMN `brevoTemplateIdEn` VARCHAR(191) NULL,
    ADD COLUMN `brevoTemplateIdHe` VARCHAR(191) NULL,
    ADD COLUMN `icon` VARCHAR(191) NULL,
    ADD COLUMN `templateOverrides` JSON NULL,
    ADD COLUMN `status` VARCHAR(191) NOT NULL DEFAULT 'published';

CREATE INDEX `EmailFlow_status_idx` ON `EmailFlow`(`status`);

CREATE TABLE `EmailProviderConfig` (
    `id` VARCHAR(191) NOT NULL,
    `emailProvider` VARCHAR(191) NULL,
    `brevoApiUrl` VARCHAR(191) NULL,
    `brevoApiKey` TEXT NULL,
    `brevoSenderName` VARCHAR(191) NULL,
    `brevoSenderEmail` VARCHAR(191) NULL,
    `brevoAutomationEnabled` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `GlobalStyling`
    ADD COLUMN `useDefaultHeader` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `useDefaultFooter` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `headerMode` VARCHAR(191) NULL,
    ADD COLUMN `headerImageUrl` VARCHAR(191) NULL,
    ADD COLUMN `headerTitle` VARCHAR(191) NULL,
    ADD COLUMN `headerSubtitle` VARCHAR(191) NULL,
    ADD COLUMN `headerBackgroundColor` VARCHAR(191) NULL,
    ADD COLUMN `headerBackgroundType` VARCHAR(191) NULL,
    ADD COLUMN `headerGradientFrom` VARCHAR(191) NULL,
    ADD COLUMN `headerGradientTo` VARCHAR(191) NULL,
    ADD COLUMN `headerGradientAngle` INTEGER NULL,
    ADD COLUMN `headerTextColor` VARCHAR(191) NULL,
    ADD COLUMN `headerTextType` VARCHAR(191) NULL,
    ADD COLUMN `headerTextGradientFrom` VARCHAR(191) NULL,
    ADD COLUMN `headerTextGradientTo` VARCHAR(191) NULL,
    ADD COLUMN `headerTextGradientAngle` INTEGER NULL,
    ADD COLUMN `footerText` TEXT NULL,
    ADD COLUMN `footerImageUrl` VARCHAR(191) NULL,
    ADD COLUMN `footerBackgroundColor` VARCHAR(191) NULL,
    ADD COLUMN `footerBackgroundType` VARCHAR(191) NULL,
    ADD COLUMN `footerGradientFrom` VARCHAR(191) NULL,
    ADD COLUMN `footerGradientTo` VARCHAR(191) NULL,
    ADD COLUMN `footerGradientAngle` INTEGER NULL,
    ADD COLUMN `footerTextColor` VARCHAR(191) NULL,
    ADD COLUMN `footerTextType` VARCHAR(191) NULL,
    ADD COLUMN `footerTextGradientFrom` VARCHAR(191) NULL,
    ADD COLUMN `footerTextGradientTo` VARCHAR(191) NULL,
    ADD COLUMN `footerTextGradientAngle` INTEGER NULL,
    ADD COLUMN `unsubscribeLabel` VARCHAR(191) NULL,
    ADD COLUMN `unsubscribeUrl` VARCHAR(191) NULL,
    ADD COLUMN `signatureUrl` VARCHAR(191) NULL;
