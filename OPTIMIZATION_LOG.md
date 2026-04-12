# Optimization log

## 2026-04-07

- **枫叶 + 待办图标概念稿**：生成一版小程序/应用图标方向稿（暖色枫叶 + 清单/勾选意象），便于后续导出多尺寸或改绘为 SVG；文件见 Cursor 项目 `assets/maple-todo-app-icon.png`。

## 2026-04-08

- **NOVA 原型落地（分阶段）**：先完成版心/顶栏/卡片与单暗色变量；随后完全还原见下条。

- **项目页对齐 NOVA 原型**：去掉顶栏筛选区，仅保留 `PROJECTS` 标签 + 标题「项目展示」+ 原型说明文案；`projects-grid` 使用 `repeat(auto-fill, minmax(340px, 1fr))` 与 24px 间距；卡片为 `nova-p-card`（hover 上移 + `rotateX(2deg)` + 双层阴影）、180px 预览区、`project-header` 式名称 + 状态徽标、`nova-p-desc` / `nova-p-tech`、底栏两格（🍴 源码或 —、渐变「→ 查看」或「→ 待定」，**不含 Star 占位**）；样式在 `main.css` `.nova-projects-grid`～`.nova-p-link--primary`。

- **好站页对齐 NOVA 原型**：去掉侧栏、移动端抽屉与 FAB、按分类分区与内层滚动；改为 `BOOKMARKS` 标签 + 原型标题/说明；分类行复用 `.nova-tag-filter`；`bookmarks-grid`（`minmax(280px,1fr)`、gap 16px）；`.nova-bmark-card`（↗ hover、渐变 favicon、mono 域名、描述、底部分类 tag）；删除全局 `.good-site-card` 与 `good-site-wiggle`。

- **文章列表合并与原型结构**：`学习记录`与`学习笔记`合并为单一路由 `/posts`（`name: posts`，导航标题「文章」），`/posts/tech`、`/posts/review` 重定向至 `/posts`；新页 `posts-list` 对齐 NOVA 文章区：`section-header`（ARTICLES 标签 + 标题 + 描述）、`search-bar`（🔍 + 原生搜索 + 右侧篇数 mono）、`tag-filters` 圆角 pill（全部 / 学习记录 / 学习笔记 / 动态标签）、`articles-list` 网格卡片（左侧竖条 hover、标签行、标题、摘要、meta、右箭头）；`main.css` 增加 `.nova-search-bar`～`.nova-article-arrow`；`getAllPublishedPosts` 供合并数据；删除 `tech-list`、`review-list`；详情页面包屑返回统一「文章」；首页 CTA 改为「探索文章」。

- **NOVA 完全还原（四主题 + 动效 + 首页代码窗）**：`html[data-nova-theme]` 四套配色（cyber / aurora / solar / sakura）与 `--nova-nav-bg`、`--nova-sticky-bg`、`--nova-scan-accent` 等；`index.html` 内联脚本防 FOUC；`useNovaTheme` + `localStorage` 键 `nova-theme`（兼容旧 `theme-mode`）；顶栏四色圆点主题切换（抽屉内同步）；全局扫描线 `.nova-scan-line`、全屏粒子 `.nova-particles`（随主题色 rebuild）；根布局始终挂载背景网格与光球；首页 `HomeNovaHero` + `HomeHeroCodePanel` 双栏 Hero（徽章、双行标题、简介、`✦/⬡` 按钮、代码窗 + 三格统计）；合并后的文章列表页内建搜索条与 🔍。未接入原型的纯展示能力：文章列表 mock 数据、计数器动画、Glitch 文案、关于页技能条/时间线 mock 等。

