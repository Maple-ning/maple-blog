USE blog_db;

CREATE TABLE IF NOT EXISTS good_site_primary_categories (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  category_key VARCHAR(100) NOT NULL UNIQUE,
  category_label VARCHAR(100) NOT NULL UNIQUE,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS good_site_secondary_categories (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  primary_category_id INT NOT NULL,
  category_key VARCHAR(100) NOT NULL,
  category_label VARCHAR(100) NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_good_site_secondary_primary
    FOREIGN KEY (primary_category_id) REFERENCES good_site_primary_categories(id)
    ON DELETE CASCADE,
  UNIQUE KEY uk_good_site_secondary_primary_label (primary_category_id, category_label),
  UNIQUE KEY uk_good_site_secondary_primary_key (primary_category_id, category_key)
);

INSERT INTO good_site_primary_categories (category_key, category_label, sort_order)
SELECT primary_category, primary_category, MIN(sort_order) AS sort_order
FROM good_sites
WHERE TRIM(COALESCE(primary_category, '')) <> ''
GROUP BY primary_category
ON DUPLICATE KEY UPDATE
  category_label = VALUES(category_label);

INSERT INTO good_site_primary_categories (category_key, category_label, sort_order)
SELECT '精选友链', '精选友链', 0
WHERE NOT EXISTS (
  SELECT 1 FROM good_site_primary_categories WHERE category_label = '精选友链'
);

INSERT INTO good_site_secondary_categories (primary_category_id, category_key, category_label, sort_order)
SELECT
  pc.id,
  gs.secondary_category,
  gs.secondary_category,
  MIN(gs.sort_order) AS sort_order
FROM good_sites gs
INNER JOIN good_site_primary_categories pc
  ON pc.category_label = gs.primary_category
WHERE TRIM(COALESCE(gs.secondary_category, '')) <> ''
GROUP BY pc.id, gs.secondary_category
ON DUPLICATE KEY UPDATE
  category_label = VALUES(category_label);

INSERT INTO good_site_secondary_categories (primary_category_id, category_key, category_label, sort_order)
SELECT
  pc.id,
  '未分类',
  '未分类',
  0
FROM good_site_primary_categories pc
WHERE NOT EXISTS (
  SELECT 1
  FROM good_site_secondary_categories sc
  WHERE sc.primary_category_id = pc.id
    AND sc.category_label = '未分类'
);
