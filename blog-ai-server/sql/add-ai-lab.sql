CREATE TABLE IF NOT EXISTS ai_site_profile (
  id INT PRIMARY KEY AUTO_INCREMENT,
  site_name VARCHAR(120) NOT NULL,
  tagline VARCHAR(255) NOT NULL,
  hero_title VARCHAR(255) NOT NULL,
  hero_intro TEXT NOT NULL,
  contact_email VARCHAR(255) NOT NULL DEFAULT '',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ai_journey_entries (
  id INT PRIMARY KEY AUTO_INCREMENT,
  stage VARCHAR(100) NOT NULL,
  title VARCHAR(255) NOT NULL,
  summary TEXT NOT NULL,
  status ENUM('draft', 'published') NOT NULL DEFAULT 'draft',
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_ai_journey_status_sort (status, sort_order, updated_at)
);

CREATE TABLE IF NOT EXISTS ai_insights (
  id INT PRIMARY KEY AUTO_INCREMENT,
  category VARCHAR(100) NOT NULL,
  title VARCHAR(255) NOT NULL,
  summary TEXT NOT NULL,
  published_at DATE NULL,
  status ENUM('draft', 'published') NOT NULL DEFAULT 'draft',
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_ai_insights_status_date (status, published_at, sort_order, updated_at)
);

CREATE TABLE IF NOT EXISTS ai_projects (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  summary TEXT NOT NULL,
  status ENUM('planned', 'in-progress', 'published') NOT NULL DEFAULT 'planned',
  stack JSON NULL,
  source_url VARCHAR(500) NULL,
  github_url VARCHAR(500) NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_ai_projects_status_sort (status, sort_order, updated_at)
);

INSERT INTO ai_site_profile (id, site_name, tagline, hero_title, hero_intro, contact_email)
SELECT
  1,
  'AI探索站',
  '分享 AI 学习历程，整理 AI 资讯，持续发布项目实验。',
  '把个人 AI 网站做成一个持续成长的知识与项目入口。',
  '这里会长期记录我学习 AI 的过程、筛选行业动态、整理方法论，并持续沉淀自己的项目实验档案。',
  'hello@maple-ai.local'
WHERE NOT EXISTS (
  SELECT 1 FROM ai_site_profile WHERE id = 1
);

INSERT INTO ai_journey_entries (stage, title, summary, status, sort_order)
SELECT '阶段 01', '建立 AI 基础认知', '从模型概念、Prompt 基础和主流产品体验切入，先形成自己的知识框架。', 'published', 10
WHERE NOT EXISTS (
  SELECT 1 FROM ai_journey_entries WHERE title = '建立 AI 基础认知'
);

INSERT INTO ai_journey_entries (stage, title, summary, status, sort_order)
SELECT '阶段 02', '进入工作流和工具实践', '开始围绕真实场景理解自动化、协作和内容生产中的 AI 用法。', 'published', 20
WHERE NOT EXISTS (
  SELECT 1 FROM ai_journey_entries WHERE title = '进入工作流和工具实践'
);

INSERT INTO ai_insights (category, title, summary, published_at, status, sort_order)
SELECT '行业动态', '哪些 AI 信息值得收集，哪些只会制造焦虑', '把看似热闹的资讯转化成真正影响学习和项目判断的信号。', '2026-04-11', 'published', 10
WHERE NOT EXISTS (
  SELECT 1 FROM ai_insights WHERE title = '哪些 AI 信息值得收集，哪些只会制造焦虑'
);

INSERT INTO ai_insights (category, title, summary, published_at, status, sort_order)
SELECT '方法观察', '为什么 AI 资讯整理应该服务项目，而不是服务刷屏', '资讯不是终点，它应该回流到选题、决策和后续实验设计。', '2026-04-10', 'draft', 20
WHERE NOT EXISTS (
  SELECT 1 FROM ai_insights WHERE title = '为什么 AI 资讯整理应该服务项目，而不是服务刷屏'
);

INSERT INTO ai_projects (title, summary, status, stack, source_url, sort_order)
SELECT
  'AI 项目首页重构实验',
  '从单页展示改成多路由个人 AI 网站，让内容结构更符合用户心智。',
  'published',
  JSON_ARRAY('Vue 3', 'Vite', 'Hash Routing'),
  '',
  10
WHERE NOT EXISTS (
  SELECT 1 FROM ai_projects WHERE title = 'AI 项目首页重构实验'
);

INSERT INTO ai_projects (title, summary, status, stack, source_url, sort_order)
SELECT
  'AI 资讯整理系统',
  '把日常看到的更新、工具和趋势整理成可检索、可归类的站点内容。',
  'planned',
  JSON_ARRAY('Content Modeling', 'Curation Workflow'),
  '',
  20
WHERE NOT EXISTS (
  SELECT 1 FROM ai_projects WHERE title = 'AI 资讯整理系统'
);
