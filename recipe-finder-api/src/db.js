import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

export const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'dev',
  password: process.env.DB_PASS || 'devpass',
  database: process.env.DB_NAME || 'recipes',
  waitForConnections: true,
  connectionLimit: 10
});