- **关于页对齐 NOVA ME 布局**：`about/index.vue` 改为左栏 sticky 资料卡（渐变头像首字/🍁、姓名、签名、简介、邮箱/GitHub 快捷按钮）+ 右栏 `.nova-me-card`（我在做什么 / 联系我 / 关于本站）；数据仍来自 `getProfile`。`main.css` 新增 `.nova-me-*`（含 `prefers-reduced-motion`、≤900px 单列）；移除全局 `.about-info-card`、`.about-hero` 覆盖与页内 Ant Card / scoped 深色补丁。

- **关于页去顶栏文案**：去掉 `nova-section-header`（About / 关于我 / 副标题），页面自资料卡起笔，避免与侧栏标题重复。

- **关于页对齐**：左右栏统一 `28px` 内边距；资料卡改为左对齐（头像与正文同一垂线）；栅格 `minmax(260px,300px) + 1fr`；右侧卡片增加 `.nova-me-card-body`，`padding-left` 与标题行「图标+间距」同宽，列表/简介与标题文字左缘齐平；联系行用双列 grid 固定标签列宽。

- **关于页留白与节奏**：根节点 `.nova-about-page` 与 `blog-shell` 的 `px-6` 对消，主内容贴近版心左右；主栅格改为 `clamp(220px,26%,300px) + 1fr`，加宽右侧正文区；列间距 `40px`（≥1100px 时 `48px`）、右侧卡片栈 `gap: 28px`；资料卡/卡片内边距略收为 `22px 24px`，正文 `15px` 行高略紧；≤900px 取消负边距避免窄屏溢出。

- **关于页版式重做**：弃用左右 sticky 窄栏 + emoji 标题卡；改为顶栏「资料带」`.nova-about-hero`（角光晕、圆角方头像、PROFILE kicker、渐变姓名、mono 签名、简介、圆角胶囊操作）+ 下方 Bento `.nova-about-panels`（有关注点时左大列列表 + 右列联系/本站；无关注点时联系与本站并排）。样式统一为 `.nova-about-*`，面板 hover 细边框高光；列表用圆点前缀替代原生 disc。

- **首页对齐 NOVA 原型**：去掉包裹 Hero 的 `a-card`；`.nova-home-hero-bleed` 在版心内横向拉满（与关于页对消 `px-6` 一致），单框圆角+描边；区块标签改为 `LATEST` / `NOTES` / `PROJECTS`；最新记录与笔记使用与 `/posts` 相同的 `.nova-articles-list` + `.nova-article-card`（标签行、摘要、meta、侧箭头、点击进详情）；精选项目使用与项目页相同的 `.nova-projects-grid` + `nova-p-card`；底部「查看全部项目」链到 `projects`。

- **首页与文章页/项目页 DOM 同源**：抽取 `NovaArticlesFeed`（与 `/posts` 完全相同的 `ARTICLES` 头、搜索条、`nova-tag-filters`、列表与空态文案）；`posts-list` 仅包一层 `nova-articles-page`；`projects/index` 复用 `NovaProjectsShowcase`。

- **首页对齐根目录 `index.html` 原型**：首屏 Hero 去掉整体卡片（仅右侧 `hero-card` 内代码窗 + 三格小统计：文章 / 项目 / Stars）；`min-height: 70vh`、≤900px 隐藏右侧视觉区。第二块为 `stats-grid` 四卡（篇技术文章、个开源项目、GitHub Stars 占位 —、收藏好站数，大数字入场动画）。第三块 `LATEST` +「最新文章」+ `posts-mini-grid` 仅展示按日期排序的 **4 篇**，样式对齐 `post-mini-card`；主按钮文案「✦ 开始探索」。`/posts` 仍为完整 `NovaArticlesFeed`。

- **首页右侧去代码窗**：删除 `HomeHeroCodePanel`，改为 `HomeHeroVisualPanel`；底栏三格统计与数字动画保留。

- **首页右侧封面图**：`public/hero-cover.svg` 为默认底图（矢量渐变网格）；`HomeHeroVisualPanel` 顶部 `object-fit: cover` + 底部 scrim 与角标「MAPLE · 学习 · 记录 · 项目」；`cover-src` / `HomeNovaHero.hero-cover-src` 可改为任意图片 URL（如替换为 `public/hero-cover.jpg` 或外链）。

