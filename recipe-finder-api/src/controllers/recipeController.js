import {
  getRecipes,
  getRecipeCount,
  getDietTypes,
  getRecipeDetails,
  getIngredients,
  getFavoriteRecipesByUser,
  getFavoriteRecipeIdsByUser,
  addFavoriteRecipe,
  removeFavoriteRecipe,
} from "../models/recipeModel.js";

export async function searchRecipes(req, res) {
  try {
    const q = req.query.q || "";
    const dietTypes = req.query.diets
      ? req.query.diets.split(",").map((d) => d.trim())
      : [];
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
        hasMore: offset + limit < total,
      },
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
      return res.status(404).json({ error: "Recipe not found" });
    }

    res.json(recipe);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function listFavoriteRecipes(req, res) {
  try {
    const userId = req.user.sub;
    const rows = await getFavoriteRecipesByUser(userId);
    res.json(rows);
  } catch (err) {
    res.status(503).json({
      error:
        "Favorites service unavailable. Verify Firebase Admin credentials.",
      detail: err.message,
    });
  }
}

export async function listFavoriteRecipeIds(req, res) {
  try {
    const userId = req.user.sub;
    const recipeIds = await getFavoriteRecipeIdsByUser(userId);
    res.json({ recipeIds });
  } catch (err) {
    res.status(503).json({
      error:
        "Favorites service unavailable. Verify Firebase Admin credentials.",
      detail: err.message,
    });
  }
}

export async function addFavorite(req, res) {
  try {
    const userId = req.user.sub;
    const recipeId = Number(req.params.id);

    if (!Number.isInteger(recipeId) || recipeId <= 0) {
      return res.status(400).json({ error: "Invalid recipe id." });
    }

    const added = await addFavoriteRecipe(userId, recipeId);

    if (!added) {
      return res.status(404).json({ error: "Recipe not found." });
    }

    return res.status(201).json({ success: true });
  } catch (err) {
    return res.status(503).json({
      error:
        "Favorites service unavailable. Verify Firebase Admin credentials.",
      detail: err.message,
    });
  }
}

export async function removeFavorite(req, res) {
  try {
    const userId = req.user.sub;
    const recipeId = Number(req.params.id);

    if (!Number.isInteger(recipeId) || recipeId <= 0) {
      return res.status(400).json({ error: "Invalid recipe id." });
    }

    await removeFavoriteRecipe(userId, recipeId);
    return res.json({ success: true });
  } catch (err) {
    return res.status(503).json({
      error:
        "Favorites service unavailable. Verify Firebase Admin credentials.",
      detail: err.message,
    });
  }
}
