-- =====================================================================
-- Migration: add SEO fields to articles
-- Date: 2026-06-22
-- Database: news
-- Run once on existing installs. Adds: seo_title, meta_description, seo_tags
-- =====================================================================

USE `news`;

-- MySQL 8 supports IF NOT EXISTS on ADD COLUMN. For older MySQL, drop the
-- `IF NOT EXISTS` clauses and ignore the "Duplicate column" error if a column
-- has already been applied.
ALTER TABLE `articles`
  ADD COLUMN IF NOT EXISTS `seo_title`        VARCHAR(255) DEFAULT NULL AFTER `media_url`,
  ADD COLUMN IF NOT EXISTS `meta_description` TEXT         DEFAULT NULL AFTER `seo_title`,
  ADD COLUMN IF NOT EXISTS `seo_tags`         VARCHAR(255) DEFAULT NULL AFTER `meta_description`;
