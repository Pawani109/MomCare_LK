// MySQL connection pool for the MomCare LK database.
// Connection details come from backend/.env (see .env.example):
//   DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME
require('dotenv').config();
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'momcare',
  waitForConnections: true,
  connectionLimit: Number(process.env.DB_POOL_LIMIT) || 10,
  queueLimit: 0,
  // Return DATE / DATETIME columns as plain strings so the API keeps emitting
  // the same 'YYYY-MM-DD' / 'YYYY-MM-DD HH:MM:SS' shapes the frontend expects.
  dateStrings: true,
  charset: 'utf8mb4',
});

// Small helper so callers can write `const rows = await query('SELECT ...', [..])`.
async function query(sql, params = []) {
  const [rows] = await pool.execute(sql, params);
  return rows;
}

async function assertConnection() {
  const conn = await pool.getConnection();
  try {
    await conn.ping();
  } finally {
    conn.release();
  }
}

module.exports = { pool, query, assertConnection };