- **项目卡预览区图标**：`NovaProjectPoolIcon` 从原型同款 emoji 池按 `project.id` 固定取一枚展示，无轮播；`NovaProjectsShowcase` 使用之，替代项目名首字。

- **Hero 双按钮视觉**：`nova-btn-primary` / `nova-btn-outline` 改为同系玻璃底 + 细边框 + `var(--nova-text)`，主按钮仅略强的 accent 混色，去掉强渐变、白字与 glow；hover 统一 `-1px` 位移，降低两键反差。

- **项目卡底栏 + 文章 meta 文案与按钮风格**：`NovaProjectsShowcase` 底栏改为「查看源码」「查看项目」，空态「暂无源码」「敬请期待」；`NovaArticlesFeed` 与首页 `posts-mini` 的阅读时长改为「约 N 分钟」，类型提示统一为「查看学习笔记 / 查看学习记录」（首页为「查看」+ `categoryLabel`）；`.nova-p-link` / `--primary` 与 Hero 按钮同系玻璃底 + 细边框，去掉渐变白字主按钮，降低两格反差。

- **顶栏导航现代化**：`AppHeader` 桌面端去掉 Ant `Menu`，改为版心内 `RouterLink` 主导航（`:focus-visible`、`aria-current`）；Logo 徽标为玻璃底细描边，字标 `tracking-tight`；移动端为圆角图标按钮 + 抽屉内列表式链接（右 chevron），标题「导航」；顶栏 `backdrop-saturate`。布局层移除仅服务于菜单 `click` 的 `goTo` / `useRouter`，路由变化仍由现有 `watch` 关抽屉。

- **顶栏菜单形态再调**：去掉外层胶囊槽（易显「分段控件 / 组件库」感），改为 **扁平文字链接行**（`.nova-nav-bar`）：14px / 略紧字距、圆角 8px、hover 弱底；当前页为 **弱 accent 底 + 底部短指示条**（`::after`），更接近常见产品站顶栏而不是 iOS segmented。

- **主题切换折叠为下拉**：桌面端顶栏由横排四色圆点改为 **配色图标按钮**（`BgColorsOutlined` + 当前主题色小圆点），`a-dropdown` **悬停或点击**展开（`mouseLeaveDelay` 略增便于移入菜单）；每项仅 **主题名**（赛博蓝等）+ 色点；下拉面板 `overlay-class-name` 玻璃圆角菜单样式。移动端抽屉内主题区为 **同款单行按钮**。

- **Nova 主题扩充为 8 套**：新增 **夜幕紫 void**（紫靛粉）、**余烬红 ember**（珊瑚橙）、**苔原绿 moss**（绿青柠）、**霜青 frost**（浅底冷蓝，第二套浅色）；`main.css` 补全 `--nova-*` 令牌；`useNovaTheme` 用 `NOVA_LIGHT_THEMES` 列表驱动 `html.dark` 与 `applyNovaThemeToDocument`；`blog-front/index.html` FOUC 脚本同步 `allowed` / `light`；顶栏色点渐变 class 与浅色主题下选中描边、下拉阴影分别处理；主题菜单 `max-height: min(420px,70vh)` 防项多溢出。

- **黑白主题 mono**：第九套 **极简灰阶浅色**（近黑字、中性灰底与描边，`accent` 均为灰/黑无彩）；归入 `NOVA_LIGHT_THEMES` 与 FOUC `light`；顶栏色点黑→浅灰渐变、下拉阴影中性灰。

- **深灰主题 ink 与默认**：第十套 **深色灰阶**（近黑底、浅灰字与强调，无彩）；`resolveInitialNovaTheme` 与 `blog-front/index.html` FOUC 在无 `nova-theme`、无 legacy light 时默认 **`ink`**（legacy `theme-mode: dark` 亦指向 `ink` 而非 cyber）；`NOVA_THEMES` 中排在苔原绿与浅色组之间。

