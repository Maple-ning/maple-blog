USE blog_db;

ALTER TABLE good_sites
  ADD COLUMN IF NOT EXISTS primary_category VARCHAR(100) NOT NULL DEFAULT '' AFTER description,
  ADD COLUMN IF NOT EXISTS secondary_category VARCHAR(100) NOT NULL DEFAULT '' AFTER primary_category;

UPDATE good_sites
SET
  primary_category = CASE
    WHEN TRIM(primary_category) = '' THEN '精选友链'
    ELSE primary_category
  END,
  secondary_category = CASE
    WHEN TRIM(secondary_category) = '' THEN category
    ELSE secondary_category
  END;

ALTER TABLE good_sites
  MODIFY COLUMN primary_category VARCHAR(100) NOT NULL,
  MODIFY COLUMN secondary_category VARCHAR(100) NOT NULL;

CREATE INDEX idx_good_sites_primary_category ON good_sites (primary_category);
CREATE INDEX idx_good_sites_secondary_category ON good_sites (secondary_category);
