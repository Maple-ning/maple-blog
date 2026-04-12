# blog-ai-admin

**AI探索站**管理后台，与前台 **hash 路由一一对应**：

| 前台 `blog-ai` | 后台 hash |
| --- | --- |
| 首页 `#/` | `#/` 总览（只读统计 + 快捷入口） |
| 学习历程 `#/journey` | `#/journey` |
| AI资讯 `#/insights` | `#/insights` |
| 项目分享 `#/projects` | `#/projects` |
| （全站） | `#/site` 站点信息（名称与首页文案） |

旧链接 `#/posts` 会自动跳到 `#/journey`。

## 启动

```bash
npm install
npm run dev
```

默认会请求 `http://localhost:3011`。

## 环境变量

可通过 `.env.local` 覆盖接口地址：

```bash
VITE_API_BASE_URL=http://localhost:3011
```