- **导航与栏目命名**：顶栏与 `routes` meta 统一为 **首页 | 博文 | 项目 | 友链 | 简介**；列表/详情/首页统计与区块标题、友链页标题与说明、`NovaArticlesFeed`/`NovaProjectsShowcase`、关于页缺省名与简介文案、面包屑与 404 等同步用语（博文/友链/项目/简介）。

- **博文详情接入 Nova 主题**：`post-detail` 根节点 `nova-post-detail`，去掉 Tailwind 灰/蓝字色；`a-card` 使用 `nova-post-card`（全主题 `--nova-card-bg` / 边框 / 深浅 hover）；`main.css` 增加 `.nova-post-detail__*` 面包屑与标题日期、`.nova-post-detail .markdown-body` 正文/链接/引用/表格/代码块用 CSS 变量；目录与标签用 `var(--nova-text-muted)` / `var(--nova-accent)`。

- **友链卡图标**：去掉标题首字 + 强渐变块；新增 `NovaBookmarkPoolIcon` 按 **`site.id`** 在约 30 枚符号里固定取一枚（与项目卡图标池思路一致，同分类也不会扎堆同一字）；`.nova-bmark-favicon` 改为淡 accent 混色底 + 细边框 + 轻阴影，字号略收。

## 2026-04-09

- **新增 AI 门户子站**：创建 `blog-ai`（Vite + Vue + TS，`base: /ai/`），首版包含「社区分享、知识库、产品、AI资讯、学习资源」五个入口卡片与返回博客链接；部署配置新增第三前端发布目录 `/usr/share/nginx/html/blog-ai`，`deploy/README.md` 补充 `/ai/` 的 Nginx 片段。

- **博客前台新增 AI 门户菜单**：`blog-front` 顶栏/抽屉导航支持外链项，新增「AI门户」直达 `/ai/`；为避免重复，顶部导航中隐藏原内部 `ai-note` 菜单项（路由仍可直达）。

- **AI 跳转失败修复**：菜单链接改为配置项 `VITE_AI_PORTAL_URL`（开发环境指向 `http://8.163.46.202/ai/`），并在服务器 `nginx` 增加 `/ai/`、`/ai/assets/`、`/ai/index.html` 路由后 reload；线上 `http://8.163.46.202/ai/` 已返回 200。

- **去掉扫描线动效**：移除全局 `.nova-scan-line`（整页下移高亮条）及 `HomeWelcomeHero` 内 `.home-welcome__scan`；删除各主题下已无用的 `--nova-scan-accent`，降低视觉干扰。（已 `deploy/deploy.ps1` 发版上线。）

- **博文去掉库内分类**：`posts` 表删除 `category` 列（迁移 `sql/drop-post-category.sql`、`npm run sql:drop-post-category`）；`init.sql` 新建库不再含该列。接口与前后台不再读写 `tech`/`review`，统称文章，用 **tags** 区分主题。前台 `NovaArticlesFeed` 去掉「学习记录/学习笔记」筛选 pill；后台博文管理去掉分段筛选与分类表单项；仪表盘改为「已发布」计数。`seed-front-menu-mock` 改为 `--post-count`。

- **生产部署**：`deploy/deploy.ps1` 发版 blog-admin / blog-front / blog-server（PM2）；远程先后执行 `npm run sql:profile-site-about`、`npm run sql:drop-post-category`（均已 ok），库结构与当前代码一致。

## 2026-04-07 · 后台与部署

