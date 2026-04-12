const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

async function main() {
  const sqlPath = path.join(__dirname, '../sql/add-ai-lab.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME,
    multipleStatements: true,
  });

  try {
    await conn.query(sql);
    try {
      await conn.query(
        'ALTER TABLE ai_projects ADD COLUMN github_url VARCHAR(500) NULL AFTER source_url',
      );
    } catch (error) {
      if (!error || error.code !== 'ER_DUP_FIELDNAME') {
        throw error;
      }
    }
    console.log('apply-ai-lab: ok');
  } finally {
    await conn.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
