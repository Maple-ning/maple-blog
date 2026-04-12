-- 去掉 posts.category（博文不再区分 tech/review；可重复执行）
SET @exists_cat := (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'posts'
    AND COLUMN_NAME = 'category'
);

SET @sql_drop_cat := IF(
  @exists_cat > 0,
  'ALTER TABLE posts DROP COLUMN category',
  'SELECT 1'
);

PREPARE stmt_drop_cat FROM @sql_drop_cat;
EXECUTE stmt_drop_cat;
DEALLOCATE PREPARE stmt_drop_cat;
