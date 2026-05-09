ALTER TABLE `EmailFlow`
    ADD COLUMN `deliveryMode` VARCHAR(191) NOT NULL DEFAULT 'architect_html',
    ADD COLUMN `brevoTemplateId` VARCHAR(191) NULL,
    ADD COLUMN `brevoTemplateIdEn` VARCHAR(191) NULL,
    ADD COLUMN `brevoTemplateIdHe` VARCHAR(191) NULL,
    ADD COLUMN `icon` VARCHAR(191) NULL,
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
