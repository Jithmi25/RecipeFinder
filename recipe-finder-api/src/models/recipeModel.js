import { pool } from '../db.js';

export async function getDietTypes() {
  const [rows] = await pool.query(
    'SELECT id, key_name, display_name FROM diet_types ORDER BY display_name'
  );
  return rows;
}

export async function getIngredients(limit = 20) {
  const [rows] = await pool.query(
    'SELECT id, name, normalized_name FROM ingredients ORDER BY name LIMIT ?',
    [limit]
  );
  return rows;
}

export async function getRecipes({ q, dietTypes, limit = 12, offset = 0 }) {
  let sql = `
    SELECT DISTINCT r.id, r.title, r.slug, r.description, r.instructions, 
           r.prep_minutes, r.cook_minutes, r.servings, r.popularity
    FROM recipes r
    WHERE 1=1
  `;
  const params = [];

  if (q) {
    sql += ' AND (r.title LIKE ? OR r.description LIKE ?)';
    const searchTerm = `%${q}%`;
    params.push(searchTerm, searchTerm);
  }

  if (dietTypes && dietTypes.length > 0) {
    const placeholders = dietTypes.map(() => '?').join(',');
    sql += `
      AND r.id IN (
        SELECT rdt.recipe_id 
        FROM recipe_diet_types rdt
        JOIN diet_types dt ON dt.id = rdt.diet_type_id
        WHERE dt.key_name IN (${placeholders})
      )
    `;
    params.push(...dietTypes);
  }

  sql += ' ORDER BY r.popularity DESC, r.title ASC LIMIT ? OFFSET ?';
  params.push(limit, offset);

  const [rows] = await pool.query(sql, params);
  return rows;
}

export async function getRecipeCount({ q, dietTypes }) {
  let sql = 'SELECT COUNT(DISTINCT r.id) as total FROM recipes r WHERE 1=1';
  const params = [];

  if (q) {
    sql += ' AND (r.title LIKE ? OR r.description LIKE ?)';
    const searchTerm = `%${q}%`;
    params.push(searchTerm, searchTerm);
  }

  if (dietTypes && dietTypes.length > 0) {
    const placeholders = dietTypes.map(() => '?').join(',');
    sql += `
      AND r.id IN (
        SELECT rdt.recipe_id 
        FROM recipe_diet_types rdt
        JOIN diet_types dt ON dt.id = rdt.diet_type_id
        WHERE dt.key_name IN (${placeholders})
      )
    `;
    params.push(...dietTypes);
  }

  const [result] = await pool.query(sql, params);
  return result[0]?.total || 0;
}

export async function getRecipeDetails(id) {
  const [recipes] = await pool.query(
    `SELECT r.*, 
            GROUP_CONCAT(DISTINCT dt.display_name SEPARATOR ', ') as diet_types
     FROM recipes r
     LEFT JOIN recipe_diet_types rdt ON r.id = rdt.recipe_id
     LEFT JOIN diet_types dt ON dt.id = rdt.diet_type_id
     WHERE r.id = ?
     GROUP BY r.id`,
    [id]
  );

  if (recipes.length === 0) return null;

  const [ingredients] = await pool.query(
    `SELECT i.name, ri.quantity
     FROM recipe_ingredients ri
     JOIN ingredients i ON i.id = ri.ingredient_id
     WHERE ri.recipe_id = ?`,
    [id]
  );

  return {
    ...recipes[0],
    ingredients: ingredients
  };
}
