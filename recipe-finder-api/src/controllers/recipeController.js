import { getRecipes } from '../models/recipeModel.js';

export async function searchRecipes(req, res) {
  try {
    const { q, ingredients, diet } = req.query;
    const rows = await getRecipes({ q, ingredients, diet });
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
