const mysql = require('mysql2/promise');
const path = require('path');

require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const requiredEnv = ['DB_HOST', 'DB_USER', 'DB_NAME'];
const hasDatabaseConfig = requiredEnv.every(
  (key) => process.env[key] && String(process.env[key]).trim() !== '',
);

function createPool() {
  if (!hasDatabaseConfig) {
    return null;
  }

  return mysql.createPool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME,
    charset: 'utf8mb4',
    dateStrings: true,
    waitForConnections: true,
    connectionLimit: 10,
  });
}

module.exports = {
  hasDatabaseConfig,
  pool: createPool(),
};
