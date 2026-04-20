import {
  getRecipes,
  getRecipeCount,
  getDietTypes,
  getRecipeDetails,
  getIngredients
} from '../models/recipeModel.js';

export async function searchRecipes(req, res) {
  try {
    const q = req.query.q || '';
    const dietTypes = req.query.diets ? req.query.diets.split(',').map(d => d.trim()) : [];
    const limit = parseInt(req.query.limit, 10) || 12;
    const offset = parseInt(req.query.offset, 10) || 0;

    const total = await getRecipeCount({ q, dietTypes });
    const rows = await getRecipes({ q, dietTypes, limit, offset });

    res.json({
      data: rows,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function getDiets(req, res) {
  try {
    const diets = await getDietTypes();
    res.json(diets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function getIngredientsList(req, res) {
  try {
    const limit = parseInt(req.query.limit, 10) || 20;
    const ingredients = await getIngredients(limit);
    res.json(ingredients);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function getRecipeById(req, res) {
  try {
    const { id } = req.params;
    const recipe = await getRecipeDetails(id);

    if (!recipe) {
      return res.status(404).json({ error: 'Recipe not found' });
    }

    res.json(recipe);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