- **管理端与前台博文入口一致**：`blog-admin` 合并为 `/posts`「博文管理」，旧 `/posts/tech`、`/posts/review` 重定向；删除独立 tech/review 管理页。（后续已去掉库内 `category` 与分段筛选，见 2026-04-09。）
- **`site_about` 可编辑**：`profile` 表幂等迁移 `sql/add-profile-site-about.sql` 与 `npm run sql:profile-site-about`；接口字段 `siteAbout`；关于管理页与前台关于页展示（空则沿用默认「关于本站」段落）。
- **默认数据类型**：`constants/defaults.ts` 中 `defaultAbout` 补 `siteAbout: ''`，保证 `AboutProfile` 与 `vue-tsc` 一致。
- **部署与数据**：`deploy/README.md` 说明常规发版不删库；博文为单表 `posts`（无 `category` 列，用 tags 表达主题）；升级时按文档执行 `site_about` 与 `drop-post-category` 等迁移。

- **后台顶栏菜单**：布局里 `navItems` 原先扁平化**所有**子路由，把仅用于兼容旧链接的 `posts/tech`、`posts/review` 重定向也画进菜单，且没有 `meta.title`，表现为多余项或路径文案。改为只收录带 `component` 的子路由，顶栏只保留概览、博文管理、项目、好站、关于我。

- **项目体验 / 源码可选**：后台保存只校验名称与介绍必填；体验地址、源码均可空，填写时须为 http(s)。接口与 `projectsController` 同步。前台 `NovaProjectsShowcase` 无对应链接则不渲染「查看源码」「查看项目」占位文案与底栏；仅有其一则只显示该按钮；状态「开发中 / 已发布」仍以是否有有效体验链接为准。

## 2026-04-11 · AI 本地 API 404

- **原因**：`blog-ai-server` 仅注册 `/api/dashboard`、`/api/taxonomy`、`/api/journey` 等路径；`blog-ai-admin` / `blog-ai` 在 DEV 下把 `API_BASE` 写成 `http://localhost:3011`，导致请求落在根路径 `/dashboard` 等而 404。
- **修复**：开发环境默认 `API_BASE` 改为 `http://localhost:3011/api`（与生产 Nginx `/api-ai/` → 上游 `/api/` 一致）；`blog-ai-admin/.env.example` 同步说明。

## 2026-04-11 · blog-ai 项目分享页（与全站对齐）

- **Banner**：与其它子页一致使用 **`page-banner`**；项目页加 **`page-banner--proj-row`**：单行横向（图标 + 标题/简述 | 统计 chip），**减小上下 padding** 与标题字号，避免占高过多；窄屏改为纵向堆叠。
- **筛选与视图**：技术栈使用全站已有 **`filter-btn` + `filter-bar`**；工具区收入 **`panel` + `panel-body`**；右侧 **网格/列表** 切换保留。去掉「当前技术栈：…共 N 个」文案行。
- **网格**：改用 **`grid grid--3` + `post-card` / `card-cover`**，与首页「最新内容」等卡片一致；无封面用 **`card-cover-placeholder`**。
- **样式**：删除独立深蓝 Hero/渐变统计盒与 `proj-card` 大块；仅保留 `.proj-page__mark*`、`.projects-toolbar-panel*`、`.view-toggle*`、`.card-cover-placeholder`。

- **项目 Banner 视觉**：`page-banner--proj-row` 覆盖为 **透明背景、无底边线**，与页面底色融合；右侧统计 chip 使用 **`--color-blue-soft` + 浅蓝描边**，**数字 `strong` 为蓝色**（亮色 `#2563eb`、暗色 `#60a5fa`），与其它页 `page-banner` 渐变互不影响。

- **技术栈筛选 / 网格卡 / 列表行**：筛选区增加 **`projects-stack-filter`**（`flex: 0 0 auto` + `nowrap` 文案 + 统一 `row-gap`/`column-gap`）；**≤720px** 改为 **单行横向滚动**（抵消 `panel-body` 左右内边距以拉满可滑区域），减轻长短不一标签换行参差不齐。网格卡加 **`post-card--project`**：**状态+置顶** 与 **技术栈 `post-tag`** 分两行。列表 **`.projects-panel td`** 改为 **`vertical-align: middle`**，与多行「项目」列垂直对齐更整齐。

