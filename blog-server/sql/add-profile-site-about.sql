-- 个人资料「关于本站」正文（可重复执行）
SET @exists_site_about := (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'profile'
    AND COLUMN_NAME = 'site_about'
);

SET @sql_site_about := IF(
  @exists_site_about = 0,
  'ALTER TABLE profile ADD COLUMN site_about TEXT NULL AFTER github',
  'SELECT 1'
);

PREPARE stmt_site_about FROM @sql_site_about;
EXECUTE stmt_site_about;
DEALLOCATE PREPARE stmt_site_about;
