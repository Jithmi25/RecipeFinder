import express from 'express';
import mysql from 'mysql2/promise';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || 'localhost',
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || 'password',
  database: process.env.MYSQL_DB || 'recipes'
});

// sample route
app.get('/api/recipes/search', async (req, res) => {
  const { q, ingredients, diet } = req.query;
  let sql = 'SELECT * FROM recipes WHERE 1=1';
  const params = [];

  if (q) {
    sql += ' AND title LIKE ?';
    params.push(`%${q}%`);
  }
  if (ingredients) {
    sql += ' AND ingredients LIKE ?';
    params.push(`%${ingredients}%`);
  }
  if (diet) {
    sql += ' AND dietary LIKE ?';
    params.push(`%${diet}%`);
  }

  const [rows] = await pool.query(sql, params);
  res.json(rows);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
