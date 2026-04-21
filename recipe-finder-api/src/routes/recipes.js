import { Router } from "express";
import {
  searchRecipes,
  getDiets,
  getIngredientsList,
  getRecipeById,
  listFavoriteRecipes,
  listFavoriteRecipeIds,
  addFavorite,
  removeFavorite,
} from "../controllers/recipeController.js";
import { authenticateToken } from "../middleware/auth.js";

const router = Router();

router.get("/search", authenticateToken, searchRecipes);
router.get("/diets", authenticateToken, getDiets);
router.get("/ingredients", authenticateToken, getIngredientsList);
router.get("/favorites", authenticateToken, listFavoriteRecipes);
router.get("/favorites/ids", authenticateToken, listFavoriteRecipeIds);
router.post("/favorites/:id", authenticateToken, addFavorite);
router.delete("/favorites/:id", authenticateToken, removeFavorite);
router.get("/:id", authenticateToken, getRecipeById);

export default router;
