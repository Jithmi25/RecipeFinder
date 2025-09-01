import pool from '../db';

async function searchRecipes({ q, ingredients = [], diets = [], limit = 20, offset = 0 }) {
// Simple two-step approach: find matched recipe ids by ingredients then select
let matchedRecipeIds = [];
if (ingredients.length) {
const ph = ingredients.map(() => '?').join(',');
const [rows] = await pool.execute(
`SELECT ri.recipe_id, COUNT(DISTINCT ri.ingredient_id) AS matched
FROM recipe_ingredients ri JOIN ingredients i ON i.id = ri.ingredient_id
WHERE i.normalized_name IN (${ph}) GROUP BY ri.recipe_id`,
ingredients
);
matchedRecipeIds = rows.map(r => ({ id: r.recipe_id, matched: r.matched }));
}


const whereParts = [];
const params = [];
if (q) {
whereParts.push(`MATCH(r.title, r.description) AGAINST(? IN BOOLEAN MODE)`);
params.push(q + '*');
}
if (matchedRecipeIds.length) {
whereParts.push(`r.id IN (${matchedRecipeIds.map(() => '?').join(',')})`);
params.push(...matchedRecipeIds.map(r => r.id));
}
if (!whereParts.length) whereParts.push('1');


let dietFilterSql = '';
if (diets.length) {
const ph = diets.map(() => '?').join(',');
dietFilterSql = ` AND r.id IN (
SELECT rdt.recipe_id FROM recipe_diet_types rdt JOIN diet_types dt ON dt.id = rdt.diet_type_id
WHERE dt.key_name IN (${ph}) GROUP BY rdt.recipe_id HAVING COUNT(DISTINCT dt.key_name) = ${diets.length}
)`;
params.push(...diets);
}


const sql = `
SELECT r.*, MATCH(r.title, r.description) AGAINST(? IN BOOLEAN MODE) AS ft_score
FROM recipes r
WHERE (${whereParts.join(' OR ')}) ${dietFilterSql}
ORDER BY ((MATCH(r.title, r.description) AGAINST(? IN BOOLEAN MODE)) * 2 + r.popularity * 0.1) DESC
LIMIT ? OFFSET ?
`;


// duplicate q for MATCH placeholders if provided
if (q) {
params.unshift(q + '*'); // for SELECT MATCH
params.push(q + '*'); // for ORDER BY MATCH
} else {
params.unshift(''); params.push('');
}
params.push(limit, offset);


const [recipes] = await pool.execute(sql, params);
// merge ingredient matched counts
const matchedMap = new Map(matchedRecipeIds.map(r => [r.id, r.matched]));
return recipes.map(r => ({ ...r, ingredient_matched: matchedMap.get(r.id) || 0 }));
}


module.exports = { autocompleteIngredients, searchRecipes };