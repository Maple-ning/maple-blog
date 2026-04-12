/**
 * 给前台“其他菜单”补演示数据（文章/项目/关于）
 *
 * 用法:
 *   node scripts/seed-front-menu-mock.js
 *   node scripts/seed-front-menu-mock.js --post-count=40
 */
const path = require('path')
const mysql = require('mysql2/promise')

require('dotenv').config({ path: path.resolve(__dirname, '../.env') })

const today = new Date()
const d = (offsetDays) => {
  const dt = new Date(today)
  dt.setDate(today.getDate() - offsetDays)
  return dt.toISOString().slice(0, 10)
}

const parseArgs = () => {
  const args = process.argv.slice(2)
  const getNum = (key, fallback) => {
    const matched = args.find((a) => a.startsWith(`${key}=`))
    if (!matched) return fallback
    const n = Number(matched.split('=').slice(1).join('='))
    return Number.isFinite(n) && n > 0 ? Math.floor(n) : fallback
  }
  return {
    postCount: getNum('--post-count', 30),
  }
}

const tagPools = [
  ['工程化', '前端'],
  ['性能', '优化'],
  ['读书', '思考'],
  ['架构', '实践'],
  ['习惯', '成长'],
]

const makePosts = (count) =>
  Array.from({ length: count }, (_, i) => {
    const idx = i + 1
    const tagPair = tagPools[i % tagPools.length]
    return {
      title: `示例-文章 #${idx}`,
      summary: `用于页面展示的第 ${idx} 篇示例文章，模拟列表与标签筛选。`,
      content:
        `这是一篇用于界面展示的示例内容（文章 #${idx}）。` +
        '\\n\\n你可以在后台编辑它，替换为真实发布内容。',
      tags: tagPair,
      date: d(idx),
      status: 'published',
    }
  })

const makeProjects = (count) =>
  Array.from({ length: count }, (_, i) => {
    const idx = i + 1
    const stackPool = [
      ['Vue 3', 'TypeScript', 'Pinia'],
      ['Node.js', 'Express', 'MySQL'],
      ['Vue 3', 'ECharts', 'Vite'],
      ['Nuxt', 'Prisma', 'PostgreSQL'],
    ]
    return {
      name: `示例项目-演示工程 #${idx}`,
      description: `用于展示项目列表样式与卡片密度的示例项目 ${idx}。`,
      url: `https://example.com/demo-project-${idx}`,
      sourceCodeUrl: `https://github.com/example/demo-project-${idx}`,
      techStack: stackPool[i % stackPool.length],
    }
  })

const demoProfile = {
  name: '枫叶',
  tagline: '独立开发者 · 持续学习 · 长期主义',
  intro:
    '你好，我是枫叶。这里是一段用于页面演示的简介文案，覆盖前台“关于”页面内容展示。你可以在后台随时替换为真实介绍。',
  focusPoints: ['持续更新文章，沉淀实战经验与工程化思考。', '通过读书与课程复盘，构建可复用的学习体系。', '把想法做成项目并持续打磨用户体验。'],
  email: 'maple@example.com',
  github: 'https://github.com/example/maple',
}

const ensureTables = async (conn) => {
  await conn.query(`
    CREATE TABLE IF NOT EXISTS posts (
      id INT PRIMARY KEY AUTO_INCREMENT,
      title VARCHAR(255) NOT NULL,
      summary VARCHAR(500) NOT NULL,
      content TEXT NOT NULL,
      tags JSON NULL,
      date DATE NOT NULL,
      status ENUM('draft', 'published') NOT NULL DEFAULT 'draft',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
  `)

  await conn.query(`
    CREATE TABLE IF NOT EXISTS projects (
      id INT PRIMARY KEY AUTO_INCREMENT,
      name VARCHAR(255) NOT NULL,
      description VARCHAR(500) NOT NULL,
      url VARCHAR(500) NOT NULL,
      source_code_url VARCHAR(500) NULL,
      tech_stack JSON NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
  `)

  await conn.query(`
    CREATE TABLE IF NOT EXISTS profile (
      id INT PRIMARY KEY AUTO_INCREMENT,
      name VARCHAR(100) NOT NULL,
      tagline VARCHAR(255) NULL,
      intro TEXT NOT NULL,
      focus_points JSON NULL,
      email VARCHAR(255) NULL,
      github VARCHAR(500) NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
  `)
}

async function main() {
  const { postCount } = parseArgs()
  const demoPosts = makePosts(postCount)
  const demoProjects = makeProjects(12)

  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME,
    multipleStatements: true,
  })

  try {
    await ensureTables(conn)
    await conn.beginTransaction()

    await conn.query("DELETE FROM posts WHERE title LIKE '示例-%'")
    await conn.query("DELETE FROM projects WHERE name LIKE '示例项目-%'")

    for (const post of demoPosts) {
      await conn.query(
        'INSERT INTO posts (title, summary, content, tags, date, status) VALUES (?, ?, ?, ?, ?, ?)',
        [post.title, post.summary, post.content, JSON.stringify(post.tags), post.date, post.status],
      )
    }

    for (const p of demoProjects) {
      await conn.query(
        'INSERT INTO projects (name, description, url, source_code_url, tech_stack) VALUES (?, ?, ?, ?, ?)',
        [p.name, p.description, p.url, p.sourceCodeUrl, JSON.stringify(p.techStack)],
      )
    }

    const [rows] = await conn.query('SELECT id FROM profile ORDER BY id ASC LIMIT 1')
    if (rows.length === 0) {
      await conn.query(
        'INSERT INTO profile (name, tagline, intro, focus_points, email, github) VALUES (?, ?, ?, ?, ?, ?)',
        [
          demoProfile.name,
          demoProfile.tagline,
          demoProfile.intro,
          JSON.stringify(demoProfile.focusPoints),
          demoProfile.email,
          demoProfile.github,
        ],
      )
    } else {
      await conn.query(
        'UPDATE profile SET name = ?, tagline = ?, intro = ?, focus_points = ?, email = ?, github = ? WHERE id = ?',
        [
          demoProfile.name,
          demoProfile.tagline,
          demoProfile.intro,
          JSON.stringify(demoProfile.focusPoints),
          demoProfile.email,
          demoProfile.github,
          rows[0].id,
        ],
      )
    }

    await conn.commit()
    console.log(`seed-front-menu-mock: ok (posts=${demoPosts.length}, projects=${demoProjects.length}, profile=1)`)
  } catch (error) {
    await conn.rollback()
    throw error
  } finally {
    await conn.end()
  }
}

main().catch((error) => {
  console.error(error.message || error)
  process.exit(1)
})
