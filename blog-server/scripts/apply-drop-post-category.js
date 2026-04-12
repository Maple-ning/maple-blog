/**
 * 执行 sql/drop-post-category.sql（可重复执行，仅删列不删行）
 */
const fs = require('fs')
const path = require('path')
const mysql = require('mysql2/promise')

require('dotenv').config({ path: path.resolve(__dirname, '../.env') })

async function main() {
  const sqlPath = path.join(__dirname, '../sql/drop-post-category.sql')
  const sql = fs.readFileSync(sqlPath, 'utf8')
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME,
    multipleStatements: true,
  })

  try {
    await conn.query(sql)
    console.log('apply-drop-post-category: ok')
  } finally {
    await conn.end()
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