- **项目页留白**：**Banner** `page-banner--proj-row` 上下改为 **`space-10` / `space-8`**（原 `space-5` 过紧）。主内容 **`section--projects`** 纵向 **`space-8`～`space-10`**（轻于全站 `section` 的 `space-16`）；**`panel-body`** 改为 **`space-4`×`space-5`**；**`projects-page__content`** 列间距 **`space-4`**；项目网格卡 **`post-card--project`** 内边距 **`space-5`**。≤720px 横向筛选条与收紧后的 **`panel-body`** 用 **`space-5`** 对齐；≤768px 下 **`section--projects`** 再收一档。

- **项目 Banner 统计图标**：三项统计 chip 前增加 **线框 SVG**（立方体 / 星标 / Git 分叉），**`page-banner-chip__icon`** 与数字同色（亮 `#2563eb`、暗 `#60a5fa`），`aria-hidden` 装饰图标；文案包在 **`page-banner-chip__stat-text`** 内。

- **Banner Stars/Forks 缺省**：无 `githubStars` / `githubForks` 时不再显示 **—**，累加为 **0** 并走 **`formatStatNumber`**（与有数据时一致）。

- **顶栏返回与主题按钮**：**`btn-icon`** 内 emoji 包一层 **`btn-icon__glyph`**（flex 居中、固定字号），避免与 36px 方框基线不齐。**`back-home-btn`** 与主题按钮同高 **36px**；箭头放入 **`back-home-btn__icon`** 固定 **18×18** 盒子内 SVG；文案改为 **「博客」**（`title`/`aria-label` 仍为「返回博客首页」）；统一 **`box-sizing`/`flex-shrink`**，hover 时图标色随文字。

- **返回按钮横排**：删除全局 **`.hide-mobile { display: inline }`**（与 **`.back-home-btn`** 同优先级且靠后，会覆盖 **`inline-flex`** 导致箭头与文字无法 flex 横排）。**`back-home-btn`** 显式 **`flex-direction: row` + `nowrap` + `align-items: center`**，**`gap: var(--space-2)`**；**`back-home-btn__label`** 改为 **`inline-flex` + `align-items: center`**。小屏仍仅用 **`display: none`** 隐藏 **`.hide-mobile`**。

- **顶栏操作顺序**：**`nav-actions`** 内 **「博客」返回** 置于 **主题切换** 左侧（先返回主站入口，再调主题，再汉堡菜单）。

- **AI 前台 / 后台命名对齐**：前台 **`blog-ai/index.html`** 与 **`site.ts`** 统一为 **「AI探索站」** 叙事（去掉 Maple AI Lab 与站内品牌不一致）。后台 **`blog-ai-admin`** 侧栏 **「内容管理」** 改为 **「AI 探索内容」**，子项与前台导航对齐：**「学习与资讯」**（原内容/文章管理）、**「项目分享」**（原项目管理）；**`adminRoutes` 标签**同步供 **`document.title`**。**PostsView / ProjectsView / Dashboard** 标题与说明、**「查看前台」**、**添加内容** 等按钮文案一并统一；**`index.html`** 标题与 meta 改为 **「AI探索站 · 管理后台」**。**`blog-ai-server`** 默认 **`siteName`**、**`content.json`** 与 **SQL 种子** 同步为 **AI探索站**。

- **后台与前台 1:1 页面**：废除合并页 **`#/posts`**（旧链接 **`#/posts`** 在 **`useHashRoute`** 中重定向到 **`#/journey`**）。**`adminRoutes`** 改为 **`/` 首页**、**`/journey`**、**`/insights`**、**`/projects`**、**`/site`**，侧栏分组 **「前台页面（一一对应）」** + **「全站」**。**`PostsView`** 通过 **`listKind`** 拆成仅学习历程 / 仅资讯两套实例；**项目**仅在 **`#/projects`** 维护（新建弹窗去掉「项目」类型）。**`DashboardView`** 改为 **「首页」** 说明 + 快捷链到各对应后台页。**`README`** 补充对照表。

