-- =====================================================================
-- Migration: add countries + link jobs to a country
-- Date: 2026-06-19
-- Database: news
-- Run once on existing installs. Safe to re-run (uses IF NOT EXISTS).
-- =====================================================================

USE `news`;

-- 1. Countries table
CREATE TABLE IF NOT EXISTS `countries` (
  `id`         INT AUTO_INCREMENT PRIMARY KEY,
  `name`       VARCHAR(255)  NOT NULL,
  `flag`       VARCHAR(1000) DEFAULT NULL,
  `sort_order` INT           NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `uniq_country_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Add country_id to jobs (nullable -> unassigned jobs stay valid)
--    MySQL 8 supports IF NOT EXISTS on ADD COLUMN. For older MySQL, drop the
--    `IF NOT EXISTS` clause and ignore the "Duplicate column" error if it
--    has already been applied.
ALTER TABLE `jobs`
  ADD COLUMN IF NOT EXISTS `country_id` INT DEFAULT NULL AFTER `is_published`;

-- 3. Index for faster filtering on the public Jobs page
ALTER TABLE `jobs`
  ADD INDEX IF NOT EXISTS `idx_jobs_country_id` (`country_id`);

-- 4. (Optional) Foreign key. Skip if you keep jobs that may outlive the
--    country row. The delete handler in manage_countries.php already nulls
--    out country_id before deleting, so this FK is safe either way.
-- ALTER TABLE `jobs`
--   ADD CONSTRAINT `fk_jobs_country`
--   FOREIGN KEY (`country_id`) REFERENCES `countries`(`id`)
--   ON DELETE SET NULL ON UPDATE CASCADE;
