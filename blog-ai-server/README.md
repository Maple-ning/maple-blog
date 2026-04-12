# blog-ai-server

AI探索站（blog-ai / blog-ai-admin）的后端服务。正式部署建议使用 MySQL；若本地未配置数据库环境变量，会自动回退到 `data/content.json` 作为轻量存储。

## 环境变量

复制 `.env.example` 为 `.env`：

```bash
PORT=3011
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_database_password
DB_NAME=blog_db
```

## 数据库

新环境可执行 `sql/init.sql`，已有博客数据库可执行：

```bash
npm run sql:ai-lab
```

## 接口

- `GET /health`
- `GET /api/dashboard`
- `GET /api/site-profile`
- `PUT /api/site-profile`
- `GET /api/journey`
- `POST /api/journey`
- `PUT /api/journey/:id`
- `DELETE /api/journey/:id`
- `GET /api/insights`
- `POST /api/insights`
- `PUT /api/insights/:id`
- `DELETE /api/insights/:id`
- `GET /api/projects`
- `POST /api/projects`
- `PUT /api/projects/:id`
- `DELETE /api/projects/:id`

另外提供面向前台使用的公开接口：

- `GET /api/public/site-profile`
- `GET /api/public/journey`
- `GET /api/public/insights`
- `GET /api/public/projects`

## 启动

```bash
npm run dev
```

默认端口：`3011`
