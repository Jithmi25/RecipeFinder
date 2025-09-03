import { pool } from '../db.js';


export async function getRecipes({ q, ingredients, diet }) {
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
  return rows;
}