- **AI资讯前台单列列表**：资讯卡片由 **`grid--3`** 改为 **`grid--1`**（并新增全局 **`.grid--1`**），每行仅一张卡片。

- **站点设置去分类标签 / 前台资讯卡 / Banner 对齐项目页**：**`SiteSettingsView`** 去掉 **「分类与标签」** 整块；说明改为阶段、资讯分类、技术栈在各编辑表单 **直接填写**。**`App.vue`** 不再请求 **`getTaxonomy`** / **`saveTaxonomy`**；**`PostsView` / `ProjectsView` / 新建弹窗** 去掉 **`datalist`** 依赖。**`blog-ai` 资讯页** 去掉顶部 **「资讯分类」** 面板，改为 **`grid--3` 卡片**，**`post-tag` 分类** 与状态在 **`.insight-card__meta-row`** 内展示；**学习历程 / AI资讯** 的 **Banner** 改为与 **项目分享** 相同的 **`page-banner--proj-row`**（左图标+标题、右三枚带图标统计 chip）。**项目页** 技术栈 Tab 仅从 **项目数据里的 stack** 聚合，不再合并后台 **`taxonomy.projectTags`**。

## 2026-04-11 · blog-ai-admin 学习历程阶段维护

- **`PostsView`（`listKind === 'journey'`）**：增加 **按学习阶段筛选**（`stageOptions` + `stageFilter`，与前台 `#/journey` 分组字段一致）；表格列由「分类」改为 **「学习阶段」**，展示 `journeyStageLabel`（空为「未命名阶段」）；搜索同时匹配阶段名；阶段选项变化时若当前筛选失效则回退 **「全部」**。
- **编辑弹窗**：**学习阶段** 字段上移到标题下，补充 **placeholder** 与 **`form-hint`**，说明同名合并分组与留空展示规则。

## 2026-04-11 · 学习阶段可配置 + 双栏后台 + 接口

- **数据模型**：`content.json` 增加 **`journeyStages`**（`id` / `name` / `sortOrder`）；笔记保留 **`stage`**（展示名）与 **`stageId`**（关联阶段）。**MySQL** 模式下阶段顺序与名称写在 **`data/journey-stages.json`**（与笔记表 `stage` 字段联动）。
- **blog-ai-server**：**`GET/PUT /api/journey-stages`**、**`GET /api/public/journey-stages`**；保存阶段时 **同 id 改名** 会批量更新笔记的 `stage` 文本；**删除阶段** 前若仍有笔记引用则 **400**；笔记 **POST/PUT** 支持用 **`stageId`** 解析 `stage`。
- **blog-ai-admin**：学习历程改为 **左栏阶段维护**（增删改序、保存配置）+ **右栏笔记表**；新建/编辑笔记用 **下拉选择阶段**；**`App.vue`** 并行加载阶段列表；样式见 **`style.css`**（`journey-admin-layout` 等）。
- **blog-ai 前台**：**`usePublicContent`** 可选拉取 **`/public/journey-stages`**（失败则回退按名称排序）；**`JourneyPage`** 按后台阶段顺序渲染分组。
- **示例数据**：**`blog-ai-server/data/content.json`** 写入与现有笔记一致的 **`journeyStages`**。

## 2026-04-11 · blog-ai 样式还原

- **撤销科幻改版**：恢复首页 Hero + blob、列表/详情 `page-banner`、原先 Inter 主题变量与暗色 slate 配色；移除 `ai-*` 样式与 `logo-glyph`，顶栏/页脚恢复 🤖 + 渐变标题字。

## 2026-04-11 · blog-ai 门户 UI（已还原）

- 本条记录的设计改动已由上条「样式还原」撤回，仅作历史说明保留。
