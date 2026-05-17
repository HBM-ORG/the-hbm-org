-- Event end datetime and IANA timezone for calendar accuracy (defaults: null end uses client fallback).

ALTER TABLE `Event`
  ADD COLUMN `endDate` DATETIME(3) NULL,
  ADD COLUMN `timezone` VARCHAR(191) NOT NULL DEFAULT 'Asia/Jerusalem';
